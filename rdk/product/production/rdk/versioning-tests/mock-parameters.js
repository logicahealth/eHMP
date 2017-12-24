'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var RandExp = require('randexp')
var apiBlueprint = require('../src/core/api-blueprint/api-blueprint');

var IncludeParams = {
    all: 'all',
    required: 'required',
    none: 'none',
// FUTURE-TODO: support invalid
    invalid: 'invalid'
};

module.exports = mockParameters;
module.exports.IncludeParams = IncludeParams;
module.exports.actionDocumentationFor = actionDocumentationFor;
module.exports.parametersFor = parametersFor;
module.exports.requestSchemaFor = requestSchemaFor;
module.exports.mockParameterValue = mockParameterValue;
module.exports.mockObjectFromSchema = mockObjectFromSchema;

var cannedParametersDirectory = 'versioning-tests/canned-parameters';

function mockParameters(resource, method, includeParams) {
    method = method.toUpperCase();

    var result = readCannedParameters(resource, method, includeParams);
    if (result) {
        return result;
    }

    result = {headers: {}, query: {}, body: {}, path: {}};

    if (includeParams === IncludeParams.none) {
        return result;
    }

    result.headers = headersFor(resource, method);

    var parameters = parametersFor(resource, method);
    _.each(parameters, function(parameter) {
        if (!parameter.paramType) {
            throw new Error('parameter "' + parameter.name + '" has no parameter type; did you forget to include it in the URI template?');
        }
        if (parameter.required || includeParams === IncludeParams.all) {
            var scope = result[parameter.paramType];
            scope[parameter.name] = String(mockParameterValue(parameter, resource));
        }
    });

    result.body = exampleBodyFor(resource, method) || result.body;
    if (!result.body) {
        var schema = requestSchemaFor(resource, method);
        if (schema) {
            result.body = mockObjectFromSchema(schema, resource, includeParams) || {};
        }
    }

    return result;
}

function readCannedParameters(resource, method, includeParams) {
    var path = cannedParametersPath(resource, method, includeParams);
    try {
        var json = fs.readFileSync(path, {encoding: 'utf8'});
        return JSON.parse(json);
    } catch(e) {}
}

function cannedParametersPath(resource, method, includeParams) {
    var path = resource.path;
    if (_.startsWith(path, '/')) {
        path = path.substring(1);
    }
    path = path.replace(/\//g, '_');
    path = encodeURIComponent(path);
    path += '-' + method + '-' + includeParams + '.json';
    return fspath.join(cannedParametersDirectory, path);
}

function actionDocumentationFor(resource, method) {
    if (!resource.jsonDocumentation) {
        return;
    }

    var action = resource.jsonDocumentationAction ||
        apiBlueprint.matchAction(resource.jsonDocumentation, resource.path, method);

    resource.jsonDocumentationAction = action;
    return action;
}

function headersFor(resource, method) {
    var action = actionDocumentationFor(resource, method);
    if (!action) {
        return;
    }

    var headers;
    _.each(action.examples, function(example) {
        _.each(example.requests, function(request) {
            headers = request.headers;
            return !headers;
        });
        return !headers;
    });
    return _.chain(headers).indexBy('name').mapValues('value').value();
}

function parametersFor(resource, method) {
    var action = actionDocumentationFor(resource, method);
    return action ? action.actualParameters : [];
}

function mockParameterValue(parameter, resource) {
    if (parameter.default || parameter.example) {
        return parameter.default || parameter.example;
    } else if (parameter.values && parameter.values.length) {
        return parameter.values[0].value;
    } else {
        var commonMock = mockCommonParameter(parameter);
        if (commonMock) {
            return commonMock;
        } else {
            var pattern = extractPattern(parameter.description);
            if (pattern) {
                return new RandExp(pattern).gen();
            }
        }
    }

    var type = parameter.type;
    if (_.isArray(type)) {
        type = type[0];
    }

    if (type === 'string') {
        return 'ssss';
    } else if (type === 'number' || type === 'integer') {
        return mockNumberParameter(parameter, 2);
    } else if (type === 'boolean') {
        return true;
    } else if (type === 'null') {
        return null;
    } else {
console.log('Unable to mock parameter for ' + resource.filePath + ', definition: ' + JSON.stringify(parameter));
        throw new Error('Unable to mock parameter for ' + resource.filePath + ', definition: ' + JSON.stringify(parameter));
    }
}

function mockCommonParameter(parameter) {
    switch (parameter.name) {
    case 'pid':
        return 'SITE;3';
    case 'uid':
        return 'urn:va:document:SITE:3:3';
    case 'id':
        return 'SITE;12345';
    case 'site.code':
        return 'SITE';
    case 'subject.identifier':
        return '10108V420871';
    case 'ssn':
        return '123-45-6789';
    case 'date.birth':
        return '01/01/1987';
    case 'limit':
        return 10;
    case 'start':
        return 0;
    case 'rows.max':
        return 20;
    case 'filter':
        return 'xxx';
    case 'order':
        return 'observed desc';
    case 'teamId':
        return 501;
    }
    return undefined;
}

var patternRegex = /\bPattern:\s+`([^`]+)`/im;

function extractPattern(description) {
    var result = patternRegex.exec(description);
    if (result) {
        return new RegExp(result[1]);
    }
}

function mockNumberParameter(parameter, defaultValue) {
    if (parameter.minimum) {
        return Number(parameter.minimum);
    } else if (parameter.maximum) {
        return Number(parameter.maximum);
    }
    return defaultValue;
}

function exampleBodyFor(resource, method) {
    var action = actionDocumentationFor(resource, method);
    if (!action) {
        return;
    }

    var result;
    _.each(action.examples, function(example) {
        _.each(example.requests, function(request) {
            if (request.body) {
                try {
                    result = JSON.parse(request.body);
                } catch (e) {
                    // node-mocks-http doesn't support string bodies, so ignore non-JSON
                }
            }
            return !result;
        });
        return !result;
    });
    return result;
}

function requestSchemaFor(resource, method) {
    if (resource.requestSchema) {
        return resource.requestSchema;
    }

    var action = actionDocumentationFor(resource, method);
    if (!action) {
        return;
    }

    var result;
    _.each(action.examples, function(example) {
        _.each(example.requests, function(request) {
            if (request.schema) {
                try {
                    result = JSON.parse(request.schema);
                    resource.requestSchema = result;
                } catch (e) {
                    console.error('Error parsing schema for ' + action.method + ' ' + action.actualUriTemplate);
                }
            }
            return !result;
        });
        return !result;
    });
    return result;
}

function mockObjectFromSchema(schema, resource, includeParams, required, name) {
    var type = schema.type;
    if (_.isArray(type)) {
        type = _.first(type);
    }
    if (type === 'object' || schema.properties) {
        var object = {};
        _.each(schema.properties, function(value, key) {
            var required = _.contains(schema.required, key);
            if (required || includeParams === IncludeParams.all) {
                object[key] = mockObjectFromSchema(value, resource, includeParams, required, key);
            }
        });
        return object;
    } else if (type === 'array') {
        var array = [];
        if (schema.items) {
            array.push(mockObjectFromSchema(schema.items, resource, includeParams));
        }
        return array;
    } else {
        var parameter = {
            type: type || schema.$ref,
            name: name,
            required: _.isUndefined(required) ? true : required
        };
        if (schema.enum) {
            parameter.values = _.map(schema.enum, function(value) {
                return {value: value};
            });
        }
        return mockParameterValue(parameter, resource);
    }
}
