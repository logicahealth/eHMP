'use strict';

var _ = require('lodash');
var url = require('url');
var interceptor = require('./validate-request-parameters');
var rdk = require('../core/rdk');

describe('The parameter validation interceptor', function() {

    var action;
    var expectedErrors;

    beforeEach(function() {
        var jsonDocs = mockJsonDocs();
        action = jsonDocs.ast.resourceGroups[0].resources[0].actions[0];
        expectedErrors = undefined;
        sinon.stub(rdk.apiBlueprint, 'jsonDocumentationForPath', function(req, callback) {
            callback(null, jsonDocs);
        });
    });

    it('should succeed when there are no parameters', function(done) {
        defineParameters();
        var req = mockRequest('/some/url');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should allow required parameters with a default value', function(done) {
        defineParameters({name: 'q1', default: 'hello'});
        var req = mockRequest('/some/url');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should allow missing optional parameters', function(done) {
        defineParameters({name: 'q1', required: false});
        var req = mockRequest('/some/url');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should allow empty optional parameters', function(done) {
        defineParameters({name: 'q1', type: 'boolean', required: false});
        var req = mockRequest('/some/url?q1');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should ignore fragment parameters', function(done) {
        defineParameters({name: 'q1', paramType: 'fragment'});
        var req = mockRequest('/some/url');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should support "explode" parameters', function(done) {
        defineParameters({name: 'q1', explode: true});
        var req = mockRequest('/some/url?q1=jim&q1=bob');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should support "explode" enum parameters', function(done) {
        defineParameters({name: 'q1', values: ['jim', 'bob'], explode: true});
        var req = mockRequest('/some/url?q1=jim&q1=bob');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should support "explode" enum parameters with a comma-separated value', function(done) {
        defineParameters({name: 'q1', values: ['jim', 'bob'], explode: true});
        var req = mockRequest('/some/url?q1=jim,bob');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should refuse repeated non-"explode" parameters', function(done) {
        defineParameters({name: 'q1', values: ['jim', 'bob']});
        var req = mockRequest('/some/url?q1=jim&q1=bob');

        expectErrors('The \"q1\" parameter repeats but isn\'t marked with \"*\" in its URI Template');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should parse parameters', function(done) {
        defineParameters({name: 'q1', type: 'number'});
        var req = mockRequest('/some/url?q1=23');

        interceptor(req, mockResponse(done), mockNext(function() {
            expect(req.parsedParams).to.be.an.object();
            expect(req.parsedParams.q1).to.be.a.number();
            expect(req.parsedParams.q1).to.equal(23);
            done();
        }));
    });

    it('should require query parameters', function(done) {
        defineParameters({name: 'q1'});
        var req = mockRequest('/some/url');

        expectErrors('The required parameter "q1" is missing.');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should require parameters that aren\'t in the uriTemplate', function(done) {
        defineParameters({name: 'q1', paramType: ''});
        var req = mockRequest('/some/url');

        expectErrors('The required parameter "q1" is missing.');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should require comma-separated query parameters', function(done) {
        defineParameters({name: 'q1'}, {name: 'q2'});
        var req = mockRequest('/some/url');

        expectErrors('The required parameter "q1" is missing.', 'The required parameter "q2" is missing.');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should accept path parameters', function(done) {
        defineParameters({name: 'p1', paramType: 'path'});
        var req = mockRequest('/some/url/test');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should require path parameters', function(done) {
        defineParameters({name: 'p1', paramType: 'path'});
        var req = mockRequest('/some/url/');

        expectErrors('The required parameter "p1" is missing.');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should require reserved path parameters', function(done) {
        defineParameters({name: 'r1', paramType: 'reserved'});
        var req = mockRequest('/some/url');

        expectErrors('The required parameter "r1" is missing.');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should check number parameters', function(done) {
        defineParameters({name: 'q1', type: 'number', required: false});
        var req = mockRequest('/some/url?q1=hello');

        expectErrors('The "q1" parameter must be a number but was "hello".');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should check boolean parameters', function(done) {
        defineParameters({name: 'q1', type: 'boolean'});
        var req = mockRequest('/some/url?q1=hello');

        expectErrors('The "q1" parameter must be "true" or "false" but was "hello".');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should check parameters with a pattern', function(done) {
        defineParameters({name: 'q1', description: 'Awesome!\n\nPattern: `\\d+`'});
        var req = mockRequest('/some/url?q1=hello');

        expectErrors('The "q1" parameter\'s value "hello" doesn\'t match the pattern "\\d+".');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should check enum parameters', function(done) {
        defineParameters({name: 'q1', values: ['jim', 'bob']});
        var req = mockRequest('/some/url?q1=hello');

        expectErrors('The "q1" parameter was "hello" but must be one of "jim", "bob".');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should accept enum parameters', function(done) {
        defineParameters({name: 'q1', values: ['jim', 'bob']});
        var req = mockRequest('/some/url?q1=jim');

        interceptor(req, mockResponse(done), mockNext(done));
    });

    it('should validate the request body when there\'s a request schema', function(done) {
        defineParameters();
        addRequestBodySchema({
            type: 'object',
            properties: {
                name: { type: 'string' },
                greeting: { type: 'string' }
            },
            required: ['name']
        });
        var req = mockRequest('/some/url');
        req.body = {
            greeting: 'Hi'
        };

        expectErrors('body.name is a required property');

        interceptor(req, mockResponse(done), mockNext(done));
    });


    function mockJsonDocs() {
        var jsonDocs = {
            ast: {
                resourceGroups: [{
                    resources: [{
                        uriTemplate: '/some/url',
                        parameters: [],
                        actions: [{
                            method: 'GET',
                            parameters: [],
                            attributes: {
                                uriTemplate: ''
                            }
                        }]
                    }]
                }]
            }
        };
        return jsonDocs;
    }

    function defineParameters() {
        var templateParams = '';
        action.parameters = _.map(arguments, function(parameter) {
            var defaultParameter = {
                type: 'string',
                required: true,
                default: '',
                example: '',
                values: []
            };
            parameter = _.merge(defaultParameter, parameter);
            parameter.values = _.map(parameter.values, function(value) {
                return {value: value};
            });
            templateParams += formatParameter(parameter);
            return parameter;
        });
        if (templateParams) {
            action.attributes.uriTemplate = '/some/url' + templateParams;
        }
    }

    function formatParameter(parameter) {
        var template;
        switch (parameter.paramType) {
        case 'path':
            template = '/{';
            break;
        case 'fragment':
            template = '{#';
            break;
        case 'reserved':
            template = '{+';
            break;
        default:
            template = '{?';
            break;
        }
        delete parameter.paramType;
        template += parameter.name;
        if (parameter.explode) {
            template += '*';
            delete parameter.explode;
        }
        template += '}';
        return template;
    }

    function addRequestBodySchema(schema) {
        var examples = [ { requests: [ { schema: JSON.stringify(schema) } ] } ];
        action.examples = examples;
    }

    function mockRequest(uri) {
        var request = url.parse(uri, true);
        request.path = request.pathname;
        request.logger = {
            trace: function() {},
            debug: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        };
        request.param = function(name) {
            return request.query[name];
        };
        request.method = 'GET';
        return request;
    }

    function mockResponse(done) {
        return {
            rdkSend: function(response) {
                var sentErrors = _.isString(response) ? [response] : response.data.errors;
                if (_.isUndefined(expectedErrors)) {
                    throw new Error('Expected successful validation but got ' + JSON.stringify(sentErrors, null, 2));
                } else if (expectedErrors !== true) {
                    expect(sentErrors).to.eql(expectedErrors);
                }
                done();
            },
            status: function(status) {
                return this;
            }
        };
    }

    function mockNext(done) {
        return function() {
            expect(expectedErrors).to.be.falsy();
            done();
        };
    }

    function expectErrors(expected) {
        expectedErrors = _.toArray(arguments);
        expectedErrors = expectedErrors.length ? expectedErrors : true;
    }

});
