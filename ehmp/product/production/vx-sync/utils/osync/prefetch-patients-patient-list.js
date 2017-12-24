'use strict';

// Retrieves all active ehmp users and then retrieves their patient lists from a specific VistA (user id and site).
// Stores all patients to the pJDS prefetch data store.

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var OsyncActiveUserListUtil = require(global.OSYNC_UTILS + 'osync-active-user-list-util');
var patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

function prefetchPatients(log, config, environment, callback) {
    getActiveUser(log, config, environment, function(error, users) {
        if (error) {
            log.error('prefetch-patients-patient-list.prefetchPatients: Error retrieving active users. No active users will be processed. Error: ' + error);
            return callback(null, 'Active user processing completed with errors.');
        }

        processPatientListForUsers(log, config, environment, users, function(error, result) {
            callback(error, result);
        });
    });
}

function getActiveUser(log, config, environment, callback) {
    var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
    osyncActiveUserListUtil.getActiveUsers(function (error, users) {
        callback(error, users);
    });
}

function processPatientListForUsers(log, config, environment, users, callback) {
    var validUsers = _.compact(users);

    async.eachSeries(validUsers, function(user, seriesCallback) {
        patientListVistaRetriever.getPatientListForOneUser(log, config.osync, user, function(error, patientList) {
            if (error) {
                log.error('Error retrieving patient list for user %j. Error: %s', user, error);
                return setTimeout(seriesCallback, 0);   //Allow processing to continue on error
            }

            if (_.isArray(patientList) && patientList.length > 0) {
                processPatients(log, config, environment, patientList, seriesCallback);
            } else {
                log.debug('prefetch-patients-patient-list.processPatientListForUsers: No patients to process for user %j.', user);
                return setTimeout(seriesCallback, 0);
            }
        });
    }, function() {
        log.debug('prefetch-patients-patient-list.processPatientListForUsers: Active user processing completed.');
        callback(null, 'Active user processing completed.');
    });
}

function processPatients(log, config, environment, patientList, callback) {
    async.eachSeries(patientList, function(patient, cb) {
        var vistaSite = config.vistaSites[patient.siteId];
        if (_.isUndefined(vistaSite)) {
            log.error('prefetch-patients-patient-list.processPatientList: Cannot process users for undefined site %s.', patient.siteId);
            return setTimeout(cb, 0);
        }
        var prefetchPatient = createPatientListPatient(patient, vistaSite.stationNumber);

        log.debug('prefetch-patients-patient-list.processPatientList: Saving patient %j to prefetch list.', prefetchPatient);
        prefetchUtil.savePrefetchPatient(log, environment, prefetchPatient, cb);
    }, function(error) {
        if (error) {
            log.error('prefetch-patients-patient-list.processPatientListForUsers: Unable to create and save the patient to prefetch list. Error: ', error);
        }
        setTimeout(callback, 0);
    });
}

function createPatientListPatient(patient, stationNumber) {
    return {
        uid: 'urn:va:patientList:' + patient.siteId + ':' + patient.dfn + ':' + patient.dfn,
        pid: patient.siteId + ';' + patient.dfn,
        patientIdentifier: patient.dfn + '^PI^' + stationNumber + '^USVHA^P',
        isEhmpPatient: true,
        source: 'patientList',
        sourceDate: moment().format('YYYYMMDDHHmmss'),
        facility: stationNumber
    };
}

module.exports.prefetchPatients = prefetchPatients;
module.exports._createPatientListPatient = createPatientListPatient;
module.exports._processPatientListForUsers = processPatientListForUsers;
