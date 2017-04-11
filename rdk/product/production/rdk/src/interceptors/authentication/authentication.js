'use strict';
var _ = require('lodash');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var authUtils = require('../../subsystems/authentication/utils');

module.exports = function(req, res, next) {
    var logger = req.logger;
    var readOnly = authUtils.isInterceptorReadOnly(req);
    var validSession = authUtils.hasValidSession(req);
    var errorObj;

    if (!authUtils.isInterceptorEnabled(req)) {
        logger.warn('Authentication Disabled');
        return next();
    }

    if (readOnly) {
        logger.info('Read Access Permission Set Requirement Configuration Active');
    } else {
        logger.info('Read Access Permission Set Requirement Configuration Inactive');
    }

    if (!validSession && !authUtils.isAuthenticationResource(req)) {
        errorObj = new RdkError({
            code: 'rdk.401.1002',
            logger: logger
        });
        return res.status(errorObj.status).rdkSend(errorObj);
    }

    if (authUtils.isLoginResource(req)) {
        if (validSession && (_.get(req, 'body.accessCode', null) === _.get(req, 'session.user.accessCode') &&
                _.get(req, 'body.verifyCode', null) === _.get(req, 'session.user.password') &&
                _.get(req, 'body.site', null) === _.get(req, 'session.user.site'))) {
            logger.debug(req.session.user, 'USER ALREADY LOGGED IN');
            return next();
        }
        if (validSession && (_.get(req, 'headers.authorization', null) === _.get(req, 'session.user.name'))) {
            logger.debug(req.session.user, 'SYSTEM USER ALREADY LOGGED IN');
            return next();
        }
        // regenerate session if session user doesn't match req user
        return req.session.regenerate(regenerateCallback);
    }

    function regenerateCallback(err) {
        if (err) {
            errorObj = new RdkError({
                error: err,
                code: 'rdk.500.1001',
                logger: logger
            });
            return res.status(errorObj.status).rdkSend(errorObj);
        }
        //allow authentication to start at the resource
        return next();
    }

    return next();
};