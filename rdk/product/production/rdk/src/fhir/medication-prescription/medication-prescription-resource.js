/*jsling node: true*/
'use strict';

var rdk = require('../../core/rdk');
var medicationPrescription = require('./medication-prescription');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');

function getResourceConfig() {
    return [{
        name: 'medicationprescription-medicationprescription',
        path: '',
        get: getmedicationPrescription,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: { // REQUIRED FOR pid IN URL
            fhirPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        permitResponseFormat: true
    }];
}

function limitFHIRResultByCount(fhirBundle, countStr) {
    if (nullchecker.isNotNullish(countStr)) {
        var count = parseInt(countStr);
        fhirBundle.entry = _.take(fhirBundle.entry, count);
    }
}

function getmedicationPrescription(req, res) {
    var pid = req.query.pid;
    var params = req.query;

    if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_format).send('Missing required parameter: pid');
    }
    validateParams(params, /*onSuccess*/ function() {
        medicationPrescription.getData(req, pid, params, function(err, data) {
            if (err) {
                req.logger.error(err.message);
                res.status(rdk.httpstatus.internal_server_error).send(err.message);
            }
            var fhirBundle = medicationPrescription.convertToFhir(data, req);
            limitFHIRResultByCount(fhirBundle, params._count);
            res.status(rdk.httpstatus.ok).send(fhirBundle);

        });
    }, /*onError*/ function(errors) {
        return res.status(rdk.httpstatus.bad_request).send('Invalid parameters:' + fhirToJDSSearch.validationErrorsToString(errors));
    });
}

function validateParams(params, onSuccess, onError) {
    // check common parameters
    fhirToJDSSearch.validateCommonParams(params, function() {
        // validate date
        fhirToJDSSearch.validateDateParams(params, ['datewritten'], function() {
            if (medicationPrescription.isSortCriteriaValid(params)) {
                onSuccess();
            } else {
                onError(['Unsupported _sort criteria. Supported attributes are: identifier, patient']);
            }
        }, onError);
        // TODO: add validation for code param
    }, onError);
}

module.exports.getResourceConfig = getResourceConfig;
