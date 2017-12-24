'use strict';

var _ = require('lodash');
var moment = require('moment');
var oracledb = require('oracledb');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var amuu = require('./activity-management-users-utility');
var RdkError = rdk.utils.RdkError;
var pjdsUtil = rdk.utils.pjdsUtil;

/**
 * Callback for the put to pJDS used to save the user being modified
 * @param {(Error|RdkError|null)} error
 * @param {Object|null} response
 * @param {Object} req - default express request object
 * @param {Object} res - default express response object
 * @param {*} pjdsOptions - Parameters for hte pJDS call to save modifications to the user
 */
var processEditUserResponse = function(error, response, req, res, pjdsOptions) {
    var statusCode = _.get(response, 'statusCode') || rdk.httpstatus.bad_request;
    var uid = _.get(pjdsOptions, 'data.uid');
    _.set(req, ['audit', uid, 'statusCode'], statusCode);
    if (error) {
        statusCode = error.status || statusCode;
        _.set(req, ['audit', uid, 'outcome'], 'failure');
        return res.status(statusCode).rdkSend(error);
    }
    var resultObj = {};
    resultObj.data = _.get(pjdsOptions, 'data.permissionSet');
    resultObj.statusCode = statusCode;
    var activityManagementParams = {
        queryParams: {
            'i_user_uid': uid,
            'output': {
                dir: oracledb.BIND_OUT,
                type: oracledb.NUMBER
            }
        },
        status: _.get(pjdsOptions, 'data.status')
    };
    _.set(req, ['audit', uid, 'outcome'], 'success');
    amuu(req, activityManagementParams);
    return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
};

/**
 * Callback for the get to pJDS for the user being modified
 * @param {(Error|RdkError|null)} error
 * @param {Object|null} response
 * @param {Object} req - default express request object
 * @param {Object} res - default express response object
 * @param {*} pjdsOptions - Parameters for hte pJDS call to save modifications to the user
 */
var processGetUserResponse = function(error, response, req, res, pjdsOptions) {
    var uid = _.get(response, 'data.uid') || _.get(pjdsOptions, 'key');
    var defaultUser = _.get(pjds.getDefaults(), 'user');
    _.set(defaultUser, 'uid', uid);
    pjdsOptions.data = _.defaultsDeep(_.get(response, 'data'), defaultUser);
    if (error) {
        /*
         * if user does not exist we merged with a new one above just logging
         * the error here and moving on as a new user would cause a 404
         * Reset pjdsOptions.data to default user to prevent error response from being appended to writeback.
         */
        req.logger.debug(error, 'Error getting a user from pJDS');
        pjdsOptions.data = defaultUser;
    }
    var currentModifyingUser = pjdsUtil.actingUserFromRequest(req);
    var permissionSetsArray = pjdsUtil.permissionSetFromRequest(req);
    if (permissionSetsArray instanceof RdkError) {
        return res.status(permissionSetsArray.status).rdkSend(permissionSetsArray);
    }
    var additionalPermissionsArray = pjdsUtil.additionalPermissionsFromRequest(req, res);
    if (additionalPermissionsArray instanceof RdkError) {
        return res.status(additionalPermissionsArray.status).rdkSend(additionalPermissionsArray);
    }

    pjdsUtil.retrieveNationalAccess(req, res, true, true, function(error, natAccessResult) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }

        var userNationalAccess = _.get(req, 'session.user.nationalAccess', false);

        if (!userNationalAccess) {
            var allNationalAccessPermSets = _.map(_.get(natAccessResult, 'permissionSets.data.items', []), 'uid');
            var preExistingPermSets = _.get(response, 'data.permissionSet.val', []);
            var filteredPermSetsSuccess = pjdsUtil.filterEditRequestOnNationalAccess(allNationalAccessPermSets, preExistingPermSets, permissionSetsArray);
            if (!filteredPermSetsSuccess) {
                var responseError = 'Invalid request - cannot add national access permission sets if user does not have national access';
                req.logger.error(responseError);
                return res.status(rdk.httpstatus.precondition_failed).rdkSend(responseError);
            }

            var allNationalAccessPermissions = _.map(_.get(natAccessResult, 'permissions.data.items', []), 'uid');
            var preExistingPermissions = _.get(response, 'data.permissionSet.additionalPermissions', []);
            var filteredPermissionsSuccess = pjdsUtil.filterEditRequestOnNationalAccess(allNationalAccessPermissions, preExistingPermissions, additionalPermissionsArray);
            if (!filteredPermissionsSuccess) {
                var permResponseError = 'Invalid request - cannot add national access permissions if user does not have national access';
                req.logger.error(permResponseError);
                return res.status(rdk.httpstatus.precondition_failed).rdkSend(permResponseError);
            }
        }

        var now = new moment().utc().format();
        var updatedPermissionSets = {
            val: permissionSetsArray,
            modifiedBy: currentModifyingUser.uid,
            modifiedOn: now.toString(),
            additionalPermissions: additionalPermissionsArray
        };

        var natAccessForPerms = pjdsUtil.determineNationalAccessFromResponse(_.get(natAccessResult, 'permissions'), _.get(updatedPermissionSets, 'additionalPermissions', []));
        var natAccessForPermSets = pjdsUtil.determineNationalAccessFromResponse(_.get(natAccessResult, 'permissionSets'), _.get(updatedPermissionSets, 'val', []));

        _.set(pjdsOptions, 'data.permissionSet', updatedPermissionSets);
        _.set(pjdsOptions, 'data.uid', uid);
        _.set(pjdsOptions, 'data.nationalAccess', natAccessForPerms || natAccessForPermSets);

        /**
         * This section is temporary to keep the users status active or inactive.
         * At a later time the permissions should no longer dictate the inactivity of a user.
         */
        _.set(pjdsOptions, 'data.status', 'inactive');
        if (_.size(permissionSetsArray) > 0 || _.size(additionalPermissionsArray) > 0) {
            pjdsOptions.data.status = 'active';
        }

        _.set(req, ['audit', uid, 'currentPermissionSets'], updatedPermissionSets);
        _.set(req, ['audit', uid, 'previousPermissionSets'], _.get(response, 'data.permissionSet'));

        return pjdsUtil.editUser(req, res, pjdsOptions, processEditUserResponse);
    });
};

/**
 * The resource endpoint for editing a user. Currently it's broken up into get and put so that
 * an audit record can be generated with the permissions before and after the modification was made
 * and which acting user made the modifications to the subject user
 * @param {Object} req - default express request object
 * @param {Object} res - default express response object
 */
var editPermissionSet = function(req, res) {
    req.logger.debug('editPermissionSet resource called');

    var user = pjdsUtil.subjectUserFromRequest(req, res);
    if (user instanceof RdkError) {
        return res.status(user.status).rdkSend(user);
    }

    var userModifyingSelf = pjdsUtil.isUserModifyingSelf(req);
    if (userModifyingSelf instanceof RdkError) {
        return res.status(userModifyingSelf.status).rdkSend(userModifyingSelf);
    }
    if (userModifyingSelf) {
        var rdkError = new RdkError({
            code: '200.403.1002',
            logger: req.logger
        });
        return res.status(rdkError.status).rdkSend(rdkError);
    }

    var pjdsOptions = {
        store: 'ehmpusers',
        key: user.uid
    };

    return pjdsUtil.getUser(req, res, pjdsOptions, processGetUserResponse);
};

module.exports = editPermissionSet;
