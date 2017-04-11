'use strict';

var _ = require('lodash');
var util = require('util');
var searchUtil = require('./results-parser');
var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var pidValidator = rdk.utils.pidValidator;

function getJDSPatientSyncStatus(request, response) {
    request.logger.debug('getJDSPatientSyncStatus is called');
    var pid = request.body.pid || request.body.icn || request.body.edipi || ''; //if !pid then error
    request.app.subsystems.jdsSync.getPatientStatus(pid, request, function(err, result) {
        request.logger.trace('getJDSPatientSyncStatus: err: ' + JSON.stringify(err));
        request.logger.trace('getJDSPatientSyncStatus: result: ' + JSON.stringify(result));

        if (err && (err !== 404)) {
            request.logger.error('Error connecting to sync subsystem:');
            request.logger.error(err);
            response.status(500).rdkSend('There was an error processing your request. The error has been logged.');
            return;
        }

        determineIfPatientIsSynced(result, request, response);
    });
}

function determineIfPatientIsSynced(syncStatus, request, response) {
    var pid = request.body.pid || request.body.icn || request.body.edipi || ''; //if !pid then error
    request.logger.debug('determineIfPatientIsSynced called for pid = ' + pid);
    var patientSynced = false;
    var syncInProgress = false;
    var status = 'ok';
    if (!syncStatus || !syncStatus.status) {
        request.logger.warn('unknown response from JDS Sync subsystem');
        return response.rdkSend({
            'status': 'Unknown response from JDS',
            'patientSynced': patientSynced,
            'syncInProgress': syncInProgress
        });
    }
    syncJDSPatient(request, function(getPatientStatus) {
        status = getPatientStatus;

        if (syncStatus.status === 404) {
            patientSynced = false;
        } else if (syncStatus.data && syncStatus.data.syncStatus) {
            if (syncStatus.data.syncStatus.inProgress) {
                patientSynced = false;
            }
            else if (_.isArray(syncStatus.data.jobStatus) && syncStatus.data.jobStatus.length > 0) { // not empty
                patientSynced = false;
            }
            else if (syncStatus.data.syncStatus.completedStamp) {
                patientSynced = true;
            }
        }
        request.logger.debug('Patient ' + pid + ' sync status is ' + patientSynced);
        if (!patientSynced) {
            syncInProgress = true;
        }

        response.rdkSend({
            'status': status,
            'patientSynced': patientSynced,
            'syncInProgress': syncInProgress
        });
    });
}

function syncJDSPatient(req, cb) {
    var payload = {
        'demographics': req.body.demographics
    };

    if (req.body.icn && pidValidator.isIcn(req.body.icn)) {
        payload.icn = req.body.icn;
    } else if (req.body.edipi && pidValidator.isEdipi(req.body.edipi)) {
        payload.edipi = req.body.edipi;
    }

    req.logger.debug('calling demographicSync endpoint');
    req.logger.debug(util.inspect(payload));
    searchUtil.transformPatient(payload.demographics);
    req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, function(err, response, data) {
        req.logger.trace('in syncJDSPatient callback from syncPatientDemographics: err = ' + JSON.stringify(err));
        req.logger.trace('in syncJDSPatient callback from syncPatientDemographics: response = ' + JSON.stringify(response));
        req.logger.trace('in syncJDSPatient callback from syncPatientDemographics: data = ' + JSON.stringify(data));

        if (!err && data && (data.success || data.status === 'created')) {
            cb({
                syncInProgress: true,
                error: 'ok'
            });
        } else if (data && data.error && _.isArray(data.error.errors) && data.error.errors.length > 0 && data.error.errors[0].exception) {
            cb({
                syncInProgress: false,
                error: data.error.errors[0].exception
            });
        } else {
            cb({
                syncInProgress: false,
                error: 'Unknown error while syncing patient.'
            });
        }
    });
}

module.exports.getPatient = getJDSPatientSyncStatus;
module.exports._determineIfPatientIsSynced = determineIfPatientIsSynced;
