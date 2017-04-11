'use strict';

var _ = require('underscore');

function getEventsRecentEventTime(pid) {
    if (pid.lastAccessed) {
        return pid.lastAccessed;
    }
    else {
        //If they don't have a lastAccessed time, then use today's date.
        return new Date();
    }
}

/**
 * I have a Patient assigned to a CDS panel where 1 year passes without any event,
 * rule should trigger and patients data should be removed from cache.
 * Event === (admission, appointment, updates to data, accessed data - any touchpoints to patients record set)<br/><br/>
 *
 * Returns a list of the patients that fit this criteria.
 */
function patientsAssignedCDSPanelRule(log, config, environment, patientIdentifiers, callback) {
    log.debug('patients-assigned-cds-panel.patientsAssignedCDSPanelRule() : Running patients-assigned-cds-panel');
    log.debug('PatientIdentifiers before removing those assigned to a CDS panel: ', patientIdentifiers);

    //Retrieve only those patientIdentifiers that are NOT in a CDS panel.
    var pidsNotInCDS = _.filter(patientIdentifiers, function(patientIdentifier) {
        log.debug('filtering identifier', patientIdentifier.value);
        //We need to save for those that are not in a CDS panel so we can add it later.
        return patientIdentifier.cdsPanel === false || patientIdentifier.cdsPanel === null || patientIdentifier.cdsPanel === undefined;
    });

    //Retrieve only those patientIdentifiers that are in a CDS panel.
    patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
        log.debug('filtering identifier', patientIdentifier.value);
        return patientIdentifier.cdsPanel === true;
    });
    log.debug('Result after removing those assigned to a CDS panel', patientIdentifiers);

    var oneYearAgo = 365 * 24 * 60 * 60 * 1000; //365 days * 24 hours * 60 minutes * 60 second * 1000 milliseconds = total milliseconds in one normal (non-leap) year
    var dateCurrent = new Date();

    //Retrieve only those CDS panel patientIdentifiers that are over one year ago.
    patientIdentifiers = _.filter(patientIdentifiers, function(pid) {
        var latestEvent = new Date(1970, 1, 1);

        var eventTime = getEventsRecentEventTime(pid);
        eventTime = new Date(eventTime);

        if (latestEvent.getTime() < eventTime.getTime())
            latestEvent = eventTime;

        //See if the latest event is over one year ago
        if ((dateCurrent.getTime() - latestEvent.getTime()) > oneYearAgo) {
            return true;
        }
        else {
            return false;
        }
    });

    //Add back those patientIdentifiers that are not in a CDS panel.
    patientIdentifiers = patientIdentifiers.concat(pidsNotInCDS);

    return callback(null, patientIdentifiers);
}

function loadRule() {
    return patientsAssignedCDSPanelRule;
}

module.exports = loadRule;