'use strict';

//------------------------------------------------------------------------------------
// This class contains the code which processes the individual data items in a batch
// of messages received from a VistA system.  It breaks the batch up into individual
// jobs and starts them processing.
//
// Author: Les Westberg
//-------------------------------------------------------------------------------------

require('../../env-setup');

var util = require('util');
//var inspect = require(global.VX_UTILS + 'inspect');
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
//var mapUtil = require(global.VX_UTILS + 'map-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var uidUtil = require(global.VX_UTILS + 'uid-utils');
var format = require('util').format;
var metaStampUtil = require(global.VX_UTILS + 'metastamp-utils');

var PRIORITY_DEFAULT = 1;

//-------------------------------------------------------------------------------------
// Constructor for this class.
//
// log: The log to be used to write log messages to.
// config: The worker-config information to be used by this class.
// environment: The environment containing handles to shared objects, etc.
//-------------------------------------------------------------------------------------
var VistaRecordProcessor = function (log, config, environment) {
    log.debug('VistaRecordProcessor.constructor - class initialized.');
    this.log = log;
    this.config = config;
    this.environment = environment;
    this.metrics = environment.metrics;
};

//-------------------------------------------------------------------------------------------
// When a vista response contains a batch of data to be processed, it will call this function
// to process the batch.
//
// data: The data node of the response that was received from VistA.
// callback: The function to call when the batch has been processed.
//-------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype.processBatch = function (data, callback) {
    var self = this;
    self.log.debug('VistaRecordProcessor.processBatch: processing batch of %s records', data.items.length);
    var processId = uuid.v4();

    // Process all the jobs that we have received
    //--------------------------------------------
    self._logMetrics(processId, 'start', function () {
    });
    var taskResults = [];

    async.eachSeries(data.items, function (item, itemCompleteCallback) {
        self.log.trace('VistaRecordProcessor.processBatch: Inside async.eachSeries with item : %j', item);
        self._processDataItem(item, function (error, response) {
            self.log.trace('VistaRecordProcessor.processBatch: (Inside async.eachSeries) finished processing item: %j error: %s response: %s', item, error, response);
            if (!error) {
                taskResults.push(response);
            }
            itemCompleteCallback(error);
        });
    }, function (error) {
        self._logMetrics(processId, 'stop', function () {
        });
        self.log.debug('VistaRecordProcessor.processBatch: Completed processing all the jobs.  error: %s; all responses: %j', error, taskResults);
        return callback(error, taskResults);
    });
};

//-------------------------------------------------------------------------------------
// This method decides how a vista data item should be processed, based on the
// type of message. There are three kinds of messages to be processed.  The message
// type is contained in the 'collection' attribute of the item.  SyncStart
// messages signal the start of a sync, syncStatus messages signal the end of a sync, and
// all the rest are the actual data items.
// Based on which type the item belongs to, the appropriate method will be called to handle it.
//
// item: A single data item from a batch of vista data.
// callback: The callback to call once processing the data item has been completed.
//-------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._processDataItem = function (item, callback) {
    var self = this;

    if (!item) {
        self.log.debug('VistaRecordProcessor.processBatch: Item was nullish.');
        callback(null, 'Item was nullish.');
    } else if (item.error) {
        self._handleItemError(item, function (error, response) {
            callback(error, response);
        });
    } else if (!item.collection) {
        self.log.debug('VistaRecordProcessor.processBatch: Item.collection was nullish.');
        callback(null, 'Item.collection was nullish.');
    } else if (item.collection === 'syncStart') {
        self._processSyncStartJob(item, function (error, response) {
            callback(error, response);
        });
    } else if (item.collection === 'OPDsyncStart') {
        self._processOPDSyncStartJob(item, function (error, response) {
            callback(error, response);
        });
    } else if ((item.collection !== 'syncStart') && (item.collection !== 'OPDsyncStart') && (item.collection !== 'syncStatus')) {
        if (!item.object) {
            self.log.debug('VistaRecordProcessor.processBatch: Item of collection type %s has no data to process', item.collection);
            return callback(null, format('Item of collection type %s has no data to process', item.collection));
        }
        self._processVistaDataJob(item, function (error, response) {
            callback(error, response);
        });
    } else {
        self.log.debug('VistaRecordProcessor.processBatch: Item of collection type %s doesn\'t need to be processed.', item.collection);
        callback(null, format('Item of collection type %s doesn\'t need to be processed.', item.collection));
    }
};

//--------------------------------------------------------------------------------------------------------------
// This method handles the item level error that was received from Vista.   It will log and publish an error
// message and then call the callback handler.
//
// item: The item (chunk) of a batch from Vista that represents one message.
// callback: The callback handler to call when are done processing the error.
//--------------------------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._handleItemError = function (item, callback) {
    var self = this;

    // We should never have this situation - but if we do - get out of here.
    //----------------------------------------------------------------------
    if (!item) {
        self.log.error('VistaRecordProcessor.handleItemError: Method called with null or undefined item.');
        return callback(null, 'Method called with null or undefined item.');
    }

    if (!item.error) {
        self.log.error('VistaRecordProcessor.handleItemError: Method called with item that did not contain an error.');
        return callback(null, 'Method called with item that did not contain an error.');
    }

    var errorMessage = util.format('A single item from a Vista Batch had an error.  Error Info: %j ', item.error);
    var uids = _.compact(_.pluck(item.error, 'uid'));
    var site;
    if ((uids) && (!_.isEmpty(uids))) {
        site = uidUtil.extractSiteFromUID(uids[0]);  // Does not really matter which one we pick up - so use the first one.
    }

    // Write a log message for this error.
    //-------------------------------------
    self.log.error('VistaRecordProcessor.handleItemError: ' + errorMessage);

    // Publish an error to JDS
    //------------------------
    self.environment.errorPublisher.publishPollerError(site, item, errorMessage, function () {});

    return callback(null, errorMessage);

};


//create detectAndResycn method
//------------------------------------------------------------------------------------------
// This method processes a single syncStart job.
//
// self: A handle to the correct 'this' object.
// syncStartJob: A sync start job to process.
// callback: The handler to call when we are done processing the jobs.
//------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._processSyncStartJob = function (syncStartJob, callback) {
    var self = this;
    var childLog = self.log;
    if ((syncStartJob) && (!_.isEmpty(syncStartJob.referenceInfo))) {
        childLog = self.log.child(syncStartJob.referenceInfo);
    }

    childLog.debug('VistaRecordProcessor._processSyncStartJob: Processing syncStartJob [%j].', syncStartJob);

    // Get the PID that we are dealing with.
    //--------------------------------------
    // console.log('syncStartJob: pid: %s syncStartJob: [%j]', syncStartJob.pid, syncStartJob);
    if (!syncStartJob.pid) {
        childLog.error('VistaRecordProcessor._processSyncStartJob: Failed to process - syncStart did not contain a pid.');

        // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
        //--------------------------------------------------------------------------------------------------------------------------
        //return setTimeout(callback, 0, 'Failed to process syncStart - there was no pid in the message.');

        return setTimeout(callback, 0, null, 'FailedNoPid');
    }
    var patientIdentifier = idUtil.create('pid', syncStartJob.pid);
    var tasks = [];
    var syncStartDomain;
    var vistaId = idUtil.extractSiteFromPid(patientIdentifier.value);

    // If we received a meta-stamp then we need a task to store it.
    //-------------------------------------------------------------
    if (_.isObject(syncStartJob.metaStamp)) {
        syncStartDomain = metaStampUtil.getDomainFromMetastamp(syncStartJob.metaStamp, vistaId);
        if (self._isSyncNotification(syncStartDomain)) {
            childLog.debug('VistaRecordProcessor._processSyncStartJob: metaStamp for domain %s is a sync notification job. metaStamp does not need to be stored. pid: %s.', syncStartDomain, syncStartJob.pid);
        } else if (!_.isEmpty(metaStampUtil.getEventMetastampForDomain(syncStartJob.metaStamp, vistaId, syncStartDomain))) {
            tasks = tasks.concat(self._storeMetaStamp.bind(self, childLog, syncStartJob.metaStamp, patientIdentifier));
        } else {
            childLog.debug('VistaRecordProcessor._processSyncStartJob: metaStamp for domain %s has no events associated with it. Means the patient has no data for this domain on this VistA site. metaStamp does not need to be stored. pid: %s.', syncStartDomain, syncStartJob.pid);
        }
    } else {
        childLog.debug('VistaRecordProcessor._processSyncStartJob: Received a syncStart job that did not contain a metaStamp.  Means the patient has no data on this VistA site. pid: %s.', syncStartJob.pid);
    }

    //Store completed job only if the job isn't an unsolicted update
    //Unsolicited updates won't include rootJobId or jobId
    //---------------------------------------------------------------------------
    if (syncStartJob.rootJobId && syncStartJob.jobId) {
        childLog.trace('VistaRecordProcessor._processSyncStartJob: syncStartJob contains rootJobId and jobId; is not an unsolicited update.  pid: %s', syncStartJob.pid);
        tasks.push(self._storeCompletedJob.bind(self, childLog, syncStartJob.rootJobId, syncStartJob.jobId, syncStartDomain, patientIdentifier));
    } else {
        childLog.trace('VistaRecordProcessor._processSyncStartJob: syncStartJob was received as an unsolicited update. No job status to store. pid: %s', syncStartJob.pid);
    }

    // Process all the jobs that we have received
    //--------------------------------------------
    if (!_.isEmpty(tasks)) {
        async.series(tasks, function (error, response) {
            childLog.debug('VistaRecordProcessor._processSyncStartJob: Completed processing syncStartJob. pid: %s; error: %s; response: %j', syncStartJob.pid, error, response);
            return callback(error, response);
        });
    } else {
        // We have nothing to do... We are good to go...
        //----------------------------------------------
        childLog.debug('VistaRecordProcessor._processSyncStartJob: There was no metastamp to store or no job to complete. pid: %s', syncStartJob.pid);
        return setTimeout(callback, 0, null, null);
    }
};

//------------------------------------------------------------------------------------------
// This method processes a single OPDsyncStart job.
//
// self: A handle to the correct 'this' object.
// OPDsyncStartJob: A sync start job to process.
// callback: The handler to call when we are done processing the jobs.
//------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._processOPDSyncStartJob = function (OPDsyncStartJob, callback) {
    var self = this;
    self.log.debug('VistaRecordProcessor._processOPDSyncStartJob: Processing OPDsyncStartJob [%j].', OPDsyncStartJob);
    if (!OPDsyncStartJob.metaStamp) {
        self.log.error('VistaRecordProcessor._processOPDSyncStartJob: Failed to process - OPDsyncStart did not contain a metaStamp for systemId: %s.', OPDsyncStartJob.systemId);

        // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
        //--------------------------------------------------------------------------------------------------------------------------
        // return setTimeout(callback, 0, util.format('Failed to process syncStart for pid: %s.  There was no metaStamp in the message.', syncStartJob.pid));

        return setTimeout(callback, 0, null, 'FailedNoMetaStamp');
    }

    var tasks = [
        self._storeOperationalMetaStamp.bind(self, OPDsyncStartJob.metaStamp, OPDsyncStartJob.systemId) //,

        // FUTURETODO:  Store completed job once rootJobId and jobId can be received in the operational data sync start message
        //--------------------------------------------------------------------------------------------------------------------------
        //self._storeCompletedJob.bind(self, OPDsyncStartJob.rootJobId, OPDsyncStartJob.jobId, OPDsyncStartJob.systemId)
    ];

    // Process all the jobs that we have received
    //--------------------------------------------
    async.series(tasks, function (error, response) {
        self.log.debug('VistaRecordProcessor._processOPDSyncStartJob: Completed processing OPDsyncStartJob.  error: %s; response: %j', error, response);
        return callback(error, response);
    });
};

//------------------------------------------------------------------------------------------
// This method processes a single syncStart job.
//
// childLog: The logger to use for any log messages.
// metaStamp: The meta stamp to be stored.
// patientIdentifier: The patient identifier associated with this job.
// callback: The handler to call when we are done processing the jobs.
//------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._storeMetaStamp = function (childLog, metaStamp, patientIdentifier, callback) {
    var self = this;
    var vistaId = idUtil.extractSiteFromPid(patientIdentifier.value);
    var metricObj = {
        'site': vistaId,
        'pid': patientIdentifier.value,
        'timer': 'start',
        'process': uuid.v4()
    };
    self.metrics.trace('vista-record-processor Store Metastamp', metricObj);
    metricObj.timer = 'stop';
    childLog.debug('VistaRecordProcessor._storeMetaStamp: Storing metaStamp: %s; patientIdentifier: %j', metaStamp, patientIdentifier);

    // Store the metaStamp to JDS
    //----------------------------
    var jdsClient = self.environment.jds.childInstance(childLog);
    jdsClient.saveSyncStatus(metaStamp, patientIdentifier, function (error, response) {
        childLog.debug('VistaRecordProcessor._storeMetaStamp: Returned from storing patient metaStamp for pid: %s.  Error: %s;  Response: %j', patientIdentifier.value, error, response);
        if (error) {
            childLog.error('VistaRecordProcessor._storeMetaStamp:  Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', patientIdentifier.value, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            //return callback(util.format('Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsError');
        }

        if (!response) {
            childLog.error('VistaRecordProcessor._storeMetaStamp:  Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', patientIdentifier.value, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsNoResponse');
        }

        if (response.statusCode !== 200) {
            childLog.error('VistaRecordProcessor._storeMetaStamp:  Failed to store metaStamp for pid: %s - incorrect status code returned. Error: %s;  Response: %j; metaStamp:[%j]', patientIdentifier.value, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - incorrect status code returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsWrongStatusCode');
        }

        self.metrics.trace('vista-record-processor Store Metastamp', metricObj);
        return callback(null, 'success');
    });
};

//------------------------------------------------------------------------------------------
// This method stores an operational data metastamp via the jds client.
//
// metaStamp: The meta stamp to be stored.
// patientIdentifier: The patient identifier associated with this job.
// callback: The handler to call when we are done processing the jobs.
//------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._storeOperationalMetaStamp = function (metaStamp, siteId, callback) {
    var self = this;
    var metricObj = {
        'site': siteId,
        'timer': 'start',
        'process': uuid.v4()
    };
    self.metrics.trace('vista-record-processor Store Operational Metastamp', metricObj);
    metricObj.timer = 'stop';
    self.log.debug('VistaRecordProcessor._storeOperationalMetaStamp: Storing metaStamp: %s; siteId: %j', metaStamp, siteId);

    // Store the metaStamp to JDS
    //----------------------------
    self.environment.jds.saveOperationalSyncStatus(metaStamp, siteId, function (error, response) {
        self.log.debug('VistaRecordProcessor._storeOperationalMetaStamp: Returned from storing patient metaStamp for pid: %s.  Error: %s;  Response: %j', siteId, error, response);
        if (error) {
            self.log.error('VistaRecordProcessor._storeOpeationalMetaStamp:  Received error while attempting to store metaStamp for site: %s.  Error: %s;  Response: %j; metaStamp:[%j]', siteId, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            //return callback(util.format('Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Operational Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsError');
        }

        if (!response) {
            self.log.error('VistaRecordProcessor._storeOperationalMetaStamp:  Failed to store metaStamp for site: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', siteId, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Operational Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsNoResponse');
        }

        if (response.statusCode !== 200) {
            self.log.error('VistaRecordProcessor._storeOperationalMetaStamp:  Failed to store metaStamp for site: %s - incorrect status code returned. Error: %s;  Response: %j; metaStamp:[%j]', siteId, error, response, metaStamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - incorrect status code returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Operational Metastamp in Error', metricObj);
            return callback(null, 'FailedJdsWrongStatusCode');
        }

        self.metrics.trace('vista-record-processor Store Operational Metastamp', metricObj);
        return callback(null, 'success');
    });
};

//------------------------------------------------------------------------------------------
// This method processes a single syncStart job.
//
// childLog: The logger to use for any log messages.
// rootJobId: The Job Id of the job that started the sync for this patient.
// jobId: The job Id that represents this specific poller job.
// patientIdentifier: The patient identifier associated with this job.
// callback: The handler to call when we are done processing the jobs.
//------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._storeCompletedJob = function (childLog, rootJobId, jobId, domain, patientIdentifier, callback) {
    var self = this;
    var vistaId = idUtil.extractSiteFromPid(patientIdentifier.value);
    var metricObj = {
        'site': vistaId,
        'pid': patientIdentifier.value,
        'rootJobId': rootJobId,
        'jobId': jobId,
        'timer': 'start',
        'process': uuid.v4()
    };
    self.metrics.trace('vista-record-processor Store Completed Data jobs', metricObj);
    metricObj.timer = 'stop';
    childLog.debug('VistaRecordProcessor._storeCompletedJob: Storing completed job.  rootJobId: %s; jobId: %s, patientIdentifier: %j', rootJobId, jobId, patientIdentifier);

    // First thing we need to do is to retrieve the JPID for this patient.  It is a requirement for the Job.
    //------------------------------------------------------------------------------------------------------
    var jdsClient = self.environment.jds.childInstance(childLog);
    jdsClient.getPatientIdentifierByPid(patientIdentifier.value, function (error, response, result) {
        childLog.debug('VistaRecordProcessor._storeCompletedJob: Received response from getPatientIdentifierByPid.  error: %s; response: %j; result: %j', error, response, result);
        if (error) {
            childLog.error('VistaRecordProcessor._storeCompletedJob:  Received error while retrieving patient identifiers for pid: %s; error: %s; response: %j', patientIdentifier.value, error, response);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            //return callback(util.format('Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
            return callback(null, 'FailedJdsError');
        }

        if (!response) {
            childLog.error('VistaRecordProcessor._storeCompletedJob:  Failed to retrieve patient identifiers for pid: %s; error: %s; response: %j', patientIdentifier.value, error, response);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
            return callback(null, 'FailedJdsNoResponse');
        }

        if (response.statusCode !== 200) {
            childLog.error('VistaRecordProcessor._storeCompletedJob:  Failed to retrieve patient identifiers for pid: %s - incorrect status code returned. Error: %s;  Response: %j', patientIdentifier.value, error, response);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - incorrect status code returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
            return callback(null, 'FailedJdsWrongStatusCode');
        }

        if ((!result) || (!result.jpid)) {
            childLog.error('VistaRecordProcessor._storeCompletedJob:  Result for pid: %s did not contain jpid.  Result: %j', patientIdentifier.value, error, result);
            self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
            return callback(null, 'FailedNoJpidInResult');
        }

        // We have successful response...  Now store the completed job...
        //---------------------------------------------------------------
        var record = null;
        var eventUid = null;
        var meta = {
            rootJobId: rootJobId,
            jpid: result.jpid,
            jobId: jobId
        };
        metricObj.jpid = result.jpid;
        childLog.debug('VistaRecordProcessor._storeCompletedJob: before creating job.  meta: %j', meta);
        var pollerJob;
        if (idUtil.isVistaHdrSite(vistaId, self.config)) {
            pollerJob = jobUtil.createVistaHdrPollerDomainRequest(vistaId, domain, patientIdentifier, record, eventUid, meta);
        } else {
            pollerJob = jobUtil.createVistaPollerDomainRequest(vistaId, domain, patientIdentifier, record, eventUid, meta);
        }
        childLog.debug('VistaRecordProcessor._storeCompletedJob: preparing to write job: %j', pollerJob);

        var jobStatusUpdaterClient = self.environment.jobStatusUpdater.childInstance(childLog);
        jobStatusUpdaterClient.completeJobStatus(pollerJob, function (error, response, result) {
            childLog.debug('VistaRecordProcessor._storeCompletedJob:  Response from JobStatusUpdater.completeJobStatus for pid: %s.  error: %s; response: %j; result: %j', patientIdentifier.value, error, response, result);
            // Note - right now JDS is returning an error 200 if things worked correctly.   So
            // we need to absorb that error.
            //--------------------------------------------------------------------------------
            if (error) {
                childLog.error('VistaRecordProcessor._storeCompletedJob:  Received error while storing job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result);

                // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                //--------------------------------------------------------------------------------------------------------------------------
                //return callback(util.format('Received error while storing job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result), null);

                self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
                return callback(null, 'FailedJdsError');
            }

            if (!response) {
                childLog.error('VistaRecordProcessor._storeCompletedJob:  Failed to store job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result);

                // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                //--------------------------------------------------------------------------------------------------------------------------
                // return callback(util.format('Failed to store job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result), null);

                self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
                return callback(null, 'FailedJdsNoResponse');
            }

            if (response.statusCode !== 200) {
                childLog.error('VistaRecordProcessor._storeCompletedJob:  Failed to store job - incorrect status code.  job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result);

                // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                //--------------------------------------------------------------------------------------------------------------------------
                // return callback(util.format('Failed to store job - incorrect status code.  job: %j pid: %s; error: %s; response: %j; result: %j', pollerJob, patientIdentifier.value, error, response, result), null);

                self.metrics.trace('vista-record-processor Store Completed Data jobs in Error', metricObj);
                return callback(null, 'FailedJdsWrongStatusCode');
            }

            self.metrics.trace('vista-record-processor Store Completed Data jobs', metricObj);
            return callback(null, 'success');
        });
    });
};

//-------------------------------------------------------------------------------------------
// This method is used to create a method that can be processed by async.series to log
// the beginning and stopping of the processBatch method.
//
// processId: The processId to attach to this metric.
// timerValue: What is the timer value  (i.e. start or stop).
// callback: The callback to call when the metrics has been recorded.
//-------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._logMetrics = function (processId, timerValue, callback) {
    var self = this;
    self.metrics.debug('VistaRecordProcessor processBatch', {
        'timer': timerValue,
        'process': processId,
        'handler': 'vista-record-processor'
    });
    callback(null, null);
};

//-------------------------------------------------------------------------------------------
// This method processes an individual vista data job
//
// vistaDataJob: A single patient or vista data job to be processed.
// callback: The handler to call when we are done processing the job.
//-------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._processVistaDataJob = function (vistaDataJob, callback) {
    var self = this;
    var childLog = self.log;
    if ((vistaDataJob) && (!_.isEmpty(vistaDataJob.referenceInfo))) {
        childLog = self.log.child(vistaDataJob.referenceInfo);
    }
    childLog.debug('VistaRecordProcessor._processVistaDataJob: Processing vistaDataJob: %j', vistaDataJob);

    var jobToPublish = self._buildVistaDataJob(childLog, vistaDataJob);
    childLog.trace('VistaRecordProcessor._processVistaDataJob: publishing child job %j', jobToPublish);

    var publisherRouterClient = self.environment.publisherRouter.childInstance(childLog);
    publisherRouterClient.publish(jobToPublish, function (error) {
        if (error) {
            childLog.error('VistaRecordProcessor._processVistaDataJob: An error occurred when publishing.  error: %s', error);
            return callback(null, 'success');
        }

        childLog.trace('VistaRecordProcessor._processVistaDataJob: published child jobs for processing: %j', jobToPublish);
        return callback(null, 'success');
    });
};

//---------------------------------------------------------------------------------------------
// This method creates a job for one patient or operational data record and places it in the
// appropriate tube.
//
// childLog: The logger to use for any log messages.
// vistaDataJob: The patient or operational data job to be processed.
//---------------------------------------------------------------------------------------------
VistaRecordProcessor.prototype._buildVistaDataJob = function (childLog, vistaDataJob) {
    var self = this;
    var vistaId = idUtil.extractSiteFromPid(vistaDataJob.pid);
    var metricObj = {
        'site': vistaId,
        'pid': vistaDataJob.pid,
        'timer': 'start',
        'process': uuid.v4()
    };
    self.metrics.trace('vista-record-processor: Build Vista Data', metricObj);
    metricObj.timer = 'stop';
    childLog.debug('VistaRecordProcessor._buildVistaDataJob: Processing vistaDataJob [%j].', vistaDataJob);

    if (!vistaDataJob.object) {
        childLog.debug('VistaRecordProcessor._buildVistaDataJob:  The object node did not exist.');
        self.metrics.trace('vista-record-processor build Vista Data in Error', metricObj);
        return null;
    }

    if (!self._isOperationalData(vistaDataJob)) {
        childLog.debug('VistaRecordProcessor._buildVistaDataJob: Job is patient data.');

        var patientIdentifier = {
            type: 'pid',
            value: vistaDataJob.pid
        };

        var meta = {};
        if (vistaDataJob.referenceInfo) {
            // Extract the job related fields that were passed through.
            //----------------------------------------------------------
            meta.rootJobId = vistaDataJob.referenceInfo.rootJobId;
            if (!isNaN(vistaDataJob.referenceInfo.priority)) {
                meta.priority = parseInt(vistaDataJob.referenceInfo.priority);
            }

            // We need to make a deep copy so we can trim out the extra job related fields
            // that Vista handed us back.
            //----------------------------------------------------------------------------
            var referenceInfo = JSON.parse(JSON.stringify(vistaDataJob.referenceInfo));
            delete referenceInfo.jobId;
            delete referenceInfo.rootJobId;
            delete referenceInfo.priority;
            meta.referenceInfo = referenceInfo;
        }
        // If this VistA system is updated - it will tell us if this is an unsolicited update.
        // Unsolicited updates should be treated as high priority.
        //-------------------------------------------------------------------------------------
        else if (vistaDataJob.unsolicitedUpdate === true) {
            meta.priority = PRIORITY_DEFAULT;
            meta.referenceInfo = { 'initialSyncId': vistaDataJob.pid };
        }

        var vistaObjectNode = vistaDataJob.object;
        vistaObjectNode.pid = vistaDataJob.pid;
        self.metrics.trace('vista-record-processor: Build Vista Data', metricObj);

        if (self._isSyncNotification(vistaDataJob.collection)) {
            return jobUtil.createSyncNotification(patientIdentifier, vistaDataJob.collection, vistaObjectNode, meta);
        } else {
            return jobUtil.createEventPrioritizationRequest(patientIdentifier, vistaDataJob.collection, vistaObjectNode, meta);
        }
    }

    if (vistaDataJob.error) {
        childLog.error('VistaRecordProcessor._buildVistaDataJob: Error in VPR update data: ' + vistaDataJob.error);
        self.metrics.trace('vista-record-processor: Build Vista Data in error', metricObj);
        return null;
    }

    if (!vistaDataJob.deletes) {
        childLog.debug('VistaRecordProcessor._buildVistaDataJob: Job is operational data.');
        self.metrics.trace('vista-record-processor: Build Vista Data', metricObj);
        return jobUtil.createOperationalDataStore(vistaDataJob.object);
    }
};

//--------------------------------------------------------------------------------
// Checks to see if the record contains operational data.
//   (logic taken from eHMP VistaVprDataExtractEvent)
//
// vistaDataJob: The patient or operational data job to be processed.
//--------------------------------------------------------------------------------
VistaRecordProcessor.prototype._isOperationalData = function (vistaDataJob) {
    if (!vistaDataJob) {
        return false;
    }
    var domainName = vistaDataJob.collection || '';
    var pid = vistaDataJob.pid || null;
    return ((domainName.toLowerCase() === 'pt-select') || !pid);
};

//--------------------------------------------------------------------------------
// Checks to see if this record is a sync notification.
//
// syncDomain: The sync domain for the job.
//--------------------------------------------------------------------------------
VistaRecordProcessor.prototype._isSyncNotification = function (syncDomain) {
    if (!syncDomain || !this.config.syncNotifications) {
        return false;
    }

    var foundDataDomain = _.find(_.values(this.config.syncNotifications), function(syncNotification) {
        return syncNotification.dataDomain === syncDomain;
    });

    return !_.isUndefined(foundDataDomain);
};


module.exports = VistaRecordProcessor;
