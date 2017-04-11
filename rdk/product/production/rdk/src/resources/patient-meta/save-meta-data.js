'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = saveMetaData;

function saveMetaData(req, res, next) {
    req.logger.debug('editMetaData resource called');
    var pid = (req.interceptorResults.patientIdentifiers.dfn) ? req.interceptorResults.patientIdentifiers.dfn : req.interceptorResults.patientIdentifiers.edipi;

    if (_.isUndefined(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid');
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

    var now = new Date();
    var updatedMetadata = {
        val: metadata,
        modifiedBy: currentModifyingUser.uid,
        modifiedOn: now.toString()
    };

    var pjdsOptions = {
        store: 'pidmeta',
        key: pid
    };

    pjdsOptions.data = updatedMetadata;
    pjds.put(req, res, pjdsOptions, function(error, response) {
        if (error) {
            return res.status(dd(response)('statusCode').val || rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        var resultObj = {};
        resultObj.data = pjdsOptions.data;
        res.status(rdk.httpstatus.ok).rdkSend(resultObj);
    });
}
