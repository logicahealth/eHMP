'use strict';

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var pid = require('../patient-search/pid').performPatientSearchWithCallback;
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
            req.logger.error('Error getting pJDS data');
            req.logger.error(error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error.message);
        }
        var resultObj = {};
        var recentPatients = response.data.eHMPUIContext || [];
        recentPatients = recentPatients.reverse();
        var fetchedAdditionalDataCount = 0;
        resultObj.status = _.get(response, 'statusCode');
        resultObj.data = [];
        var noResultsReturnObject = {
            message: 'No results found.',
            data: []
        };
        if (_.isEmpty(recentPatients)) {
            return res.status(rdk.httpstatus.ok).rdkSend(noResultsReturnObject);
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
                    if (_.isEmpty(resultObj.data)) {
                        return res.status(200).rdkSend(_.extend({}, resultObj, noResultsReturnObject));
                    }
                    return res.status(rdk.httpstatus.ok).rdkSend(resultObj);
                }
            }, true);
        });
    });
}
