'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var dd = require('drilldown');
var stringify = require('json-stable-stringify');
var generateJsonSchema = require('./generate-json-schema/generate-json-schema');

module.exports = recordSchemas;
module.exports.recordToDirectory = fspath.resolve(__dirname, '../src/core/api-blueprint/schemas');
module.exports.startRecording = startRecording;
module.exports.readSchema = readSchema;
module.exports.compareSchemaProperties = compareSchemaProperties;

function startRecording(app) {
    app.logger.info('record-schemas-outerceptor.js: start recording schemas from resource responses');

    createRecordToDirectory(app.logger);
    app.outerceptorPathRegistry._default.push(recordSchemas);
}

function createRecordToDirectory(logger) {
    fs.mkdir(module.exports.recordToDirectory, function(error) {
        if (error && error.code !== 'EEXIST') {
            logger.error('record-schemas-outerceptor.js: unable to create the directory for spying: ' + error);
        }
    });
}

function recordSchemas(req, res, body, callback) {
    if (_.contains(req.path, '/resource/docs/vx-api/')) {
        return callback(null, req, res, body);
    }

    var bodyObject = body;
    if (!_.isObject(body)) {
        try {
            bodyObject = JSON.parse(body);
        } catch(err) {}
    }

    if (_.isObject(bodyObject)) {
        var schema = generateJsonSchema(bodyObject, {arrayType: 'same', includeRequired: true});
        saveSchema(schema, req, res);
    } else {
        req.logger.warn(body, 'record-schemas-outerceptor.js couldn\'t parse the response as a JSON object');
    }

    return callback(null, req, res, body);
}

function saveSchema(schema, req, res) {
    var path = pathsForRequest(req, res)[0];

    if (_.contains(path, '/fhir_')) {
        return;
    }

    var data = readSchema(req, res);
    mergeSchemas(data, schema, req);

    var content = stringify(schema, {space: '\t', cmp: compareSchemaProperties});
    fs.writeFile(path, content, function(error) {
        if (error) {
            req.logger.warn(error, 'record-schemas-outerceptor.js couldn\'t save schema for ' + path);
        }
    });
}

function pathsForRequest(req, res) {
    var path = dd(req)('_resourceConfigItem')('path').val || req.path;
    if (_.startsWith(path, '/')) {
        path = String(path).substring(1);
    }
    path = path.replace(/\//g, '_');
    path = encodeURIComponent(path);
    var statusCode = res.statusCode || 200;
    var method = req.method || 'GET';
    var paths = [
        path + '-' + method + '-' + statusCode + '.jsonschema',
        path + '-' + statusCode + '.jsonschema'
    ];
    if (statusCode >= 300) {
        paths.push('message.jsonschema');
    }
    return _.map(paths, function(path) {
        return fspath.join(module.exports.recordToDirectory, path);
    });
}

function mergeSchemas(existingSchema, schema, req) {
    if (!existingSchema) {
        return;
    }
    if (existingSchema.type !== schema.type) {
        req.logger.warn({old: existingSchema, 'new': schema}, 'record-schemas-outerceptor.js found different schema types for the same resource path and will overwrite the old schema');
        return;
    }
    // TODO: compare somehow, to see if the schemas are similar?
    req.logger.info({old: existingSchema, 'new': schema}, 'record-schemas-outerceptor.js will merge schemas');
    schema = _.merge(schema, existingSchema, function(a, b, key) {
        if (key === 'required' && (_.isArray(a) || _.isArray(b))) {
            return _.intersection(a, b);
        } else if (!a || (_.isString(a.type) && b && !b.type)) {
            return b;
        }
    });
    stripEmptyRequired(schema);
}

function stripEmptyRequired(schema) {
    if (!schema) {
        return;
    }

    if (_.isArray(schema.required) && _.isEmpty(schema.required)) {
        delete schema.required;
    }
    if (_.isObject(schema)) {
        _.each(schema, stripEmptyRequired);
    }
}

var schemaProperties = {
    '$schema': 0,
    title: 1,
    description: 2,
    type: 3,
    required: 4,
    properties: 5,
    items: 6,
    minimum: 7,
    maximum: 8
};

function compareSchemaProperties(a, b) {
    var aIndex = schemaProperties[a.key];
    var bIndex = schemaProperties[b.key];
    if (aIndex && bIndex) {
        return aIndex - bIndex;
    }
    return a.key < b.key ? -1 : 1;
}

function readSchema(req, res) {
    var paths = pathsForRequest(req, res);
    var data;
    _.each(paths, function(path) {
        data = readFile(path);
        return !data;
    });
    if (data) {
        data = JSON.parse(data);
    }
    return data;
}

function readFile(path) {
    try {
        return fs.readFileSync(path, {encoding: 'utf8'});
    } catch(e) {
        return undefined;
    }
}
