'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var stringify = require('json-stable-stringify');
var mockParameters = require('./mock-parameters');

var requestDefinitionDirectory = 'versioning-tests/request-definitions';

module.exports = verifyUnchangedParameters;
module.exports.requestDefinitionDirectory = requestDefinitionDirectory;

function verifyUnchangedParameters(resource, method) {
    var actual = {
        parameters: mockParameters.parametersFor(resource, method),
        schema: mockParameters.requestSchemaFor(resource, method) || {}
    };
    actual.parameters = rewriteParameters(actual.parameters);

    var path = pathForResource(resource, method);
    var content;
    try {
        content = fs.readFileSync(path, {encoding: 'utf8'});
    } catch (e) {
        writeParameters(actual, path);
        return;
    }

    var expected = JSON.parse(content);
    expected.parameters = rewriteParameters(expected.parameters);

    if (addedParameters(expected, actual)) {
        writeParameters(actual, path);
    } else {
        actual.must.eql(expected);
    }
}

function rewriteParameters(parameters) {
    var rewritten = {};
    _.each(parameters, function(parameter) {
        if (rewritten[parameter.name]) {
            throw new Error('Two different parameters have the same name: ' + parameter.name);
        }
        parameter = _.clone(parameter);
        rewritten[parameter.name] = parameter;
        _.each(parameter, function(v, k) {
            if (!v || k === 'description' || k === 'example') {
                delete parameter[k];
            }
        });
    });
    return rewritten;
}

function pathForResource(resource, method) {
    var path = resource.path;
    if (_.startsWith(path, '/')) {
        path = path.substring(1);
    }
    path = path.replace(/\//g, '_');
    path = encodeURIComponent(path);
    path += '-' + method.toUpperCase() + '.json';
    return fspath.join(requestDefinitionDirectory, path);
}

function writeParameters(parameters, path) {
    var content = stringify(parameters, {space: '\t'});
    fs.writeFile(path, content, function(error) {
        if (error) {
            console.log('verify-unchanged-parameters.js couldn\'t save parameters for ' + path + ': ' + JSON.stringify(error));
        }
    });
}

function addedParameters(expected, actual) {
    var expectedKeys = _.keys(expected.parameters);
    var actualKeys = _.keys(actual.parameters);
    if (actualKeys.length > expectedKeys.length) {
        var addedKeys = _.difference(actualKeys, expectedKeys);
        if (_.intersection(addedKeys, expectedKeys).length === 0) {
            return true;
        }
    }
    return false;
}
