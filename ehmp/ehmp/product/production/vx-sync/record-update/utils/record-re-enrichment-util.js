'use strict';

require('../../env-setup');

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var util = require('util');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var _ = require('underscore');
var getProperty = require(global.VX_UTILS + 'object-utils').getProperty;

function ReEnrichUtil(log, jdsClient, updateConfig){
    if (!(this instanceof ReEnrichUtil)) {
        return new ReEnrichUtil(log, jdsClient, updateConfig);
    }

    this.log = log;
    this.jdsClient = jdsClient;
    this.updateConfig = updateConfig;
}

ReEnrichUtil.prototype.retrievePatientList = function(pidList, callback) {
    var self = this;

    self.log.info('record-re-enrichment-util.retrievePatientList: entering method');
    if (pidList) {
        self.log.info('record-re-enrichment-util.retrievePatientList: pids already provided via parameter. Skipping to next step...');
        return callback(null, pidList);
    }

    pidList = [];

    self.log.debug('record-re-enrichment-util.retrievePatientList: attempting to retrieve patient list from JDS');
    self.jdsClient.getPatientList(null, function(error, response, result) {
        if (error) {
            var message = util.format('record-re-enrichment-util.retrievePatientList: got error from JDS: %j', error);
            self.log.error(message);
            return callback(message);
        } else if (!response || response.statusCode !== 200) {
            var errorMessage = util.format('record-re-enrichment-util.retrievePatientList: got unexpected response from JDS: Error %s, Response %s', util.inspect(error), util.inspect(response));
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        self.log.debug('record-re-enrichment-util.retrievePatientList: picking first patientIdentifier for each patient...');
        _.each(result.items, function(patient) {
            pidList.push(_.first(patient.patientIdentifiers));
        });
        self.log.debug('record-re-enrichment-util.retrievePatientList: resulting patient list: %s. Continuing to next step...', pidList);
        return callback(null, pidList);
    });
};

ReEnrichUtil.prototype.retrievePatientSyncStatuses = function(updateTime, filterDomains, pids, callback) {
    var self = this;

    self.log.info('record-re-enrichment-util.retrievePatientSyncStatuses: entering method');
    var pidsToResyncDomains = {};

    if(!updateTime){
        _.each(pids,function(pid){
            pidsToResyncDomains[pid] = filterDomains;
        });

        self.log.info('record-re-enrichment-util.retrievePatientSyncStatuses: No updateTime provided. Skipping this step; Using pids mapped to domains: %j', pidsToResyncDomains);
        return callback(null, pidsToResyncDomains);
    }

    var jdsFilter = {filter: '?detailed=true&filter=lt("stampTime",' + updateTime + ')'};

    self.log.info('record-re-enrichment-util.retrievePatientSyncStatuses: async: attempting to get sync status for each patient');
    async.eachLimit(pids, 5, function(pid, callback) {
        self.log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: attempting to get sync status for patient %s', pid);
        var patientIdentifier = getPatientIdentifierFromRecordPid(pid);

        self.jdsClient.getSyncStatus(patientIdentifier, jdsFilter, function(err, response, result) {
            if (err) {
                var errorMessage = util.format('record-re-enrichment-util.retrievePatientSyncStatuses: got error from JDS when attempting to get sync status for patient %s. Error %j', pid, err);
                self.log.error(errorMessage);
                return callback(errorMessage);
            } else if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.retrievePatientSyncStatuses: got unexpected response from JDS when attempting to get sync status for patient %s. Error %s, Response %s', pid, util.inspect(err), util.inspect(response));
                self.log.error(message);
                return callback(message);
            }

            self.log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: determining which domains should be resynced for patient %s', pid);
            var pidDomainsToBeResynced = self.getDomainsToBeResynced(result, filterDomains, updateTime);
            if (pidDomainsToBeResynced) {
                pidsToResyncDomains[pid] = pidDomainsToBeResynced;
                self.log.info('record-re-enrichment-util.retrievePatientSyncStatuses: Preparing to resync these domains for patient %s: %s', pid, pidDomainsToBeResynced);
            }

            callback(null);
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        self.log.debug('record-re-enrichment-util.retrievePatientSyncStatuses: mapped pids to domains to be resynced %j', pidsToResyncDomains);
        callback(null, pidsToResyncDomains);
    });
};

ReEnrichUtil.prototype.getDomainsToBeResynced = function (status, filterDomains, updateTime) {
    var self = this;

    self.log.debug('record-re-enrichment-util.getDomainsToBeResynced: entering method');
    var resyncDomains = [];
    var sourceMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp']);
    var sites = _.keys(sourceMetaStamp);

    _.each(sites, function(site) {
        self.log.trace('record-re-enrichment-util.getDomainsToBeResynced: checking metastamp for %s', site);
        var domainMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp', site, 'domainMetaStamp']);
        if (domainMetaStamp) {
            var domainsForSite = _.keys(domainMetaStamp);
            _.each(domainsForSite, function(domain) {
                self.log.trace('record-re-enrichment-util.getDomainsToBeResynced: checking domain metastamp for %s', domain);
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
        self.log.debug('record-re-enrichment-util.getDomainsToBeResynced: exiting with domains to be resynced: %s', resyncDomains);
        return resyncDomains;
    }

    self.log.debug('record-re-enrichment-util.getDomainsToBeResynced: found no domains to be resynced');
    return null;
};

ReEnrichUtil.prototype.getRecordsAndCreateJobs = function(pidsToResyncDomains, updateTime, callback) {
    var self = this;
    self.log.info('record-re-enrichment-util.getRecordsAndCreateJobs: entering method');
    var pidToDomainComboList = [];

    var pidStats = {};
    var totalJobsPublished = 0;

    _.each(pidsToResyncDomains, function(domains, pid) {
        pidStats[pid] = {
            domainsComplete: [],
            jobsPublished: 0
        };

        _.each(domains, function(domain) {
            pidToDomainComboList.push({
                pid: pid,
                domain: domain
            });
        });
    });

    self.log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: beginning async to get domain data for patients from JDS');
    //Limit to 1 to avoid running out of memory on large data sets
    async.eachLimit(pidToDomainComboList, 1, function(pidAndDomain, asyncCallback) {
        var pid = pidAndDomain.pid;
        var domain = pidAndDomain.domain;
        var jobsToPublish = [];

        if(!pidStats[pid].started){
            self.log.info('record-re-enrichment-util:---STARTED patient %s---', pid);
            pidStats[pid].started = true;
        }

        self.log.info('record-re-enrichment-util.getRecordsAndCreateJobs: retrieving %s data for %s from JDS', domain, pid);
        self.jdsClient.getPatientDomainData(pid, domain, function(error, response, result) {
            if (error) {
                var errorMessage = util.format('record-re-enrichment-util.getRecordsAndCreateJobs: got error from JDS when attempting to retrieve %s data for patient %s. Error %j', domain, pid, error);
                self.log.error(errorMessage);
                return asyncCallback(errorMessage);
            } else if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.getRecordsAndCreateJobs: got unexpected response from JDS when attempting to retrieve %s data for patient %s. Error %s, Response %s', domain, pid, util.inspect(error), util.inspect(response));
                self.log.error(message);
                return asyncCallback(message);
            }

            var items = getProperty(result, ['data', 'items']);
            var domainJobsCreated = 0;

            _.each(items, function(item) {
                //Exclude the record if it is older than the provided updateTime; include if by default if updateTime is omitted
                var updateRecord = (updateTime)?(item.stampTime < updateTime): true;
                if(updateRecord){
                    var newJob = jobUtil.createRecordUpdate(getPatientIdentifierFromRecordPid(item.pid), pidAndDomain.domain, item, null);
                    if (self.updateConfig.solrOnly) {
                        newJob.solrOnly = true;
                    }
                    jobsToPublish.push(newJob);
                    domainJobsCreated++;
                }
            });

            self.log.info('record-re-enrichment-util.getRecordsAndCreateJobs: Created %s record update jobs for %s domain data for patient %s. Now publishing jobs.', domainJobsCreated, domain, pid);

            self.writeJobsToBeanstalk(jobsToPublish, function(error, domainJobsPublished){
                var errorMessage;
                if (error) {
                    errorMessage = util.format('record-re-enrichment-util: Error returned by writeJobsToBeanstalk for pid %s, domain %s: %s', pid, domain, error);
                    self.log.error('record-re-enrichment-util: Error returned by writeJobsToBeanstalk: %s', errorMessage);
                } else {
                    pidStats[pid].domainsComplete.push(domain);
                }

                pidStats[pid].jobsPublished += domainJobsPublished;
                totalJobsPublished += domainJobsPublished;

                self.log.info('record-re-enrichment-util.getRecordsAndCreateJobs: Published %s out of %s %s jobs for patient %s', domainJobsPublished, domainJobsCreated, domain, pid);
                self.log.info('record-re-enrichment-util: Total jobs published as of this time: %s', totalJobsPublished);

                if(_.isEmpty(_.difference(pidsToResyncDomains[pid], pidStats[pid].domainsComplete))){
                    self.log.info('record-re-enrichment-util:---FINISHED patient %s---', pid);
                }

                self.log.debug('record-re-enrichment-util.getRecordsAndCreateJobs: Finished call to writeJobsToBeanstalk for patient %s and domain %s. Jobs published successfully.', pid, domain);
                asyncCallback(errorMessage);
            });

        });
    }, function(error) {
        if (error) {
            self.log.error('record-re-enrichment-util.getRecordsAndCreateJobs: Processing interrupted due to error: %s', error);
            return callback(error);
        }

        self.log.info('record-re-enrichment-util.getRecordsAndCreateJobs: async operation completed; finished creating and publishing jobs.');
        callback(error);
    });
};

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
ReEnrichUtil.prototype.writeJobsToBeanstalk = function(jobsToPublish, callback) {
    var self = this;

    self.log.debug('record-re-enrichment-util.writeJobsToBeanstalk: entering method');
    var tubeName = 'vxs-record-update';
    var host = self.updateConfig.beanstalk.repoDefaults.host;
    var port = self.updateConfig.beanstalk.repoDefaults.port;
    var client = new BeanstalkClient(self.log, host, port);

    var tasks = [];
    _.each(jobsToPublish, function(job) {
        tasks.push(writeJob.bind(null, client, 0, JSON.stringify(job)));
    });

    var jobsPublishedCount = 0;

    client.connect(function(error) {
        if (error) {
            client.end(function() {
                return callback(util.format('Failed to connect to beanstalk.  Host: %s; Port: %s; Error: %s', host, port, error), jobsPublishedCount);
            });
        }

        // Need this to put jobs in the tube.
        //-----------------------------------
        client.use(tubeName, function(error) {
            if (error) {
                client.end(function() {
                    return callback(util.format('Failed to use tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error), jobsPublishedCount);
                });
            }

            // Need this to bury jobs.
            //------------------------
            client.watch(tubeName, function(error) {
                if (error) {
                    client.end(function() {
                        return callback(util.format('Failed to watch tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error), jobsPublishedCount);
                    });
                }

                async.series(tasks, function(error, result) {
                    if (error) {
                        self.log.error('record-re-enrichment-util.writeJobsToBeanstalk: Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
                    }

                    if(result){
                        //Result is a list of ids of the inserted beanstalk jobs
                        //Array may contain an 'undefined' in an error situation - will cause this number to be off
                        jobsPublishedCount += result.length;
                    }

                    client.end(function() {
                        self.log.debug('record-re-enrichment-util.writeJobsToBeanstalk: finished placing jobs into beanstalk tube');
                        return callback(error, jobsPublishedCount);
                    });
                });
            });
        });
    });
};

module.exports = ReEnrichUtil;