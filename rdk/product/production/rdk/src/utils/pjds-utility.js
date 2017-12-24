'use strict';

var _ = require('lodash');
var async = require('async');
var jdsFilter = require('jds-filter');
var rdk = require('../core/rdk');
var RdkError = rdk.utils.RdkError;
var RdkTimer = rdk.utils.RdkTimer;
var pjds = rdk.utils.pjdsStore;

var sensitiveFields = [
    'firstname',
    'lastname',
    'ssn'
];

/**
 * Get parameter off request object with default fallback
 * @param {Object} req - default Express request object
 * @param {string|Array} path - path to the item on the request
 * @example req.params.ninja.status => hidden;
 * @param {Object|string|number} defaultItem
 * @returns {*} will return whatever is at that path or the defaultItem (which if not passed in is undefined)
 */
var getRequestParameter = function(req, path, defaultItem) {
    if (_.isString(path)) {
        path = path.split('.');
    }
    return _.get(req.params, path) || _.get(req.body, path) || _.get(req.query, path) || defaultItem;
};

/**
 * Simple modification on source Array based on the filter where the
 * source and filter arrays are of generally the same construct and
 * contain uid member vairiables for comparison
 * @param {Array} source - the array of strings you are filtering
 * @example ['read-access','standard-doctor']
 * @param {Array} filter - the array of objects with uids to filter by
 * @example [{'uid': 'read-access', ...}, {'uid': 'standard-doctor', ...}]
 * @returns {*} source or modified source array
 */
var filterArrayByUid = function(source, filter) {
    if (_.size(filter) > 0 && _.size(source) > 0) {
        _.remove(source, function(item) {
            return _.isUndefined(_.findWhere(filter, {
                'uid': item
            }));
        });
    }
    return source;
};

/**
 * Returns the Acting user from their current session user object on the following condition -
 * We have to check to make sure the user isn't editing themself unless they have edit-own-permissions permission (requirement)
 * @param {Object} req - default express request object
 * @returns {Object}
 */
var actingUserFromRequest = function(req) {
    return _.get(req, 'session.user', {});
};

/**
 * Checks if the subject user and acting user are the same and if so
 * if the acting user is allowed to modify themself
 * @param {Object} req - default express request object
 * @param {Object} subjectUser
 * @returns {boolean|RdkError}
 */
var isUserModifyingSelf = function(req, subjectUser) {
    var actingUser = actingUserFromRequest(req);
    var modifyingSelf = false;
    if (!subjectUser) {
        subjectUser = subjectUserFromRequest(req);
        if (subjectUser instanceof RdkError) {
            return subjectUser;
        }
    }
    if (_.has(actingUser, 'uid') && _.has(subjectUser, 'uid') && actingUser.uid === subjectUser.uid && _.indexOf(actingUser.permissions, 'edit-own-permissions') === -1) {
        modifyingSelf = true;
    }
    return modifyingSelf;
};

/**
 * Returns the permissionSet from the request
 * @param {Object} req - default express request object
 * @returns {Array|RdkError}
 */
var permissionSetFromRequest = function(req) {
    var permissionSetsArray = getRequestParameter(req, 'permissionSets');
    if (_.isString(permissionSetsArray)) {
        try {
            permissionSetsArray = JSON.parse(permissionSetsArray);
        } catch (ex) {
            return new RdkError({
                logger: req.logger,
                code: '200.400.1021',
                error: ex
            });
        }
    }
    if (_.isUndefined(permissionSetsArray)) {
        return new RdkError({
            logger: req.logger,
            code: '200.400.1020'
        });
    }
    return permissionSetsArray;
};

/**
 * Returns the additionalPermissions from the request
 * @param {Object} req - default express request object
 * @returns {Array|RdkError}
 */
var additionalPermissionsFromRequest = function(req) {
    var additionalPermissionsArray = getRequestParameter(req, 'additionalPermissions', []);
    if (_.isString(additionalPermissionsArray)) {
        try {
            additionalPermissionsArray = JSON.parse(additionalPermissionsArray);
        } catch (ex) {
            return new RdkError({
                logger: req.logger,
                code: '200.400.1021',
                error: ex
            });
        }
    }
    return additionalPermissionsArray;
};

/**
 * Returns acting user from the request session user object
 * @param {Object} req - default express request object
 * @returns {Object}
 */
var subjectUserFromRequest = function(req) {
    var user = getRequestParameter(req, 'user');
    var rdkError;
    if (_.isString(user)) {
        try {
            user = JSON.parse(user);
        } catch (ex) {
            rdkError = new RdkError({
                logger: req.logger,
                code: '200.400.1021'
            });
            return rdkError;
        }
    }
    if (!user) {
        rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1026'
        });
        return rdkError;
    }
    /* make sure the uid exists and is not an empty string */
    if (!_.has(user, 'uid') || _.isEmpty(_.get(user, 'uid'))) {
        rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1025'
        });
        return rdkError;
    }
    return user;
};

/**
 * Gather the unique permissions for a user from the given user, list of permission sets and permissions.
 * @param {Object} user
 * @param {Object} user.permissionSet - ehmpusers permission set object
 * @param {Array} user.permissionSet.val - user's listed permission sets
 * @param {Array} user.permissionSet.additionalPermissions - user's listed additional permissions
 * @param {Object[]} permissionSets - Object list of Permission Sets to use as a filter on the user's list
 * @param {Object[]} permissions - Object list of Permissions to use as a filter on the user's list
 */
var gatherUniquePermissions = function(user, permissionSets, permissions) {
    permissionSets = permissionSets || [];
    permissions = permissions || [];
    var userAdditionalPerms = _.get(user, 'permissionSet.additionalPermissions', []);
    var userPermissionSets = _.get(user, 'permissionSet.val', []);
    //go ahead and add the additional permissions to the list right away
    var permissionsToReturn = userAdditionalPerms;
    //find the users list of unique permissions that corrispond to the intersections of passed in permission sets and permissions.
    _.forEach(userPermissionSets, function(userPermissionSetUid) {
        _.find(permissionSets, function(permissionSet) {
            if (_.contains(permissionSet, userPermissionSetUid)) {
                permissionsToReturn = _.union(permissionsToReturn, permissionSet.permissions);
            }
        });
    });
    //filter the list of permissionsToReturn based on the Object array of permissions provided
    permissionsToReturn = _.filter(permissionsToReturn, function(permissionUid) {
        return !_.isEmpty(_.find(permissions, 'uid', permissionUid));
    });

    return permissionsToReturn.sort();
};

/**
 * Gets the Permission Sets requested. Expects the filterList in a parse-able method. ie eq(status,active)
 * @param {*} req
 * @param {*} pJDSOptions
 * @param {*} callback
 */
var getPermissionSet = function(req, pJDSOptions, callback) {
    var filterList = _.get(pJDSOptions, 'filterList', 'eq(status,active)');
    var pjdsOptions = _.defaultsDeep(pJDSOptions, {
        store: 'permset'
    });
    //set a filter if one provided
    if (filterList) {
        pjdsOptions.filterList = jdsFilter.parse(filterList);
    }
    req.logger.debug(pjdsOptions, 'pjds-utility.getPermissionSet called with params');
    return pjds.get(req, null, pjdsOptions, function(error, result) {
        callback(error, result, req, pjdsOptions);
    });
};

var getPermissionSetFeatures = function(req, callback) {
    var pjdsOptions = {
        store: 'featperms'
    };
    return pjds.get(req, null, pjdsOptions, function(error, result) {
        callback(error, result, req);
    });
};

/**
 * Gets the Permissions requested. Expects the filterList in a parse-able method. ie eq(status,active)
 * @param {*} req
 * @param {*} pJDSOptions
 * @param {*} callback
 */
var getPermissions = function(req, pJDSOptions, callback) {
    var filterList = _.get(pJDSOptions, 'filterList', 'eq(status,active)');
    var pjdsOptions = _.defaultsDeep(pJDSOptions, {
        store: 'permission'
    });
    //set a filter if one provided
    if (filterList) {
        pjdsOptions.filterList = jdsFilter.parse(filterList);
    }
    req.logger.debug(pjdsOptions, 'pjds-utility.getPermissions called with params');
    return pjds.get(req, null, pjdsOptions, function(error, result) {
        callback(error, result, req, pjdsOptions);
    });
};

/**
 * Get the user from a pjds user store (defaults to ehmpusers)
 * @param {Object} req
 * @param {Object} res
 * @param {Object} pJDSOptions - options for the various stores to be called from pjds
 * @param {String} pJDSOptions.store - the store of the user
 * @example ex. trustsys
 * @default ehmpusers
 * @param {String} pJDSOptions.key - uid of the user
 * @param {Function} callback
 */
var getUser = function(req, res, pJDSOptions, callback) {
    _.set(pJDSOptions, 'store', _.get(pJDSOptions, 'store', 'ehmpusers'));
    req.logger.debug(pJDSOptions, 'pjds-utility.getUser called with params');
    if (_.isUndefined(pJDSOptions.key)) {
        var rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1024'
        });
        return res.status(rdkError.status).rdkSend(rdkError);
    }
    return pjds.get(req, res, pJDSOptions, function(error, result) {
        callback(error, result, req, res, pJDSOptions);
    });
};

/**
 * Get a user with all permissions and data set already
 * @param {*} req
 * @param {*} res
 * @param {*} pjdsOptions
 * @param {Object} pJDSOptions.user - describes which user and store we plan to fetch from
 * @param {String} pJDSOptions.user.store - the store of the user
 * @example ex. trustsys
 * @default ehmpusers
 * @param {String} pJDSOptions.user.uid - uid of the user
 * @param {*} finalCb
 */
var getUserWithFilteredPermissions = function(req, res, pjdsOptions, finalCb) {
    var uid = _.get(pjdsOptions, 'user.uid') || getRequestParameter(req, 'uid');
    var userStore = _.get(pjdsOptions, 'user.store');
    var permissionSetStatusFilter = _.get(pjdsOptions, 'filter-permission-set') || getRequestParameter(req, 'filter-permission-set', 'eq(status,active)');
    var permissionsStatusFilter = _.get(pjdsOptions, 'filter-permission') || getRequestParameter(req, 'filter-permission', 'eq(status,active)');
    if (!uid) {
        var rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1025'
        });
        return res.status(rdkError.status).rdkSend(rdkError);
    }
    var timer = new RdkTimer({
        'name': 'pjdsUtility.getUserWithFilteredPermissions',
        'start': true
    });
    var callback = function(err, data) {
        timer.log(req.logger, {
            'stop': true
        });
        return finalCb(err, data);
    };
    async.parallel({
        user: function(userCb) {
            var userTimer = new RdkTimer({
                'name': 'pjdsUtil.userStep',
                'start': true
            });
            var options = {
                key: uid
            };
            if (userStore) {
                options.store = userStore;
            }
            getUser(req, res, options, function(error, result, req, res, pJDSOptions) {
                req.logger.trace(result, 'pjdsUtility.getUserWithFilteredPermissions user result');
                userTimer.log(req.logger, {
                    'stop': true
                });
                userCb(error, result);
            });
        },
        permSets: function(permSetsCb) {
            /**
             * We need to get permission sets to check on
             * DE6491 - by default this should be only active
             */
            var permSetTimer = new RdkTimer({
                'name': 'pjdsUtil.permSetStep',
                'start': true
            });
            getPermissionSet(req, {
                filterList: permissionSetStatusFilter
            }, function(error, result, req, res, pJDSOptions) {
                req.logger.debug('pjdsUtility.getUserWithFilteredPermissions permission sets resulted in %s items', _.size(_.get(result, 'data.items')));
                permSetTimer.log(req.logger, {
                    'stop': true
                });
                permSetsCb(error, result);
            });
        },
        permissions: function(permissionsCb) {
            /**
             * We need to get permissions to check on
             * DE6491 - by default this should be only active
             */
            var permissionsTimer = new RdkTimer({
                'name': 'pjdsUtil.permissionsStep',
                'start': true
            });
            getPermissions(req, {
                filterList: permissionsStatusFilter
            }, function(error, result, req, res, pJDSOptions) {
                req.logger.debug('pjdsUtility.getUserWithFilteredPermissions permissions resulted in %s items', _.size(_.get(result, 'data.items')));
                permissionsTimer.log(req.logger, {
                    'stop': true
                });
                permissionsCb(error, result);
            });
        }
    }, function(error, response) {
        var rdkError;
        //A get on a user could easily return a 404 for a new user. Lets bypass that and return as much of a user as possible.
        if (error && _.get(error, 'user.status') !== 404) {
            rdkError = new RdkError({
                code: '200.500.1020',
                error: error,
                logger: req.logger
            });
            return callback(rdkError, null);
        }
        var data = _.defaultsDeep(_.get(response, 'user.data', {}), pjds.defaults.user);
        var userPermSetVals = _.get(data, ['permissionSet', 'val']);
        var userAdditionalPerms = _.get(data, ['permissionSet', 'additionalPermissions']);
        var permissionSets = _.get(response, ['permSets', 'data', 'items']);
        var permissions = _.get(response, ['permissions', 'data', 'items']);
        //process the permission sets returned from the pjds filtered lookup
        _.set(data, 'permissionSet.val', filterArrayByUid(userPermSetVals, permissionSets));
        _.set(data, 'permissionSets', _.get(data, 'permissionSet.val'));
        //process the permissions returned from the pjds filtered lookup
        _.set(data, 'permissionSet.additionalPermissions', filterArrayByUid(userAdditionalPerms, permissions));
        //set the users permissions list based on the gathered permission and permission sets
        _.set(data, 'permissions', gatherUniquePermissions(data, permissionSets, permissions));

        var userStatus = 'inactive';
        if (_.size(data.permissions) > 0) {
            userStatus = 'active';
        }
        _.set(data, 'status', userStatus);
        callback(null, data);
    });
};

/**
 * Put user information to a pjds store, defaults to ehmpusers
 * @param {Object} req
 * @param {Object} res
 * @param {Object} pJDSOptions - options for the various stores to be called from pjds
 * @param {String} pJDSOptions.store - the store of the user
 * @example ex. trustsys
 * @default ehmpusers
 * @param {String} pJDSOptions.key - uid of the user
 * @param {Function} callback
 */
var editUser = function(req, res, pJDSOptions, callback) {
    _.set(pJDSOptions, 'store', _.get(pJDSOptions, 'store', 'ehmpusers'));
    req.logger.debug(pJDSOptions, 'pjds-utility.editUser called with params');
    if (_.isUndefined(pJDSOptions.key)) {
        var rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1024'
        });
        return res.status(rdkError.status).rdkSend(rdkError);
    }
    excludeSensitiveFields(pJDSOptions);
    return pjds.put(req, res, pJDSOptions, function(error, result) {
        callback(error, result, req, res, pJDSOptions);
    });
};

/**
 * Patch user information to a pjds store, defaults to ehmpusers
 * This is the prefered method to use when modifying user data
 * @param {Object} req
 * @param {Object} res
 * @param {Object} pJDSOptions - options for the various stores to be called from pjds
 * @param {String} pJDSOptions.store - the store of the user
 * @example ex. trustsys
 * @default ehmpusers
 * @param {String} pJDSOptions.key - uid of the user
 * @param {Function} callback
 */
var patchUser = function(req, res, pJDSOptions, callback) {
    _.set(pJDSOptions, 'store', _.get(pJDSOptions, 'store', 'ehmpusers'));
    req.logger.debug(pJDSOptions, 'pjds-utility.patchUser called with params');
    if (_.isUndefined(pJDSOptions.key)) {
        var rdkError = new RdkError({
            logger: req.logger,
            code: '200.400.1024'
        });
        return res.status(rdkError.status).rdkSend(rdkError);
    }
    excludeSensitiveFields(pJDSOptions);
    return pjds.patch(req, res, pJDSOptions, function(error, result) {
        callback(error, result, req, res, pJDSOptions);
    });
};

/**
 * Remove sensitive fields like first/last name from pJDSOptions.data.
 * This modifies pJDSOptions.data directly.
 * @param {Object} pJDSOptions - options for the user store in pjds
 */
var excludeSensitiveFields = function (pJDSOptions) {
    var data = _.get(pJDSOptions, 'data');
    if (!data) {
        return pJDSOptions;
    }
    _.each(sensitiveFields, function (sensitiveField) {
        delete data[sensitiveField];
    });
    return pJDSOptions;
};

var getJDSQueriesFromIds = function(ids, maxIdsPerRequest) {
    var batchedIds = _.chunk(ids, maxIdsPerRequest);
    var jdsQueries = [];

    _.each(batchedIds, function(ids) {
        jdsQueries.push('/data/index/user-uid?range=' + ids);
    });
    return jdsQueries;
};

var needsNationalAccess = function(req, res, permissions, permissionSets, callback) {
    var callPermissions = _.isArray(permissions) && permissions.length > 0;
    var callPermSet = _.isArray(permissionSets) && permissionSets.length > 0;
    retrieveNationalAccess(req, res, callPermissions, callPermSet, function(err, result) {
        var natAccessPermissions = determineNationalAccessFromResponse(_.get(result, 'permissions'), permissions);
        var natAccessPermSets = determineNationalAccessFromResponse(_.get(result, 'permissionSets'), permissionSets);
        return callback(err, natAccessPermissions || natAccessPermSets);
    });
};

var retrieveNationalAccess = function(req, res, callPermissions, callPermSet, callback) {
    var pjdsOptions = {
        filterList: ['eq', 'nationalAccess', true]
    };

    var calls = {};

    if (callPermissions) {
        calls.permissions = function(permCallback) {
            var opts = _.extend({
                store: 'permission'
            }, pjdsOptions);
            pjds.get(req, res, opts, function(error, result) {
                if (error) {
                    return permCallback(error);
                } else {
                    return permCallback(null, result);
                }
            });
        };
    }

    if (callPermSet) {
        calls.permissionSets = function(permSetCallback) {
            var opts = _.extend({
                store: 'permset'
            }, pjdsOptions);
            pjds.get(req, res, opts, function(error, result) {
                if (error) {
                    return permSetCallback(error);
                } else {
                    return permSetCallback(null, result);
                }
            });
        };
    }

    async.parallel(calls, function(err, results) {
        if (err) {
            return callback(err);
        }

        return callback(null, results);
    });
};

var determineNationalAccessFromResponse = function(result, comparingItems) {
    var uids = _.map(_.get(result, 'data.items', []), 'uid');
    if (!_.isEmpty(_.intersection(uids, comparingItems))) {
        return true;
    }
    return false;
};

var filterEditRequestOnNationalAccess = function(allNationalAccessSet, preExistingSet, requestedSet) {
    var isValidRequestedSet = _.every(requestedSet, function(permSet) {
        return !(allNationalAccessSet.indexOf(permSet) >= 0 && preExistingSet.indexOf(permSet) < 0);
    });
    if (!isValidRequestedSet) {
        return false;
    }

    var userNatAccessIntersect = _.intersection(allNationalAccessSet, preExistingSet);
    _.each(userNatAccessIntersect, function(item) {
        if (requestedSet.indexOf(item) < 0) {
            requestedSet.push(item);
        }
    });

    return true;
};

module.exports.getRequestParameter = getRequestParameter;
module.exports.filterArrayByUid = filterArrayByUid;
module.exports.subjectUserFromRequest = subjectUserFromRequest;
module.exports.isUserModifyingSelf = isUserModifyingSelf;
module.exports.actingUserFromRequest = actingUserFromRequest;
module.exports.permissionSetFromRequest = permissionSetFromRequest;
module.exports.additionalPermissionsFromRequest = additionalPermissionsFromRequest;
module.exports.getPermissionSet = getPermissionSet;
module.exports.getPermissionSetFeatures = getPermissionSetFeatures;
module.exports.getPermissions = getPermissions;
module.exports.gatherUniquePermissions = gatherUniquePermissions;
module.exports.getUser = getUser;
module.exports.getUserWithFilteredPermissions = getUserWithFilteredPermissions;
module.exports.editUser = editUser;
module.exports.patchUser = patchUser;
module.exports.excludeSensitiveFields = excludeSensitiveFields;
module.exports.getJDSQueriesFromIds = getJDSQueriesFromIds;
module.exports.needsNationalAccess = needsNationalAccess;
module.exports.retrieveNationalAccess = retrieveNationalAccess;
module.exports.determineNationalAccessFromResponse = determineNationalAccessFromResponse;
module.exports.filterEditRequestOnNationalAccess = filterEditRequestOnNationalAccess;
