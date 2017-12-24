'use strict';

require('../../env-setup');

// Retrieves all patients with appointments in a date range from all VistA sites in the worker-config.json file.
// Stores all patients to the pJDS prefetch data store.

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var objUtil = require(global.VX_UTILS + 'object-utils');
var filemanDateUtil = require(global.VX_UTILS + 'filemanDateUtil');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var parseRpc = require(global.OSYNC_UTILS + 'patient-sync-utils');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

function prefetchPatients(log, config, environment, startDate, endDate, callback) {
    getAllAppointmentClients(log, environment, function(error, clinicUids) {
        if (error) {
            log.error('prefetch-patients-appointments.prefetchPatients: Error retrieving osync appointment clinics. No appointments will be processed. Error: ' + error);
            return callback(null, 'Appointment processing completed with errors.');
        }

        processAppointmentsForSites(log, config, environment, startDate, endDate, clinicUids, function(error, result) {
            callback(error, result);
        });
    });
}

// Retrieve the osync appointment clinics. If the the appointment is for an osync clinic ie sync patients for these
// clinics then isEhmpPatient flag should be set to true.
function getAllAppointmentClients(log, environment, callback) {
    log.debug('prefetch-patients-appointments.getAllAppointmentClients: Retrieving osync clinics.');

    environment.pjds.getAllOSyncClinics(function(error, response, result) {
        if (error) {
            log.error('prefetch-patients-appointments.getAllAppointmentClients: There was an error retrieving appointment clinics. Error: %s', error);
            return callback(error);
        }

        if (response.statusCode !== 200) {
            log.error('prefetch-patients-appointments.getAllAppointmentClients: There was an error retrieving appointment clinics. Error: %j', result);
            return callback(result);
        }

        var locationUids = _.chain(result.items).pluck('uid').value();    //array of locationIen only
        log.debug('prefetch-patients-appointments.getAllAppointmentClients: Found the following appointment clinics for osync: %s', locationUids);

        callback(null, locationUids);
    });
}

function processAppointmentsForSites(log, config, environment, startDate, endDate, osyncClinicUids, callback) {
    var vistaSites = config.vistaSites;

    startDate = !_.isUndefined(startDate) && moment(startDate, 'YYYYMMDDHHmmSS').isValid() ?
        filemanDateUtil.getFilemanDate(moment(startDate, 'YYYYMMDDHHmmSS').toDate()) : filemanDateUtil.getFilemanDate(moment().toDate());

    var daysInFuture = objUtil.getProperty(config, 'osync', 'appointmentsOptions', 'daysInFuture') || 1;
    var future = moment().add(daysInFuture, 'days');

    endDate = !_.isUndefined(endDate) && moment(endDate, 'YYYYMMDDHHmmSS').isValid() ?
        filemanDateUtil.getFilemanDate(moment(endDate, 'YYYYMMDDHHmmSS').toDate()) : filemanDateUtil.getFilemanDate(future.toDate());

    async.eachSeries(_.keys(vistaSites), function(site, seriesCallback) {
        var rpcConfig = vistaSites[site];
        rpcConfig.context = config.osync.rpcContext;

        rpcUtil.standardRPCCall(log, rpcConfig, 'HMP PATIENT SCHED SYNC', startDate, endDate, null, null, function(error, data) {
            if (error) {
                log.error('prefetch-patients-appointments.processAppointmentsForSites: Unable to retrieve appointments from site: %s. error: %s data: %s', site, error, data);
                return setTimeout(seriesCallback, 0);       //Allow processing to continue on error
            }

            processPatients(log, config, environment, data, site, vistaSites[site].stationNumber, osyncClinicUids, seriesCallback);
        });
    }, function() {
        log.debug('prefetch-patients-appointments.processAppointmentsForSites: Appointment processing completed.');
        callback(null, 'Appointment processing completed.');
    });

}

function processPatients(log, config, environment, data, site, stationNumber, osyncClinicUids, callback) {
    if (_.isUndefined(data) || _.isEmpty(data)) {
        log.info('prefetch-patients-appointments.processPatients: No appointments to process for site %s', site);
        return setTimeout(callback, 0);
    }

    parseRpc.parseRpcResponseAppointments(log, data, ['all'], function(err, patients) {
        if (err) {
            log.error('prefetch-patients-appointments.processPatients: Unable to parse the appointments for site: %s error: %s', site, err);
            return setTimeout(callback, 0);
        }

        async.eachSeries(patients, function(patient, cb) {
            patient.siteId = site;
            var isEhmpPatient = isOnClinicList(patient, osyncClinicUids);
            var prefetchPatient = createAppointmentPatient(patient, stationNumber, isEhmpPatient);

            log.debug('prefetch-patients-appointments.processPatients: Saving patient %j to prefetch list.', prefetchPatient);
            prefetchUtil.savePrefetchPatient(log, environment, prefetchPatient, cb);
        }, function(err) {
            if (err) {
                log.error('prefetch-patients-appointments.processPatients: Unable to create and save the appointments for site: %s error: %s', site, err);
            }
            return setTimeout(callback, 0);
        });
    });
}

//If the the appointment is for an osync clinic ie sync patients for these clinics then isEhmpPatient flag should be set to true.
function isOnClinicList(patient, osyncClinics) {
    var uid = 'urn:va:location:' + patient.siteId + ':' + patient.locationIen;
    return _.contains(osyncClinics, uid);
}

function createAppointmentPatient(patient, stationNumber, isEhmpPatient) {
    return {
        uid: 'urn:va:appointment:' + patient.siteId + ':' + patient.dfn + ':' + patient.dfn,
        pid: patient.siteId + ';' + patient.dfn,
        patientIdentifier: patient.dfn + '^PI^' + stationNumber + '^USVHA^P',
        isEhmpPatient: isEhmpPatient,
        source: 'appointment',
        sourceDate: filemanDateUtil.getVprDateTime(patient.date),
        facility: stationNumber,
        clinic: patient.locationName
    };
}

module.exports.prefetchPatients = prefetchPatients;
module.exports._createAppointmentPatient = createAppointmentPatient;
module.exports._getAllAppointmentClients = getAllAppointmentClients;
module.exports._isOnClinicList = isOnClinicList;
module.exports._processAppointmentsForSites = processAppointmentsForSites;
