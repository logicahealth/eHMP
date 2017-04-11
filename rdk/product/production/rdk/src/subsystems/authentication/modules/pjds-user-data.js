'use strict';
var _ = require('lodash');
var moment = require('moment');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;
var pjds = require('../../../subsystems/pjds/pjds-store');

/**
 * Call (p)jds for permissions related to the user to help determine some eHMP policies
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} pjdsCallback - typical callback function
 * @param {Object=} params - Optional items used to determine how the attempt will be dealt with
 * @return {Object|undefined}
 */
var getEhmpUserData = function(req, res, pjdsCallback, params) {
    var logger = req.logger;
    var site = params.site;
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
        var errorObj = new RdkError({
            'code': 'pjds.412.1001'
        });
        return callback(errorObj, null);
    }
    //Gets User Permission Sets for User
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            var errorObj = new RdkError({
                'error': error,
                'code': 'pjds.500.1001'
            });
            return callback(errorObj, null);
        }
        logger.trace(response, 'pJDS ehmp users result');

        data.preferences = _.get(response, 'data.preferences', {
            defaultScreen: {}
        });
        data.permissionSets = _.get(response, 'data.permissionSet.val', []);
        data.eHMPUIContext = _.get(response, 'data.eHMPUIContext', {});
        data.permissions = _.get(response, 'data.permissionSet.additionalPermissions', []);
        data.unsuccessfulLoginAttemptCount = _.get(response, 'data.unsuccessfulLoginAttemptCount', 0);
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
    var name = _.get(params, 'name');
    var timer = new RdkTimer({
        'name': 'systemAuthTimer.authenticationStep',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(req.logger, {
            'stop': true
        });
        return authenticationCB(err, data);
    };
    var errorObj;
    if (!name) {
        var errObj = new RdkError({
            code: 'pjds.412.1001'
        });
        return callback(errObj, null);
    }
    var data = {
        name: name,
        consumerType: 'system',
        permissionSets: [],
        permissions: []
    };
    //Gets User Permission Sets for User
    var pjdsOptions = {
        store: 'trustsys',
        key: name
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            req.logger.error('ERROR: There was an error finding system user ' + name + ' in pJDS');
            errorObj = new RdkError({
                code: 'pjds.401.1003',
                error: error
            });
            return callback(errorObj, null);
        }
        if (_.result(response, 'data.name', '') !== name) {
            errorObj = new RdkError({
                code: 'pjds.401.1003'
            });
            return callback(errorObj, null);
        }

        data.permissionSets = _.result(response, 'data.permissionSet.val', []);
        data.permissions = _.result(response, 'data.permissionSet.additionalPermissions', []);
        data.breakglass = true;
        return callback(null, data);
    });
};

/**
 * Call (p)jds for permissions related to the user to help determine some eHMP policies
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} authorizationCB - typical callback function
 * @param {Object} params
 * @param {Object} params.data - object of data to continue to modify
 * @return {Object|undefined}
 */
var getPermissionsData = function(req, res, authorizationCB, params) {
    var data = _.get(params, 'data', {});
    var permissionSets = data.permissionSets;
    var timer = new RdkTimer({
        'name': 'authTimer.authorizationStep',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(req.logger, {
            'stop': true
        });
        return authorizationCB(err, data);
    };
    var errorObj;
    if (!_.isEmpty(data.permissions)) {
        data.permissions = _.uniq(data.permissions);
    }
    if (_.isEmpty(permissionSets)) {
        //if permissionsets are empty just return because
        //we don't need to get the permissions
        return callback(null, data);
    }
    var permissionSetsPjdsOptions = {
        store: 'permset',
        key: permissionSets
    };
    pjds.get(req, res, permissionSetsPjdsOptions, function(error, response) {
        if (error) {
            errorObj = new RdkError({
                code: 'pjds.401.1002',
                error: error
            });
            return callback(errorObj, null);
        }
        var permissions = data.permissions;
        _.each(response.data.items, function(item) {
            permissions = permissions.concat(item.permissions);
        });
        data.permissions = _.uniq(permissions);
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
        var errorObj = error || new RdkError({
            'code': 'pjds.412.1001'
        });
        return callback(errorObj, null);
    }
    //Patches User Permission Sets for User
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid,
        data: {}
    };
    if (_.get(params, 'error')) {
        _.set(pjdsOptions, 'data.lastUnsuccessfulLogin', moment(_.get(req, 'session.expires')).utc().format());
        _.set(pjdsOptions, 'data.unsuccessfulLoginAttemptCount', _.get(user, 'unsuccessfulLoginAttemptCount', 0) + 1);
        _.set(user, 'unsuccessfulLoginAttemptCount', data.unsuccessfulLoginAttemptCount);
    } else {
        _.set(pjdsOptions, 'data.lastSuccessfulLogin', moment(_.get(req, 'session.expires')).utc().format());
        _.set(pjdsOptions, 'data.unsuccessfulLoginAttemptCount', 0);
    }
    return pjds.patch(req, res, pjdsOptions, function(err, response) {
        logger.trace(response, 'pJDS ehmp users result');
        if (error || err) {
            var errorObj = error || new RdkError({
                'error': err,
                'code': 'pjds.500.1001'
            });
            return callback(errorObj, null);
        }
        return callback(null, data);
    });
};

module.exports.getEhmpUserData = getEhmpUserData;
module.exports.setLoginAttempt = setLoginAttempt;
module.exports.getPermissionsData = getPermissionsData;
module.exports.getTrustedSystemData = getTrustedSystemData;
