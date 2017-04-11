'use strict';
var rdk = require('../../core/rdk');

ParamError.prototype = Error.prototype;
FetchError.prototype = Error.prototype;
NotFoundError.prototype = Error.prototype;

function ParamError(paramName, error) {
    this.name = 'ParamError';
    if (error) {
        this.message = 'Invalid parameter ' + paramName + ': ' + error;
    } else {
        this.message = 'Missing parameter ' + paramName;
    }
}

function FetchError(message, error) {
    this.name = 'FetchError';
    this.error = error;
    this.message = message;
}

function NotFoundError(message, error) {
    this.name = 'NotFoundError';
    this.error = error;
    this.message = message;
}

function isNotFound(obj) {
    return ('code' in obj.error && String(obj.error.code) === String(rdk.httpstatus.not_found));
}

module.exports.ParamError = ParamError;
module.exports.FetchError = FetchError;
module.exports.NotFoundError = NotFoundError;
module.exports.isNotFound = isNotFound;

// TODO: Refactor all other error instances. JDS returns proper HTTP error codes.
// There's no need to add another layer of error classes.

function HTTPError(code, msg) {
    this.code = code;
    this.message = msg;
}

module.exports.HTTPError = HTTPError;

function getJDSErrorMessage(error) {
    var msg = '';

    if (nullchecker.isNotNullish(error.errors)) {
        msg = _.reduce(error.errors, function(memo, e) {
            if (!_.isEmpty(memo)) {
                memo += ', ';
            }
            memo += e.domain + ' :: ' + e.message;
            return memo;
        }, '');
    }
    return msg;
}

module.exports.getJDSErrorMessage = getJDSErrorMessage;

