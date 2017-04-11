'use strict';

//----------------------------------------------------------------------------------
// This class handles the code that continuously polls VistA for data that needs
// to be processed.  The data may be a result of a subscription request or new data
// on patients that have already been subscribed.
//
// Author: Les Westberg
//----------------------------------------------------------------------------------

// ------------------ NOTE: ------------------
// The common logic and functionality in
// appointment-trigger-poller.js and
// vista-record-poller.js needs to be
// extracted into a library/utility
// ------------------ NOTE: ------------------

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var logUtil = require(global.VX_UTILS + 'log');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var VprUpdateOpData = require(global.VX_UTILS + 'VprUpdateOpData');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var metaStampUtil = require(global.VX_UTILS + 'metastamp-utils');

//---------------------------------------------------------------------------------
// Constructor for this class - This class inherits from events.EventEmitter. (REMOVAL PENDING)
//
// log: The log to use when logging messages.
// vistaId: The site code for the site associated with this poller.
// config: The general configuration information.
// environment: Cross cutting environment handles, etc.
// start: if this coerces to 'true', then the poller will start automatically
//      when the Poller is instantiated.
//----------------------------------------------------------------------------------
var Poller = function(log, vistaId, config, environment, start) {
    this.vistaId = vistaId;
    this.environment = environment;
    this.config = config;
    this.metrics = environment.metrics;
    this.log = logUtil.getAsChild('vistaRecordPoller-' + vistaId, log);
    this.paused = !start;
    this.readyToShutdown = !start;
    this.pollDelayMillis = 1000;
    this.lastUpdateTime = '0';
    this.vprUpdateOpData = new VprUpdateOpData(this.log, vistaId, environment.jds);
    this.vistaProxy = new VistaClient(log, this.metrics, config);
    this.errorPublisher = environment.errorPublisher;
    this.isVistaHdr = idUtil.isVistaHdrSite(vistaId, config);
    if (this.isVistaHdr) {
        this.vistaProxy = new HdrClient(log, this.metrics, config);
    }
    else {
        this.vistaProxy = new VistaClient(log, this.metrics, config);
    }
    this.hmpBatchSize = this.getBatchSize();
    this.success = false;
};

//-----------------------------------------------------------------------------------
// This method starts the polling process.
//
// callback: The callback handler to call when the process is started.
//-----------------------------------------------------------------------------------
Poller.prototype.start = function(callback) {
    var self = this;
    self._getLastUpdateTimeFromJds(function(error, response) {
        // If we have an error here - we need to stop what we are doing - it is fatal.
        //-----------------------------------------------------------------------------
        if (error) {
            self.log.error('vista-record-poller.start: Failed to retrieve last update time from JDS.  error: %s; response: %s', error, response);
            self.errorPublisher.publishPollerError(self.vistaId, error, function(){});
            return callback('vista-record-poller.start: Failed to retrieve last update time from JDS.  error: ' + error, response);
        }

        self.log.debug('vista-record-poller.start: Received infromation lastUpdateTime from jds.  response: %s', response);

        if (response) {
            self.lastUpdateTime = response;
        }

        // Now that we have primed our lastUpdateTime - we can now proceed to poll VistA
        //------------------------------------------------------------------------------

        self.log.trace('vista-record-poller.start: poller started');
        self.doNext();

        // TODO: Pick this value up from JDS
        //----------------------------------
        callback(null, 'success');
    });
};

//--------------------------------------------------------------------------------------
// This method pauses the polling process.
//--------------------------------------------------------------------------------------
Poller.prototype.pause = function() {
    this.log.debug('vista-record-poller.pause()');
    this.paused = true;
};

//--------------------------------------------------------------------------------------
// This method resumes the polling process.
//--------------------------------------------------------------------------------------
Poller.prototype.resume = function() {
    this.log.debug('vista-record-poller.resume()');
    this.paused = false;
};

Poller.prototype.isReadyToShutdown = function(){
    this.log.debug('vista-record-poller.isReadyToShutdown(): ' + this.readyToShutdown);
    return this.readyToShutdown;
};

//--------------------------------------------------------------------------------------
// This method resets the lastUpdatedTime to '0'.
//--------------------------------------------------------------------------------------
Poller.prototype.reset = function() {
    this.log.debug('vista-record-poller.reset()');
    this.lastUpdateTime = '0';
};


Poller.prototype.getStatus = function() {
    this.log.debug('vista-record-poller.getStatus()');

    return {
        vista: this.vistaId,
        status: this.paused ? 'paused' : 'running',
        lastUpdateTime: this.lastUpdateTime
    };
};

Poller.prototype.getVistaId = function(){
    return this.vistaId;
};

Poller.prototype.getBatchSize = function() {
    if (this.isVistaHdr) {
        return this.config.hdr.pubsubConfig.maxBatchSize;
    }
    else {
        return this.config['hmp.batch.size'];
    }
};
//--------------------------------------------------------------------------------------
// This method is run every time the 'next' event is fired.
//--------------------------------------------------------------------------------------
Poller.prototype.doNext = function() {
    if (this.paused) {
        this.log.debug('vista-record-poller.doNext: paused == true, SKIPPING Polling for new batch of data from vista [%s]', this.vistaId);
        this.readyToShutdown = true;
        return poll(this, this.pollDelayMillis);
        // return waitAndThenPoll(this);
    } else {
        this.readyToShutdown = false;
    }
    if (this.isVistaHdr && !idUtil.isHdrPubSubMode(this.config)) {
        this.log.debug('vista-record-poller.doNext: HDR pub/sub mode is off, HDR site: %s', this.vistaId);
        return poll(this, this.pollDelayMillis * 10);
    }
    this.log.debug('vista-record-poller.doNext: Polling for new batch of data from vista [%s]', this.vistaId);
    this.vistaProxy.fetchNextBatch(this.vistaId, this.lastUpdateTime, this.hmpBatchSize, this._processResponse.bind(this));
};

//------------------------------------------------------------------------------------------------
// This method processes the response that was received from the VistA system.  This is
// method is called as a result of a callback on the Vista - fetchNextBatch method.
//
// error: The error that occured when fetching the data from VistA - or null if no error occurred.
// wrappedResponse: The response information from VistA.
//-------------------------------------------------------------------------------------------------
Poller.prototype._processResponse = function(error, wrappedResponse) {
    var self = this;

    // If we have an error - but fetch has wratcheted the batch size all the way down to one message chunk,
    // we can safely log the error for this one offending chunk, and set the lastUpdateTime to move on, so that
    // we can continue processing messages.
    //----------------------------------------------------------------------------------------------------------
    if ((error) && (wrappedResponse) && ((wrappedResponse.hmpBatchSize === 1) || (wrappedResponse.hmpBatchSize === '1'))) {
        self.success = false;
        // This means that we have found our offending record.  We need to make sure the next batch size is back to normal now.
        //---------------------------------------------------------------------------------------------------------------------
        self.hmpBatchSize = self.getBatchSize();

        self.log.error('vista-record-poller.processResponse: Received failed message with hmpBatchSize=1.   Setting poller to skip this message. Error: %s; rawResponse: %s', error, wrappedResponse.rawResponse);
        var messagelastUpdateTime = self._extractLastUpdateFromRawResponse(wrappedResponse.rawResponse);
        if ((_.isString(messagelastUpdateTime)) && (!_.isEmpty(messagelastUpdateTime))) {
            self._storeLastUpdateTime({ lastUpdate: messagelastUpdateTime },  function (error, response) {
                if (error) {
                    self.errorPublisher.publishPollerError(self.vistaId, error, function(){});
                    self.log.error('vista-record-poller.processResponse: Failed to store lastUpdateTime.  lastUpdateTime: messagelastUpdateTime: %s; response: %s', messagelastUpdateTime, response);
                    return poll(self, self.pollDelayMillis);
                } else {
                    return poll(self);
                }
            });
        } else {
            self.log.error('vista-record-poller.processResponse: Failed to store lastUpdateTime.  Could not extract lastUpdate from the rawResponse.');
            return poll(self, self.pollDelayMillis);
        }
    } else if (error) {
        self.errorPublisher.publishPollerError(self.vistaId, error, function(){});
        self.success = false;
        self.hmpBatchSize = self.getBatchSize();
        self.log.error('vista-record-poller.processResponse: Failed to invoke vista [%s]', error);
        return poll(self, self.pollDelayMillis);
    } else {

        var data = wrappedResponse.data;

        // Poller may have found some responses that were considered bad JSON.  If it happens, it will start reducing the batch size until it gets
        // a message that it can parse.  When that happens, on the next fetch, we want to use that size, until we find the offending JSON chunk and
        // push that offending JSON chunk to the top of our list so that we can error that one chunk out and move forward.   This will set batch size for
        // the next fetch.
        //------------------------------------------------------------------------------------------------------------------------------------------------
        self.hmpBatchSize = wrappedResponse.hmpBatchSize || self.getBatchSize();

        if(self.success === true) {
            self.hmpBatchSize = self.getBatchSize();  //two successful messages from Vista, reset batch size
        }

        self.success = true;
        self.log.debug('vista-record-poller.processResponse: Received batch of data.  Length: [%s];  data: [%j]', (data ? data.totalItems : 0), data);
        if (data && data.items && data.items.length > 0) {
            self._processBatch(data, function(error, result) {
                self.log.debug('vista-record-poller.processResponse: Returned from calling _processBatch.  Error: %s; result: %s', error, result);
                if (!result) {
                    result = error;
                    error = undefined;
                }

                if (error) {
                    self.errorPublisher.publishPollerError(self.vistaId, error, function() {});
                    self.log.warn('vista-record-poller.processResponse: Failed to process records [%s]', error);

                    // hmmm, what should we do...?
                    poll(self, this.pollDelayMillis);
                } else {
                    self.log.debug('vista-record-poller.processResponse: Finished process batch of data');
                    poll(self);
                }
            });
        } else {
            poll(self, this.pollDelayMillis);
        }
    }
};

//-------------------------------------------------------------------------------------------
// If VistA sends back a response that  cannot be parsed as JSON, we need to see if we can
// find the lastUpdate value in this - by simply locating it through a string search.
//
// rawResponse: The string form of the response from VistA.
//-------------------------------------------------------------------------------------------
Poller.prototype._extractLastUpdateFromRawResponse = function(rawResponse) {
    var self = this;

    var lastUpdate = null;
    if ((_.isString(rawResponse)) && (!_.isEmpty(rawResponse))) {
        // Quickest way to get this, is to extract just the lastUpdate fields.  Ours should always be first.  So get them,
        // if we get an array of them throw away all but the first.  Wrap it in {} and parse it as JSON.
        //----------------------------------------------------------------------------------------------------------------
        var lastUpdateFields = rawResponse.match(/\"lastUpdate\"\s*\:\s*\"\d+-\d+\"/g);
        if (_.isArray(lastUpdateFields)) {
            lastUpdateFields = lastUpdateFields[0];
        }
        if ((_.isString(lastUpdateFields)) && (!_.isEmpty(lastUpdateFields))) {
            var lastUpdateObj = null;
            try {
                lastUpdateObj = JSON.parse('{' + lastUpdateFields + '}');
                lastUpdate = lastUpdateObj.lastUpdate;
            }
            catch (e) {
                self.log.error('viata-record-poller._extractLastUpdateFromRawResponse: Failed to extract the lastUpdate value from the raw response.  rawResponse: %s', rawResponse);
            }
        }
    }

    return lastUpdate;
};

//-------------------------------------------------------------------------------------------
// When a vista response contains a batch of data to be processed, it will call this function
// to process the batch.  There are three kinds of messages to be processed.  The message
// type is contained in the 'collection' attribute of the item.  SyncStart
// messages signal the start of a sync, syncStatus messages signal the end of a sync, and
// all the rest are the actual data items.
//
// data: The data node of the response that was received from VistA.
// callback: The function to call when the batch has been processed.
//-------------------------------------------------------------------------------------------
Poller.prototype._processBatch = function(data, callback) {
    var self = this;
    self.log.debug('vista-record-poller._processBatch: processing batch of records');
    var processId = uuid.v4();

    var tasks = [
            self._logMetrics.bind(self, processId, 'start'),
            self._createJobsForUnsolicitedUpdates.bind(self, data),
            self._sendToVistaRecordProcessor.bind(self, data),
            self._storeLastUpdateTime.bind(self, data),
            self._logMetrics.bind(self, processId, 'stop')
        ];
    // Process all the jobs that we have received
    //--------------------------------------------
    async.series(tasks, function(error, response) {
        self.log.debug('vista-record-poller._processBatch: Completed processing all the jobs.  error: %s; response: %j', error, response);
        if (error) {
            self.errorPublisher.publishPollerError(self.vistaId, error, function(){});
        }
        return callback(error, response);
    });
};

Poller.prototype._logMetrics = function(processId, timerValue, callback) {
    this.metrics.debug('Poller process data',{'timer':timerValue, 'process':processId, 'handler':'vista-poller'});
    callback();
};

//----------------------------------------------------------------------------------------------------
// This method creates a job containing the batch and sends it to the Vista-Record-Processor-Request
// handler.
//
// data: The batch of data received from VistA
// callback: The callback to call when this is done.
//----------------------------------------------------------------------------------------------------
Poller.prototype._sendToVistaRecordProcessor = function(data, callback) {
    var self = this;

    var processorJob = jobUtil.createVistaRecordProcessorRequest(data, null);
    var metricObj = {'handler':'vista-poller','process':uuid.v4(), 'timer':'start'};
    self.metrics.trace('Poller send vista data to vista-record-processor.',metricObj);
    metricObj.timer = 'stop';

    self.log.debug('vista-record-poller._sendToVistaRecordProcessor: sending job to vista-record-processor-request handler.  processorJob: %j', processorJob);
    self.environment.publisherRouter.publish(processorJob, function(error) {
        if (error) {
            self.log.error('vista-record-poller._sendToVistaRecordProcessor: An error occurred when publishing.  error: %s', error);
            return callback(null, 'success');
        }

        self.log.debug('vista-record-poller._sendToVistaRecordProcessor: successfully published job to vista-record-processor-request.');
        self.metrics.trace('Poller send vista data to vista-record-processor.', metricObj);
        return callback(null, 'success');
    });
};

//----------------------------------------------------------------------------------------------------
// This method retrieves the last update time from JDS.
//
// callback: The callback handler to call when the data comes back from JDS.  On successful call
//           the response will contain a string which is the lastUpdateTime value.
//----------------------------------------------------------------------------------------------------
Poller.prototype._getLastUpdateTimeFromJds = function(callback) {
    var self = this;
    self.vprUpdateOpData.retrieveLastUpdateTime(function(error, response) {
        self.log.debug('vista-record-poller._getLastUpdateTimeFromJds: Received error: %s; response: %s', error, response);
        callback(error, response);
    });
};

//----------------------------------------------------------------------------------------------------
// This method stores the last update time to JDS for this site.
//
// lastUpdateTime: The last update time in VistA internal format to be stored.
// callback: The callback handler to call when the data comes back from JDS.
//----------------------------------------------------------------------------------------------------
Poller.prototype._storeLastUpdateTimeToJds = function(lastUpdateTime, callback) {
    var self = this;
    self.vprUpdateOpData.storeLastUpdateTime(lastUpdateTime, function(error, response) {
        self.log.debug('vista-record-poller._storeLastUpdateTimeToJds: Received error: %s; response: %s', error, response);
        callback(error, response);
    });
};

//---------------------------------------------------------------------------------------------
// This method stores the last update time that was received in the message to JDS.
//
// data: The data that was returned from Vista
// callback: The callback handler to call when we are done.
//---------------------------------------------------------------------------------------------
Poller.prototype._storeLastUpdateTime = function(data, callback) {
    var self = this;
    if ((data) && (data.lastUpdate)) {
        self.log.debug('vista-record-poller._storeLastUpdateTime: Storing new lastUpdateTime: %s', data.lastUpdate);
        self._storeLastUpdateTimeToJds(data.lastUpdate, function(error, response) {
            if (error) {
                return callback(error, response);
            }
            self.lastUpdateTime = data.lastUpdate;
            return callback(null, 'success');
        });
    } else {
        self.log.error('vista-record-poller._storeLastUpdateTime: The message from VistA did not contain lastUpdate so no new lastUpdateTime will be stored.');
        return setTimeout(callback, 0, null, 'success');
    }
};

function poll(instance, pollDelayMillis) {
    // setTimeout(instance.emit.bind(instance, 'next'), pollDelayMillis);
    setTimeout(instance.doNext.bind(instance), pollDelayMillis);
}

//--------------------------------------------------------------------------------------------
// This method scans through a VistA data batch for unsolicited updates, calling the
// _createUnsolicitedUpdateJobStatus method for any unsolicited update data found.
//
// data - a batch of VistA data
// callback - This is the callback that is called back after the method has completed.
//--------------------------------------------------------------------------------------------
Poller.prototype._createJobsForUnsolicitedUpdates = function(data, callback){
    var self = this;
    var taskResponses = [];

    self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: entering method');
    async.each(data.items, function(item, asyncCallback){
        if(item.collection === 'syncStart' && !item.rootJobId && !item.jobId){
            self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: Found unsolicited update data: %j', item);
            var newRootJobId = uuid.v4();
            var newJobId = newRootJobId;
            var syncStartDomain = metaStampUtil.getDomainFromMetastamp(item.metaStamp, self.vistaId);

            self._createUnsolicitedUpdateJobStatus(self.vistaId, syncStartDomain, item.pid, newJobId, self.environment.jobStatusUpdater, self.log, function(error, response){
                if(error){
                    self.log.error('vista-record-poller._createJobsForUnsolicitedUpdates: got error when trying to create job status for unsolicited update. data: %j; error: %s', item, error);
                } else {
                    item.rootJobId = newRootJobId;
                    item.jobId = newJobId;
                }

                taskResponses.push(response);
                asyncCallback(error);
            });
        } else {
            asyncCallback(null);
        }
    }, function(error){
        self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: completed method. error: %s, response: %s', error, taskResponses);
        callback(error, taskResponses);
    });
};

//--------------------------------------------------------------------------------------------
// This method creates the JDS job status for the unsolicited update poller job.
// This job tracks whether the unsolicited update has been stored; it is closed by the VistaRecordProcessor after
// it processes the metastamp.
//
// vistaId - The site hash for the vistaId that this handler is configured to process.
// domain - The domain for which to create the vista poller job
// pid - The pid that identifies the patient.
// job - The Job that is being processed.
// pollerJobId - The job ID for the job that will be logged in JDS to represent the job that the
//               poller will process.  Note the poller does not get this job from a tube - rather
//               it will get it from VistA when the sync message is received.
// jobStatusUpdater - The handle to the module that is used to update job status in the JDS.
// log - The logger to be used to log messages.
// callback - This is the callback that is called back after the job status has been created.
//--------------------------------------------------------------------------------------------
Poller.prototype._createUnsolicitedUpdateJobStatus = function(vistaId, domain, pid, pollerJobId, jobStatusUpdater, log, callback) {
    var self = this;

    log.debug('vista-record-poller._createUnsolicitedUpdateJobStatus: Entering method. vistaId: %s; pid: %j; pollerJobId: %s', vistaId, pid, pollerJobId);
    var patientIdentifier = idUtil.create('pid', pid);
    var record = null;
    var eventUid = null;
    var meta = {
        rootJobId: pollerJobId,
        jobId: pollerJobId,
        jpid: uuid.v4()
    };
    var isHdr = self.isVistaHdr;
    var pollerJob;
    if (!isHdr) {
        pollerJob = jobUtil.createVistaPollerDomainRequest(vistaId, domain, patientIdentifier, record, eventUid, meta);
    }
    else {
        pollerJob = jobUtil.createVistaHdrPollerRequest(vistaId, patientIdentifier, record, eventUid, meta);
    }
    jobStatusUpdater.createJobStatus(pollerJob, function (error, response) {
        // Note - right now JDS is returning an error 200 if things worked correctly.   So
        // we need to absorb that error.
        //--------------------------------------------------------------------------------
        if ((error) && (String(error) === '200')) {
            callback(null, response);
        }
        else {
            callback(error, response);
        }
    });
};

module.exports = Poller;