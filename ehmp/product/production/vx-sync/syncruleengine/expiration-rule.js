'use strict';

var _ = require('underscore');
var inspect = require(global.VX_UTILS + 'inspect');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var patientUtil = require(global.VX_UTILS + 'patient-identifier-utils');

var jobTypeSourceHashMap = {
    'jmeadows': 'dod',
    'hdr':'hdr',
    'vler':'vler'
};

function expiration(log, config, environment, patientIdentifiers, exceptions, callback) {
    log.debug('Running expiration-rule on ' + inspect(patientIdentifiers));
    log.debug('Getting job state for %s', patientIdentifiers[0].value);
    environment.jds.getJobStatus({
            'jpid': patientIdentifiers[0].value,
        },{filter:  '?filter=ilike(\"type\",\"%25request%25\")'},
        function(error, response, result) {
            if (error) {
                log.error('expiration-rule.expiration: Erorr occurred retrieving job history for pid: %s; error: %s', patientIdentifiers[0].value, error);
                return callback(error, patientIdentifiers);
            }
            log.debug('Filtering job states for source sync jobs', result.items);
            var sourceSyncJobs = _.filter(result.items, function(job) {
                return jobUtil.isSyncJobType(job);
            });

            // Check for Vista Direct sites that have been completed.  These do not expire - so if they
            // are completed - we do not need to sync them.
            //------------------------------------------------------------------------------------------
            log.debug('Found source sync jobs.  Find completed VistA jobs which don\'t expire', inspect(sourceSyncJobs));
            var vistaRegEx = /vista-[0-9,A-F]{4}-subscribe/;
            var vistaJobs = _.filter(sourceSyncJobs, function(job) {
                return vistaRegEx.test(job.type) && job.status === 'completed';
            });
            log.debug('Found vista jobs.  Extracting PIDs', inspect(vistaJobs));
            var vistaPids = _.pluck(vistaJobs, 'patientIdentifier');
            vistaPids = _.pluck(vistaPids, 'value');
            log.debug('Found PIDs for existing VistA jobs, removing from rule result', inspect(vistaPids));
            patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
                return !_.contains(vistaPids, patientIdentifier.value);
            });
            log.debug('Result after filtering out existing VistA pids', inspect(patientIdentifiers));

            // Check for VistaHdr sites that have been completed.  These do not expire - so if they
            // are completed - we do not need to sync them.
            //------------------------------------------------------------------------------------------
            var vistaHdrRegEx = /vistahdr-[0-9,A-F]{4}-subscribe/;
            if (patientUtil.isHdrPubSubMode(config)) {
                log.debug('Find completed VistAHdr jobs which don\'t expire', inspect(sourceSyncJobs));
                var vistaHdrJobs = _.filter(sourceSyncJobs, function(job) {
                    return vistaHdrRegEx.test(job.type) && job.status === 'completed';
                });
                log.debug('Found vistaHdr jobs.  Extracting PIDs', inspect(vistaHdrJobs));
                var vistaHdrPids = _.pluck(vistaHdrJobs, 'patientIdentifier');
                vistaHdrPids = _.pluck(vistaHdrPids, 'value');
                log.debug('Found PIDs for existing VistaHdr jobs, removing from rule result', inspect(vistaHdrPids));
                patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
                    return !_.contains(vistaHdrPids, patientIdentifier.value);
                });
                log.debug('Result after filtering out existing VistaHdr pids', inspect(patientIdentifiers));
            }

            // Find completed jobs for secondary sources which may have expired
            //------------------------------------------------------------------
            log.debug('Find completed jobs for other sources which may have expired.  sourceSyncJobs: %j', sourceSyncJobs);
            var secondaryJobs = _.filter(sourceSyncJobs, function(job) {
                return jobUtil.isSecondaryDomainSyncRequestType(job) && job.status === 'completed';
            });
            log.debug('Found secondary jobs, identifying sources, extracting PIDs and looking up expiration cooldowns.  secondaryJobs: %j', secondaryJobs);
            var secondaryPids = _.pluck(secondaryJobs, 'patientIdentifier');
            secondaryPids = _.pluck(secondaryPids, 'value');

            log.debug('Checking whether any secondary source domain-specific sync jobs are in error state...');
            var secondaryPidsWithErrorJobs = getSecondaryPidsWithErrorJobs(secondaryPids, result.items, log);
            log.debug('PIDs corresponding to secondary sites with error jobs (expiration will be ignored for these PIDs): %s', secondaryPidsWithErrorJobs);

            var secondarySourcesExpired = _.map(_.pluck(secondaryJobs, 'type'), function(type, index) {
                var hash = jobTypeSourceHashMap[type.split('-')[0]];
                log.debug('age:', (Date.now() - parseInt(secondaryJobs[index].timestamp)));
                return {
                    'hash': hash,
                    'expiration': config.rules.expiration[hash] || config.rules.expiration.default,
                    'isExpired': (Date.now() - parseInt(secondaryJobs[index].timestamp)) > (config.rules.expiration[hash] || config.rules.expiration.default)
                };
            });
            log.debug(secondarySourcesExpired, secondaryPids);
            var secondaryPidsToRemove = _.filter(secondaryPids, function(secondaryPid, index) {
                return !secondarySourcesExpired[index].isExpired;
            });
            log.debug('Secondary pids to remove (unless expiration is ignored): ', secondaryPidsToRemove);
            patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
                log.debug('filtering identifier', patientIdentifier.value);
                if (exceptions === true) {
                    return true;
                }
                if (_.contains(secondaryPidsWithErrorJobs, patientIdentifier.value)) {
                    return true;
                }
                if (!_.contains(secondaryPidsToRemove, patientIdentifier.value)) {
                    return true;
                }
                if (_.contains(exceptions, patientUtil.extractSiteFromPid(patientIdentifier.value).toLowerCase())) {
                    return true;
                }
                return false;
            });
            log.debug('Result after removing unexpired secondary pids', patientIdentifiers);

            // FAILSAFE: check for sync status too on primary sources
            if (patientIdentifiers.length === 0) {
                callback(null, patientIdentifiers);
            } else {
                environment.jds.getSyncStatus(patientIdentifiers[0], function(error, response, result) {
                    if (error) {
                        log.error('expiration-rule.expiration: Error occured retriving sync status for  patientIdentifier: %j; error: %s', patientIdentifiers[0], error);
                        callback(error, patientIdentifiers);
                    }

                    if ((_.isEmpty(response)) || (response.statusCode !== 200)) {
                        log.error('expiration-rule.expiration: Statuscode was not 200 when retriving sync status for patientIdentifier: %j; error: %s, statusCode: %s', patientIdentifiers[0], error, response.statusCode);
                        callback(response.statusCode, patientIdentifiers);
                    }

                    if (!_.isEmpty(result)) {
                        // Note:  if completed or inProgress then...
                        //-------------------------------------------
                        if (!_.isEmpty(result.completedStamp) || !_.isEmpty(result.inProgress)) {
                            patientIdentifiers = _.filter(patientIdentifiers, function(identifier) {
                                var sourceHash = patientUtil.extractSiteFromPid(identifier.value);
                                if (patientUtil.isVistaDirect(identifier, config)) {
                                    return true;
                                }
                                if (patientUtil.isVistaHdr(identifier, config)) {
                                    return true;
                                }
                                if (_.contains(result.completedStamp, sourceHash)) {
                                    return false;
                                }
                                if (_.contains(result.inProgress, sourceHash)) {
                                    return false;
                                }
                                return true;
                            });
                        }
                    }
                    callback(null, patientIdentifiers);
                });
            }
        });
}

function getSecondaryPidsWithErrorJobs(secondaryPids, jobs, log) {
    log.debug('expiration-rule.getSecondaryPidsWithErrorJobs(): entering method; secondaryPids: %s', secondaryPids);
    var secondaryDomainSyncRequestJobs = _.filter(jobs, function(job) {
        return jobUtil.isSecondaryDomainSyncRequestType(job);
    });
    var secondaryPidsWithErrorJobs = _.filter(secondaryPids, function(pid) {
        log.debug('expiration-rule.getSecondaryPidsWithErrorJobs() - filter: Looking for error jobs for pid %s', pid);
        var errorJobs = _.find(secondaryDomainSyncRequestJobs, function(job) {
            return job.patientIdentifier.value === pid && job.status === 'error';
        });
        log.debug('expiration-rule.getSecondaryPidsWithErrorJobs() - filter: Found error jobs for pid %s; jobs: %j', pid, errorJobs);
        if (_.isEmpty(errorJobs)) {
            log.debug('expiration-rule.getSecondaryPidsWithErrorJobs() - filter: No error jobs found for pid %s; returning false', pid);
            return false;
        } else {
            log.debug('expiration-rule.getSecondaryPidsWithErrorJobs() - filter: Error jobs have been found for pid %s; returning true', pid);
            return true;
        }
    });
    log.debug('expiration-rule.getSecondaryPidsWithErrorJobs(): PIDs with error jobs: %s', secondaryPidsWithErrorJobs);
    return secondaryPidsWithErrorJobs;
}

function loadRule() {
    return expiration;
}

module.exports = loadRule;
loadRule._steps = {
    '_getSecondaryPidsWithErrorJobs': getSecondaryPidsWithErrorJobs
};