'use strict';

var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var httpMocks = require('node-mocks-http');
var ajv = require('ajv')();
var sinon = require('sinon');
var rdk = require('../src/core/rdk');
var loadResources = require('../src/utils/test-resources-loader-spec-helper');
var buildDescription = loadResources.buildDescription;
var mockHttp = require('./http-mock').mockHttp;
var mockVistaJS = require('./vistajs-mock').mockVistaJS;
var mockParameters = require('./mock-parameters');
var verifyUnchangedParameters = require('./verify-unchanged-parameters');
var IncludeParams = mockParameters.IncludeParams;
var readSchema = require('./record-schemas-outerceptor').readSchema;
var apiBlueprint = require('../src/core/api-blueprint/api-blueprint');

// Make the below true to enable request logging
var enableLogging = false;
var printBodyForSchemaErrors = false;
var app;
var user;
var versioningConfig;

describe('For API version stability,', function() {

    mockHttp();
    mockVistaJS();
    app = createApp();
    user = JSON.parse(fs.readFileSync('versioning-tests/IP    .json', {encoding: 'utf8'}));
    versioningConfig = loadVersioningConfig();

    // FUTURE-TODO: get rid of this skip list
    var skip = [
        '/fhir/',// the services are changing to the 1.0 spec
        '/asu-resource',// missing the asu config
        '/tasks-resource',// missing the JBPM config
        '/user-resource',// missing userResourceConfig
        'order-detail-resource',// this always errors for me, live
        '/orderables/orderables',// this always errors for me, live
        '/cds-',// (temporary?) issues with the DB that CDS uses
        '/user-defined-screens/',// TEMP
    ];

    var resources = loadResources(app);
    initResources(resources);

    var filePaths = _.keys(resources).sort();
    _.each(filePaths, function(filePath) {
        // FUTURE-TODO: kill these skip tests
        if (_.contains(filePath, '/write/') && !_.contains(filePath, '/write/pick-list/')) {
            return;
        }
        if (_.find(skip, function(entry) {
            return _.contains(filePath, entry);
        })) {
            return;
        }

        var resourceConfigs = resources[filePath];
        _.each(resourceConfigs, function(resource) {
            var description = buildDescription(resource, resourceConfigs, filePath);

            describe(description, function(suite) {

                var method = getMethod(resource);
                var error;

                before(function(done) {
                    this.timeout(120000);

                    prepareRequests(resource, method, function(err, requests) {

                        describe(description, function() {
                            _.each(requests, function(request) {
                                var should = buildShouldPhrase(request);

                                it(should, function(done) {
                                    makeRequest(request, resource, done);
                                });
                            });

                            done(err);
                        });
                    });
                });

                if (!resource.undocumented) {
                    it('should have API Blueprint documentation', function() {
                        error = error || 'Missing documentation for ' + method.toUpperCase() + ' ' + resource.path;
                        expect(resource.jsonDocumentation, error).to.be.an.object();
                        expect(mockParameters.actionDocumentationFor(resource, method.toUpperCase()), error).to.be.an.object();
                    });

                    it('should not have warnings in its API Blueprint documentation', function(done) {
                        if (!_.isEmpty(resource.jsonDocumentation.warnings)) {
                            apiBlueprint.loadFullMarkdown(resource.filePath + '.md', resource.mountpoint, null, function(error, markdown) {
                                expect(resource.jsonDocumentation.warnings, markdown).to.be.empty();
                                done();
                            });
                        } else {
                            done();
                        }
                    });

                    it('should not change its parameters', function() {
                        verifyUnchangedParameters(resource, method);
                    });
                }

            });
        });
    });
});

function buildShouldPhrase(request) {
    var phrase = 'should handle a ' + request.method + ' request';
    if (request.versioningSetup.simulateExternalError) {
        phrase += ' with a \'' + request.versioningSetup.simulateExternalError + '\' error from external resources';
    } else {
        phrase += ' with ' + request.versioningSetup.includeParams.replace(/none/, 'no') + ' parameters provided';
    }
    return phrase;
}

function createApp() {
    return rdk.appfactory().defaultConfigFilename('../../config/rdk-fetch-server-config.json').build();
}

function loadVersioningConfig() {
    var versioningConfig = require('./versioning-tests-config.json');
    _.each(versioningConfig.ignore, function(ignore) {
        delete ignore.justification;
    });
    return versioningConfig;
}

function initResources(resources) {
    _.each(resources, function(resourceConfigs, filePath) {
        _.each(resourceConfigs, function(resource) {
            resource.filePath = filePath;
            resource.interceptors = _.merge((resource.interceptors || {}), {
                metrics: true,
                audit: true,
                validatePid: true,
                assignRequestSite: true,
                convertPid: true,
                validateRequestParameters: true,
                authentication: false,
                pep: false,
                operationalDataCheck: false,
                synchronize: false
            });
            if (!resource.undocumented) {
                var path = resource.mountpoint.length > 1 ? resource.mountpoint : resource.path;
                var markdownPath = resource.apiBlueprintFile || filePath + '.md';
                apiBlueprint.registerResource(path, markdownPath, false);
            }
        });
    });
}

function getMethod(resource) {
    return _.find(['get', 'post', 'put', 'delete'], function(httpMethod) {
        return _.has(resource, httpMethod);
    });
}

function prepareRequests(resource, method, callback) {
    apiBlueprint.jsonDocumentationForPath(resource.path, function(error, jsonDocumentation) {
        if (error) {
            return callback(error);
        }

        resource.jsonDocumentation = jsonDocumentation;

        var requests = [
            prepareRequest(resource, method, IncludeParams.required),
            prepareRequest(resource, method, IncludeParams.required, 'ESIMULATED'),
            prepareRequest(resource, method, IncludeParams.required, 404),
            prepareRequest(resource, method, IncludeParams.required, 500)
        ];
// FUTURE-TODO: use the first request to determine the number of external calls, then create requests
// that simulate failure for each one in turn. This would also avoid the 404/500 requests for
// VistaJS resources.

// FUTURE-TODO: maybe create separate requests for each member of enum parameters.

// FUTURE-TODO: if a resource has multiple request types (like permission-sets-resource), test each one.
        if (mockParameters.parametersFor(resource, method).length > 0) {
            requests.push(prepareRequest(resource, method, IncludeParams.all));
            requests.push(prepareRequest(resource, method, IncludeParams.none));
// FUTURE-TODO: support invalid
            // requests.push(prepareRequest(resource, method, IncludeParams.invalid));
        }

        return callback(null, _.filter(requests));
    });
}

function prepareRequest(resource, method, includeParams, simulateExternalError) {
    if (shouldIgnoreRequest(resource, method, includeParams, simulateExternalError)) {
        return undefined;
    }

    var parameters = mockParameters(resource, method, includeParams);
    var url = replacePathParameters(resource.path, parameters.path);

    var request = httpMocks.createRequest({
        method: method.toUpperCase(),
        url: url,
        headers: parameters.headers,
        params: parameters.path,
        query: parameters.query,
        body: parameters.body
    });

    request.route = {
        path: resource.path,
        stack: [{
            handle: resource[method],
            name: resource.title,
            method: method
        }]
    };

    request.session = {
        user: user,
        cookie: {
          httpOnly: true,
          path: '/',
          expires: new Date().toString()
        },
        touch: function() {},
        destroy: function(callback) {
            delete this.user;
            callback();
        }
    };

    request.app = app;
    request._resourceConfigItem = resource;
    request.interceptorResults = {};
    if (enableLogging) {
        request.logger = app.logger;
    } else {
        request.logger = sinon.stub(require('bunyan').createLogger({name: 'versioning-tests'}));
    }

    request.versioningSetup = {
        includeParams: includeParams,
        simulateExternalError: simulateExternalError
    };

    return request;
}

function shouldIgnoreRequest(resource, method, includeParams, simulateExternalError) {
    var candidate = {
        path: resource.path,
        method: method.toUpperCase(),
        includeParams: includeParams,
        simulateExternalError: simulateExternalError
    };
    if (simulateExternalError) {
        candidate.simulateExternalError = simulateExternalError;
    }
    return _.filter(versioningConfig.ignore, function(ignore) {
        return _.isMatch(ignore, candidate) || _.isMatch(candidate, ignore);
    }).length > 0;
}

function replacePathParameters(url, pathParams) {
    _.each(pathParams, function(value, name) {
        url = url.replace(':' + name, value);
    });
    return url;
}

function makeRequest(request, resource, done) {
    var method = request.method.toLowerCase();
    var response;
    var responses = [];
    var handleResponse = function() {
        // some resources erroneously send multiple responses
        responses.push(response._getData());
        expect(responses.length, 'Sent multiple responses: ' + JSON.stringify(responses)).to.equal(1);

        checkResponse(response, request, resource);

        // allows checking for multiple responses
        setImmediate(done);
    };

    response = prepareResponse(resource, handleResponse);
    callInterceptors(resource, request, response, function() {
        if (request.versioningSetup.simulateExternalError) {
            // A horrible hack: the only way of reliably communicating with the HTTP and VistaJS
            // subsystems is through the logger which is always passed to their config.
            request.logger = inheritClone(request.logger);
            request.logger.simulateExternalError = request.versioningSetup.simulateExternalError;
        }

        resource[method](request, response, handleResponse);
    });
}

function inheritClone(item) {
    // this allows us to keep prototype fields, which in the case of logger are necessary
    var Constructor = function() {};
    Constructor.prototype = item;
    return new Constructor();
}

function prepareResponse(resource, done) {
    var response = httpMocks.createResponse();

    response.type = function() {return response;};

    var fakeapp = {
        use: function(next) {
            next({}, response, function(){});
        }
    };
    rdk.appfactory._addRdkSendToResponse(fakeapp);

    response._wrapped_emit = response.emit;
    response.emit = function(event) {
        if (event === 'end') {
            done();
        }
        this._wrapped_emit.apply(this, arguments);
    };

    response.setTimeout = function() {};

    return response;
}

function callInterceptors(resource, request, response, next) {
    _.eachRight(app.interceptors, function(interceptor) {
        var interceptorName = _.first(_.keys(interceptor));
        if (resource.interceptors[interceptorName]) {
            next = interceptor[interceptorName].bind(null, request, response, next);
        }
    });

    next();
}

function checkResponse(response, request, resource) {
    var expectError = expectExternalError(request) || expectParameterError(request);
    if (expectError) {
        if (_.isNumber(expectError)) {
            expect(response.statusCode, 'Unexpected response status code').to.equal(expectError);
        }
    } else {
        var message = 'Expected successful response status code';
        if (response.statusCode < 200 || response.statusCode >= 300) {
            message += ', ' + JSON.stringify(response._getData());
        }
        expect(response.statusCode, message).to.be.gte(200);
        expect(response.statusCode, message).to.be.lt(300);
    }

    var checkSchema = true;
    var expectedStatusCode = false;
    var action = mockParameters.actionDocumentationFor(resource, request.method);
    if (action) {
        _.each(action.examples, function(example) {
            _.each(example.responses, function(exampleResponse) {
                var statusCode = parseInt(exampleResponse.name, 10);
                if (response.statusCode === statusCode) {
                    expectedStatusCode = true;
                    if (exampleResponse.schema) {
                        try {
                            var schema = JSON.parse(exampleResponse.schema);
                        } catch (e) {
                            console.log('failed to parse schema ' + exampleResponse.schema);
                            throw e;
                        }
                        validateAgainstSchema(schema, response, resource);
                        checkSchema = false;
                    } else if (statusCode === 204) {
                        checkSchema = false;
                    } else {
                        var contentType = (_.find(exampleResponse.headers, function(header) {
                            return header.name === 'Content-Type';
                        }) || {}).value;
                        if (contentType && !_.contains(contentType, 'json')) {
                            checkSchema = false;
                        }
                    }
                }
            });
        });

        var error = 'Unexpected status code: ' + response.statusCode + ' not listed in API Blueprint documentation for ' + resource.filePath;
        expect(expectedStatusCode, error).to.be.true();

// FUTURE-TODO: verify that all documented status codes were exercised?
    }

    if (checkSchema) {
        var schema;
        try {
            schema = readSchema(request, response);
        } catch (e) {}

        validateAgainstSchema(schema, response, resource);
    }
}

function expectExternalError(request) {
    if (request.logger.didSimulateExternalError) {
        return request.logger.simulateExternalError;
    }
    return false;
}

function expectParameterError(request) {
    var includeParams = request.versioningSetup.includeParams;
    return includeParams === IncludeParams.none || includeParams === IncludeParams.invalid;
}

function validateAgainstSchema(schema, response, resource) {
    if (!schema) {
        throw new Error('No response schema found for ' + resource.filePath + ' with status code ' + (response.statusCode || 200));
    }

    var body = response._getData();
    try {
        body = JSON.parse(body);
    } catch (e) {}

    var valid = ajv.validate(schema, body);
    if (!valid && printBodyForSchemaErrors) {
        console.log(JSON.stringify(body));
    }
    expect(valid, ajv.errorsText(ajv.errors, { dataVar: 'response' })).to.be.true();
}
