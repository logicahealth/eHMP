'use strict';

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');
var moment = require('moment');

module.exports = saveMetaData;

function saveMetaData(req, res, next) {
    req.logger.debug('editMetaData resource called');
    var uid = req.interceptorResults.patientIdentifiers.uid;
    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }
    var currentModifyingUser = req.session.user;

    var metadata = req.body;
    if (_.isString(metadata)) {
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(e.message);
        }
    }


    var updatedMetadata = {
        val: metadata,
        modifiedBy: currentModifyingUser.uid,
        modifiedOn: moment().format('YYYYMMDDHHmmss')
    };

    var pjdsOptions = {
        store: 'pidmeta',
        key: req.interceptorResults.patientIdentifiers.uids
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        var dataItems = _.result(response, 'data.items', []);
        if (error || _.isEmpty(dataItems)) {
            pjdsOptions.key = uid;
        } else {
            pjdsOptions.key = response.data.items[0].uid;
        }
        pjdsOptions.data = updatedMetadata;
        pjds.put(req, res, pjdsOptions, function(error, response) {
            if (error) {
                return res.status(_.get(response, 'statusCode') || rdk.httpstatus.bad_request).rdkSend(error.message);
            }
            var resultObj = {};
            resultObj.data = pjdsOptions.data;
            return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
        });
    });
}
