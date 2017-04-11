'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var async = require('async');
var theme = require('aglio-theme-olio');
var handlebars = require('handlebars');
var apiBlueprint = require('./api-blueprint');

module.exports.apiBlueprintDocsUri = '/docs/vx-api';
module.exports.resourcesUri = null;
module.exports.getResourceConfig = getResourceConfig;

var development = false;
var fullHtml;
var renderedHtml = {};
var rootDir = 'src/';
var markdownPath = '/markdown';
var sourceCodeTemplate;

function getResourceConfig(app) {
    module.exports.resourcesUri = app.config.rootPath;
    development = app.config.environment === 'development';
    if (development) {
        var template = fs.readFileSync(fspath.resolve(__dirname, './source-code.handlebars'), {encoding: 'utf8'});
        sourceCodeTemplate = handlebars.compile(template);
    }

    return [{
        name: 'vx-api',
        interceptors: {
            authentication: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true,
        permitResponseFormat: true,
        get: renderDocumentation,
        undocumented: true
    }];
}

function renderDocumentation(req, res) {
    var index = req.path.indexOf(module.exports.apiBlueprintDocsUri);
    if (index === -1) {
        throw new Error('Invalid documentation request path ' + req.path);
    }
    var mountpoint = req.path.substring(index + module.exports.apiBlueprintDocsUri.length);
    if (!module.exports.resourcesUri) {
        module.exports.resourcesUri = req.path.substring(0, index);
    }

    req.logger.debug({mountpoint: mountpoint}, 'Render API Blueprint docs');

    if (mountpoint.length <= 1) {
        renderAllResources(req, res);
    } else if (development && _.endsWith(req.path, markdownPath)) {
        renderMarkdownSource(req, res);
    } else {
        renderSingleResource(mountpoint, req, res);
    }
}

function renderAllResources(req, res) {
    if (fullHtml) {
        return sendHtml(res, null, fullHtml);
    }

    fullHtml = fs.readFileSync(fspath.resolve(__dirname, './loading.html'), {encoding: 'utf8'});

    apiBlueprint.getAllJsonDocumentation(function(error, json) {
        if (error) {
            return res.status(500).rdkSend(error);
        }

        var indexPath = fspath.resolve(__dirname, './index.md');
        async.waterfall([
            apiBlueprint.jsonDocumentationFromFile.bind(null, indexPath, null),
            function mergeJson(indexJson, callback) {
                indexJson = apiBlueprint.mergeJsonDocumentation(indexJson, json);
                callback(null, indexJson);
            },
            prependResourcesUri,
            addFieldsParameter,
            addSpyForVersioningParameter,
            addMissingExampleWarnings,
            displayWarnings,
            renderHtml
        ], function(error, html) {
            if (error) {
                return res.status(500).rdkSend(error);
            }
            fullHtml = html;
            sendHtml(res, error, html);
        });
    });
}

function renderSingleResource(mountpoint, req, res) {
    if (renderedHtml[mountpoint]) {
        return sendHtml(res, null, renderedHtml[mountpoint]);
    }

    async.waterfall([
        apiBlueprint.jsonDocumentationForPath.bind(null, mountpoint),
        prependResourcesUri,
        addFieldsParameter,
        addSpyForVersioningParameter,
        addMissingExampleWarnings,
        displayWarnings,
        renderHtml
    ], function cacheHtml(error, html) {
        renderedHtml[mountpoint] = html;
        sendHtml(res, error, html);
    });
}

function renderMarkdownSource(req, res) {
    var markdownPath = req.query.source;
    if (!_.startsWith(markdownPath, 'http')) {
        var rootPath = __dirname.substring(0, __dirname.indexOf(rootDir) + rootDir.length);
        markdownPath = rootPath + markdownPath;
    }
    var mountpoint = req.query.mountpoint;
    apiBlueprint.loadFullMarkdown(markdownPath, mountpoint, null, function(error, markdown) {
        if (markdown) {
            apiBlueprint.jsonDocumentationForPath(mountpoint, function(docsError, json) {
                var html;
                var context = {
                    filename: fspath.basename(req.query.source),
                    lines: markdown.split(/\r?\n/g)
                };
                if (json) {
                    _.each(json.warnings, function(warning) {
                        var location = _.first(warning.location);
                        if (location && location.line && location.column) {
                            var line = context.lines[location.line - 1];
                            if (!_.contains(line, '<span class="warning"')) {
                                var start = location.column - 1;
                                var end = location.column - 1 + Math.max(1, location.length);
                                context.lines[location.line - 1] = _.escape(line.substring(0, start)) + '<span class="warning" title="' + _.escape(warning.message) + '">' + _.escape(line.substring(start, end)) + '</span>' + _.escape(line.substring(end));
                            }
                        }
                    });
                }
                html = sourceCodeTemplate(context);
                sendHtml(res, error, html);
            });
        } else {
            sendHtml(res, error);
        }
    });
}

function prependResourcesUri(json, done) {
    if (json.__domain && json.__domain !== 'local') {
        return done(null, json);
    }

    var prefix = _.trimRight(module.exports.resourcesUri, '/');
    async.each(json.ast.resourceGroups, function(resourceGroup, groupDone) {
        async.each(resourceGroup.resources, function(resource, resourceDone) {
            if (resource.uriTemplate && !_.startsWith(resource.uriTemplate, prefix)) {
                resource.uriTemplate = prefix + resource.uriTemplate;
            }
            async.each(resource.actions, function(action, actionDone) {
                var uriTemplate = _.get(action, 'attributes.uriTemplate');
                if (uriTemplate && !_.startsWith(uriTemplate, prefix)) {
                    action.attributes.uriTemplate = prefix + uriTemplate;
                }
                setImmediate(actionDone);
            }, resourceDone);
        }, groupDone);
    }, function(error) {
        done(error, json);
    });
}

function addFieldsParameter(json, done) {
    addQueryParameter({
        name: 'fields',
        description: 'Define which fields to return using:\n\n`a,b,c` comma-separated list to select multiple fields.\n\n`a/b/c` path to select a field from its parent.\n\n`a(b,c)` sub-selection to select many fields from a parent.\n\nReference: [json-mask](https://github.com/nemtsov/json-mask)',
        type: 'string',
        required: false,
        default: '',
        example: '',
        values: []
    }, hasJsonResponse, json, done);
}

function addSpyForVersioningParameter(json, done) {
    addQueryParameter({
        name: 'spy-for-versioning',
        description: '**DEVELOPMENT ONLY:** when `true`, generate a schema from this resource\'s response, and capture responses from external systems like JDS and VistA.\n\nSchemas are generated under `src/core/api-blueprint/schemas`, and external responses are captured under `versioning-tests/recorded-responses`.',
        type: 'boolean',
        required: false,
        default: '',
        example: '',
        values: []
    }, function (action) {
        return development && hasJsonResponse(action);
    }, json, done);
}

function addQueryParameter(parameter, checkFunction, json, done) {
    if (json.__domain && json.__domain !== 'local') {
        return done(null, json);
    }

    async.each(json.ast.resourceGroups, function(resourceGroup, groupDone) {
        async.each(resourceGroup.resources, function(resource, resourceDone) {
            var applies = false;
            _.each(resource.actions, function(action) {
                if (!checkFunction(action)) {
                    return;
                }

                applies = true;
                var uriTemplate = _.get(action, 'attributes.uriTemplate');
                if (uriTemplate) {
                    action.parameters.push(parameter);
                    action.attributes.uriTemplate = appendQueryParameter(uriTemplate, parameter);
                }
            });

            if (applies && resource.uriTemplate) {
                resource.parameters.push(parameter);
                resource.uriTemplate = appendQueryParameter(resource.uriTemplate, parameter);
            }
            setImmediate(resourceDone);
        }, groupDone);
    }, function(error) {
        done(error, json);
    });

    function appendQueryParameter(uriTemplate, parameter) {
        uriTemplate += _.contains(uriTemplate, '{?') ? '{&' : '{?';
        uriTemplate += parameter.name;
        return uriTemplate + '}';
    }
}

function hasJsonResponse(action) {
    return !!_.find(action.examples, function(example) {
        return _.find(example.responses, function(response) {
            var statusCode = parseInt(response.name, 10);
            return (isNaN(statusCode) || statusCode < 300) &&
                _.find(response.headers, {name: 'Content-Type', value: 'application/json'});
        });
    });
}

function addMissingExampleWarnings(json, done) {
    if (!development) {
        return done(null, json);
    }

    _.each(json.ast.resourceGroups, function(resourceGroup) {
        _.each(resourceGroup.resources, function(resource) {
            _.each(resource.actions, function(action) {
                _.each(action.examples, function (example) {
                    var requests = _.map(example.requests, withType.bind(null, 'request'));
                    var responses = _.map(example.responses, withType.bind(null, 'response'));

                    _.each(requests.concat(responses), function (item) {
                        if (!item.example.body || !item.example.schema) {
                            var contentType = (_.find(item.example.headers, function (header) {
                                return header.name === 'Content-Type';
                            }) || {}).value;
                            if (contentType && _.contains(contentType, 'json')) {
                                addWarning(item.example, item.type, resource, action);
                            }
                            return;
                        }
                    });
                });
            });
        });
    });

    return done(null, json);

    function withType(type, item) {
        return {
            example: item,
            type: item.name + ' ' + type
        };
    }

    var nextResourceId;

    function addWarning(example, type, resource, action) {
        if (!resource.__id) {
            if (!nextResourceId) {
                nextResourceId = 1;
                while (findResourceById(nextResourceId, json)) {
                    ++nextResourceId;
                }
            }
            resource.__id = String(++nextResourceId);
        }

        var message = 'Please write an example ' + type;
        if (!example.body && !example.schema) {
            message += ' and schema';
        } else if (!example.schema) {
            message = 'Please write a schema for the ' + type;
        }
        var title = action.name || resource.name;
        if (action.method.toUpperCase() !== title.toUpperCase()) {
            title = action.method + ' ' + title;
        }
        json.warnings.push({
            code: -1,
            message: message + ' for endpoint *' + title + '*',
            location: [{
                resourceId: resource.__id
            }]
        });
    }
}

function displayWarnings(json, done) {
    if (!development) {
        return done(null, json);
    }

    var prefix = _.trimRight(module.exports.resourcesUri, '/') + module.exports.apiBlueprintDocsUri;

    _.each(json.warnings, function(warning) {
        var location = _.first(warning.location);
        if (location) {
            var resource = findResourceById(location.resourceId, json);
            if (resource) {
                var text = '::: warning\n<i class="fa fa-warning" title="API Blueprint parse warning"></i> ';
                text += warning.message + '\n';
                if (location.file || location.line || location.index) {
                    text += ' (';
                    if (location.file) {
                        var index = location.file.indexOf(rootDir);
                        var file = _.trimLeft(index > 0 ? location.file.substring(index + rootDir.length) : location.file, '/');
                        var line = location.line ? '#' + (location.line - 1) : '';
                        // uriTemplate without query and fragment parameters
                        var mountpoint = resource.uriTemplate.replace(/\{[\?&#][^\}]+\}/g, '');
                        index = mountpoint.indexOf(module.exports.resourcesUri);
                        mountpoint = (index !== -1) ? mountpoint.substring(index + module.exports.resourcesUri.length) : mountpoint;
                        text += 'in [' + file + '](' + prefix + markdownPath + '?source=' + encodeURIComponent(file) + '&mountpoint=' + encodeURIComponent(mountpoint) + line + ') ';
                    }
                    if (location.line) {
                        text += 'line ' + location.line;
                    } else {
                        text += 'index ' + location.index;
                    }
                    text += ')';
                }
                text += '\n:::\n\n';
                resource.description += text;
            }
        }
    });

    done(null, json);
}

function findResourceById(resourceId, json) {
    var resource;
    _.each(json.ast.resourceGroups, function(resourceGroup) {
        resource = _.find(resourceGroup.resources, {__id: resourceId});
        if (resource) {
            return false;
        }
    });
    return resource;
}

function renderHtml(json, done) {
    theme.render(json.ast, {themeForms: true}, done);
}

function sendHtml(res, error, html) {
    if (error) {
        return res.status(500).rdkSend(error);
    }
    return res.send(html);
}
