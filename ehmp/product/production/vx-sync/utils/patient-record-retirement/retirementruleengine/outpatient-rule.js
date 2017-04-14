'use strict';

var _ = require('underscore');

function process(log, config, environment, patientIdentifiers, callback) {
    //make RPC to check if patient is in-patient/out-patient
    var notOutPatientPids = _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.inpatient === true;
    });

    patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.inpatient === false || patientIdentifier.inpatient === null || patientIdentifier.inpatient === undefined;
    });

    //get last accessed date for outpatient date
    var thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000; //30 days 24 hours, 60 minutes, 60 second, 1000 milliseconds
    var dateCurrent = new Date();
    patientIdentifiers = _.filter(patientIdentifiers, function(pid) {
        var lastAccessedDate = pid.lastAccessed ? new Date(pid.lastAccessed) : new Date();
        if ((dateCurrent.getTime() - lastAccessedDate.getTime()) > thirtyDaysAgo) {
            return true;
        }
        else {
            return false;
        }
    });

    patientIdentifiers = patientIdentifiers.concat(notOutPatientPids);
    return callback(null, patientIdentifiers);
}

function loadRule() {
    return process;
}

module.exports = loadRule;