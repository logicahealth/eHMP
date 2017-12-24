'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var async = require('async');
var handlebars = require('handlebars');
var hercule = require('hercule');
var drafter = require('drafter.js');
var http = require('../../utils/http');

module.exports.commonDir = fspath.resolve(__dirname, './');

module.exports.registerExternalUrlOnPrefix = registerExternalUrlOnPrefix;
module.exports.registerResource = registerResource;
module.exports.getAllJsonDocumentation = getAllJsonDocumentation;
module.exports.jsonDocumentationForPath = jsonDocumentationForPath;
module.exports.jsonDocumentationFromFile = jsonDocumentationFromFile;
module.exports.loadFullMarkdown = loadFullMarkdown;
module.exports.mergeJsonDocumentation = mergeJsonDocumentation;
module.exports.preparsedJsonPath = preparsedJsonPath;
module.exports.matchAction = matchAction;

var domains = {
    local: {
        resources: []
    }
};
var localPrefix = 'local';

module.exports._domains = domains;

var operators = {
    '?': 'query',
    '&': 'query',
    '+': 'reserved',
    '#': 'fragment'
};
var paramTypeOrder = {
    'path': 1,
    'query': 2,
    'fragment': 4
};

function registerExternalUrlOnPrefix(url, prefix) {
    prefix = _.trim(prefix, '/');
    domains[prefix] = domains[prefix] || {
        url: url,
        resources: []
    };
}

function registerResource(mountpoint, markdownPath, preload) {
    var prefix = _.findKey(domains, function(domain) {
        return _.startsWith(markdownPath, domain.url);
    });
    prefix = prefix || localPrefix;

    var resources = domains[prefix].resources;

    // wrap colon-prefixed path parameters (e.g. :pid) with braces (e.g. {pid})
    mountpoint = mountpoint.replace(/\/:(\w+)(\/|$)/g, '/{$1}$2');

    var existing = _.find(resources, {
        markdownPath: markdownPath
    });
    if (existing && _.startsWith(existing.mountpoint, mountpoint)) {
        existing.mountpoint = mountpoint;
        return;
    }

    var resource = {
        mountpoint: mountpoint,
        markdownPath: markdownPath,
        prefix: prefix
    };
    resources.push(resource);
    sortResources(resources);

    if (_.isUndefined(preload) || preload) {
        var callback = _.isFunction(preload) ? preload : function() {};
        jsonDocumentationFromFile(resource.markdownPath, resource.mountpoint, callback);
    }
}

function sortResources(resources) {
    resources.sort(function byMountpoint(a, b) {
        if (_.startsWith(a.mountpoint, b.mountpoint)) {
            return -1;
        } else if (_.startsWith(b.mountpoint, a.mountpoint)) {
            return 1;
        }
        return 0;
    });
}

function getAllJsonDocumentation(callback) {
    var prefix = _.isFunction(callback) ? localPrefix : callback;
    callback = _.last(arguments);
    var resources = domains[prefix].resources;
    var fullJson = createEmptyJsonDocumentation();
    async.eachSeries(resources, function(resource, done) {
        jsonDocumentationFromFile(resource.markdownPath, resource.mountpoint, function mergeJson(error, json) {
            if (error && error.code === 'ENOENT') {
                var markdown = '\n\n# Group Undocumented\n\n## ' +
                    fspath.basename(resource.markdownPath, '.md') + ' [' + resource.mountpoint + ']\n\n' +
                    '(No documentation found)\n\n';
                parseApiBlueprint(markdown, function(error, json) {
                    fullJson = mergeJsonDocumentation(fullJson, json);
                    setImmediate(done, error);
                });
            } else {
                fullJson = mergeJsonDocumentation(fullJson, json);
                setImmediate(done, error);
            }
        });
    }, function(error) {
        decorateExternalPrefix(fullJson, prefix);
        callback(error, fullJson);
    });
}

function jsonDocumentationForPath(path, callback) {
    var prefix = prefixForPath(path);

    if (_.trim(path, '/') === prefix) {
        return getAllJsonDocumentation(prefix, callback);
    }

    var resources = resourcesForPath(path, domains[prefix].resources);
    if (!resources || !resources.length) {
        return callback('No resource found for path ' + path);
    }

    var fullJson = createEmptyJsonDocumentation();
    async.eachSeries(resources, function(resource, done) {
        jsonDocumentationFromFile(resource.markdownPath, resource.mountpoint, function mergeJson(error, json) {
            fullJson = mergeJsonDocumentation(fullJson, json, resource.markdownPath);
            setImmediate(done);
        });
    }, function(error) {
        callback(error, fullJson);
    });
}

function prefixForPath(path) {
    var prefix = _.find(_.keys(domains), function(prefix) {
        return new RegExp('^/?' + prefix + '\\b').test(path);
    });
    return prefix || localPrefix;
}

function resourcesForPath(path, resources) {
    return _.filter(resources, function(resource) {
        if (resource.mountpoint.length <= 1) {
            return path === resource.mountpoint;
        }
        // support path parameters
        resource.mountpointRegex = resource.mountpointRegex ||
            new RegExp(resource.mountpoint.replace(/\/\{\w+\}(\/|$)/g, '/[^/]+$1'));
        return resource.mountpointRegex.test(path);
    });
}

function createEmptyJsonDocumentation() {
    return {
        ast: {
            resourceGroups: []
        },
        warnings: []
    };
}

function jsonDocumentationFromFile(markdownPath, mountpoint, callback) {
    loadPreparsedDocumentation(markdownPath, function(error, json) {
        if (json) {
            return callback(null, json);
        }

        var warnings = [];
        var context = {};
        async.waterfall([
            loadFullMarkdown.bind(null, markdownPath, mountpoint, warnings),
            function grabMarkdown(markdown, done) {
                context.markdown = markdown;
                done(null, markdown);
            },
            parseApiBlueprint,
            decorateWarnings.bind(null, context, markdownPath),
            prependWarnings.bind(null, warnings),
            function writeParsedJson(json, done) {
                fs.writeFile(preparsedJsonPath(markdownPath), JSON.stringify(json), function(error) {
                    done(null, json);
                });
            }
        ], callback);
    });
}

function preparsedJsonPath(markdownPath) {
    return markdownPath + '-preparsed.json';
}

function loadPreparsedDocumentation(markdownPath, callback) {
    fs.stat(preparsedJsonPath(markdownPath), function(error, preparsedStats) {
        if (error) {
            return callback(error);
        }
        fs.stat(markdownPath, function(error, markdownStats) {
            if (error) {
                return callback(error);
            }
            if (preparsedStats.mtime.getTime() > markdownStats.mtime.getTime()) {
                fs.readFile(preparsedJsonPath(markdownPath), {
                    encoding: 'utf8'
                }, function(error, content) {
                    if (error) {
                        return callback(error);
                    }
                    try {
                        return callback(null, JSON.parse(content));
                    } catch (e) {
                        return callback(e);
                    }
                });
            } else {
                return callback();
            }
        });
    });
}

function loadFullMarkdown(markdownPath, mountpoint, warnings, callback) {
    var loadMarkdown = _.startsWith(markdownPath, 'http') ?
        loadMarkdownFromUrl.bind(null, markdownPath) :
        fs.readFile.bind(null, markdownPath, {
            encoding: 'utf8'
        });
    var resource = {
        mountpoint: mountpoint,
        markdownPath: markdownPath
    };
    async.waterfall([
        loadMarkdown,
        replaceTemplateVariables.bind(null, resource),
        transclude.bind(null, null),
        replaceTemplateVariables.bind(null, resource),
        transclude.bind(null, warnings),
        cleanWhitespace
    ], callback);
}

function loadMarkdownFromUrl(url, done) {
    var logger = {};
    _.each(['trace', 'debug', 'info', 'error', 'fatal'], function(level) {
        logger[level] = function() {};
    });
    http.get({
        url: url,
        logger: logger
    }, function(error, response, markdown) {
        done(error, markdown);
    });
}

function replaceTemplateVariables(resource, template, done) {
    var context = {
        common: module.exports.commonDir,
        path: resource.mountpoint,
        relative: fspath.dirname(resource.markdownPath)
    };
    var rendered = handlebars.compile(template)(context);
    done(null, rendered);
}

function transclude(warnings, markdown, done) {
    var logger = {
        debug: function() {},
        error: function(message) {
            if (warnings) {
                warnings.push({
                    code: -1,
                    message: 'Transclude ' + message,
                    location: []
                });
            }
        }
    };
    hercule.transcludeString(markdown, logger, done.bind(null, null));
}

function cleanWhitespace(markdown, done) {
    markdown = markdown.replace(/\t/g, '    ');
    markdown = markdown.replace(/\r\n?/g, '\n');
    done(null, markdown);
}

function parseApiBlueprint(markdown, done) {
    var error;
    var json;
    try {
        json = drafter.parse(markdown, {
            type: 'ast'
        });
    } catch (e) {
        error = e;
    }
    if (_.get(json, 'error.code')) {
        error = json.error;
    }
    done(error, json);
}

function decorateWarnings(context, markdownPath, json, done) {
    if (_.isEmpty(json.warnings)) {
        return done(null, json);
    }

    var lineStarts = findLineStarts(context.markdown);
    var resourceEnds = findResourceEnds(context.markdown, json);

    _.each(json.warnings, function(warning) {
        _.each(warning.location, function(location) {
            location.file = markdownPath;
            if (location.index) {
                location.line = Number(findKey(location.index, lineStarts) || lineStarts.length);
                location.column = location.index - lineStarts[location.line - 1] + 1;
                location.resourceId = findKey(location.index, resourceEnds);
            }
        });
    });

    done(null, json);
}

function findLineStarts(markdown) {
    var newline = /\r?\n/g;
    var lineStarts = [0];
    var match;
    while ((match = newline.exec(markdown)) !== null) {
        lineStarts.push(match.index + match[0].length);
    }
    return lineStarts;
}

function findResourceEnds(markdown, json) {
    var resourceEnds = {};
    var prevResourceId;
    _.each(json.ast.resourceGroups, function(resourceGroup) {
        _.each(resourceGroup.resources, function(resource) {
            resource.__id = resource.__id || _.uniqueId();
            var index = markdown.search(buildResourceRegExp(resource));
            if (prevResourceId) {
                resourceEnds[prevResourceId] = index;
            }
            prevResourceId = resource.__id;
        });
    });
    resourceEnds[prevResourceId] = markdown.length;
    return resourceEnds;
}

function buildResourceRegExp(resource) {
    var header = '^# +';
    if (resource.name) {
        header += resource.name + ' +\\[ *';
    }
    header += '([A-Z]+ +)?';
    header += resource.uriTemplate;
    if (resource.name) {
        header += resource.name + ' *\\]';
    }
    return new RegExp(header);
}

function findKey(index, lineNumbers) {
    return _.findKey(lineNumbers, function(end) {
        return end > index;
    });
}

function prependWarnings(warnings, json, done) {
    json.warnings = warnings.concat(json.warnings || []);
    done(null, json);
}

function mergeJsonDocumentation(targetJson, json) {
    if (!targetJson || !json) {
        return targetJson || json;
    }
    _.each(json.ast.resourceGroups, function(resourceGroup) {
        var targetGroup = _.find(targetJson.ast.resourceGroups, {
            name: resourceGroup.name
        });
        if (targetGroup) {
            targetGroup.resources = targetGroup.resources.concat(resourceGroup.resources);
        } else {
            targetJson.ast.resourceGroups.push(resourceGroup);
        }
    });
    if (json.warnings.length) {
        targetJson.warnings = targetJson.warnings.concat(json.warnings);
    }
    return targetJson;
}

function decorateExternalPrefix(json, prefix) {
    if (json && prefix !== localPrefix) {
        json.__domain = prefix;
        json.ast.metadata = json.ast.metadata || [];
        if (!_.find(json.ast.metadata, {
                name: 'HOST'
            })) {
            json.ast.metadata.push({
                name: 'HOST',
                value: domains[prefix].url
            });
        }
    }
}

function matchAction(jsonDocumentation, path, method) {
    if (!jsonDocumentation || !path || !method) {
        return undefined;
    }

    var result;
    _.each(jsonDocumentation.ast.resourceGroups, function(resourceGroup) {
        _.each(resourceGroup.resources, function(resource) {
            _.each(resource.actions, function(action) {
                var uriTemplate = _.get(action, 'attributes.uriTemplate') || resource.uriTemplate;
                var uriTemplateRegex = createUriTemplateRegex(uriTemplate);
                var regexMatch;
                if (method === action.method && (regexMatch = uriTemplateRegex.exec(path))) {
                    var parameters = _.cloneDeep(action.parameters || []).concat(resource.parameters || []);
                    parameters = _.unique(parameters, 'name');
                    addParamTypes(parameters, uriTemplate);
                    parameters.sort(function byParamType(a, b) {
                        return (paramTypeOrder[a.paramType] || 3) - (paramTypeOrder[b.paramType] || 3);
                    });
                    setPathParameterValues(parameters, regexMatch);
                    result = _.extend({
                        actualUriTemplate: uriTemplate,
                        actualParameters: parameters,
                        resource: resource,
                        resourceGroup: resourceGroup
                    }, action);
                }
                return !result;
            });
            return !result;
        });
        return !result;
    });
    return result;
}

function createUriTemplateRegex(uriTemplate) {
    // kill query and fragment parameters
    uriTemplate = uriTemplate.replace(/\{[\?&#][^\}]+\}/g, '');
    // individualize comma-separated parameters
    var result;
    while (!!(result = /\{([#&\?\+]?)([^,\}]+),/g.exec(uriTemplate))) {
        var operator = (result[1] === '?' ? '&' : result[1]);
        uriTemplate = uriTemplate.substring(0, result.index) +
            '{' + result[1] + result[2] +
            '}{' + operator + uriTemplate.substring(result.index + result[0].length);
    }
    // swap out path parameters with regular expresssions
    uriTemplate = uriTemplate.replace(/\{\+[^\}]+\}/g, '(.*)');
    uriTemplate = uriTemplate.replace(/\{[\w%][^\}]*\}/g, '([^/]*)');
    // enforce an optional trailing slash
    if (!_.endsWith(uriTemplate, '/')) {
        uriTemplate += '/';
    }
    uriTemplate += '?$';
    return new RegExp(uriTemplate);
}

function addParamTypes(parameters, uriTemplate) {
    var start = uriTemplate.indexOf('{');
    var foundQuery = false;
    var eachFunction = function(name) {
        var explode = _.endsWith(name, '*') || _.startsWith(name, '*');
        if (explode) {
            name = name.replace('*', '');
        }
        var parameter = _.find(parameters, {
            name: name
        });
        if (parameter) {
            parameter.paramType = paramType;
            parameter.explode = explode;
        }
    };
    while (start !== -1) {
        ++start;

        var paramType = operators[uriTemplate.charAt(start)] || 'path';
        if (paramType !== 'path') {
            ++start;
            foundQuery = foundQuery || paramType === 'query';
            if (paramType === 'reserved') {
                paramType = 'path';
            }
        }
        if (paramType === 'path' && foundQuery) {
            paramType = 'query';
        }

        var end = uriTemplate.indexOf('}', start);
        var names = uriTemplate.substring(start, end).split(',');

        _.each(names, eachFunction);

        start = uriTemplate.indexOf('{', end);
    }
}

function setPathParameterValues(parameters, regexMatch) {
    _.each(parameters, function(parameter, index) {
        if (parameter.paramType !== 'path') {
            return false;
        }
        parameter.value = regexMatch[index + 1];
    });
}
