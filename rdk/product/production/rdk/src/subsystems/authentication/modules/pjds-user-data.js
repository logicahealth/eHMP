'use strict';
var _ = require('lodash');
var moment = require('moment');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;
var pjdsUtil = rdk.utils.pjdsUtil;

/**
 * Call (p)jds for permissions related to the user to help determine some eHMP policies
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} pjdsCallback - typical callback function
 * @param {Object=} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var getEhmpUserData = function(req, res, pjdsCallback, params) {
    var errorObj;
    var logger = req.logger;
    var data = _.get(params, 'data', {});
    var uid = data.uid;
    //get user PJDS data
    var timer = new RdkTimer({
        'name': 'authTimer.userDataStep',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return pjdsCallback(err, data);
    };
    if (!uid) {
        errorObj = new RdkError({
            code: 'pjds.412.1001',
            logger: logger
        });
        return callback(errorObj, null);
    }
    //Gets User Permission Sets for User
    var pjdsOptions = {
        user: {
            store: 'ehmpusers',
            uid: uid
        }
    };

    //permission and permission set filters default to `eq(status,active)`
    pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, function(error, response) {
        if (error) {
            errorObj = new RdkError({
                error: error,
                code: 'pjds.500.1001',
                logger: logger
            });
            return callback(errorObj, null);
        }
        logger.trace(response, 'pJDS ehmp users result');

        data.preferences = _.get(response, 'preferences', {
            defaultScreen: {}
        });
        data.permissionSets = _.get(response, 'permissionSet.val', []);
        data.eHMPUIContext = _.get(response, 'eHMPUIContext', {});
        data.permissions = _.get(response, 'permissions') || _.get(response, 'permissionSet.additionalPermissions', []);
        data.nationalAccess = _.get(response, 'nationalAccess', false);
        data.unsuccessfulLoginAttemptCount = _.get(response, 'unsuccessfulLoginAttemptCount', 0);
        return callback(null, data);
    });
};

/**
 * Call (p)jds for permissions related to the user to help determine some eHMP policies
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} authenticationCB - typical callback function
 * @param {Object} params
 * @param {String} params.name - name of the system attempting to authenticate
 * @return {Object|undefined}
 */
var getTrustedSystemData = function(req, res, authenticationCB, params) {
    var errorObj;
    var logger = req.logger;
    var name = _.get(params, 'name');
    var timer = new RdkTimer({
        'name': 'systemAuthTimer.authenticationStep',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return authenticationCB(err, data);
    };

    if (!name) {
        errorObj = new RdkError({
            code: 'pjds.412.1001',
            logger: logger
        });
        return callback(errorObj, null);
    }
    //Gets User Permission Sets for User
    var pjdsOptions = {
        user: {
            store: 'trustsys',
            uid: name
        },
        'filter-permission-set': 'ilike(status,"active%")',
        'filter-permission': 'ilike(status,"active%")'
    };

    //permission and permission set filters default to an active status
    pjdsUtil.getUserWithFilteredPermissions(req, res, pjdsOptions, function (error, response) {
        if (error) {
            errorObj = new RdkError({
                code: 'pjds.401.1003',
                error: {
                    original: error,
                    additionalInfo: 'ERROR: There was an error finding system user ' + name + ' in pJDS'
                },
                logger: logger
            });
            return callback(errorObj, null);
        }
        if (_.get(response, 'name', '') !== name) {
            errorObj = new RdkError({
                code: 'pjds.401.1003',
                error: 'pjdsUtil.getUserWithFilteredPermissions response name did not match the request name',
                logger: logger
            });
            return callback(errorObj, null);
        }

        var data = _.extend(response, {
            name: name,
            breakglass: true,
            consumerType: 'system',
            permissions: _.get(response, 'permissions') || _.get(response, 'permissionSet.additionalPermissions', [])
        });

        _.set(data, 'permissionSets', _.get(response, 'permissionSet.val', []));
        _.set(data, 'unsuccessfulLoginAttemptCount', 0);

        return callback(null, data);
    });
};

/**
 * Call (p)jds to set login properties after (un)successful log in attempts
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} loginAttemptCallback - typical callback function
 * @param {Object=} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var setLoginAttempt = function(req, res, loginAttemptCallback, params) {
    var errorObj;
    var logger = req.logger;
    var data = _.get(params, 'data', {});
    var user = _.get(req, 'session.user', data);
    var uid = _.get(user, 'uid', undefined);
    var timer = new RdkTimer({
        'name': 'authTimer.pjdsLoginAttemptStep',
        'start': true
    });
    var error = _.get(params, 'error');

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return loginAttemptCallback(err, data);
    };
    if (!uid) {
        errorObj = error || new RdkError({
            code: 'pjds.412.1001',
            error: 'pjds-user-data.setLoginAttempt missing a uid',
            logger: logger
        });
        return callback(errorObj, null);
    }
    //Patches User Permission Sets for User
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid,
        data: {}
    };
    if (error) {
        _.set(pjdsOptions, 'data.lastUnsuccessfulLogin', moment(_.get(req, 'session.expires')).utc().format());
        _.set(pjdsOptions, 'data.unsuccessfulLoginAttemptCount', _.get(user, 'unsuccessfulLoginAttemptCount', 0) + 1);
        _.set(user, 'unsuccessfulLoginAttemptCount', _.get(data, 'unsuccessfulLoginAttemptCount'));
        if (!_.has(user, 'permissionSets')) {
            _.set(pjdsOptions, 'data.permissionSet.val', []);
            if (!_.has(user, 'permissions')) {
                _.set(pjdsOptions, 'data.permissionSet.additionalPermissions', []);
            }
        }
    } else {
        _.set(pjdsOptions, 'data.lastSuccessfulLogin', moment(_.get(req, 'session.expires')).utc().format());
        _.set(pjdsOptions, 'data.unsuccessfulLoginAttemptCount', 0);
    }
    return pjdsUtil.patchUser(req, res, pjdsOptions, function(err, response) {
        logger.trace(response, 'pJDS ehmp users result');
        if (error || err) {
            errorObj = error || new RdkError({
                error: err,
                code: 'pjds.500.1001',
                logger: logger
            });
            return callback(errorObj, null);
        }
        return callback(null, data);
    });
};

module.exports.getEhmpUserData = getEhmpUserData;
module.exports.setLoginAttempt = setLoginAttempt;
module.exports.getTrustedSystemData = getTrustedSystemData;
