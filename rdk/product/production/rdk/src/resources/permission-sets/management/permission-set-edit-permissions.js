'use strict';

var _ = require('lodash');
var async = require('async');
var validator = require('./permission-set-validator');
var managementUtility = require('./permission-set-management-utility');
var nullChecker = require('../../../utils/nullchecker');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var pjdsUtil = rdk.utils.pjdsUtil;

function editPermissions(req, res) {
    var model = req.body;
    var validationError = validator.validateEditPermissionsOnSets(model);
    if (!nullChecker.isNullish(validationError)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend(validationError);
    }

    var totalSets = _.union(model.addSets, model.removeSets);
    pjdsUtil.retrieveNationalAccess(req, res, true, false, function(natAccessErr, natAccessResult) {
        if(natAccessErr) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(natAccessErr);
        }

        async.each(totalSets, function(setUid, callback) {
                managementUtility.findPermissionSet(req, res, setUid, function(error, result) {
                    var data = _.get(result, 'data');
                    if (error || _.isUndefined(data)) {
                        return callback('Failed to find permission set with uid: ' + setUid);
                    }

                    if (_.isArray(data.permissions)) {
                        if (_.indexOf(model.addSets, setUid) > -1) {
                            data.permissions.push(model.permission);
                        } else {
                            _.pull(data.permissions, model.permission);
                        }
                    }

                    data.nationalAccess = pjdsUtil.determineNationalAccessFromResponse(_.get(natAccessResult, 'permissions'), data.permissions);

                    var pjdsOptions = {
                        store: 'permset',
                        key: setUid,
                        data: data
                    };

                    pjds.put(req, res, pjdsOptions, function(error, response) {
                        if (error) {
                            return callback(error);
                        }

                        return callback(null);
                    });
                });
            },
            function(error) {
                if (error) {
                    return res.status(rdk.httpstatus.bad_request).rdkSend(error);
                }

                return res.status(rdk.httpstatus.ok).rdkSend();
            }
        );
    });
}

module.exports = editPermissions;
