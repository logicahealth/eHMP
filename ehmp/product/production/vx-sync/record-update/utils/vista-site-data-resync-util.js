'use strict';

require('../../env-setup');

var util = require('util');
var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var format = require('util').format;

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var metaStampUtil = require(global.VX_UTILS + 'metastamp-utils');
var getProperty = require(global.VX_UTILS + 'object-utils').getProperty;

var recordUpdateUtils = require('./record-update-utils');
var getPatientIdentifierFromRecordPid = recordUpdateUtils.getPatientIdentifierFromRecordPid;
var createErrorStatus = recordUpdateUtils.createErrorStatus;
var addDistinct = recordUpdateUtils.addDistinct;
var addIncompleteDomain = recordUpdateUtils.addIncompleteDomain;
var buildPidStats = recordUpdateUtils.buildPidStats;
var buildPidToDomainComboList = recordUpdateUtils.buildPidToDomainComboList;
var buildJobTaskList = recordUpdateUtils.buildJobTaskList;


//---------------------------------------------------------------------------------
// Variadic Function:
// VistaResyncUtil(logger, vistaClient, jdsClient, updateConfig)
// VistaResyncUtil(logger, vistaClient, jdsClient, updateConfig, tubename)
//
// This method returns an array of PIDs. If a non-empty list is passed for 'pidList',
// then that will be returned with no processing. Otherwise, jdsClient.getPatientListBySite()
// will be called for each site and all of the results will be returned as a single array.
//
// logger: A bunyan style logger instance
//
// vistaClient: An instance of vista-client
//
// jdsClient: An instance of jds-client
//
// updateConfig: A config object containing record updater specific properties
//
// tubename: An optional parameter to allow the tubename used to be specified
//      for testing purposes.
//---------------------------------------------------------------------------------
function VistaResyncUtil(logger, vistaClient, jdsClient, updateConfig, tubename) {
    if (!(this instanceof VistaResyncUtil)) {
        return new VistaResyncUtil(logger, vistaClient, jdsClient, updateConfig, tubename);
    }

    this.logger = logger;
    this.vistaClient = vistaClient;
    this.jdsClient = jdsClient;
    this.updateConfig = updateConfig;
    this.tubename = tubename || 'vxs-record-update';
}


//---------------------------------------------------------------------------------
// This method returns an array of PIDs. If a non-empty list is passed for 'pidList',
// then that will be returned with no processing. Otherwise, jdsClient.getPatientListBySite()
// will be called for each site and all of the results will be returned as a single array.
//
// siteList: A list of sites, e.g. ['9E7A', 'C877']
//
// pidList: A list of PIDs, e.g. ['9E7A;3', '9E7A;1', '9E7A;8', 'C877;1']
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
VistaResyncUtil.prototype.retrievePatientList = function(siteList, pidList, callback) {
    var self = this;

    self.logger.info('vista-site-data-resync-util.retrievePatientList(): entering method');

    if (_.isEmpty(siteList) && _.isEmpty(pidList)) {
        self.logger.error('vista-site-data-resync-util.retrievePatientList(): You must provide either the site or the pid parameter.');
        return setTimeout(callback, 0, 'Error: You must provide either the "site" or the "pid" parameter.');
    }

    if (!_.isEmpty(pidList)) {
        self.logger.info('vista-site-data-resync-util.retrievePatientList(): pids already provided via parameter. Skipping to next step...');
        return setTimeout(callback, 0, null, pidList);
    }

    async.mapLimit(siteList, 5, function(site, asyncCallback) {
        self.logger.debug('vista-site-data-resync-util.retrievePatientList(): attempting to retrieve patient list from JDS for site %s', site);
        self.jdsClient.getPatientListBySite(site, function(error, response, result) {
            if (error) {
                var message = util.format('vista-site-data-resync-util.retrievePatientList() for site %s: got error from JDS: %j', site, error);
                self.logger.error(message);
                return asyncCallback(message);
            }

            if (!response || response.statusCode !== 200) {
                var errorMessage = util.format('vista-site-data-resync-util.retrievePatientList() for site %s: got unexpected response from JDS: error: %j, response: %j', site, error, response);
                self.logger.error(errorMessage);
                return asyncCallback(errorMessage);
            }

            var pidsForSite = getProperty(result, ['data', 'items']) || [];
            if (_.isEmpty(pidList)) {
                self.logger.warn('vista-site-data-resync-util.retrievePatientList(): No pids found for site %s', site);
            }

            return asyncCallback(null, pidsForSite);
        });
    }, function(error, result) {
        if (error) {
            return callback(error);
        }

        var combinedPidList = _.flatten(result);
        if (_.isEmpty(combinedPidList)) {
            var errorMessage = 'vista-site-data-resync-util.retrievePatientList(): No pids found';
            self.logger.error(errorMessage);
            return callback(errorMessage);
        }

        self.logger.debug('vista-site-data-resync-util.retrievePatientList(): resulting patient list: %s.', pidList);
        return callback(null, combinedPidList);
    });
};


//---------------------------------------------------------------------------------
// This method retrieves sync statuses to build a list of domains to resync. For each PID in 'pids',
// parameter, this method will call jdsClient.getSyncStatus() with a filter to eliminate events
// with stampTimes NOT earlier than the value in 'updateTime'. Any domains with events that are
// returned in this status AND also are present in 'filterDomains' will be included in the list
// of domains returned by this method in the callback.
//
// If no valid date value is passed in 'updateTime', then ALL domains in the 'filterDomains' parameter
// will be returned for every PID.
//
// The result of this method will be returned in the callback in the form of an object with PID keys
// to the list of domains for that key, e.g.
//
//     {
//         '9E7A;3': ['med', 'allergy', 'consult'],
//         '9E7A;1': ['med', 'consult'],
//         'C877;8': ['allergy'],
//     }
//
// updateTime: A timestamp string in YYYYMMDDHHmmss format.
//
// filterDomains: An array of domains, e.g. ['med', 'allergy', 'consult']
//
// pids: An array of PIDs, e.g. ['9E7A;3', '9E7A;1', '9E7A;8', 'C877;1']
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
VistaResyncUtil.prototype.retrievePatientSyncDomains = function(updateTime, filterDomains, pids, callback) {
    var self = this;

    self.logger.info('vista-site-data-resync-util.retrievePatientSyncDomains(): entering method');
    var pidsToResyncDomains = {};

    // If no updateTime is provided, add all domains to the list
    // and skip the calls for detailed sync status.
    if (!updateTime) {
        _.each(pids, function(pid) {
            pidsToResyncDomains[pid] = filterDomains;
        });

        self.logger.info('vista-site-data-resync-util.retrievePatientSyncDomains(): Skipping status check this step; Using pids mapped to domains: %j', pidsToResyncDomains);
        return setTimeout(callback, 0, null, pidsToResyncDomains);
    }

    var jdsFilter = {
        filter: '?detailed=true&filter=lt("stampTime",' + updateTime + ')'
    };

    self.logger.info('vista-site-data-resync-util.retrievePatientSyncDomains(): async: attempting to get sync status for each patient');
    async.eachLimit(pids, 5, function(pid, callback) {
        self.logger.debug('vista-site-data-resync-util.retrievePatientSyncDomains(): attempting to get sync status for patient %s', pid);
        var patientIdentifier = getPatientIdentifierFromRecordPid(pid);
        var site = pidUtil.extractSiteFromPid(pid);

        self.jdsClient.getSyncStatus(patientIdentifier, jdsFilter, function(error, response, result) {
            if (error) {
                var errorMessage = util.format('vista-site-data-resync-util.retrievePatientSyncDomains(): Error from JDS when attempting to get sync status for patient %s. error: %j', pid, error);
                self.logger.error(errorMessage);
                return callback(errorMessage);
            }

            if (!response || response.statusCode !== 200) {
                var message = util.format('vista-site-data-resync-util.retrievePatientSyncDomains(): Unexpected response from JDS when attempting to get sync status for patient %s. error: %j, response %j', pid, error, result);
                self.logger.error(message);
                return callback(message);
            }

            self.logger.debug('vista-site-data-resync-util.retrievePatientSyncDomains(): determining which domains should be resynced for patient %s', pid);

            // This is all of the domain objects returned in the MetaStamp for the patient's site
            var returnedDomains = getProperty(result, ['completedStamp', 'sourceMetaStamp', site, 'domainMetaStamp']);

            // Only add a domain if it has events with a stampTime earlier than the updateTime,
            // which is any domain object with an eventMetaStamp property.
            var pidDomainsToBeResynced = _.filter(filterDomains, function(domain) {
                return _.has(returnedDomains[domain], 'eventMetaStamp');
            });

            if (!_.isEmpty(pidDomainsToBeResynced)) {
                pidsToResyncDomains[pid] = pidDomainsToBeResynced;
                self.logger.info('vista-site-data-resync-util.retrievePatientSyncDomains(): Preparing to resync these domains for patient %s: %s', pid, pidDomainsToBeResynced);
            }

            self.logger.info('vista-site-data-resync-util.retrievePatientSyncDomains(): Preparing to resync these domains for patient %s: %s', pid, pidDomainsToBeResynced);
            return callback();
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        self.logger.debug('vista-site-data-resync-util.retrievePatientSyncDomains(): mapped pids to domains to be resynced %j', pidsToResyncDomains);
        return callback(null, pidsToResyncDomains);
    });
};


//---------------------------------------------------------------------------------
// This method iterates through the object in 'pidsToResyncDomains' and for each domain in the
// list for that PID, calls vistaClient.getPatientDataByDomain() to get all of the domain data
// for that patient for that site. It then builds a job for each record with a stampTime which
// is earlier than 'updateTime' and publishes it to beanstalk.
//
// If 'updateTime' is falsy, then this method will create jobs for all of the records returned
// for each domain.
//
// pidsToResyncDomains: An object containing lists of domains to resync keyed by PIDs, e.g.
//     {
//         '9E7A;3': ['med', 'allergy', 'consult'],
//         '9E7A;1': ['med', 'consult'],
//         'C877;8': ['allergy']
//     }
//
// updateTime: A timestamp string in YYYYMMDDHHmmss format.
//
// referenceInfo: An object containing info for tracking the flow of a job through
//      the system via the log files, e.g.
//    {
//         sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//         utilityType: 'record-update-enrichment'
//    }
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
VistaResyncUtil.prototype.getRecordsAndCreateJobs = function(pidsToResyncDomains, updateTime, referenceInfo, callback) {
    var self = this;

    self.logger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): entering method');

    var pidToDomainComboList = buildPidToDomainComboList(pidsToResyncDomains);
    var pidStats = buildPidStats(pidsToResyncDomains, referenceInfo);
    var totalJobsPublished = 0;
    var pidCompleteList = [];
    var incompleteCollection = {};

    self.logger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): beginning async to get domain data for patients from VistA');
    // Limit to 10 to avoid running out of memory on large data sets
    async.eachLimit(pidToDomainComboList, 10, function(pidAndDomain, asyncCallback) {
        var pid = pidAndDomain.pid;
        var domain = pidAndDomain.domain;
        var dfn = pidUtil.extractDfnFromPid(pid);
        var site = pidUtil.extractSiteFromPid(pid);

        var pidReferenceInfo = pidStats[pid].referenceInfo;
        var childLogger = self.logger.child(pidReferenceInfo);

        if (!pidStats[pid].started) {
            childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): STARTED patient: %s', pid);
            pidStats[pid].started = true;
        }

        childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): retrieving %s data for %s from VistA', domain, pid);
        var callTime = moment().format('YYYYMMDDHHmmss');

        var vistaClient = self.vistaClient.childInstance(childLogger);
        vistaClient.getPatientDataByDomain(site, dfn, domain, function(error, result) {
            if (error) {
                var errorMessage = util.format('vista-site-data-resync-util.getRecordsAndCreateJobs(): Error from VistA when attempting to retrieve %s data for patient %s. error: %j', domain, pid, error);
                childLogger.error(errorMessage);
                childLogger.error(createErrorStatus('Get domain data from VistA', pid, domain, error));
                addIncompleteDomain(incompleteCollection, pid, domain);
                return asyncCallback();
            }

            var domainItems = result;
            var jobsToPublish = buildJobsToPublish(callTime, updateTime, pid, domain, domainItems, pidReferenceInfo);

            childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): Created %s record update jobs for %s domain data for patient %s', _.size(jobsToPublish), domain, pid);

            self.writeJobsToBeanstalk(childLogger, jobsToPublish, function(error, domainJobsPublished) {
                if (error) {
                    var errorMessage = util.format('vista-site-data-resync-util.getRecordsAndCreateJobs(): Error returned by writeJobsToBeanstalk for pid %s, domain %s: %s, error: %j', pid, domain, error);
                    childLogger.error(errorMessage);
                    childLogger.error(createErrorStatus('Write jobs to beanstalk', pid, domain, error));
                } else {
                    pidStats[pid].domainsComplete.push(domain);
                }

                pidStats[pid].jobsPublished += domainJobsPublished;
                totalJobsPublished += domainJobsPublished;

                addDistinct(pidCompleteList, pid);

                childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): Finished %s out of %s patients', _.size(pidCompleteList), _.size(pidStats));
                childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): Published %s out of %s %s jobs for patient %s', domainJobsPublished, _.size(jobsToPublish), domain, pid);
                childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): Total jobs published as of this time: %s', totalJobsPublished);

                if (_.isEmpty(_.difference(pidsToResyncDomains[pid], pidStats[pid].domainsComplete))) {
                    childLogger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): FINISHED patient %s', pid);
                }

                childLogger.debug('vista-site-data-resync-util.getRecordsAndCreateJobs(): Finished call to writeJobsToBeanstalk for patient %s and domain %s. Jobs published successfully.', pid, domain);
                asyncCallback();
            });

        });
    }, function() {
        self.logger.info('vista-site-data-resync-util.getRecordsAndCreateJobs(): Finished creating and publishing jobs.');
        self.logger.info({
            incomplete: incompleteCollection
        }, 'Incomplete domains by PID:');
        return callback();
    });
};


//---------------------------------------------------------------------------------
// This function iterates through each item in the domainItems list, creating a
// 'record-update' job for each item that was created before the 'updateTime' or
// all records if 'updateTime' is falsy. The resulting array of jobs is returned.
//
// callTime: A timestamp in YYYYMMDDHHmmss format, which should be the timestamp
//      of the call to the vista-client to retrieve the domainItems.
//
// updateTime: A timestamp in YYYYMMDDHHmmss format.
//
// pid: The PID of the patient.
//
// domain: The domain of all of the domainItems (e.g. 'allergy').
//
// domainItems: A collection of items as returned from VistA.
//
// pidReferenceInfo: An object containing info for tracking the flow of a job through
//      the system via the log files, e.g.
//    {
//         sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//         utilityType: 'record-update-enrichment'
//    }
//---------------------------------------------------------------------------------
function buildJobsToPublish(callTime, updateTime, pid, domain, domainItems, pidReferenceInfo) {
    var jobsToPublish = [];

    _.each(domainItems, function(item) {
        //Exclude the record if it is older than the provided updateTime; include if by default if updateTime is omitted
        var updateRecord = updateTime ? (item.stampTime < updateTime) : true;

        if (!item.pid) {
            item.pid = pid;
        }

        if (updateRecord) {
            var job = jobUtil.createRecordUpdate(getPatientIdentifierFromRecordPid(pid), domain, item, {
                referenceInfo: pidReferenceInfo
            });

            job.metaStamp = metaStampUtil.metastampDomain({
                data: {
                    items: [
                        item
                    ]
                }
            }, callTime);

            jobsToPublish.push(job);
        }
    });

    return jobsToPublish;
}


//---------------------------------------------------------------------------------
// This function writes jobs to the tube.
//
// childLogger: A bunyan logger to use when all logging in this function.
//
// jobsToPublish: Puts one or more jobs on a Beanstalk tube.
//
// callback: The callback handler.
//---------------------------------------------------------------------------------
VistaResyncUtil.prototype.writeJobsToBeanstalk = function(childLogger, jobsToPublish, callback) {
    var self = this;

    childLogger.debug('vista-site-data-resync-util.writeJobsToBeanstalk(): entering method');
    var tubeName = self.tubename;
    var host = self.updateConfig.beanstalk.repoDefaults.host;
    var port = self.updateConfig.beanstalk.repoDefaults.port;
    var client = new BeanstalkClient(childLogger, host, port);

    var tasks = buildJobTaskList(client, jobsToPublish);

    var jobsPublishedCount = 0;

    client.connect(function(error) {
        if (error) {
            return client.end(function() {
                return callback(util.format('Failed to connect to beanstalk. Host: %s; Port: %s; error: %j', host, port, error), jobsPublishedCount);
            });
        }

        // Need this to put jobs in the tube.
        //-----------------------------------
        client.use(tubeName, function(error) {
            if (error) {
                return client.end(function() {
                    return callback(util.format('Failed to use tube. Host: %s; Port: %s; TubeName: %s; error: %j', host, port, tubeName, error), jobsPublishedCount);
                });
            }

            // Need this to bury jobs.
            //------------------------
            client.watch(tubeName, function(error) {
                if (error) {
                    return client.end(function() {
                        return callback(util.format('Failed to watch tube. Host: %s; Port: %s; TubeName: %s; error: %j', host, port, tubeName, error), jobsPublishedCount);
                    });
                }

                async.series(tasks, function(error, result) {
                    if (error) {
                        childLogger.error('vista-site-data-resync-util.writeJobsToBeanstalk(): Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
                    }

                    if (result) {
                        //Result is a list of ids of the inserted beanstalk jobs
                        //Array may contain an 'undefined' in an error situation - will cause this number to be off
                        jobsPublishedCount += result.length;
                    }

                    client.end(function() {
                        childLogger.debug('vista-site-data-resync-util.writeJobsToBeanstalk: finished placing jobs into beanstalk tube');
                        return callback(error, jobsPublishedCount);
                    });
                });
            });
        });
    });
};


//---------------------------------------------------------------------------------
// This method runs the Vista Data Resync process one step at a time in correct order.
//
// sites: An array of vista sites for record re-pulling.
//
// pids: An array of PIDS to process
//
// updateTime: A timestamp in YYYYMMDDHHmmss format. Only domain event items dated
//      before this value will be re-processed. If this value is null or undefined,
//      then no filter will be applied.
//
// domains: An array of domains to re-process
//
// referenceInfo: An object containing information to allow tracing job activity
//      through the system in the log files.
//
// callback: The callback handler.
//---------------------------------------------------------------------------------
VistaResyncUtil.prototype.runUtility = function(sites, pids, updateTime, domains, referenceInfo, callback) {
    var self = this;
    var errorMessage;

    self.retrievePatientList(sites, pids, function(error, pidList) {
        if (error) {
            errorMessage = format('vista-site-data-resync-util: Exiting due to error returned by retrievePatientList: %s', error);
            return callback(errorMessage);
        }

        self.retrievePatientSyncDomains(updateTime, domains, pidList, function(error, pidsToResyncDomains) {
            if (error) {
                errorMessage = format('vista-site-data-resync-util: Exiting due to error returned by retrievePatientSyncStatuses: %s', error);
                return callback(errorMessage);
            }

            self.getRecordsAndCreateJobs(pidsToResyncDomains, updateTime, referenceInfo, function(error) {
                if (error) {
                    errorMessage = format('vista-site-data-resync-util: Exiting due to error returned by getRecordsAndCreateJobs: %s', error);
                    return callback(errorMessage);
                }

                callback();
            });
        });
    });
};


module.exports = VistaResyncUtil;