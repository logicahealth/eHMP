'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');
var pidValidator = rdk.utils.pidValidator;
var VIEWED_PATIENT_CONTEXT_LIST_LIMIT = 20;

module.exports = setEhmpUserContext;
module.exports.parameters = {
    put: {
        workspaceContext: {
            required: true
        }
    }
};

function setEhmpUserContext(req, res, next) {
    var parse = function(stringToParse) {
        try {
            return JSON.parse(stringToParse);
        } catch (e) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid JSON Error: unable to parse string');
        }
    };
    var hasPreviousPatientListed = function(viewedPatientContext, currentPreviousPatientsList) {
        var hasPreviousPatientListed = false;
        _.each(currentPreviousPatientsList, function(previousPatient) {
            if (viewedPatientContext.patientIdentifier === previousPatient.patientIdentifier) {
                hasPreviousPatientListed = true;
            }
        });
        return hasPreviousPatientListed;
    };
    var updatePreviousPatientsList = function(viewedPatientContext, currentPreviousPatientsList) {
        req.logger.debug('setEhmpUserContext resource called');
        viewedPatientContext.lastAccessed = new moment().format('YYYYMMDDHHmmssSSS');
        var updatedPreviousPatientsList = [];
        var previousPatientContextLimitReached = (currentPreviousPatientsList.length === VIEWED_PATIENT_CONTEXT_LIST_LIMIT);
        var userContextExists = hasPreviousPatientListed(viewedPatientContext, currentPreviousPatientsList);
        if (userContextExists) {
            _.each(currentPreviousPatientsList, function(previousPatient) {
                if (viewedPatientContext.patientIdentifier !== previousPatient.patientIdentifier) {
                    updatedPreviousPatientsList.push(previousPatient);
                }
            });
            updatedPreviousPatientsList.push(viewedPatientContext);
        } else if (previousPatientContextLimitReached) {
            updatedPreviousPatientsList = _.takeRight(currentPreviousPatientsList, currentPreviousPatientsList.length - 1);
            updatedPreviousPatientsList.push(viewedPatientContext);
        } else {
            updatedPreviousPatientsList = currentPreviousPatientsList;
            updatedPreviousPatientsList.push(viewedPatientContext);
        }
        return updatedPreviousPatientsList;
    };
    var formatPatientIdentifier = function(patientId, patientIdentifier) {
        if (pidValidator.isIcn(patientId.value)) {
            patientIdentifier = 'icn:' + patientId.value;
            patientId.type = 'icn';
        } else if (pidValidator.isPidEdipi(patientId.value)) {
            patientIdentifier = 'edipi:' + pid;
            patientId.type = 'edipi';
        } else if (pidValidator.isEdipi(patientId.value)) {
            patientIdentifier = 'edipi:DOD;' + patientId.value;
            patientId.type = 'edipi';
        } else if (pidValidator.isSiteDfn(patientId.value)) {
            patientIdentifier = 'pid:' + patientId.value;
            patientId.type = 'pid';
        } else {
            res.status(rdk.httpstatus.bad_request).rdkSend('Invalid Pid. Please pass either ICN or Primary Site ID.');
        }
        return {
            patientId: patientId,
            patientIdentifier: patientIdentifier
        };
    };
    var workspaceContext = req.param('workspaceContext');
    var viewedPatientContext = {};
    var pid = req.param('pid');
    var patientId = {
        value: pid
    };
    var patientIdentifier = '';
    if (_.isUndefined(pid)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing Pid.');
    }
    var formattedPatientIdentifier = formatPatientIdentifier(patientId, patientIdentifier);
    if (!workspaceContext) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing workspaceContext parameter');
    }
    if (_.isString(workspaceContext)) {
        workspaceContext = parse(workspaceContext);
        if (_.isUndefined(workspaceContext.workspaceId)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing workspaceContext.workspaceId parameter');
        }
        if (_.isUndefined(workspaceContext.contextId)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing workspaceContext.contextId parameter');
        }
        viewedPatientContext.workspaceContext = workspaceContext;
        viewedPatientContext.patientId = formattedPatientIdentifier.patientId;
        viewedPatientContext.patientIdentifier = formattedPatientIdentifier.patientIdentifier;

    }
    var uid = req.session.user.uid;
    var clearContextHistory = req.param('clear');
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };

    pjds.get(req, res, pjdsOptions, function(error, response) {
        pjdsOptions.data = response.data;
        var updatedEHMPUIContext;
        if (error) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
        }
        if (_.isUndefined(pjdsOptions.data.eHMPUIContext)) {
            pjdsOptions.data.eHMPUIContext = [];
        }
        if (clearContextHistory === 'true') {
            updatedEHMPUIContext = [];
        } else {
            _.each(pjdsOptions.data.eHMPUIContext, function(previousPatient) {
                var nextPatientIdentifier;
                if (_.isUndefined(previousPatient.patientId)) {
                    previousPatient.patientId = {
                        value: previousPatient.patientIdentifier
                    };
                    previousPatient.patientIdentifier = '';
                    nextPatientIdentifier = formatPatientIdentifier(previousPatient.patientId, previousPatient.patientIdentifier);
                    previousPatient.patientId = nextPatientIdentifier.patientId;
                    previousPatient.patientIdentifier = nextPatientIdentifier.patientIdentifier;
                }
            });
            updatedEHMPUIContext = updatePreviousPatientsList(viewedPatientContext, pjdsOptions.data.eHMPUIContext);
        }
        pjdsOptions.data.eHMPUIContext = updatedEHMPUIContext;
        pjds.put(req, res, pjdsOptions, function(error, response) {
            if (error) {
                res.status(rdk.httpstatus.bad_request).rdkSend(error.message);
            } else {
                var resultObj = {};
                resultObj.data = updatedEHMPUIContext;
                resultObj.status = dd(response)('statusCode').val;
                res.status(rdk.httpstatus.ok).rdkSend(resultObj);
            }
        });

    });
}
