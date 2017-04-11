'use strict';
var dd = require('drilldown');
var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');

module.exports = getMetaData;

function getMetaData(req, res, next) {
    req.logger.debug('getMetaData resource called');
    var pid = (req.interceptorResults.patientIdentifiers.dfn) ? req.interceptorResults.patientIdentifiers.dfn : req.interceptorResults.patientIdentifiers.edipi;
    if (_.isUndefined(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid');
    }

    var pjdsOptions = {
        store: 'pidmeta',
        key: pid
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        var resultObj;
        resultObj = {};
        if (error) {
            var statusCode = dd(response)('statusCode').val;
            if (statusCode === 404) {
                return res.status(rdk.httpstatus.accepted).rdkSend(resultObj);
            }
            return res.status(statusCode || rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        resultObj.data = response.data;
        return res.status(rdk.httpstatus.ok).rdkSend(resultObj);

    });
}
