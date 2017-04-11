'use strict';

var _ = require('lodash');
var searchUtil = require('./results-parser');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;
var globalSearch = require('./global-search');

function getGlobalPatientSyncStatus(request, response) {
    request.logger.debug('getGlobalPatientSyncStatus is called');
    var pid = _.result(request, 'query.pid', '');
    request.logger.debug('Patient Global Search Pid used: ' + pid);
    if (_.isEmpty(pid)) {
        return response.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged. No Pid Param found.');
    }
    globalSearch._getPatientDemographicWithICN(request, response, pid, function(error, globalPatient) {
        if (error) {
            request.logger.error({
                error: error
            }, 'Error performing global patient search');
            return response.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
        }
        if (!globalPatient) {
            request.logger.trace({
                request: request,
                patientPID: pid
            }, 'Error performing global search for patient demographic information');
            return response.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
        }
        request.logger.trace({
            globalPatient: globalPatient
        }, 'Returned patient from global search');
        var patientSynced = false;
        var syncInProgress = false;
        var status = 'ok';
        syncJDSPatient(request, function(getPatientStatus) {
            status = getPatientStatus;
            request.logger.debug('Patient ' + pid + ' sync status is ' + patientSynced);
            if (!patientSynced) {
                syncInProgress = true;
            }
            return response.status(rdk.httpstatus.ok).rdkSend({
                'status': status,
                'patientSynced': patientSynced,
                'syncInProgress': syncInProgress,
                'data': globalPatient
            });
        }, pid, globalPatient);
    });
}

function getJDSPatientSyncStatus(request, response) {
    request.logger.debug('getJDSPatientSyncStatus is called');
    var pid = request.body.pid || request.body.icn || request.body.edipi || ''; //if !pid then error
    request.app.subsystems.jdsSync.getPatientStatus(pid, request, function(err, result) {
        request.logger.trace({
            err: err
        }, 'getJDSPatientSyncStatus with err');
        request.logger.trace({
            result: result
        }, 'getJDSPatientSyncStatus: with result');

        if (err && (err !== 404)) {
            request.logger.error('Error connecting to sync subsystem:');
            request.logger.error(err);
            return response.status(500).rdkSend('There was an error processing your request. The error has been logged.');
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
            } else if (_.isArray(syncStatus.data.jobStatus) && syncStatus.data.jobStatus.length > 0) { // not empty
                patientSynced = false;
            } else if (syncStatus.data.syncStatus.completedStamp) {
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

function syncJDSPatient(req, cb, pid, patientDemographics) {
    var payload = {
        'demographics': req.body.demographics || patientDemographics || ''
    };

    if ((req.body.icn && pidValidator.isIcn(req.body.icn)) || (pid && pidValidator.isIcn(pid))) {
        payload.icn = req.body.icn || pid;
    } else if (pid && pidValidator.isPidEdipi(pid)) {
        payload.edipi = pid.substring(4);
    }

    req.logger.debug('calling demographicSync endpoint');
    req.logger.debug({
        payload: payload
    }, 'syncJDSPatient payload');
    searchUtil.transformPatient(payload.demographics);
    req.app.subsystems.jdsSync.syncPatientDemographics(payload, req, function(err, response, data) {
        req.logger.trace({
            err: err
        }, 'in syncJDSPatient callback from syncPatientDemographics with err');
        req.logger.trace({
            response: response
        }, 'in syncJDSPatient callback from syncPatientDemographics with response');
        req.logger.trace({
            data: data
        }, 'in syncJDSPatient callback from syncPatientDemographics with data');

        if (!err && data && (data.success || data.status === 'created')) {
            cb({
                syncInProgress: true,
                error: 'ok'
            });
        } else if (data && !_.isEmpty(_.result(data, 'error.errors[0].exception', ''))) {
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
module.exports.getGlobalPatient = getGlobalPatientSyncStatus;
