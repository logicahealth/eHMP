'use strict';

var moment = require('moment');
var _ = require('lodash');
var validator = require('./permission-set-validator');
var managementUtility = require('./permission-set-management-utility');
var nullChecker = require('../../../utils/nullchecker');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var pjdsUtil = rdk.utils.pjdsUtil;

function buildEditObject(existingData, requestData, user) {
    var editedData = _.cloneDeep(existingData);
    var now = new moment().utc().format('YYYYMMDDHHmmss');
    var userUid = '';

    if (!_.isUndefined(user)) {
        userUid = 'urn:va:user:' + user.site + ':' + user.duz[user.site];
    }

    editedData.lastUpdatedUid = userUid;
    editedData.lastUpdatedDateTime = now;

    if (requestData.deprecate) {
        editedData.status = 'deprecated';
        if (!_.isUndefined(requestData.deprecatedVersion)) {
            _.set(editedData, 'version.deprecated', requestData.deprecatedVersion);
        }
    } else {
        var validProperties = _.pick(requestData, ['description', 'example', 'label', 'note', 'status', 'sub-sets', 'nationalAccess']);
        editedData = _.extend(editedData, validProperties);

        if (!_.isUndefined(requestData.version)) {
            _.set(editedData, 'version.introduced', requestData.version);
        }

        if (!_.isUndefined(requestData.removePermissions)) {
            editedData.permissions = _.difference(editedData.permissions, requestData.removePermissions);
        }

        if (!_.isUndefined(requestData.addPermissions)) {
            editedData.permissions = _.union(editedData.permissions, requestData.addPermissions);
        }
    }

    return editedData;
}

function saveDataInPjds(req, res, uid, data) {
    var pjdsOptions = {
        store: 'permset',
        key: uid,
        data: data
    };

    pjds.put(req, res, pjdsOptions, function(error, response) {
        if (error) {
            var statusCode = _.get(response, 'statusCode', rdk.httpstatus.bad_request);
            return res.status(statusCode).rdkSend(error);
        }

        return res.status(rdk.httpstatus.ok).rdkSend();
    });
}

function update(req, res) {
    var model = req.body;
    var validationError = validator.validateUpdateModel(model);
    if (!nullChecker.isNullish(validationError)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend(validationError);
    }

    managementUtility.findPermissionSet(req, res, model.uid, function(error, result) {
        var data = _.get(result, 'data');
        if (error || _.isUndefined(data)) {
            return res.status(rdk.httpstatus.not_found).rdkSend(result);
        }

        var editedData = buildEditObject(data, model, _.get(req, 'session.user'));

        if(model.deprecate) {
            saveDataInPjds(req, res, model.uid, editedData);
        } else {
            pjdsUtil.needsNationalAccess(req, res, editedData.permissions, [], function(error, nationalAccess) {
                if (error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
                }

                editedData.nationalAccess = nationalAccess;

                saveDataInPjds(req, res, model.uid, editedData);
            });
        }
    });
}

module.exports = update;
