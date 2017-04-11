'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var async = require('async');
var dd = require('drilldown');
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
    } else if (development && _.endsWith(req.path, '.md')) {
        renderMarkdownSource(mountpoint, req, res);
    } else {
        renderSingleResource(mountpoint, req, res);
    }
}

function renderAllResources(req, res) {
    if (fullHtml) {
        return sendHtml(res, null, fullHtml);
    }

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
        renderHtml
    ], function cacheHtml(error, html) {
        renderedHtml[mountpoint] = html;
        sendHtml(res, error, html);
    });
}

function renderMarkdownSource(path, req, res) {
    var markdownPath = path;
    if (!_.startsWith(path, 'http')) {
        var rootPath = __dirname.substring(0, __dirname.indexOf(rootDir) + rootDir.length);
        markdownPath = rootPath + path;
    }
    var mountpoint = req.query.mountpoint;
    apiBlueprint.loadFullMarkdown(markdownPath, mountpoint, null, function(error, markdown) {
        if (markdown) {
            apiBlueprint.jsonDocumentationForPath(mountpoint, function(docsError, json) {
                var html;
                var context = {
                    filename: fspath.basename(path),
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
    var prefix = _.trimRight(module.exports.resourcesUri, '/');
    async.each(json.ast.resourceGroups, function(resourceGroup, groupDone) {
        async.each(resourceGroup.resources, function(resource, resourceDone) {
            if (resource.uriTemplate && !_.startsWith(resource.uriTemplate, prefix)) {
                resource.uriTemplate = prefix + resource.uriTemplate;
            }
            async.each(resource.actions, function(action, actionDone) {
                var uriTemplate = dd(action)('attributes')('uriTemplate').val;
                if (uriTemplate && !_.startsWith(uriTemplate, prefix)) {
                    action.attributes.uriTemplate = prefix + uriTemplate;
                }
                actionDone();
            }, resourceDone);
        }, groupDone);
    }, function(error) {
        done(error, json);
    });
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
                text += warning.message + '\n  (';
                if (location.file) {
                    var index = location.file.indexOf(rootDir);
                    var file = _.trimLeft(index ? location.file.substring(index + rootDir.length) : location.file, '/');
                    var line = location.line ? '#' + (location.line - 1) : '';
                    // uriTemplate without query and fragment parameters
                    var mountpoint = resource.uriTemplate.replace(/\{[\?&#][^\}]+\}/g, '');
                    index = mountpoint.indexOf(module.exports.resourcesUri);
                    mountpoint = (index !== -1) ? mountpoint.substring(index + module.exports.resourcesUri.length) : mountpoint;
                    text += 'in [' + file + '](' + prefix + '/' + file + '?mountpoint=' + encodeURIComponent(mountpoint) + line + ') ';
                }
                if (location.line) {
                    text += 'line ' + location.line;
                } else  {
                    text += 'index ' + location.index;
                }
                text += ')\n:::\n\n';
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
