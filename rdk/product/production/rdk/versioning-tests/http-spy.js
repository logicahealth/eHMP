'use strict';

var _ = require('lodash');
var rdk = require('../src/core/rdk');
var recordResponse = require('./recorded-response-repository').recordResponse;

module.exports.enabled = true;
module.exports.startSpying = startSpying;
module.exports.stopSpying = stopSpying;

var originalFunctions;

function startSpying() {
    if (originalFunctions) {
        return;
    }

    console.log('http-spy.js: start spying on external HTTP requests');

    originalFunctions = {};
    _.each(['get', 'post', 'put', 'delete'], function(name) {
        originalFunctions[name] = rdk.utils.http[name];
        rdk.utils.http[name] = spyOn.bind(null, name, originalFunctions[name]);
    });
}

function stopSpying() {
    if (!originalFunctions) {
        return;
    }

    console.log('http-spy.js: stop spying on external HTTP requests');

    _.each(originalFunctions, function(func, name) {
        rdk.utils.http[name] = func;
    });
    originalFunctions = undefined;
}

function spyOn(name, originalFunction, options, callback) {
    return originalFunction(options, function(error, response, body) {
        if (name === 'post' && hasNoContent(options)) {
            // ignore empty POSTs; they're for pings
            return callback(error, response, body);
        }

        if (module.exports.enabled) {
            var recordOptions = _.extend({method: name.toUpperCase()}, options);
            recordResponse(recordOptions, response, error);
        }

        if (callback) {
            callback(error, response, body);
        }
    });
}

function hasNoContent(options) {
    return _.isEmpty(options.body) &&
        _.isEmpty(options.qs) &&
        _.isEmpty(options.form) &&
        _.isEmpty(options.formData) &&
        _.isEmpty(options.multipart) &&
        !_.contains(options.url || options.uri, '?');
}
