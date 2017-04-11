'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var pid = require('../patient-search/pid.js').performPatientSearchWithCallback;
var _ = require('lodash');
var formatSinglePatientSearchCommonFields = require('../patient-search/results-parser').formatSinglePatientSearchCommonFields;
var sensitivityUtils = rdk.utils.sensitivity;

module.exports = getEhmpUserContext;

function getEhmpUserContext(req, res, next) {
    req.logger.debug('getEhmpUserContext resource called');
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
    var uid = req.session.user.uid;
    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        if (error) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        var resultObj = {};
        var recentPatients = response.data.eHMPUIContext || [];
        recentPatients = recentPatients.reverse();
        var fetchedAdditionalDataCount = 0;
        resultObj.status = dd(response)('statusCode').val;
        resultObj.data = [];
        if (recentPatients.length === 0) {
            return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
        }
        _.each(recentPatients, function(recentPatient) {
            pid(req, res, recentPatient.patientId.value, function(error, additionalDataResponse) {
                if (!_.isUndefined(error) && error !== null) {
                    req.logger.debug({
                        error: error
                    }, 'Patient demographics not found for ' + recentPatient.patientId.value + '. Skipping returning that patient data.');
                } else {
                    var additionalData = additionalDataResponse.data.items[0];
                    additionalData.lastAccessed = recentPatient.lastAccessed;
                    additionalData.workspaceContext = recentPatient.workspaceContext;
                    var ssn = additionalData.ssn;
                    if (additionalData.sensitive && !hasDGAccess) {
                        additionalData.lastFourSSN = 'SENSITIVE';
                        additionalData = sensitivityUtils.hideSensitiveFields(additionalData);
                        formatSinglePatientSearchCommonFields(additionalData, hasDGAccess);
                    } else {
                        additionalData.lastFourSSN = ssn.substring(ssn.length - 4, ssn.length);
                        formatSinglePatientSearchCommonFields(additionalData, hasDGAccess, true);
                    }
                    resultObj.data.push(additionalData);
                }
                fetchedAdditionalDataCount++;
                if (fetchedAdditionalDataCount === recentPatients.length) {
                    return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                }
            }, true);
        });
    });
}