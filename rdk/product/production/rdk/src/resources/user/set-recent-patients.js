'use strict';

var dd = require('drilldown');
var rdk = require('../../core/rdk');
var moment = require('moment');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');
var VIEWED_PATIENT_CONTEXT_LIST_LIMIT = 5;

module.exports = setEhmpUserContext;
module.exports.parameters = {
    put: {
        viewedPatientContext: {
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
            if (viewedPatientContext.patientPid === previousPatient.patientPid) {
                hasPreviousPatientListed = true;
            }
        });
        return hasPreviousPatientListed;
    };
    var updatePreviousPatientsList = function(viewedPatientContext, currentPreviousPatientsList) {
        req.logger.debug('setEhmpUserContext resource called');
        var updatedPreviousPatientsList = [];
        var previousPatientContextLimitReached = (currentPreviousPatientsList.length === VIEWED_PATIENT_CONTEXT_LIST_LIMIT);
        var userContextExists = hasPreviousPatientListed(viewedPatientContext, currentPreviousPatientsList);
        if (userContextExists) {
            _.each(currentPreviousPatientsList, function(previousPatient) {
                if (viewedPatientContext.patientPid !== previousPatient.patientPid) {
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
    var viewedPatientContext = req.param('viewedPatientContext');
    if (!viewedPatientContext) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing viewedPatientContext parameter');
    }
    if (_.isString(viewedPatientContext)) {
        viewedPatientContext = parse(viewedPatientContext);
        if (_.isUndefined(viewedPatientContext.screenName)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing viewedPatientContext.screenName parameter');
        }
        if (_.isUndefined(viewedPatientContext.patientPid)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing viewedPatientContext.patientPid parameter');
        }
        if (_.isUndefined(viewedPatientContext.patientDisplayName)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing viewedPatientContext.patientDisplayName parameter');
        }
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
