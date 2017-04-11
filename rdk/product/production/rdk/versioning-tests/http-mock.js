'use strict';

var _ = require('lodash');
var rdk = require('../src/core/rdk');
var repository = require('./recorded-response-repository');
var readResponse = repository.readResponse;

module.exports.mockHttp = mockHttp;

function mockHttp() {
    _.each(['get', 'post', 'put', 'delete'], function(name) {
        rdk.utils.http[name] = handleMockHttpRequest.bind(null, name.toUpperCase());
    });
}

function handleMockHttpRequest(method, options, callback) {
    if (!callback) {
        return;
    }

    if (options.logger.simulateExternalError) {
        options.logger.didSimulateExternalError = true;
        var message = 'Simulated external error';
        if (_.isNumber(options.logger.simulateExternalError)) {
            return callback(undefined, {statusCode: options.logger.simulateExternalError, body: message}, message);
        } else {
            var error = new Error(message);
            error.code = options.logger.simulateExternalError;
            return callback(error);
        }
    }

    options.method = method;
    readResponse(options, function(error, response, responseError) {
        if (response) {
            return callback(responseError, response, response.body);
        } else {
            error = error || responseError || new Error('No recorded response at ' + repository.pathForRequest(options));
            console.log('http-mock encountered error for ' + options.url);
            console.dir(error);
            return callback(error);
        }
    });
}
