'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = editPermissionSet;

function editPermissionSet(req, res, next) {
    var parse = function(stringToParse){
        try{
            return JSON.parse(stringToParse);
        }catch(e){
            return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid JSON Error: unable to parse string');
        }
    };
    req.logger.debug('editPermissionSet resource called');
    var user = req.param('user');
    if (_.isString(user)) {
        user = parse(user);
    }
    if (!user) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing user parameter');
    }
    var uid = user.uid;

    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }
    var currentModifyingUser = req.session.user;

    var permissionSetsArray = req.param('permissionSets');
    if (_.isString(permissionSetsArray)) {
        permissionSetsArray = parse(permissionSetsArray);
    }
    if (_.isUndefined(permissionSetsArray)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing permission sets');
    }
    var additionalPermissionsArrayReq = req.param('additionalPermissions');
    var additionalPermissionsArray = [];
    if (!_.isUndefined(additionalPermissionsArrayReq) && _.isString(additionalPermissionsArrayReq)) {
        additionalPermissionsArray = parse(additionalPermissionsArrayReq);
    }
    if (currentModifyingUser.uid === uid && _.indexOf(user.permissions, 'edit-own-permissions') === -1)  {
        return res.status(rdk.httpstatus.unauthorized).rdkSend('Not allowed to edit permission sets on this user');
    }
    var now = new moment();
    var updatedPermissionSets = {
        val: permissionSetsArray,
        modifiedBy: currentModifyingUser.uid,
        modifiedOn: now.toString(),
        additionalPermissions: additionalPermissionsArray
    };

    req.audit.currentPermissionSets = updatedPermissionSets;
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        pjdsOptions.data = response.data;
        if (error) {
            /* if user does not exist create new ehmp user */
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
        req.audit.previousPermissionSets = pjdsOptions.data.permissionSet.val;
        if (req.audit.previousPermissionSets === '' || req.audit.previousPermissionSets === null || req.audit.previousPermissionSets === undefined) {
            req.audit.previousPermissionSets = 'None';
        }
        req.audit.userEditedUid = pjdsOptions.data.uid;
        pjdsOptions.data.permissionSet = updatedPermissionSets;
        pjds.put(req, res, pjdsOptions, function(error, response) {
            if (error) {
                var statusCode = dd(response)('statusCode').val || rdk.httpstatus.bad_request;
                res.status(statusCode).rdkSend(error.message);
            } else {
                var resultObj = {};
                resultObj.data = pjdsOptions.data.permissionSet;
                resultObj.statusCode = dd(response)('statusCode').val;
                res.status(rdk.httpstatus.ok).rdkSend(resultObj);
            }
        });

    });
}
