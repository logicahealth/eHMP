'use strict';

var fs = require('fs');
var _ = require('lodash');
var ajv = require('ajv')();
var async = require('async');
var rdk = require('../rdk');
var loadResources = require('../../utils/test-resources-loader');
var buildDescription = loadResources.buildDescription;
var apiBlueprint = require('./api-blueprint');

var ignoreWarnings = {
    // part of a regular expression mistaken as a transclude:
    '/fhir/communicationrequest': [{ message: 'Transclude Error: File (\\\\.[0-9]+) not found.' }],
    // uses an in-progress feature of API Blueprint (see https://github.com/apiaryio/api-blueprint/issues/58)
    '/labSupportData': [{ message: 'ignoring unrecognized block' }, { message: 'empty request message-body' }]
};
var requireExamples = false;

describe('API Blueprint documentation,', function() {

    var resources = loadResources();

    var filePaths = _.keys(resources).sort();
    _.each(filePaths, function (filePath) {

        var resourceConfigs = resources[filePath];
        _.each(resourceConfigs, function (resource) {
            if (resource.undocumented) {
                return;
            }

            var method = getMethod(resource);
            var mountpoint = resource.mountpoint.length > 1 ? resource.mountpoint : resource.path;
            var markdownPath = getMarkdownPath(resource, filePath);

            describe(buildDescription(resource, resourceConfigs, filePath, method), function () {

                before(function(done) {
                    this.timeout(120000);

                    apiBlueprint.jsonDocumentationFromFile(markdownPath, mountpoint, function (error, json) {
                        resource.jsonDocumentation = json;
                        resource.actionDocumentation = apiBlueprint.matchAction(json, resource.path, method);
                        done();
                    });
                });

                it('must have an API Blueprint documentation file', function (done) {
                    fs.stat(markdownPath, function (error, stats) {
                        expect(stats, 'Please write API Blueprint documentation for ' + filePath + '\nSee instructions at https://IP_ADDRESS/documentation/#/rdk/documenting').to.not.be.undefined();
                        done();
                    });
                });

                it('must document the ' + resource.path + ' path', function () {
                    expect(resource.actionDocumentation, 'Please document the ' + resource.path + ' path').to.not.be.undefined();
                });

                it('must have no parse warnings', function () {
                    this.timeout(10000);

                    if (!resource.jsonDocumentation) {
                        return;
                    }

                    var actualWarnings = resource.jsonDocumentation.warnings;
                    if (ignoreWarnings[mountpoint]) {
                        actualWarnings = _.reject(resource.jsonDocumentation.warnings, function (warning) {
                            return _.find(ignoreWarnings[mountpoint], function (ignoreWarning) {
                                return _.isMatch(warning, ignoreWarning);
                            });
                        });
                    }

                    expect(actualWarnings).to.be.empty();
                });

                it('must have valid examples', function () {
                    this.timeout(10000);

                    if (!resource.actionDocumentation) {
                        return;
                    }

                    _.each(resource.actionDocumentation.examples, function (example) {
                        var requests = _.map(example.requests, withType.bind(null, 'request'));
                        var responses = _.map(example.responses, withType.bind(null, 'response'));

                        _.each(requests.concat(responses), function (item) {
                            if (!item.example.body || !item.example.schema) {
                                var contentType = (_.find(item.example.headers, function (header) {
                                    return header.name === 'Content-Type';
                                }) || {}).value;
                                if (contentType && _.contains(contentType, 'json')) {
                                    if (requireExamples) {
                                        expect(item.example.body, 'Please write an example JSON ' + item.type + ' body').to.not.be.empty();
                                        expect(item.example.schema, 'Please write a schema for the ' + item.type + ' body').to.not.be.empty();
                                    } else {
                                        if (!item.example.body) {
                                            console.log('Please write an example JSON ' + item.type + ' body');
                                        }
                                        if (!item.example.schema) {
                                            console.log('Please write a schema for the ' + item.type + ' body');
                                        }
                                    }
                                }
                                return;
                            }

                            try {
                                var schema = parseJson(item.example.schema, item.type + ' schema is not valid JSON');
                                var body = parseJson(item.example.body, item.type + ' is not valid JSON');

                                var valid = ajv.validate(schema, body);
                                expect(valid, ajv.errorsText(ajv.errors, { dataVar: item.type })).to.be.true();
                            } catch (e) {
                                deletePreparsedDocumentation(markdownPath);
                                throw e;
                            }
                        });
                    });
                });
            });
        });
    });
});

function getMarkdownPath(resource, filePath) {
    return resource.apiBlueprintFile || filePath + '.md';
}

function getMethod(resource) {
    return _.find(['get', 'post', 'put', 'delete'], function(httpMethod) {
        return _.has(resource, httpMethod);
    }).toUpperCase();
}

function withType(type, item) {
    return {
        example: item,
        type: item.name + ' ' + type
    };
}

function parseJson(json, errorMessage) {
    try {
        return JSON.parse(json);
    } catch (e) {
        throw new Error(errorMessage);
    }
}

function deletePreparsedDocumentation(markdownPath) {
    try {
        fs.unlinkSync(apiBlueprint.preparsedJsonPath(markdownPath));
    } catch (e) { }
}
