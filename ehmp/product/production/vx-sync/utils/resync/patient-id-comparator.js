'use strict';

var _ = require('underscore');
var async = require('async');
var jobUtils = require(global.VX_UTILS + 'job-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

//------------------------------------------------------------------------------
// Used to determine if the ids in JDS are all found in MVI for the patient.
// If they are not then a resync messaged is published to resync the patient.
// This may be done for various reason for the correlation between patient identifiers may have changed in MVI.
//
// @Author: John R. Holand, Phil Crowder
//------------------------------------------------------------------------------

// Entry point to determine if a patient resync is require and if so publish a resync message.
function detectAndResync(log, environment, job, mviPatientIdentifiers, callback) {
    log.debug('patient-id-comparator.js.detectAndResync entering method with patientIdentifier = %j', job.patientIdentifier);

    async.waterfall([
         function(waterfallCallback) { return waterfallCallback(null, job, mviPatientIdentifiers, log, environment);},
         getJdsPids,
         detectUnstablePatIds],
         function(error, resyncRequired) {
             if (error) {
                 log.error('patient-id-comparator.js.detectAndResync: An Error occurred: ' + error);
                 return callback(error);
             }
             if (resyncRequired) {
                 return requestReSync(job, log, environment, callback);
             } else {
                 return callback(null, 'NA');
             }
         }
     );
}

//---------------------------------------------------------------------------------
// This method queries JDS to receive all of the identifiers that this patient
// is linked to.  It then returns an array of patient ids.
//
// job: Original job that is used to determine if a resync is required
// mviPatientIdentifiers: All identifiers in MVI for job.patientIdentifier
// log: Logger
// environment: current execution environment
// callback: function (error, jds ids, mvi ids, patientIdentifier, log, environment) -
//           This is the async.waterfall callback handler.
//           The async.waterfall will absorb the error parameter
//           and if it is null, will pass the remaining parameter as the
//           parameters to the detectUnstablePatIds method.
//              error: The error for async.waterfall to trigger it to stop or continue.
//              jdsPids: All identifiers in JDS for patientIdentifier
//              mviPids: All identifiers in MVI for patientIdentifier
//              patientIdentifier: The patient identifier from the original job.
//              log: Logger
//              environment: current execution environment
//---------------------------------------------------------------------------------
function getJdsPids(job, mviPatientIdentifiers, log, environment, callback) {
    log.debug('patient-id-comparator.js.getJdsPids: Entered method.');

    var jdsMethod = idUtil.isPid(job.patientIdentifier.value) ? 'getPatientIdentifierByPid' : 'getPatientIdentifierByIcn';

    environment.jds[jdsMethod](job.patientIdentifier.value, function( error, response, result ) {
        if (error) {
            log.error('patient-id-comparator.js.getJdsPids: Error: ' + error);
            return callback('Error retrieving JDS Pids');
        }
        if (response.statusCode !== 200){
            log.error('patient-id-comparator.js.getJdsPids: Error return from JDS with status code %d and result = %j', response.statusCode, result);
            return callback('Unable to retrieve JDS Pids list.  JDS returned a status code of ' + response.statusCode);
        }

        return callback(null, getJdsIds(result),  _.pluck(mviPatientIdentifiers || [], 'value'), job.patientIdentifier, log, environment);
    });
}

function getJdsIds(results) {
    var jdsPidStates =[];

    for (var i=0; i < results.patientIdentifiers.length; i++) {
        // Need to skip any 'JPID' patientIdentifiers as this isn't a real patient identifier
        if (idUtil.extractPiecesFromPid(results.patientIdentifiers[i]).site === 'JPID') {
            continue;
        }
        jdsPidStates.push(results.patientIdentifiers[i]);
    }

    return jdsPidStates;
}

//---------------------------------------------------------------------------------
// This method check to see if there any ids in jds that are not in mvi.  If there
// are then a resync is requested for the patient if one is not already in process.
//
// jdsPids: All identifiers in JDS for patientIdentifier
// mviPids: All identifiers in MVI for patientIdentifier
// patientIdentifier: The patient identifier from the original job.
// log: Logger
// environment: current execution environment
// callback: function (error, jds ids, mvi ids, patientIdentifier, log, environment) -
//           This is the async.waterfall callback handler.
//           The async.waterfall will absorb the error parameter
//           and if it is null, will pass the remaining parameter as the
//           parameters to the detectUnstablePatIds method.
//              error: The error for async.waterfall to trigger it to stop or continue.
//              unstable: True if a resync is require and false if not
//---------------------------------------------------------------------------------
function detectUnstablePatIds(jdsPids, mviPids, patientIdentifier, log, environment, callback) {
    log.debug('patient-id-comparator.js.detectUnstablePatIds:  Entered method with jds pids: %j and mvi pids: %j.', jdsPids, mviPids);
    var dif = _.intersection(jdsPids, mviPids);

    if (dif.length === jdsPids.length) {
        return callback(null, false);
    }

    environment.jds.getSyncStatus(patientIdentifier, function(error, response, result) {
        if (error) {
            log.error('patient-id-comparator.js.detectUnstablePatIds: There was an error checking sync status for patient identifier %j.  Error: %s', patientIdentifier, error);
            return callback(null, true);
        }
        if (response.statusCode !== 200) {
            log.error('patient-id-comparator.js.detectUnstablePatIds: There was an error checking sync status for patient identifier %j.  Error: %j', patientIdentifier, response.body);
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
    var resyncJobRequest = jobUtils.createResyncRequest(job.patientIdentifier, job);

    environment.publisherRouter.publish(resyncJobRequest, function(error) {
        if (error) {
            log.error('patient-id-comparator.js.requestReSync: publisher error: %s', error);
            return callback(error);
        }

        log.debug('patient-id-comparator.js.requestReSync: jobs published, complete status. jobId: %s, jobsToPublish: %j', resyncJobRequest.jobId, resyncJobRequest);
        return callback(null, 'RESYNCING');
    });
}

module.exports.detectAndResync = detectAndResync;


