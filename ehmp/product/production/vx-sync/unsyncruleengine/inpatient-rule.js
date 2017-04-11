'use strict';

var _ = require('underscore');

function process(log, config, environment, patientIdentifiers, callback) {
    //make RPC to check if patient is in-patient/out-patient
    var notInPatientPids = _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.inpatient === false || patientIdentifier.inpatient === null || patientIdentifier.inpatient === undefined;
    });

    patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.inpatient === true;
    });

    //get discharge date for inpatient date
    var thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000; //30 days 24 hours, 60 minutes, 60 second, 1000 milliseconds
    var dateCurrent = new Date();
    patientIdentifiers = _.filter(patientIdentifiers, function(pid) {
        var dischargeDate = pid.dischargeDate ? new Date(pid.dischargeDate) : new Date();
        if ((dateCurrent.getTime() - dischargeDate.getTime()) > thirtyDaysAgo) {
            return true;
        }
        else {
            return false;
        }
    });

    patientIdentifiers = patientIdentifiers.concat(notInPatientPids);
    return callback(null, patientIdentifiers);
}

function loadRule() {
    return process;
}

module.exports = loadRule;