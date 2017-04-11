'use strict';

require('../../env-setup');

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var util = require('util');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var metaStampUtil = require(global.VX_UTILS + 'metastamp-utils');
var _ = require('underscore');
var moment = require('moment');
var getProperty = require(global.VX_UTILS + 'object-utils').getProperty;

function VistaResyncUtil(log, vistaClient, jdsClient, updateConfig){
    if (!(this instanceof VistaResyncUtil)) {
        return new VistaResyncUtil(log, vistaClient, jdsClient, updateConfig);
    }

    this.log = log;
    this.vistaClient = vistaClient;
    this.jdsClient = jdsClient;
    this.updateConfig = updateConfig;
}

VistaResyncUtil.prototype.retrievePatientList = function(siteList, pidList, callback) {
    var self = this;

    self.log.info('vista-site-data-resync-util.retrievePatientList: entering method');

    if(_.isEmpty(siteList) && _.isEmpty(pidList)){
        self.log.error('vista-site-data-resync-util.retrievePatientList: You must provide either the site or the pid parameter.');
        return callback('Error: You must provide either the "site" or the "pid" parameter.');
    }

    if (pidList) {
        self.log.info('vista-site-data-resync-util.retrievePatientList: pids already provided via parameter. Skipping to next step...');
        return callback(null, pidList);
    }

    pidList = [];

    async.eachLimit(siteList, 5, function(site, asyncCallback) {
        self.log.debug('vista-site-data-resync-util.retrievePatientList: attempting to retrieve patient list from JDS for site %s', site);
        self.jdsClient.getPatientListBySite(site, function(error, response, result) {
            if (error) {
                var message = util.format('vista-site-data-resync-util.retrievePatientList for site %s: got error from JDS: %j', site, error);
                self.log.error(message);
                return asyncCallback(message);
            } else if (!response || response.statusCode !== 200) {
                var errorMessage = util.format('vista-site-data-resync-util.retrievePatientList for site %s: got unexpected response from JDS: Error %s, Response %s', site, util.inspect(error), util.inspect(response));
                self.log.error(errorMessage);
                return asyncCallback(errorMessage);
            }

            var items = getProperty(result, ['data', 'items']) || [];
            if (_.isEmpty(items)) {
                self.log.warn('vista-site-data-resync-util.retrievePatientList: No pids found for site %s', site);
            }

            self.log.debug('vista-site-data-resync-util.retrievePatientList for site %s: adding pids to list: %s', site, items);
            _.each(items, function(pid) {
                pidList.push(pid);
            });
            return asyncCallback(null);
        });
    }, function(err) {
        if(err){
            return callback(err);
        } else if(_.isEmpty(pidList)){
            var errorMessage = 'vista-site-data-resync-util.retrievePatientList: No pids found';
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        self.log.debug('vista-site-data-resync-util.retrievePatientList: resulting patient list: %s.', pidList);
        return callback(null, pidList);
    });
};

VistaResyncUtil.prototype.retrievePatientSyncStatuses = function(updateTime, filterDomains, pids, callback) {
    var self = this;

    self.log.info('vista-site-data-resync-util.retrievePatientSyncStatuses: entering method');
    var pidsToResyncDomains = {};

    if (!updateTime) {
        _.each(pids, function(pid) {
            pidsToResyncDomains[pid] = filterDomains;
        });

        self.log.info('vista-site-data-resync-util.retrievePatientSyncStatuses: No updateTime provided. Skipping this step; Using pids mapped to domains: %j', pidsToResyncDomains);
        return callback(null, pidsToResyncDomains);
    }

    var jdsFilter = {
        filter: '?detailed=true&filter=lt("stampTime",' + updateTime + ')'
    };

    self.log.info('vista-site-data-resync-util.retrievePatientSyncStatuses: async: attempting to get sync status for each patient');
    async.eachLimit(pids, 5, function(pid, callback) {
        self.log.debug('vista-site-data-resync-util.retrievePatientSyncStatuses: attempting to get sync status for patient %s', pid);
        var patientIdentifier = getPatientIdentifierFromRecordPid(pid);

        self.jdsClient.getSyncStatus(patientIdentifier, jdsFilter, function(err, response, result) {
            if (err) {
                var errorMessage = util.format('vista-site-data-resync-util.retrievePatientSyncStatuses: got error from JDS when attempting to get sync status for patient %s. Error %j', pid, err);
                self.log.error(errorMessage);
                return callback(errorMessage);
            } else if (!response || response.statusCode !== 200) {
                var message = util.format('vista-site-data-resync-util.retrievePatientSyncStatuses: got unexpected response from JDS when attempting to get sync status for patient %s. Error %s, Response %s', pid, util.inspect(err), util.inspect(response));
                self.log.error(message);
                return callback(message);
            }

            self.log.debug('vista-site-data-resync-util.retrievePatientSyncStatuses: determining which domains should be resynced for patient %s', pid);
            var pidDomainsToBeResynced = self.getDomainsToBeResynced(result, filterDomains, updateTime);
            if (pidDomainsToBeResynced) {
                pidsToResyncDomains[pid] = pidDomainsToBeResynced;
                self.log.info('vista-site-data-resync-util.retrievePatientSyncStatuses: Preparing to resync these domains for patient %s: %s', pid, pidDomainsToBeResynced);
            }

            callback(null);
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        self.log.debug('vista-site-data-resync-util.retrievePatientSyncStatuses: mapped pids to domains to be resynced %j', pidsToResyncDomains);
        callback(null, pidsToResyncDomains);
    });
};

VistaResyncUtil.prototype.getDomainsToBeResynced = function(status, filterDomains, updateTime) {
    var self = this;

    self.log.debug('vista-site-data-resync-util.getDomainsToBeResynced: entering method');
    var resyncDomains = [];
    var sourceMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp']);
    var sites = _.keys(sourceMetaStamp);

    _.each(sites, function(site) {
        self.log.trace('vista-site-data-resync-util.getDomainsToBeResynced: checking metastamp for %s', site);
        var domainMetaStamp = getProperty(status, ['completedStamp', 'sourceMetaStamp', site, 'domainMetaStamp']);
        if (domainMetaStamp) {
            var domainsForSite = _.keys(domainMetaStamp);
            _.each(domainsForSite, function(domain) {
                self.log.trace('vista-site-data-resync-util.getDomainsToBeResynced: checking domain metastamp for %s', domain);
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
        self.log.debug('vista-site-data-resync-util.getDomainsToBeResynced: exiting with domains to be resynced: %s', resyncDomains);
        return resyncDomains;
    }

    self.log.debug('vista-site-data-resync-util.getDomainsToBeResynced: found no domains to be resynced');
    return null;
};

VistaResyncUtil.prototype.getRecordsAndCreateJobs = function(pidsToResyncDomains, updateTime, callback) {
    var self = this;

    self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: entering method');
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

    self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: beginning async to get domain data for patients from VistA');
    //Limit to 1 to avoid running out of memory on large data sets
    async.eachLimit(pidToDomainComboList, 1, function(pidAndDomain, asyncCallback) {
        var pid = pidAndDomain.pid;
        var domain = pidAndDomain.domain;
        var dfn = pidUtil.extractDfnFromPid(pid);
        var site = pidUtil.extractSiteFromPid(pid);
        var jobsToPublish = [];

        if(!pidStats[pid].started){
            self.log.info('record-re-enrichment-util:---STARTED patient %s---', pid);
            pidStats[pid].started = true;
        }

        self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: retrieving %s data for %s from VistA', domain, pid);
        var callTime = moment().format('YYYYMMDDHHmmss');
        self.vistaClient.getPatientDataByDomain(site, dfn, domain, function(error, result) {
            if (error) {
                var errorMessage = util.format('vista-site-data-resync-util.getRecordsAndCreateJobs: got error from VistA when attempting to retrieve %s data for patient %s. Error %j', domain, pid, error);
                self.log.error(errorMessage);
                return asyncCallback(errorMessage);
            }

            var items = result;
            var domainJobsCreated = 0;

            _.each(items, function(item) {
                //Exclude the record if it is older than the provided updateTime; include if by default if updateTime is omitted
                var updateRecord = (updateTime) ? (item.stampTime < updateTime) : true;

                if(!item.pid){
                    item.pid = pidAndDomain.pid;
                }

                if (updateRecord) {
                    var job = jobUtil.createRecordUpdate(getPatientIdentifierFromRecordPid(pid), pidAndDomain.domain, item, null);
                    var metaStamp = metaStampUtil.metastampDomain({
                        data: {
                            items: [
                                item
                            ]
                        }
                    }, callTime);
                    job.metaStamp = metaStamp;

                    jobsToPublish.push(job);
                    domainJobsCreated++;
                }
            });

            self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: Created %s record update jobs for %s domain data for patient %s', domainJobsCreated, domain, pid);

            self.writeJobsToBeanstalk(jobsToPublish, function(error, domainJobsPublished){
                var errorMessage;
                if (error) {
                    errorMessage = util.format('vista-site-data-resync-util: Error returned by writeJobsToBeanstalk for pid %s, domain %s: %s', pid, domain, error);
                    self.log.error(errorMessage);
                } else {
                    pidStats[pid].domainsComplete.push(domain);
                }

                pidStats[pid].jobsPublished += domainJobsPublished;
                totalJobsPublished += domainJobsPublished;

                self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: Published %s out of %s %s jobs for patient %s', domainJobsPublished, domainJobsCreated, domain, pid);
                self.log.info('vista-site-data-resync-util: Total jobs published as of this time: %s', totalJobsPublished);

                if(_.isEmpty(_.difference(pidsToResyncDomains[pid], pidStats[pid].domainsComplete))){
                    self.log.info('vista-site-data-resync-util:---FINISHED patient %s---', pid);
                }

                self.log.debug('vista-site-data-resync-util.getRecordsAndCreateJobs: Finished call to writeJobsToBeanstalk for patient %s and domain %s. Jobs published successfully.', pid, domain);
                asyncCallback(errorMessage);
            });

        });
    }, function(error) {
        if (error) {
            self.log.error('vista-site-data-resync-util.getRecordsAndCreateJobs: Processing interrupted due to error: %s', error);
            return callback(error);
        }

        self.log.info('vista-site-data-resync-util.getRecordsAndCreateJobs: async operation completed; finished creating and publishing jobs.');
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
VistaResyncUtil.prototype.writeJobsToBeanstalk = function(jobsToPublish, callback) {
    var self = this;

    self.log.debug('vista-site-data-resync-util.writeJobsToBeanstalk: entering method');
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
                        self.log.error('vista-site-data-resync-util.writeJobsToBeanstalk: Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
                    }

                    if(result){
                        //Result is a list of ids of the inserted beanstalk jobs
                        //Array may contain an 'undefined' in an error situation - will cause this number to be off
                        jobsPublishedCount += result.length;
                    }

                    client.end(function() {
                        self.log.debug('vista-site-data-resync-util.writeJobsToBeanstalk: finished placing jobs into beanstalk tube');
                        return callback(error, jobsPublishedCount);
                    });
                });
            });
        });
    });
};

module.exports = VistaResyncUtil;