'use strict';
//------------------------------------------------------------------------------
// Used to determine if the ids in JDS are all found in MVI for the patient.
// If they are not then a resync messaged is published to resync the patient.
// This may be done for various reason for the correlation between patient identifiers may have changed in MVI.
//
// @Author: John R. Holand, Phil Crowder
//------------------------------------------------------------------------------
var async = require('async');
var _ = require('underscore');
var jobUtils = require(global.VX_UTILS + 'job-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

// Entry point to determine if a patient resync is require and if so publish a resync message.
function detectAndResync(log, environment, job, mviPatientIdentifiers, callback) {
    log.debug('patient-id-comparator.js.detectAndResync entering method with patientIdentifier = %j', getPatientIdentifier(job));

    async.waterfall([
         function(waterfallCallback) { return waterfallCallback(null, job, mviPatientIdentifiers, log, environment);},
         getJdsPids,
         detectUnstablePatIds],
         function(error, resyncRequired) {
             if (error) {
                 log.error('patient-id-comparator.js.detectAndResync: An Error occurred: ' + error);
                 return callback(error);
             } else {
                 if (resyncRequired) {
                     return requestReSync(job, log, environment, callback);
                 } else {
                     return callback(null, 'NA');
                 }
             }
         }
     );
} 

// get the patient identifier list from JDS
function getJdsPids(job, mviPatientIdentifiers, log, environment, callback) {
    var patientIdentifier = getPatientIdentifier(job);

    log.debug('patient-id-comparator.js.getJdsPids: Entered method.');

    environment.jds.getPatientIdentifierByPid (patientIdentifier.value, function( error, response, result ) {
        if (error) {
            log.error('patient-id-comparator.js.getJdsPids: Error: ' + error);
            return callback('Error retrieving JDS Pids');
        }
        if (response.statusCode !== 200){
            log.error('patient-id-comparator.js.getJdsPids: Error return from JDS with status code %d and result = %j', response.statusCode, result);
            return callback('Unable to retrieve JDS Pids list.  JDS returned a status code of ' + response.statusCode);
        }

        return callback(null, getJdsIds(result),  _.pluck(mviPatientIdentifiers || [], 'value'), patientIdentifier, log, environment);
    });
}

function getPatientIdentifier(job) {
    if (_.isUndefined(job.patientIdentifier)) {
        return idUtil.create('pid', job.pid);
    } else {
        return job.patientIdentifier;
    }
}

function getJdsIds(results) {
    var jdsPidStates =[];

    for (var i=0; i < results.patientIdentifiers.length; i++) {
        jdsPidStates.push(results.patientIdentifiers[i]);
    }

    return jdsPidStates;
}

//check: are there any ids in jds that are not in mvi and a resync is not in process
function detectUnstablePatIds(jdsPids, mviPids, patientIdentifier, log, environment, callback) {
    log.debug('patient-id-comparator.js.detectUnstablePatIds:  Entered method with jds pids: %j and mvi pids: %j.', jdsPids, mviPids);
    var dif = _.intersection(jdsPids, mviPids);

    if (dif.length === jdsPids.length) {
        return callback(null, false);
    }

    environment.jds.getSyncStatus(patientIdentifier, function(error, response, result) {
        if (error) {
            log.warn('There was an error checking sync status for patient identifier %j.  Error: %s', patientIdentifier, error);
            return callback(null, true);
        }
        if (response.statusCode !== 200) {
            log.warn('There was an error checking sync status for patient identifier %j.  Error: %j', patientIdentifier, response.body);
            return callback(null, true);
        }

        var resyncJobs = _.find(result.jobStatus, function(jobStatus) {
            return jobStatus.type === 'resync-request';
        });

        return callback(null, _.isUndefined(resyncJobs));
    });
}

function requestReSync(job, log, environment, callback) {
    log.info('patient-id-comparator.js.requestReSync: This patient needs to be Resyncd. A resync request is being published for %j,', job.patientIdentifier);
    var resyncJobRequest = jobUtils.createResyncRequest(getPatientIdentifier(job), job);

    environment.publisherRouter.publish(resyncJobRequest, function(error) {
        if (error) {
            log.error('patient-id-comparator.js.publishJobs: publisher error: %s', error);
            return callback(error);
        }

        log.debug('patient-id-comparator.js.publishJobs: jobs published, complete status. jobId: %s, jobsToPublish: %j', resyncJobRequest.jobId, resyncJobRequest);
        return callback(null, 'RESYNCING');
    });
}

module.exports.detectAndResync = detectAndResync;



