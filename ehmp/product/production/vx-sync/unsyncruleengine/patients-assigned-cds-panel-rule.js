'use strict';

var _ = require('underscore');

function getEventsRecentEventTime(pid) {
    if (pid.lastAccessed) {
        return pid.lastAccessed;
    }
    else {
        //TODO: Need to better handle when we don't have a date (perhaps update their records with last accessed date).
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
    //Check whether patient is assigned to a CDS panel
    log.debug('PatientIdentifiers before removing those assigned to a CDS panel: ', patientIdentifiers);
    var pidsNotInCDS = _.filter(patientIdentifiers, function(patientIdentifier) {
        log.debug('filtering identifier', patientIdentifier.value);
        //We need to save for those that are not in a CDS panel so we can add it later.
        return patientIdentifier.cdsPanel === false || patientIdentifier.cdsPanel === null || patientIdentifier.cdsPanel === undefined;
    });
    patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
        log.debug('filtering identifier', patientIdentifier.value);
        //TODO: See if they are in a CDS panel.
        return patientIdentifier.cdsPanel === true;
    });
    log.debug('Result after removing those assigned to a CDS panel', patientIdentifiers);

    //TODO: Should we make this variable configurable?
    var oneYearAgo = 365 * 24 * 60 * 60 * 1000; //365 days, 24 hours, 60 minutes, 60 second, 1000 milliseconds
    var dateCurrent = new Date();
    //Get most recent event
    patientIdentifiers = _.filter(patientIdentifiers, function(pid) {
        var latestEvent = new Date(1970, 1, 1);
        //TODO: Get the most recent event from each of these: admission, appointment, updates to data, accessed data - any touchpoints to patients record set.
        var eventTime = getEventsRecentEventTime(pid);
        eventTime = new Date(eventTime);
        if (latestEvent.getTime() < eventTime.getTime())
            latestEvent = eventTime;

        //TODO: See if that is one year ago
        //See if that is one year ago
        if ((dateCurrent.getTime() - latestEvent.getTime()) > oneYearAgo) {
            //TODO: Remove from cache
            return true;
        }
        else {
            return false;
        }
    });

    //Add back those that are not in a CDS panel so we can add it later.
    patientIdentifiers = patientIdentifiers.concat(pidsNotInCDS);

    return callback(null, patientIdentifiers);
}

function loadRule() {
    return patientsAssignedCDSPanelRule;
}

module.exports = loadRule;