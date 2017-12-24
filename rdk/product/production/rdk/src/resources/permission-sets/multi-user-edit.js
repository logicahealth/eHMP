'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var moment = require('moment');
var oracledb = require('oracledb');
var pjds = rdk.utils.pjdsStore;
var amuu = require('./activity-management-users-utility');
var RdkError = rdk.utils.RdkError;
var pjdsUtil = rdk.utils.pjdsUtil;

function getPermissionSetsMap(req, callback) {
    var permissionSetsPjdsOptions = {
        store: 'permset',
        filterList: ['eq', 'status', 'active']
    };
    pjds.get(req, null, permissionSetsPjdsOptions, function(error, response) {
        if (error) {
            var rdkError = new RdkError({
                logger: req.logger,
                code: '202.500.1002',
                error: error
            });
            return callback(rdkError);
        }
        var permissionSetsMap = {};
        _.each(response.data.items, function(item) {
            permissionSetsMap[item.uid] = item.permissions;
        });
        return callback(null, permissionSetsMap);
    });
}

function getAllPermissions(permissionSetsMap, permissionSets, additionalPermissions) {
    var permissions = [];
    _.each(permissionSets, function(permissionSet) {
        permissions = permissions.concat(permissionSetsMap[permissionSet]);
    });
    permissions = permissions.concat(additionalPermissions);
    return _.uniq(permissions);
}

function hasDiscretePermission(permissions, permission) {
    return (_.indexOf(permissions, permission) !== -1);
}

function hasPermissionSet(permissionSets, permissionSet) {
    return (_.indexOf(permissionSets, permissionSet) !== -1);
}

function editPermissionSet(req, res) {
    var multiUserEditFunctions = {
        ADD: function(userPermissionSetObj, permissionSets, additionalPermissions, permissionSetsMap) {
            _.each(permissionSets, function(permissionSet) {
                userPermissionSetObj.val.push(permissionSet);
            });
            var permissionsFromSets = getAllPermissions(permissionSetsMap, userPermissionSetObj.val, []);
            userPermissionSetObj.additionalPermissions = userPermissionSetObj.additionalPermissions.concat(additionalPermissions);
            userPermissionSetObj.additionalPermissions = _.difference(userPermissionSetObj.additionalPermissions, _.uniq(permissionsFromSets));
            if (_.indexOf(additionalPermissions, 'edit-own-permissions') !== -1) {
                userPermissionSetObj.val.push('acc');
            }
            userPermissionSetObj.val = _.uniq(userPermissionSetObj.val);
            userPermissionSetObj.additionalPermissions = _.uniq(userPermissionSetObj.additionalPermissions);
            return userPermissionSetObj;
        },
        REMOVE: function(userPermissionSetObj, permissionSets, additionalPermissions, permissionSetsMap) {
            var addEditOwnPermissions = false;
            var addAcc = false;
            if (_.indexOf(permissionSets, 'acc') !== -1 && hasPermissionSet(userPermissionSetObj.val, 'acc') === true) {
                addAcc = true;
            }
            userPermissionSetObj.val = _.difference(userPermissionSetObj.val, permissionSets);
            if (addAcc === true) {
                userPermissionSetObj.val.push('acc');
            }
            if (_.indexOf(additionalPermissions, 'edit-own-permissions') !== -1 && hasDiscretePermission(userPermissionSetObj.additionalPermissions, 'edit-own-permissions') === true) {
                addEditOwnPermissions = true;
            }
            userPermissionSetObj.additionalPermissions = _.difference(userPermissionSetObj.additionalPermissions, additionalPermissions);
            if (addEditOwnPermissions === true) {
                userPermissionSetObj.additionalPermissions.push('edit-own-permissions');
            }
            return userPermissionSetObj;
        },
        CLONE: function(userPermissionSetObj, permissionSets, additionalPermissions, permissionSetsMap) {
            var nextPermissionSets = [].concat(permissionSets);
            var nextAdditionalPermissions = [].concat(additionalPermissions);
            if (hasPermissionSet(userPermissionSetObj.val, 'acc') === true) {
                nextPermissionSets.push('acc');
            }
            if (hasDiscretePermission(userPermissionSetObj.additionalPermissions, 'edit-own-permissions') === true) {
                nextAdditionalPermissions.push('edit-own-permissions');
            }
            userPermissionSetObj.val = _.uniq(nextPermissionSets);
            userPermissionSetObj.additionalPermissions = _.uniq(nextAdditionalPermissions);
            return userPermissionSetObj;
        }
    };
    req.logger.debug('editMultipleUsersPermissionSets resource called');
    var users = pjdsUtil.getRequestParameter(req, 'users');
    if (!users) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing users parameter');
    }
    if (_.isString(users)) {
        try {
            users = JSON.parse(users);
        } catch (e) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid JSON Error: unable to parse string');
        }
    }

    var now = new moment().utc().format();
    var actingUser = pjdsUtil.actingUserFromRequest(req);
    var permissionSetsArray = pjdsUtil.permissionSetFromRequest(req);
    if (permissionSetsArray instanceof RdkError) {
        return res.status(permissionSetsArray.status).rdkSend(permissionSetsArray);
    }
    var additionalPermissionsArray = pjdsUtil.additionalPermissionsFromRequest(req);
    if (additionalPermissionsArray instanceof RdkError) {
        return res.status(additionalPermissionsArray.status).rdkSend(additionalPermissionsArray);
    }

    var editMode = pjdsUtil.getRequestParameter(req, 'mode');
    var editModeFunction = null;
    var error;
    if (!editMode) {
        error = new RdkError({
            logger: req.logger,
            code: '200.400.1022'
        });
        return res.status(error.status).rdkSend(error);
    }
    var modeKey = editMode.toUpperCase();
    if (_.isUndefined(multiUserEditFunctions[modeKey])) {
        error = new RdkError({
            logger: req.logger,
            code: '200.400.1023'
        });
        return res.status(error.status).rdkSend(error);
    }

    editModeFunction = multiUserEditFunctions[modeKey];

    var resultObj = {
        data: {
            editedUsers: [],
            failedOnEditUsers: []
        }
    };
    getPermissionSetsMap(req, function(rdkError, permissionSetMap) {
        if (rdkError) {
            return res.status(rdkError.status).rdkSend(rdkError);
        }
        pjdsUtil.retrieveNationalAccess(req, res, true, true, function(natAccessErr, natAccessResult) {
            if (natAccessErr) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(natAccessErr);
            }
            _.each(users, function(user) {
                var uid = user.uid;
                if (_.isEmpty(uid)) {
                    resultObj.data.failedOnEditUsers.push({
                        uid: uid,
                        errorMessage: 'No uid on the given user.'
                    });
                    req.logger.warn('No uid on the given user. Skipping permission sets edit.');
                    if (_.isEqual(users[users.length - 1], user)) {
                        res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                    }
                    return false; // sent response, stop _.each
                }
                var userModifyingSelf = pjdsUtil.isUserModifyingSelf(req, user);
                if (userModifyingSelf instanceof RdkError) {
                    res.status(userModifyingSelf.status).rdkSend(userModifyingSelf);
                    return false; // sent response, stop _.each
                }
                if (userModifyingSelf) {
                    resultObj.data.failedOnEditUsers.push({
                        uid: uid,
                        errorMessage: 'Not allowed to edit your own permissions.'
                    });
                    req.logger.warn('Not allowed to edit your own permissions. Skipping permission sets edit.');
                    if (_.isEqual(users[users.length - 1], user)) {
                        res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                    }
                    return false; // sent response, stop _.each
                }

                var pjdsOptions = {
                    store: 'ehmpusers',
                    key: uid
                };

                pjdsUtil.getUser(req, res, pjdsOptions, function(error, response) {
                    var uid = _.get(response, 'data.uid') || _.get(pjdsOptions, 'key');
                    var defaultUser = _.get(pjds.getDefaults(), 'user');
                    _.set(defaultUser,'uid', uid);
                    pjdsOptions.data = _.defaultsDeep(_.get(response, 'data'), defaultUser);
                    if (error) {
                        /*
                        * if user does not exist we merged with a new one above just logging
                        * the error here and moving on as a new user would cause a 404
                        * Reset pjdsOptions.data to default user to prevent error response from being appended to writeback.
                        */
                        req.logger.debug(error);
                        pjdsOptions.data = defaultUser;
                    }
                    _.set(pjdsOptions, 'data.permissionSet.modifiedOn', now);
                    _.set(pjdsOptions, 'data.permissionSet.modifiedBy',  actingUser.uid);
                    _.set(pjdsOptions, 'data.uid', uid);

                    var preExistingPermSets = _.clone(_.get(response, 'data.permissionSet.val', []));
                    var preExistingPermissions = _.clone(_.get(response, 'data.permissionSet.additionalPermissions', []));

                    var updatedPermissionSets = editModeFunction(pjdsOptions.data.permissionSet, _.cloneDeep(permissionSetsArray), _.cloneDeep(additionalPermissionsArray), permissionSetMap);

                    var userNationalAccess = _.get(req, 'session.user.nationalAccess', false);
                    if(!userNationalAccess) {
                        var allNationalAccessPermSets = _.map(_.get(natAccessResult, 'permissionSets.data.items', []), 'uid');
                        var filteredPermSetsSuccess = pjdsUtil.filterEditRequestOnNationalAccess(allNationalAccessPermSets, preExistingPermSets, _.get(updatedPermissionSets, 'val', []));
                        if(!filteredPermSetsSuccess) {
                            var responseError = 'Invalid request - cannot add national access permission sets if user does not have national access';
                            req.logger.error(responseError);
                            return res.status(rdk.httpstatus.precondition_failed).rdkSend(responseError);
                        }

                        var allNationalAccessPermissions = _.map(_.get(natAccessResult, 'permissions.data.items', []), 'uid');
                        var filteredPermissionsSuccess = pjdsUtil.filterEditRequestOnNationalAccess(allNationalAccessPermissions, preExistingPermissions, _.get(updatedPermissionSets, 'additionalPermissions', []));
                        if(!filteredPermissionsSuccess) {
                            var permResponseError = 'Invalid request - cannot add national access permissions if user does not have national access';
                            req.logger.error(permResponseError);
                            return res.status(rdk.httpstatus.precondition_failed).rdkSend(permResponseError);
                        }
                    }
                    pjdsOptions.data.permissionSet = updatedPermissionSets;

                    var natAccessForPerms = pjdsUtil.determineNationalAccessFromResponse(_.get(natAccessResult, 'permissions'), _.get(updatedPermissionSets, 'additionalPermissions', []));
                    var natAccessForPermSets = pjdsUtil.determineNationalAccessFromResponse(_.get(natAccessResult, 'permissionSets'), _.get(updatedPermissionSets, 'val', []));

                    _.set(pjdsOptions, 'data.nationalAccess', natAccessForPerms || natAccessForPermSets);
                    /**
                     * This section is temporary to keep the users status active or inactive.
                     * At a later time the permissions should no longer dictate the inactivity of a user.
                     */
                    _.set(pjdsOptions, 'data.status', 'inactive');
                    if (_.size(_.get(updatedPermissionSets, 'val', [])) > 0 || _.size(_.get(updatedPermissionSets, 'additionalPermissions', [])) > 0) {
                        pjdsOptions.data.status = 'active';
                    }

                    _.set(req, ['audit', uid, 'currentPermissionSets'], updatedPermissionSets);
                    _.set(req, ['audit', uid, 'previousPermissionSets'], _.get(response, 'data.permissionSet'));

                    pjdsUtil.editUser(req, res, pjdsOptions, function(error, response) {
                        var statusCode = _.get(response, 'statusCode') || rdk.httpstatus.bad_request;
                        _.set(req, ['audit', uid, 'statusCode'], statusCode);
                        if (error) {
                            req.logger.warn({error: error}, 'Error editing permission sets for user ' + uid);
                            resultObj.data.failedOnEditUsers.push({
                                uid: uid,
                                errorMessage: error.message
                            });
                            _.set(req, ['audit', uid, 'outcome'], 'failure');
                            amuu(req, activityManagementParams);
                            // FIXME: response might never be sent to the client
                            return;
                        }
                        resultObj.data.editedUsers.push({
                            uid: uid
                        });
                        var activityManagementParams = {
                            queryParams: {
                                'i_user_uid':  uid,
                                'output': {
                                    dir: oracledb.BIND_OUT,
                                    type: oracledb.NUMBER
                                }
                            },
                            status: _.get(pjdsOptions, 'data.status')
                        };
                        _.set(req, ['audit', uid, 'outcome'], 'success');
                        amuu(req, activityManagementParams);
                        if (_.isEqual(users[users.length - 1], user)) {
                            return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                        }
                    });
                });
            });
        });
    });
}

module.exports = editPermissionSet;
