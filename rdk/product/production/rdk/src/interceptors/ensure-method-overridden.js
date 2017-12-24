'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var RdkError = rdk.utils.RdkError;
module.exports = function(req, res, next) {
    var methodOverrideErrorCodes = {
        GET: 'rdk.400.1010',
        PUT: 'rdk.400.1011',
        DELETE: 'rdk.400.1012',
        PATCH: 'rdk.400.1013',
        _default: 'rdk.400.1009'
    };
    // We only check for X-HTTP-Method-Override on POST request
    // No problem if the client POSTS with X-HTTP-Method-Override: POST
    if (req.originalMethod === req.method && req.method !== 'POST') {
        var errorCode = _.get(methodOverrideErrorCodes, req.method, methodOverrideErrorCodes._default);
        var error = new RdkError({
            code: errorCode,
            logger: req.logger
        });
        return res.status(400).rdkSend(error);
    }
    return next();
};
