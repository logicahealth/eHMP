'use strict';

var moment = require('moment');
var _ = require('lodash');
var validator = require('./permission-set-validator');
var nullChecker = require('../../../utils/nullchecker');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var pjdsUtil = rdk.utils.pjdsUtil;

function create(req, res) {
    var model = req.body;
    var validationError = validator.validateAddModel(model);
    if (!nullChecker.isNullish(validationError)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend(validationError);
    }

    var now = new moment().utc().format('YYYYMMDDHHmmss');
    var user = _.get(req, 'session.user');
    var userUid = '';

    if (!_.isUndefined(user)) {
        userUid = 'urn:va:user:' + user.site + ':' + user.duz[user.site];
    }

    var permissionSet = {
        description: model.description,
        example: model.example,
        label: model.label,
        note: model.note,
        permissions: model.permissions,
        status: model.status,
        'sub-sets': model['sub-sets'],
        version: {
            introduced: model.version,
            deprecated: null
        },
        authorUid: userUid,
        createdDateTime: now,
        lastUpdatedUid: userUid,
        lastUpdatedDateTime: now
    };

    pjdsUtil.needsNationalAccess(req, res, model.permissions, [], function(error, nationalAccess) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }

        permissionSet.nationalAccess = nationalAccess;
        var pjdsOptions = {
            store: 'permset',
            data: permissionSet
        };

        pjds.post(req, res, pjdsOptions, function(error, result, headers) {
            if (error) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
            }

            return res.status(rdk.httpstatus.created).rdkSend(buildResponse(headers));
        });
    });
}

function buildResponse(headers) {
    var locationUrl = _.get(headers, 'location', '').split('\/');
    var uid = locationUrl[locationUrl.length - 1];
    return {
        uid: uid
    };
}

module.exports = create;
