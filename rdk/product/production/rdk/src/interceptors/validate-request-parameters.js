'use strict';

var _ = require('lodash');
var dd = require('drilldown');
var util = require('util');
var ajv = require('ajv');
var apiBlueprint = require('../core/rdk').apiBlueprint;

/**
 * Validates requests against their API Blueprint documentation.
 * Invalid requests return status 400 Bad Request with details specifying the invalid input.
 * Successful requests get parsed parameters under req.parsedParams.
 */
module.exports = function(req, res, next) {
    if (dd(req)('_resourceConfigItem')('undocumented').val) {
        return next();
    }

    apiBlueprint.jsonDocumentationForPath(req.path, function(error, jsonDocumentation) {
        if (error || !jsonDocumentation) {
            req.logger.error({error: error, path: req.path}, 'validate-request-parameters.js couldn\'t find API Blueprint JSON');
            return next();
        }

        var action = apiBlueprint.matchAction(jsonDocumentation, req.path, req.method);
        if (!action) {
            req.logger.error({path: req.path}, 'validate-request-parameters.js couldn\'t find matching action in API Blueprint JSON');
            return next();
        }

        var parameterResult = parseAndValidateParameters(req, action.actualParameters);
        var schemaErrors = validateRequestBody(req, action);

        if (!_.isEmpty(parameterResult.errors) || !_.isEmpty(schemaErrors)) {
            var errors = parameterResult.errors.concat(schemaErrors);
            var message = _.first(errors);
            if (errors.length > 1) {
                return res.status(400).rdkSend({message: message, data: {errors: errors}});
            } else {
                return res.status(400).rdkSend(message);
            }
        }

        req.parsedParams = parameterResult.parsedParams;
        next();
    });
};

function parseAndValidateParameters(req, parameters) {
    var parsedParams = {};
    var errors = [];
    _.each(parameters, function(parameter) {
        if (parameter.paramType === 'fragment') {
            return;
        }

        var pattern = extractPattern(parameter.description);

        var values = extractValues(req, parameter, errors);
        _.each(values, function(value) {
            var parsed;
            if (!value && value !== false) {
                if (parameter.default) {
                    parsed = parameter.default;
                }
                if (_.isUndefined(parsed) && parameter.required) {
                   errors.push(util.format('The required parameter "%s" is missing.', parameter.name));
                }
            } else {
                parsed = parseParameterAndCheckType(parameter, value, errors);
                parsedParams[parameter.name] = parsed;

                if (!_.isEmpty(parameter.values) && !_.find(parameter.values, {value: parsed})) {
                    var expected = _.pluck(parameter.values, 'value').join('", "');
                    errors.push(util.format('The "%s" parameter was "%s" but must be one of "%s".', parameter.name, value, expected));
                }
                if (pattern && !pattern.test(value)) {
                    errors.push(util.format('The "%s" parameter\'s value "%s" doesn\'t match the pattern "%s".', parameter.name, value, pattern.source));
                }
            }
        });
    });

    return {parsedParams: parsedParams, errors: errors};
}

var patternRegex = /\bPattern:\s+`([^`]+)`/im;

function extractPattern(description) {
    var result = patternRegex.exec(description);
    if (result) {
        return new RegExp(result[1]);
    }
}

function extractValues(req, parameter, errors) {
    var values;
    if (parameter.paramType === 'query') {
        values = req.query[parameter.name];
    } else if (parameter.paramType === 'path') {
         values = parameter.value;
    } else if (!parameter.paramType) {
        values = req.param(parameter.name);
    }
    if (_.isArray(values)) {
        if (!parameter.explode) {
            errors.push(util.format('The "%s" parameter repeats but isn\'t marked with "*" in its URI Template', parameter.name));
        }
    } else {
        if (values && parameter.explode) {
            values = values.split(/\s*,\s*/g);
        } else {
            values = [values];
        }
    }
    return values;
}

function parseParameterAndCheckType(parameter, value, errors) {
    var parsed;
    switch (parameter.type) {
    case 'number':
        parsed = Number(value);
        if (isNaN(parsed)) {
            errors.push(util.format('The "%s" parameter must be a number but was "%s".', parameter.name, value));
        }
        break;
    case 'boolean':
        switch (value) {
        case 'true':
            parsed = true;
            break;
        case 'false':
            parsed = false;
            break;
        default:
            errors.push(util.format('The "%s" parameter must be "true" or "false" but was "%s".', parameter.name, value));
            break;
        }
        break;
    default:
        parsed = String(value);
        break;
    }
    return parsed;
}

function validateRequestBody(req, action) {
    var schemaErrors = [];
    var validator = ajv();
    var schemas = findRequestSchemas(action, req.logger);
    _.each(schemas, function(schema) {
        if (!validator.validate(schema, req.body)) {
            schemaErrors.push(validator.errorsText(validator.errors, { dataVar: 'body' }));
        }
    });
    if (schemaErrors.length < schemas.length) {
        schemaErrors = [];
    }
    return schemaErrors;
}

function findRequestSchemas(action, logger) {
    var schemas = [];
    _.each(action.examples, function(example) {
        _.each(example.requests, function(request) {
            if (request.schema) {
                try {
                    schemas.push(JSON.parse(request.schema));
                } catch (e) {
                    logger.error({schema: request.schema}, 'Error parsing schema');
                }
            }
        });
    });
    return schemas;
}
