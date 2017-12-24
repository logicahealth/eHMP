'use strict';

var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var authUtils = rdk.utils.authentication;

function refreshToken(req, res) {
    var errorObj;
    var logger = req.logger;
    if (!authUtils.hasValidSession(req)) {
        req.logger.warn('No session present for refresh');
        errorObj = new RdkError({
            code: 'rdk.500.1004',
            logger: logger
        });
        return res.status(errorObj.status).rdkSend(errorObj);
    }
    req.logger.info('Session refreshed');
    //refresh the user session expiration BEFORE sending the response in order to set it on the user object
    req.session.touch();
    //set the user session expiration to be equal to the new cookie expiration
    req.session.user.expires = req.session.cookie.expires;
    return res.status(rdk.httpstatus.ok).rdkSend(req.session.user);
}

module.exports = refreshToken;
