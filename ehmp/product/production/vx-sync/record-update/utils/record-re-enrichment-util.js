'use strict';

require('../../env-setup');

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var util = require('util');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var _ = require('underscore');
var getProperty = require(global.VX_UTILS + 'object-utils').getProperty;

function retrievePatientList(log, jdsClient, pidList, callback) {
    log.debug('record-re-enrichment-util.retrievePatientList: entering method');
    if (pidList) {
        log.debug('record-re-enrichment-util.retrievePatientList: pids already provided via parameter. Skipping to next step...');
        return callback(null, pidList);
    }

    pidList = [];

    log.debug('record-re-enrichment-util.retrievePatientList: attempting to retrieve patient list from JDS');
    jdsClient.getPatientList(null, function(error, response, result) {
        if (error) {
            var message = util.format('record-re-enrichment-util.retrievePatientList: got error from JDS: %j', error);
            log.error(message);
            return callback(message);
        } else if (!response || response.statusCode !== 200) {
            var errorMessage = util.format('record-re-enrichment-util.retrievePatientList: got unexpected response from JDS: Error %s, Response %s', util.inspect(error), util.inspect(response));
            log.error(errorMessage);
            return callback(errorMessage);
        }

        log.debug('record-re-enrichment-util.retrievePatientList: picking first patientIdentifier for each patient...');
        _.each(result.items, function(patient) {
            pidList.push(_.first(patient.patientIdentifiers));
        });
        log.debug('record-re-enrichment-util.retrievePatientList: resulting patient list: %s. Continuing to next step...', pidList);
        return callback(null, pidList);
    });
}

function retrievePatientSyncStatuses(log, jdsClient, updateTime, filterDomains, pids, callback) {
    log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: entering method');
    var pidsToResyncDomains = {};

    if(!updateTime){
        _.each(pids,function(pid){
            pidsToResyncDomains[pid] = filterDomains;
        });

        log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: No updateTime provided. Skipping this step; Using pids mapped to domains: %j', pidsToResyncDomains);
        return callback(null, pidsToResyncDomains);
    }

    var jdsFilter = {filter: '?detailed=true&filter=lt("stampTime",' + updateTime + ')'};

    log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: async: attempting to get sync status for each patient');
    async.eachLimit(pids, 5, function(pid, callback) {
        log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: attempting to get sync status for patient %s', pid);
        var patientIdentifier = getPatientIdentifierFromRecordPid(pid);

        jdsClient.getSyncStatus(patientIdentifier, jdsFilter, function(err, response, result) {
            if (err) {
                var errorMessage = util.format('record-re-enrichment-util.retrievePatientSyncStatuses: got error from JDS when attempting to get sync status for patient %s. Error %j', pid, err);
                log.error(errorMessage);
                return callback(errorMessage);
            } else if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.retrievePatientSyncStatuses: got unexpected response from JDS when attempting to get sync status for patient %s. Error %s, Response %s', pid, util.inspect(err), util.inspect(response));
                log.error(message);
                return callback(message);
            }

            log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: determining which domains should be resynced for patient %s', pid);
            var pidDomainsToBeResynced = getDomainsToBeResynced(log, result, filterDomains, updateTime);
            if (pidDomainsToBeResynced) {
                pidsToResyncDomains[pid] = pidDomainsToBeResynced;
            }

            callback(null);
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: mapped pids to domains to be resynced %j', pidsToResyncDomains);
        callback(null, pidsToResyncDomains);
    });
}

function getDomainsToBeResynced(log, status, filterDomains, updateTime) {
    log.debug('record-re-enrichment-util.getDomainsToBeResynced: entering method');
    var resyncDomains = [];
    var sourceMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp']);
    var sites = _.keys(sourceMetaStamp);

    _.each(sites, function(site) {
        log.trace('record-re-enrichment-util.getDomainsToBeResynced: checking metastamp for %s', site);
        var domainMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp', site, 'domainMetaStamp']);
        if (domainMetaStamp) {
            var domainsForSite = _.keys(domainMetaStamp);
            _.each(domainsForSite, function(domain) {
                log.trace('record-re-enrichment-util.getDomainsToBeResynced: checking domain metastamp for %s', domain);
                var includeDomain = (filterDomains) ? _.contains(filterDomains, domain) : false;

                //If no updateTime was given, ignore whether or not eventMetaStamp is empty and allow the domain to be added to the result list.
                var eventMetaStampNotEmpty = (updateTime) ? !_.isEmpty(domainMetaStamp[domain].eventMetaStamp) : true;

                if (includeDomain && eventMetaStampNotEmpty) {
                    resyncDomains.push(domain);
                }
            });
        }
    });

    if (!_.isEmpty(resyncDomains)) {
        resyncDomains = _.uniq(resyncDomains);
        log.debug('record-re-enrichment-util.getDomainsToBeResynced: exiting with domains to be resynced: %s', resyncDomains);
        return resyncDomains;
    }

    log.debug('record-re-enrichment-util.getDomainsToBeResynced: found no domains to be resynced');
    return null;
}

function getRecordsAndCreateJobs(log, jdsClient, pidsToResyncDomains, updateTime, callback) {
    log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: entering method');
    var pidToDomainComboList = [];
    var jobsToPublish = [];
    _.each(pidsToResyncDomains, function(domains, pid) {
        _.each(domains, function(domain) {
            pidToDomainComboList.push({
                pid: pid,
                domain: domain
            });
        });
    });

    log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: beginning async to get domain data for patients from JDS');
    async.eachLimit(pidToDomainComboList, 5, function(pidAndDomain, asyncCallback) {
        var pid = pidAndDomain.pid;
        var domain = pidAndDomain.domain;
        log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: retrieving %s data for %s from JDS', domain, pid);
        jdsClient.getPatientDomainData(pid, domain, function(error, response, result) {
            if (error) {
                var errorMessage = util.format('record-re-enrichment-util.getRecordsAndCreateJobs: got error from JDS when attempting to retrieve %s data for patient %s. Error %j', domain, pid, error);
                log.error(errorMessage);
                return asyncCallback(errorMessage);
            } else if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.getRecordsAndCreateJobs: got unexpected response from JDS when attempting to retrieve %s data for patient %s. Error %s, Response %s', domain, pid, util.inspect(error), util.inspect(response));
                log.error(message);
                return asyncCallback(message);
            }

            var items = getProperty(result, ['data', 'items']);
            var jobsCreated = 0;

            _.each(items, function(item) {
                //Exclude the record if it is older than the provided updateTime; include if by default if updateTime is omitted
                var updateRecord = (updateTime)?(item.stampTime < updateTime): true;
                if(updateRecord){
                    jobsToPublish.push(jobUtil.createRecordUpdate(getPatientIdentifierFromRecordPid(item.pid), pidAndDomain.domain, item, null));
                    jobsCreated++;
                }
            });

            log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: successfully created %s record update jobs for %s domain data for patient %s', jobsCreated, domain, pid);
            asyncCallback(null);
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: async operation completed; continuing to next step with jobsToPublish %j', jobsToPublish);
        callback(error, jobsToPublish);
    });
}

function getPatientIdentifierFromRecordPid(pid) {
    return pidUtil.create(pidUtil.isIcn(pid) ? 'icn' : 'pid', pid);
}

//--------------------------------------------------------------------------------
// This function writes a job to the tube.
//
// client: Beanstalk client.
// delaySecs: The number of seconds to delay the job.
// job: The job to be written.
// callback: The callback handler.
//---------------------------------------------------------------------------------
function writeJob(client, delaySecs, job, callback) {
    var priority = 10;
    var ttrSecs = 60;
    client.put(priority, delaySecs, ttrSecs, job, callback);
}

//---------------------------------------------------------------------------------
// This function writes jobs to the tube.
//
// tubeName: The name of the tube to write the job to.
// callback: The callback handler.
//---------------------------------------------------------------------------------
function writeJobsToBeanstalk(log, jobsToPublish, updateConfig, callback) {
    log.debug('record-re-enrichment-util.writeJobsToBeanstalk: entering method');
    var tubeName = 'vxs-record-update';
    var host = updateConfig.beanstalk.repoDefaults.host;
    var port = updateConfig.beanstalk.repoDefaults.port;
    var client = new BeanstalkClient(log, host, port);

    var tasks = [];
    _.each(jobsToPublish, function(job) {
        tasks.push(writeJob.bind(null, client, 0, JSON.stringify(job)));
    });

    client.connect(function(error) {
        if (error) {
            client.end(function() {
                return callback(util.format('Failed to connect to beanstalk.  Host: %s; Port: %s; Error: %s', host, port, error));
            });
        }

        // Need this to put jobs in the tube.
        //-----------------------------------
        client.use(tubeName, function(error) {
            if (error) {
                client.end(function() {
                    return callback(util.format('Failed to use tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error));
                });
            }

            // Need this to bury jobs.
            //------------------------
            client.watch(tubeName, function(error) {
                if (error) {
                    client.end(function() {
                        return callback(util.format('Failed to watch tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error));
                    });
                }

                async.series(tasks, function(error, result) {
                    if (error) {
                        log.error('record-re-enrichment-util.writeJobsToBeanstalk: Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
                    }

                    client.end(function() {
                        log.debug('record-re-enrichment-util.writeJobsToBeanstalk: finished placing jobs into beanstalk tube');
                        return callback(error);
                    });
                });
            });
        });
    });
}

module.exports = {
        retrievePatientList: retrievePatientList,
        retrievePatientSyncStatuses: retrievePatientSyncStatuses,
        getRecordsAndCreateJobs: getRecordsAndCreateJobs,
        getDomainsToBeResynced: getDomainsToBeResynced,
        writeJobsToBeanstalk: writeJobsToBeanstalk
};