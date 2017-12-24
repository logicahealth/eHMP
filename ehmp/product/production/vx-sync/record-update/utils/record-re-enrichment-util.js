'use strict';

require('../../env-setup');

var util = require('util');
var async = require('async');
var _ = require('underscore');
var format = require('util').format;

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var jobUtil = require(global.VX_UTILS + 'job-utils');
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
// ReEnrichUtil(logger, jdsClient, updateConfig)
// ReEnrichUtil(logger, jdsClient, updateConfig, tubename)
//
// This method returns an array of PIDs. If a non-empty list is passed for 'pidList',
// then that will be returned with no processing. Otherwise, jdsClient.getPatientListBySite()
// will be called for each site and all of the results will be returned as a single array.
//
// logger: A bunyan style logger instance
//
// jdsClient: An instance of jds-client
//
// updateConfig: A config object containing record updater specific properties
//
// tubename: An optional parameter to allow the tubename used to be specified
//      for testing purposes.
//---------------------------------------------------------------------------------
function ReEnrichUtil(logger, jdsClient, updateConfig, tubename) {
    if (!(this instanceof ReEnrichUtil)) {
        return new ReEnrichUtil(logger, jdsClient, updateConfig, tubename);
    }

    this.logger = logger;
    this.jdsClient = jdsClient;
    this.updateConfig = updateConfig;
    this.tubename = tubename || 'vxs-record-update';
}


//---------------------------------------------------------------------------------
// This method returns an array of PIDs. If a non-empty list is passed for 'pidList',
// then that will be returned with no processing. Otherwise, jdsClient.getPatientList()
// will be called and the first identifier for each will be appended to the list
// returned in the callback.
//
// pidList: A list of PIDs, e.g. ['SITE;3', 'SITE;1', 'SITE;8', 'SITE;1']
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
ReEnrichUtil.prototype.retrievePatientList = function(pidList, callback) {
    var self = this;

    self.logger.info('record-re-enrichment-util.retrievePatientList(): entering method');
    if (pidList) {
        self.logger.info('record-re-enrichment-util.retrievePatientList(): pids already provided via parameter. Skipping to next step...');
        return setTimeout(callback, 0, null, pidList);
    }

    pidList = [];

    self.logger.debug('record-re-enrichment-util.retrievePatientList(): attempting to retrieve patient list from JDS');
    self.jdsClient.getPatientList(null, function(error, response, result) {
        if (error) {
            var message = util.format('record-re-enrichment-util.retrievePatientList(): Error from JDS: %j', error);
            self.logger.error(message);
            return callback(message);
        }

        if (!response || response.statusCode !== 200) {
            var errorMessage = util.format('record-re-enrichment-util.retrievePatientList(): Unexpected response from JDS: error %j, response %j', error, response);
            self.logger.error(errorMessage);
            return callback(errorMessage);
        }
        self.logger.debug('record-re-enrichment-util.retrievePatientList(): picking first patientIdentifier for each patient...');
        pidList = _.map(result.items, function(patient) {
            return _.first(patient.patientIdentifiers);
        });

        self.logger.debug('record-re-enrichment-util.retrievePatientList(): resulting patient list: %s. Continuing to next step...', pidList);
        return callback(null, pidList);
    });
};


//---------------------------------------------------------------------------------
// This method iterates through the list of identifiers and for each one in the list,
// calls jdsClient.getSyncStatus() filtered on 'updateTime' to get a detailed sync
// status. Then, for each site in the sync status, this method iterates through the
// domains contained in domainMetaStamp, keeping those which have events and are also
// contained in 'filterDomains'. This list will be added to the result object keyed
// on the PID for that patient on that site.
//
// If 'updateTime' is falsy, then the call to jdsClient.getSyncStatus() will not be
// filtered on 'updateTime'.
//
// The result of this method will be returned in the callback in the form of an object
// with PID keys to the list of domains for that key, e.g.
//
//     {
//         'SITE;3': ['med', 'allergy', 'consult'],
//         'SITE;1': ['med', 'consult'],
//         'SITE;8': ['allergy'],
//     }
//
// updateTime: A timestamp string in YYYYMMDDHHmmss format.
//
// filterDomains: An array of domains, e.g. ['med', 'allergy', 'consult']
//
// identifiers: An array of patient identifiers, e.g. ['10108V420871', 'SITE;1', 'SITE;8', 'SITE;1']
//      Note that the identifiers can be any patient identifier that is valid in VxSync. This
//      includes ICNs, PIDs, JPIDs, etc.
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
ReEnrichUtil.prototype.retrievePatientSyncDomains = function(updateTime, filterDomains, identifiers, callback) {
    var self = this;

    self.logger.info('record-re-enrichment-util.retrievePatientSyncDomains(): entering method');
    var pidsToResyncDomains = {};

    var jdsFilter = {
        filter: '?detailed=true' + (updateTime ? '&filter=lt("stampTime",' + updateTime + ')' : '')
    };
    self.logger.info('record-re-enrichment-util.retrievePatientSyncDomains(): async: attempting to get sync status for each patient');
    async.eachLimit(identifiers, 5, function(pid, callback) {
        self.logger.debug('record-re-enrichment-util.retrievePatientSyncDomains(): attempting to get sync status for patient %s', pid);
        var patientIdentifier = getPatientIdentifierFromRecordPid(pid);

        self.jdsClient.getSyncStatus(patientIdentifier, jdsFilter, function(error, response, result) {
            if (error) {
                var errorMessage = util.format('record-re-enrichment-util.retrievePatientSyncDomains(): Error from JDS when attempting to get sync status for patient %s. error %j', pid, error);
                self.logger.error(errorMessage);
                return callback(errorMessage);
            }

            if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.retrievePatientSyncDomains(): Unexpected response from JDS when attempting to get sync status for patient %s. error %j, response %j', pid, error, result);
                self.logger.error(message);
                return callback(message);
            }

            self.logger.debug('record-re-enrichment-util.retrievePatientSyncDomains(): determining which domains should be resynced for patient %s', pid);


            var sourceMetaStamp = getProperty(result, ['completedStamp', 'sourceMetaStamp']);
            var sites = _.keys(sourceMetaStamp);
            _.each(sites, function(site) {
                // This is all of the domain objects returned in the MetaStamp for the patient's site
                var returnedDomains = getProperty(sourceMetaStamp, [site, 'domainMetaStamp']);
                var sitePid = getProperty(sourceMetaStamp, [site, 'pid']);

                // Only add a domain if it has events with a stampTime earlier than the updateTime,
                // which is any domain object with an eventMetaStamp property.
                var pidDomainsToBeResynced = _.filter(filterDomains, function(domain) {
                    return _.has(returnedDomains[domain], 'eventMetaStamp');
                });

                if (!_.isEmpty(pidDomainsToBeResynced)) {
                    pidsToResyncDomains[sitePid] = pidDomainsToBeResynced;
                    self.logger.info('record-re-enrichment-util.retrievePatientSyncDomains(): Preparing to resync these domains for patient %s: %s', pid, pidDomainsToBeResynced);
                }
            });

            return callback();
        });
    }, function(error) {
        if (error) {
            return callback(error);
        }

        self.logger.debug('record-re-enrichment-util.retrievePatientSyncDomains(): mapped pids to domains to be resynced %j', pidsToResyncDomains);
        return callback(null, pidsToResyncDomains);
    });
};


//---------------------------------------------------------------------------------
// This method iterates through the object in 'pidsToResyncDomains' and for each domain
// in the list for that PID, calls jdsClient.getPatientDomainData() to get all of the
// data for that patient for that domain. It then builds a job for each record with a stampTime which
// is earlier than 'updateTime' and publishes it to beanstalk.
//
// If 'updateTime' is falsy, then this method will create jobs for all of the records returned
// for each domain.
//
// pidsToResyncDomains: An object containing lists of domains to resync keyed by PIDs, e.g.
//     {
//         'SITE;3': ['med', 'allergy', 'consult'],
//         'SITE;1': ['med', 'consult'],
//         'SITE;8': ['allergy'],
//     }
//
// referenceInfo: An object containing info for tracking the flow of a job through
//      the system via the log files, e.g.
//    {
//         sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//         utilityType: 'record-update-enrichment'
//    }
//
// updateTime: A timestamp string in YYYYMMDDHHmmss format.
//
// callback: The function to call when this method is complete or when an error occurs.
//---------------------------------------------------------------------------------
ReEnrichUtil.prototype.getRecordsAndCreateJobs = function(pidsToResyncDomains, updateTime, referenceInfo, callback) {
    var self = this;
    self.logger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): entering method');

    var pidToDomainComboList = buildPidToDomainComboList(pidsToResyncDomains);
    var pidStats = buildPidStats(pidsToResyncDomains, referenceInfo);
    var totalJobsPublished = 0;
    var pidCompleteList = [];
    var incompleteCollection = {};


    self.logger.debug('record-re-enrichment-util.getRecordsAndCreateJobs(): beginning async to get domain data for patients from JDS');
    // Limit to 1 to avoid running out of memory on large data sets
    async.eachLimit(pidToDomainComboList, 1, function(pidAndDomain, asyncCallback) {
        var pid = pidAndDomain.pid;
        var domain = pidAndDomain.domain;

        var pidReferenceInfo = pidStats[pid].referenceInfo;
        var childLogger = self.logger.child(pidReferenceInfo);

        if (!pidStats[pid].started) {
            childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): STARTED patient: %s', pid);
            pidStats[pid].started = true;
        }

        self.logger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): retrieving %s data for %s from JDS', domain, pid);
        self.jdsClient.getPatientDomainData(pid, domain, function(error, response, result) {
            if (error) {
                var errorMessage = util.format('record-re-enrichment-util.getRecordsAndCreateJobs(): Error from JDS when attempting to retrieve %s data for patient %s. error %j', domain, pid, error);
                childLogger.error(errorMessage);
                childLogger.error(createErrorStatus('Get domain data from JDS', pid, domain, error));
                addIncompleteDomain(incompleteCollection, pid, domain);
                return asyncCallback();
            }

            if (!response || response.statusCode !== 200) {
                var message = util.format('record-re-enrichment-util.getRecordsAndCreateJobs(): Unexpected response from JDS when attempting to retrieve %s data for patient %s. error %j, response %j', domain, pid, error, result);
                childLogger.error(message);
                addIncompleteDomain(incompleteCollection, pid, domain);
                return asyncCallback();
            }

            var domainItems = getProperty(result, ['data', 'items']);
            var jobsToPublish = buildJobsToPublish(self.updateConfig.solrOnly,updateTime, domain, domainItems, pidReferenceInfo);

            childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): Created %s record update jobs for %s domain data for patient %s. Now publishing jobs.', _.size(jobsToPublish), domain, pid);

            self.writeJobsToBeanstalk(childLogger, jobsToPublish, function(error, domainJobsPublished) {
                var errorMessage;
                if (error) {
                    errorMessage = util.format('record-re-enrichment-util: Error returned by writeJobsToBeanstalk for pid %s, domain %s: %s', pid, domain, error);
                    childLogger.error('record-re-enrichment-util.getRecordsAndCreateJobs(): Error returned by writeJobsToBeanstalk: %s', errorMessage);
                } else {
                    pidStats[pid].domainsComplete.push(domain);
                }

                pidStats[pid].jobsPublished += domainJobsPublished;
                totalJobsPublished += domainJobsPublished;

                addDistinct(pidCompleteList, pid);

                childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): Finished %s out of %s patients', _.size(pidCompleteList), _.size(pidStats));
                childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): Published %s out of %s %s jobs for patient %s', domainJobsPublished, _.size(jobsToPublish), domain, pid);
                childLogger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): Total jobs published as of this time: %s', totalJobsPublished);

                if (_.isEmpty(_.difference(pidsToResyncDomains[pid], pidStats[pid].domainsComplete))) {
                    self.logger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): FINISHED patient %s', pid);
                }

                childLogger.debug('record-re-enrichment-util.getRecordsAndCreateJobs(): Finished call to writeJobsToBeanstalk for patient %s and domain %s. Jobs published successfully.', pid, domain);
                asyncCallback();
            });

        });
    }, function() {
        self.logger.info('record-re-enrichment-util.getRecordsAndCreateJobs(): Finished creating and publishing jobs.');
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
// solrOnly: True if this is only a solr update.
//
// updateTime: A timestamp in YYYYMMDDHHmmss format.
//
// domain: The domain of all of the domainItems (e.g. 'allergy').
//
// domainItems: A collection of items as returned from JDS.
//---------------------------------------------------------------------------------
function buildJobsToPublish(solrOnly, updateTime, domain, domainItems, pidReferenceInfo) {
    var jobsToPublish = [];

    _.each(domainItems, function(item) {
        var updateRecord = updateTime ? (item.stampTime < updateTime) : true;
        var newJob;
        if (updateRecord) {
            newJob = jobUtil.createRecordUpdate(getPatientIdentifierFromRecordPid(item.pid), domain, item, {
                referenceInfo: pidReferenceInfo
            });

            if (solrOnly) {
                newJob.solrOnly = true;
            }

            jobsToPublish.push(newJob);
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
ReEnrichUtil.prototype.writeJobsToBeanstalk = function(childLogger, jobsToPublish, callback) {
    var self = this;

    childLogger.debug('record-re-enrichment-util.writeJobsToBeanstalk: entering method');
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
                        return callback(util.format('Failed to watch tube.  Host: %s; Port: %s; TubeName: %s; error: %j', host, port, tubeName, error), jobsPublishedCount);
                    });
                }

                async.series(tasks, function(error, result) {
                    if (error) {
                        childLogger.error('record-re-enrichment-util.writeJobsToBeanstalk: Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
                    }

                    if (result) {
                        // Result is a list of ids of the inserted beanstalk jobs
                        // Array may contain an 'undefined' in an error situation - will cause this number to be off
                        jobsPublishedCount += _.size(result);
                    }

                    client.end(function() {
                        childLogger.debug('record-re-enrichment-util.writeJobsToBeanstalk: finished placing jobs into beanstalk tube');
                        return callback(error, jobsPublishedCount);
                    });
                });
            });
        });
    });
};


//---------------------------------------------------------------------------------
// This method runs the Data Re-enrichment process one step at a time in correct order.
//
// pids: An array of PIDS to process
//
// updateTime: A timestamp in YYYYMMDDHHmmss format. Only domain event items dated
//      before this value will be re-processed. If this value is null or undefined,
//      then no filter will be applied.
//
// domains: An array of domains to re-process
//
// referenceInfo: An object containing info for tracking the flow of a job through
//      the system via the log files, e.g.
//    {
//         sessionId: 'c45e45bf-55ab-453e-bd5e-7e9f66c58d03',
//         utilityType: 'record-update-enrichment'
//    }
//
// callback: The callback handler.
//---------------------------------------------------------------------------------
ReEnrichUtil.prototype.runUtility = function(pids, updateTime, domains, referenceInfo, callback) {
    var self = this;
    var errorMessage;

    self.retrievePatientList(pids, function(error, pidList) {
        if (error) {
            errorMessage = format('record-re-enrichment-util: Exiting due to error returned by retrievePatientList: %s', error);
            return callback(errorMessage);
        }

        self.retrievePatientSyncDomains(updateTime, domains, pidList, function(error, pidsToResyncDomains) {
            if (error) {
                errorMessage = format('record-re-enrichment-util: Exiting due to error returned by retrievePatientSyncStatuses: %s', error);
                return callback(errorMessage);
            }

            self.getRecordsAndCreateJobs(pidsToResyncDomains, updateTime, referenceInfo, function(error) {
                if (error) {
                    errorMessage = format('record-re-enrichment-util: Exiting due to error returned by getRecordsAndCreateJobs: %s', error);
                    return callback(errorMessage);
                }

                callback();
            });
        });
    });
};

module.exports = ReEnrichUtil;
