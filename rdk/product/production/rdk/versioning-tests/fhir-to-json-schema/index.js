'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var generateJSONSchemas = require('./generate-json-schemas');

module.exports = fhirToJsonSchemas;

function fhirToJsonSchemas(profiles, valueSets, options) {
    if (!_.isArray(profiles)) {
        throw new Error('The profiles argument must be a string specifying the directory containing the "profiles-types.json" and "profiles-resources.json" files, or an array of two JSON objects containing the contents of the profile files to convert.');
    }
    valueSets = valueSets || {};
    options = options || {};

    var schemas = generateJSONSchemas(profiles, valueSets, options);

    if (options.mergeSchemas) {
        var schema = {
            '$schema': 'http://json-schema.org/schema#',
            definitions: {}
        };
        _.each(schemas, function(profileSchema) {
            schema = _.merge(schema, profileSchema);
        });
        schema.id = 'http://hl7.org/fhir/jsonschema';
        return [schema];
    }
    return schemas;
}
