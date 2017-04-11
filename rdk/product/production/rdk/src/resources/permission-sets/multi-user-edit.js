'use strict';

var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = editPermissionSet;

function getPermissionSetsMap(req, res, callback) {
    var permissionSetsPjdsOptions = {
        store: 'permset'
    };
    pjds.get(req, res, permissionSetsPjdsOptions, function(permissionSetsError, permissionSetsResponse) {
        if (permissionSetsError) {
            var statusCode = _.get(permissionSetsResponse, 'statusCode') || rdk.httpstatus.internal_server_error;
            return res.status(statusCode).rdkSend('Error retrieving Permission Sets List from P-JDS');
        } else {
            var permissionSetsMap = {};
            _.each(permissionSetsResponse.data.items, function(item) {
                permissionSetsMap[item.uid] = item.permissions;
            });
            callback(permissionSetsMap);
        }
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

function editPermissionSet(req, res, next) {
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
    var parse = function(stringToParse) {
        try {
            return JSON.parse(stringToParse);
        } catch (e) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid JSON Error: unable to parse string');
        }
    };
    var users = req.param('users');
    if (!users) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing users parameter');
    }
    if (_.isString(users)) {
        users = parse(users);
    }
    var permissionSetsArray = req.param('permissionSets');
    if (_.isString(permissionSetsArray)) {
        permissionSetsArray = parse(permissionSetsArray);
    }
    var currentPermissions = req.param('permissions');
    if (_.isString(currentPermissions)) {
        currentPermissions = parse(currentPermissions);
    }
    if (_.isUndefined(permissionSetsArray)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing permission sets');
    }
    var additionalPermissionsArrayReq = req.param('additionalPermissions');
    var additionalPermissionsArray = [];
    if (!_.isUndefined(additionalPermissionsArrayReq) && _.isString(additionalPermissionsArrayReq)) {
        additionalPermissionsArray = parse(additionalPermissionsArrayReq);
    }
    var editMode = req.param('mode');
    var editModeFunction = null;
    if (!editMode) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing mode parameter');
    } else {
        var modeKey = editMode.toUpperCase();
        if (!_.isUndefined(multiUserEditFunctions[modeKey])) {
            editModeFunction = multiUserEditFunctions[modeKey];
        } else {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid Multi-user edit mode');
        }
    }

    var currentModifyingUser = req.session.user;

    var resultObj = {
        data: {
            editedUsers: [],
            failedOnEditUsers: []
        }
    };
    getPermissionSetsMap(req, res, function(permissionSetMap) {
        _.each(users, function(user) {
            var uid = user.uid;
            if (_.isUndefined(uid)) {
                resultObj.data.failedOnEditUsers.push({
                    uid: uid,
                    lname: user.lname,
                    fname: user.fname,
                    errorMessage: 'No uid on the given user.'
                });
                if (_.isEqual(users[users.length - 1], user)) {
                    res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                }
                return req.logger.warn('No uid on the given user. Skipping permission sets edit.');
            }
            if (currentModifyingUser.uid === uid && _.indexOf(currentPermissions, 'edit-own-permissions') === -1) {
                resultObj.data.failedOnEditUsers.push({
                    uid: uid,
                    lname: user.lname,
                    fname: user.fname,
                    errorMessage: 'Not allowed to edit your own permissions.'
                });
                if (_.isEqual(users[users.length - 1], user)) {
                    res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                }
                return req.logger.warn('Not allowed to edit your own permissions. Skipping permission sets edit.');
            }

            var now = new moment();
            var pjdsOptions = {
                store: 'ehmpusers',
                key: uid
            };

            pjds.get(req, res, pjdsOptions, function(error, response) {
                pjdsOptions.data = response.data;
                if (error) {
                    /* if users does not exist create new ehmp users */
                    pjdsOptions.data = {
                        createdBy: currentModifyingUser.uid,
                        createdTime: now,
                        firstname: user.fname,
                        lastSuccessfulLogin: '',
                        lastUnsucessfulLogin: '',
                        lastname: user.lname,
                        permissionSet: {},
                        uid: uid,
                        unsucessfulLoginAttemptCount: 0
                    };
                }
                if (_.isUndefined(pjdsOptions.data.permissionSet)) {
                    pjdsOptions.data.permissionSet = {
                        val: [],
                        additionalPermissions: [],
                        modifiedBy: currentModifyingUser.uid,
                        modifiedOn: now,
                    };
                } else {
                    pjdsOptions.data.permissionSet.modifiedOn = now;
                    pjdsOptions.data.permissionSet.modifiedBy = currentModifyingUser.uid;
                }
                if (req.audit.previousPermissionSets === '' || req.audit.previousPermissionSets === null || req.audit.previousPermissionSets === undefined) {
                    req.audit.previousPermissionSets = 'None';
                }
                req.audit.userEditedUid = pjdsOptions.data.uid;
                if (_.isUndefined(pjdsOptions.data.permissionSet.val)) {
                    pjdsOptions.data.permissionSet.val = [];
                }
                if (_.isUndefined(pjdsOptions.data.permissionSet.additionalPermissions)) {
                    pjdsOptions.data.permissionSet.additionalPermissions = [];
                }
                req.audit.previousPermissionSets = pjdsOptions.data.permissionSet.val;
                var permissionSetsArrayCopy = permissionSetsArray;
                var additionalPermissionsArrayCopy = additionalPermissionsArray;
                var updatedPermissionSets = editModeFunction(pjdsOptions.data.permissionSet, permissionSetsArrayCopy, additionalPermissionsArrayCopy, permissionSetMap);
                req.audit.currentPermissionSets = updatedPermissionSets;
                pjdsOptions.data.permissionSet = updatedPermissionSets;
                pjds.put(req, res, pjdsOptions, function(error, response) {
                    if (error) {
                        req.logger.warn({error: error}, 'Error editing permission sets for user ' + uid);
                        res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
                        resultObj.data.failedOnEditUsers.push({
                            uid: uid,
                            lname: user.lname,
                            fname: user.fname,
                            errorMessage: error.message
                        });

                    }
                    if (_.isEqual(users[users.length - 1], user)) {
                        res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                    }
                });

            });

        });
    });
}
