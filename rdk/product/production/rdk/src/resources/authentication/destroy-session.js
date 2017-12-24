'use strict';

var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var authUtils = rdk.utils.authentication;

function destroySession(req, res) {
    var errorObj;
    var logger = req.logger;
    if (!authUtils.hasValidSession(req)) {
        req.logger.warn('No session present to destroy');
        errorObj = new RdkError({
            code: 'rdk.500.1003',
            logger: logger
        });
        return res.status(errorObj.status).rdkSend(errorObj);
    }

    req.session.destroy(function(err) {
        if (err) {
            req.logger.debug('Could not destroy empty session.');
            errorObj = new RdkError({
                code: 'rdk.500.1002',
                error: err,
                logger: logger
            });
            return res.status(errorObj.status).rdkSend(errorObj);
        }
        req.logger.debug('Destroyed session.');
        //backbone requires a json object at a minimum to be sent back or it will assume an error
        return res.status(rdk.httpstatus.ok).rdkSend({});
    });
}

module.exports = destroySession;
