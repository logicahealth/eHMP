'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var pjdsUtil = rdk.utils.pjdsUtil;

function getUserPermissionSets(req, res) {
    var callback = function (err, user) {
        if (err) {
            var error;
            if (err instanceof RdkError) {
                error = err;
            } else {
                error = new RdkError({
                    logger: req.logger,
                    code: '200.500.1020',
                    error: err
                });
            }
            return res.status(error.status).rdkSend(error);
        }
        res.status(rdk.httpstatus.ok).rdkSend(_.get(user, 'permissionSet'));
    };
    //the following function defaults to an ehmpuser store and grabs the user's uid from the request
    pjdsUtil.getUserWithFilteredPermissions(req, res, {}, callback);
}

module.exports = getUserPermissionSets;
