'use strict';

var _ = require('underscore');
var async = require('async');
var jobUtils = require(global.VX_UTILS + 'job-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

//Used for id conflict errors from JDS during the saving of ids to JDS. If id conflicts are found then a resync
//message is published for the original job and any unique conflict ids (new jobs).
function resyncJdsIdConflicts(log, config, environment, job, conflictErrorData, callback) {
    log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: Checking conflicting patient ids in JDS for job %j.', job);

    var conflictingPatientIds = getConflictingPatientIds(log, conflictErrorData);

    if (_.isEmpty(conflictingPatientIds)) {
        log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: No conflicting ids found in error message from JDS for job %j.', job);
        return callback(null, 'NA');
    }

    log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: Conflicting ids found. %s', conflictingPatientIds.toString());

    var syncIds = [];    //Patient ids that need resynced excluding the patient id from the job.

    async.whilst(
        function () { return !_.isEmpty(conflictingPatientIds); },
        function (loopCallback) {
            getPatientIdentifiersFromJds(log, environment, conflictingPatientIds[0], function(error, patientIds) {
                if (error) {
                    log.error('resync-jds-id-conflicts.resyncJdsIdConflicts: Error getting patient identifiers from JDS for patient identifier %s with error %s.', conflictingPatientIds[0], error);
                    loopCallback('Error getting patient identifiers from JDS.');
                }

                log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: JDS return the following ids for %s: %s', conflictingPatientIds[0], patientIds);

                addSyncId(config, job.patientIdentifier.value, patientIds, syncIds);

                //remove all jds ids returned from conflicting list
                //because we don't need to look them up ie already found in this patient.
                conflictingPatientIds = _.difference(conflictingPatientIds, patientIds);

                return loopCallback();
            });
        },
        function (error) {
            if (error) {
                return callback(error);
            }

            log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: Resyncing the following patient ids: %s', syncIds.toString());

            async.each(syncIds, function(syncId, eachCallback) {
                var patientIdentifier = {type: idUtil.isIcn(syncId) ? 'icn' : 'pid', value: syncId};
                resync(jobUtils.createResyncRequest(patientIdentifier), log, environment, eachCallback);
            }, function(error) {
                if (error) {
                    log.error('resync-jds-id-conflicts.resyncJdsIdConflicts: Unexpected error %s', error);
                    return callback(error);
                }

                log.debug('resync-jds-id-conflicts.resyncJdsIdConflicts: Resyncing the original job: %j', job);
                resync(job, log, environment, callback);
            });
        }
    );
}

function getConflictingPatientIds(log, conflictErrorData) {
    log.debug('resync-jds-id-conflicts.getConflictingPatientIds: Creating a list of conflicting ids.');

    if (_.isUndefined(conflictErrorData.error) || _.isEmpty(conflictErrorData.error.errors)) {
        return [];
    }

    return _.chain(conflictErrorData.error.errors)
            .map(function(item) {
                if (_.isUndefined(item.reason) || _.isUndefined(item.domain) || item.reason !== 223) {
                    return undefined;
                }

                return item.domain.substring(10, item.domain.indexOf('Associated with')).trim();
            })
            .compact()
            .value();
}

function getPatientIdentifiersFromJds(log, environment, patientId, callback) {
    log.debug('resync-jds-id-conflicts.getPatientIdentifiersFromJds: Getting patient ids from JDS.');

    var jdsMethod = idUtil.isPid(patientId) ? 'getPatientIdentifierByPid' : 'getPatientIdentifierByIcn';

    environment.jds[jdsMethod](patientId, function(error, response, result) {
        if (error) {
            log.error('resync-jds-id-conflicts.getPatientIdentifiersFromJds: Error retrieving patient ids from JDS: ' + error);
            return callback('Error retrieving patient ids from JDS.');
        }
        if (response.statusCode !== 200){
            log.error('resync-jds-id-conflicts.getPatientIdentifiersFromJds: Error return from JDS with status code %d and result = %j', response.statusCode, result);
            return callback('Unable to retrieve JDS patient identifier list.  JDS returned a status code of ' + response.statusCode);
        }

        return callback(null, result.patientIdentifiers || []);
    });
}

//We do not want to add a patient id from the jds patient id list if one of the ids is the same as the sync job's patient id.
//The resync the job (job that trigger the conflict id check) will take care of the patient associated with the jds patient ids.
function addSyncId(config, jobPatientId, jdsPatientIds, syncIds) {
    if (_.contains(jdsPatientIds, jobPatientId)) {
        return;
    }

    var syncId = getSyncId(jdsPatientIds, config);
    if (!_.isUndefined(syncId)) {
        syncIds.push(syncId);
    }
}

//Order matters in trying to pick an id to sync the patient.  Primary site pid > ICN > DOD pid.
function getSyncId(patientIds, config) {
    var primeVistaPredicate = function(patientId) {
        return idUtil.isVistaDirect(patientId, config);
    };
    var icnPredicate = function(patientId) {
        return idUtil.isIcn(patientId);
    };
    var dodPredicate = function(patientId) {
        return idUtil.isDod(patientId);
    };

    return _.find(patientIds, primeVistaPredicate) ||
           _.find(patientIds, icnPredicate) ||
           _.find(patientIds, dodPredicate);
}

function resync(job, log, environment, callback) {
    log.debug('resync-jds-id-conflicts.resync: Sending resync message for job %j.', job);

    resyncNeeded(job.patientIdentifier, log, environment, function(error, doResync) {
        if (!doResync) {
            log.debug('resync-jds-id-conflicts.resync: Resync already in progress for job %j.', job);
            return callback(null, 'NA');
        }

        return requestReSync(job, log, environment, callback);
    });
}

function resyncNeeded(patientIdentifier, log, environment, callback) {
    log.debug('resync-jds-id-conflicts.resyncNeeded:  Checking if resync is needed for patient identifier %j.', patientIdentifier);

    environment.jds.getSyncStatus(patientIdentifier, function(error, response, result) {
        if (error) {
            log.warn('resync-jds-id-conflicts.resyncNeeded: There was an error checking sync status for patient identifier %j.  Error: %s', patientIdentifier, error);
            return callback(null, true);
        }
        if (response.statusCode !== 200) {
            log.warn('resync-jds-id-conflicts.resyncNeeded: There was an error checking sync status for patient identifier %j.  Error: %j', patientIdentifier, response.body);
            return callback(null, true);
        }

        var resyncJobs = _.find(result.jobStatus, function(jobStatus) {
            return jobStatus.type === 'resync-request';
        });

        return callback(null, _.isUndefined(resyncJobs));
    });
}

function requestReSync(job, log, environment, callback) {
    log.info('resync-jds-id-conflicts.requestReSync: This patient needs to be Resyncd. A resync request is being published for %j,', job.patientIdentifier);

    var resyncJobRequest = jobUtils.createResyncRequest(job.patientIdentifier, job);

    environment.publisherRouter.publish(resyncJobRequest, function(error) {
        if (error) {
            log.error('resync-jds-id-conflicts.requestReSync: publisher error: %s', error);
            return callback(error);
        }

        log.debug('resync-jds-id-conflicts.requestReSync: jobs published, complete status. jobId: %s, jobsToPublish: %j', resyncJobRequest.jobId, resyncJobRequest);
        return callback(null, 'RESYNCING');
    });
}

module.exports.resyncJdsIdConflicts = resyncJdsIdConflicts;

//for unit testing only
module.exports._getConflictingPatientIds = getConflictingPatientIds;
module.exports._getPatientIdentifiersFromJds = getPatientIdentifiersFromJds;
module.exports._addSyncId = addSyncId;
module.exports._resync = resync;
