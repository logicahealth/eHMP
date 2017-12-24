'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;
var authUtils = rdk.utils.authentication;
var pjdsUserData = require('../../../subsystems/authentication/modules/pjds-user-data');

var finalizeCall = function(req, res, params) {
    var err = _.get(params, 'error');
    var timer = _.get(params, 'timer');
    if (timer) {
        timer.log(req.logger, {
            'stop': true
        });
    }
    if (err) {
        if (err.log) {
            err.log(req.logger);
        }
        return res.status(err.status || 500).rdkSend(err);
    }

    if (!authUtils.hasValidSession(req)) {
        req.logger.warn('No system session present for get');
        res.status(rdk.httpstatus.unauthorized).rdkSend();
    }

    req.logger.info('Session %s Found for %s', req.session._id, req.session.user);
    //set the csrf token just before we send back to user
    rdk.utils.jwt.addJwtHeader(req, res);
    //set the user session expiration to be equal to the new cookie expiration
    req.session.user.expires = req.session.cookie.expires;
    return res.status(rdk.httpstatus.ok).rdkSend(req.session.user);
};


/**
 * Function to establish a new SYSTEM user session. Currently this system
 * must be a trusted system in the pJDS trustsys user store
 * This is used to track the eHMP user through the RDK as they interact
 * @param  {Object} req -typical default Express request object
 * @param  {Object} res -typical default Express response object
 * @return {Object|undefined)
 */
var getSession = function(req, res) {
    var authenticationTimer = new RdkTimer({
        'name': 'authTimer.systemAuthenticationStep',
        'start': true
    });

    //interogate headers
    var name = req.get('Authorization');

    if (_.isEmpty(name)) {
        var errorObj = new RdkError({
            code: 'rdk.400.1001',
            logger: req.logger
        });
        return finalizeCall(req, res, {
            timer: authenticationTimer,
            error: errorObj
        });
    }

    async.waterfall([
        function authentication(authenticationCB) {
            req.logger.debug('System Authentication authenticating %s', name);
            pjdsUserData.getTrustedSystemData(req, res, authenticationCB, {
                name: name
            });
        }
    ], function finalCallback(err, data) {
        req.logger.trace(data, 'Session data returned in finalCallback.');
        if (err) {
            var error = err;
            if (!_.has(error, 'log')) {
                error = new RdkError({
                    code: 'pjds.401.1002',
                    error: err,
                    logger: req.logger
                });
            }
            return finalizeCall(req, res, {
                timer: authenticationTimer,
                error: error
            });
        }
        var user = _.result(req, 'session.user', {});
        user = _.extend(user, data);
        req.session.user = user;
        return finalizeCall(req, res, {
            timer: authenticationTimer
        });
    });
};

module.exports = getSession;
