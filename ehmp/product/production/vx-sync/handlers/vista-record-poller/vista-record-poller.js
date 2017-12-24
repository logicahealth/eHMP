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
var vistaSyncUtil = require(global.VX_UTILS + 'vista-sync-util');
var util = require('util');
var moment = require('moment');

//---------------------------------------------------------------------------------
// Constructor for this class - This class inherits from events.EventEmitter. (REMOVAL PENDING)
//
// log: The log to use when logging messages.
// vistaId: The site code for the site associated with this poller.
// config: The general configuration information.
// environment: Cross cutting environment handles, etc.
// start: if this coerces to 'true', then the poller will start automatically
//      when the Poller is instantiated.
// multipleMode: If this poller is running in mulitple poller mode - then this is
//               true.  Otherwise it is false.
//----------------------------------------------------------------------------------
var Poller = function (log, vistaId, config, environment, start, multipleMode) {
    log.debug('vista-record-poller.constructor: Entered constructor: vistaId: %s; start: %s; multipleMode: %s.', vistaId, start, multipleMode);

    this.vistaId = vistaId;
    this.environment = environment;
    this.config = config;
    this.metrics = environment.metrics;
    this.log = logUtil.getAsChild('vistaRecordPoller-' + vistaId, log);
    this.paused = !start;
    this.readyToShutdown = !start;
    this.allocationToken = '';
    this.allocationStatus = 'complete';
    this.multipleMode = false;
    if (_.isBoolean(multipleMode)) {
        this.multipleMode = multipleMode;
    }
    this.pollDelayMillis = 1000;
    this.lastUpdateTime = '0';
    this.vprUpdateOpData = new VprUpdateOpData(this.log, vistaId, environment.jds);
    this.vistaProxy = new VistaClient(log, this.metrics, config);
    this.errorPublisher = environment.errorPublisher;
    this.isVistaHdr = idUtil.isVistaHdrSite(vistaId, config);
    if (this.isVistaHdr) {
        this.vistaProxy = new HdrClient(log, this.metrics, config);
    } else {
        this.vistaProxy = new VistaClient(log, this.metrics, config);
    }
    this.hmpBatchSize = this.getBatchSize();
    this.success = false;

    // This will be used to hold batch errors that have occurred and the last time each was published.
    // The attribute name will be the text of the error message and the value will be the time to the second
    // when it was last published.
    // The following is an example of how it will look:
    // {
    //   'Invalid JSON with hmpBatchSize = 1': '20170213101235',
    //   'VistA Allocations Locked': '20170213101850'
    // }
    //-------------------------------------------------------------------------------------------------------
    this.lastBatchErrors = {};

    // This is being logged at the warn level so that the message is output in production settings at their minimum
    // logging level.
    //--------------------------------------------------------------------------------------------------------------
    if (this.multipleMode) {
        log.warn('vista-record-poller.constructor: Poller for site: %s is running in multiple poller mode.', vistaId);
    } else {
        log.warn('vista-record-poller.constructor: Poller for site: %s is running in single poller mode.', vistaId);
    }

};

//-----------------------------------------------------------------------------------
// This method starts the polling process.
//
// callback: The callback handler to call when the process is started.
//-----------------------------------------------------------------------------------
Poller.prototype.start = function (callback) {
    var self = this;

    if (!self.multipleMode) {
        self._getLastUpdateTimeFromJds(function (error, response) {
            // If we have an error here - we need to stop what we are doing - it is fatal.
            //-----------------------------------------------------------------------------
            if (error) {
                self.log.error('vista-record-poller.start: Failed to retrieve last update time from JDS.  error: %s; response: %s', error, response);
                self.errorPublisher.publishPollerError(self.vistaId, error, function () {
                });
                return callback('vista-record-poller.start: Failed to retrieve last update time from JDS.  error: ' + error, response);
            }

            self.log.debug('vista-record-poller.start: Received infromation lastUpdateTime from jds.  response: %s', response);

            if (response) {
                self.lastUpdateTime = response;
            }

            // Now that we have primed our lastUpdateTime - we can now proceed to poll VistA
            //------------------------------------------------------------------------------

            self.log.debug('vista-record-poller.start: poller started (Single Poller Mode)');
            self.doNext();

            // TODO: Pick this value up from JDS
            //----------------------------------
            return callback(null, 'success');
        });
    } else {
        // Now that we have primed our lastUpdateTime - we can now proceed to poll VistA
        //------------------------------------------------------------------------------
        self.log.debug('vista-record-poller.start: poller started (Multiple Poller Mode)');
        self.doNext();
        return setTimeout(callback, 0, null, 'success');
    }
};

//--------------------------------------------------------------------------------------
// This method pauses the polling process.
//--------------------------------------------------------------------------------------
Poller.prototype.pause = function () {
    this.log.debug('vista-record-poller.pause()');
    this.paused = true;
};

//--------------------------------------------------------------------------------------
// This method resumes the polling process.
//--------------------------------------------------------------------------------------
Poller.prototype.resume = function () {
    this.log.debug('vista-record-poller.resume()');
    this.paused = false;
};

Poller.prototype.isReadyToShutdown = function () {
    this.log.debug('vista-record-poller.isReadyToShutdown(): ' + this.readyToShutdown);
    return this.readyToShutdown;
};

//--------------------------------------------------------------------------------------
// This method resets the lastUpdatedTime to '0'.
//--------------------------------------------------------------------------------------
Poller.prototype.reset = function () {
    this.log.debug('vista-record-poller.reset()');
    this.lastUpdateTime = '0';
};


Poller.prototype.getStatus = function () {
    this.log.debug('vista-record-poller.getStatus()');

    return {
        vista: this.vistaId,
        status: this.paused ? 'paused' : 'running',
        lastUpdateTime: this.lastUpdateTime
    };
};

Poller.prototype.getVistaId = function () {
    return this.vistaId;
};

Poller.prototype.getBatchSize = function () {
    if (this.isVistaHdr) {
        return this.config.hdr.pubsubConfig.maxBatchSize;
    } else {
        return this.config['hmp.batch.size'];
    }
};

//--------------------------------------------------------------------------------------
// This method is run every time the 'next' event is fired.
//--------------------------------------------------------------------------------------
Poller.prototype.doNext = function () {
    var self = this;

    if (self.paused) {
        self.log.debug('vista-record-poller.doNext: paused == true, SKIPPING Polling for new batch of data from vista [%s]', self.vistaId);
        self.readyToShutdown = true;
        return poll(self, self.pollDelayMillis);
        // return waitAndThenPoll(this);
    } else {
        self.readyToShutdown = false;
    }
    if (self.isVistaHdr && !idUtil.isHdrPubSubMode(self.config)) {
        self.log.debug('vista-record-poller.doNext: HDR pub/sub mode is off, HDR site: %s', self.vistaId);
        return poll(self, self.pollDelayMillis * 10);
    }

    if (self.multipleMode) {
        self.log.debug('vista-record-poller.doNext: Polling for new batch of data  (Multiple Poller Mode) from vista [%s].  allocationToken: %s', self.vistaId, self.allocationToken);
        self.vistaProxy.fetchNextBatchMultipleMode(self.vistaId, self.allocationToken, self.allocationStatus, self.hmpBatchSize, self._processResponse.bind(self));
    } else {
        self.log.debug('vista-record-poller.doNext: Polling for new batch of data (Single Poller Mode) from vista [%s]', self.vistaId);
        self.vistaProxy.fetchNextBatch(self.vistaId, self.lastUpdateTime, self.hmpBatchSize, self._processResponse.bind(self));
    }
};

//-----------------------------------------------------------------------------------------------
// This method takes the given error and updates the time on the lastBatchErrors for this error
// to be the current time.
//
// error: The text of the error that will be tracked in the lastBatchError object.
//-----------------------------------------------------------------------------------------------
Poller.prototype._updateLastBatchErrorPublishTime = function (error) {
    var self = this;

    self.lastBatchErrors[error] = moment();
};

//-----------------------------------------------------------------------------------------------
// This method checks the lastBatchErrors array for the given error message and checks to see
// if the message needs to be published again based on how much time should pass before publishing
// a duplicate error.  If the error has never been published or the amount of time that should be
// waited before re-publishing has passed, it should return true so that the error will be logged
// and published again.
//
// error: The text of the error that will be tracked in the lastBatchError object.
//-----------------------------------------------------------------------------------------------
Poller.prototype._isErrorPublishNeeded = function (error) {
    var self = this;

    // If it was not in the list - then no need to proceed further - return true.
    //----------------------------------------------------------------------------
    var lastErrorTime = self.lastBatchErrors[error];
    if (!lastErrorTime) {
        return true;
    }

    // If we got here - figure out how long it has been since we pushed out the error information
    // If it has been longer than our configured time duration - then return true - otherwise
    // return false.
    //--------------------------------------------------------------------------------------------
    var maxTimeDuration = self.config.pollerIgnoreDuplicateErrorTime || 900;       // Default to 15 minutes if it is not configured.
    var dupExpiredTime = moment().subtract(maxTimeDuration, 'seconds');

    if (lastErrorTime.isBefore(dupExpiredTime)) {
        return true;
    }

    // If we got here - then it means we do not need to log this one - we have not waited long enough.
    //------------------------------------------------------------------------------------------------
    return false;

};

//------------------------------------------------------------------------------------------------
// This method processes the response that was received from the VistA system.  This is
// method is called as a result of a callback on the Vista - fetchNextBatch method.
//
// error: The error that occured when fetching the data from VistA - or null if no error occurred.
// wrappedResponse: The response information from VistA.
//-------------------------------------------------------------------------------------------------
Poller.prototype._processResponse = function (error, wrappedResponse) {
    var self = this;

    // If we have an error - but fetch has ratcheted the batch size all the way down to one message chunk,
    // we can safely log the error for this one offending chunk, and set the lastUpdateTime to move on, so that
    // we can continue processing messages.
    //----------------------------------------------------------------------------------------------------------
    if ((error) && (wrappedResponse) && (wrappedResponse.errorData) && (wrappedResponse.errorData.message === self.vistaProxy.ERROR_LIST.INVALID_JSON_ERROR)) {
        return self._handleInvalidJSONWithSingleMessage(error, wrappedResponse);
    } else if (error) {
        return self._handleBatchErrorGeneral(error, wrappedResponse);
    } else {
        return self._handleBatchSuccess(wrappedResponse);
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method is used to handle the case where fetching a batch returns one that has only one message and an
// error  This case happens when there is a JSON parsing error that has been reduced down to one message in size.
// This means that this is the message that cannot be parsed - so log it and move on
//
// error: The error that occurred.
// wrappedResponse: The response that was given back from the fetch.
//----------------------------------------------------------------------------------------------------------------
Poller.prototype._handleInvalidJSONWithSingleMessage = function (error, wrappedResponse) {
    var self = this;
    self.success = false;
    // This means that we have found our offending record.  We need to make sure the next batch size is back to normal now.
    //---------------------------------------------------------------------------------------------------------------------
    self.hmpBatchSize = self.getBatchSize();

    var errorMessage = util.format('vista-record-poller._handleBatchErrorWithSingleMessage: Received failed message with hmpBatchSize=1.   Setting poller to skip this message. Error: %s; rawResponse: %s', error, wrappedResponse.rawResponse);
    self.errorPublisher.publishPollerError(self.vistaId, errorMessage, function () {
    });
    self.log.error(errorMessage);

    if (self.multipleMode) {
        var messageAllocationToken = vistaSyncUtil.extractAllocationTokenFromRawResponse(self.log, wrappedResponse.rawResponse);
        if ((_.isString(messageAllocationToken)) && (!_.isEmpty(messageAllocationToken))) {
            self.allocationToken = messageAllocationToken;
            self.allocationStatus = 'rejected';
            return poll(self);
        } else {
            self.errorPublisher.publishPollerError(self.vistaId, 'Failed to parse allocationToken from batch message.', function () { });
            self.log.error('vista-record-poller._handleBatchErrorWithSingleMessage: Failed to extract allocationToken from message.');

            // There is nothing we can do now.  So we will keep going.   Eventually the bad message will timeout on the Vista Side and
            // be given out again.   But that will eventually cause VistA to go into lockdown mode.   Which will alert someone to
            // resolve this bad message.
            //-------------------------------------------------------------------------------------------------------------------------
            self.allocationToken = '';
            self.allocationStatus = 'complete';
            return poll(self, self.pollDelayMillis);
        }
    } else {
        var messagelastUpdateTime = self._extractLastUpdateFromRawResponse(wrappedResponse.rawResponse);
        if ((_.isString(messagelastUpdateTime)) && (!_.isEmpty(messagelastUpdateTime))) {
            self._storeLastUpdateTime({lastUpdate: messagelastUpdateTime}, function (error, response) {
                if (error) {
                    self.errorPublisher.publishPollerError(self.vistaId, error, function () { });
                    self.log.error('vista-record-poller._handleBatchErrorWithSingleMessage: Failed to store lastUpdateTime.  lastUpdateTime: messagelastUpdateTime: %s; response: %s', messagelastUpdateTime, response);
                    return poll(self, self.pollDelayMillis);
                } else {
                    return poll(self);
                }
            });
        } else {
            self.log.error('vista-record-poller._handleBatchErrorWithSingleMessage: Failed to store lastUpdateTime.  Could not extract lastUpdate from the rawResponse.');
            return poll(self, self.pollDelayMillis);
        }
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method is used to handle a batch level general error that is returned from the batch.
//
// error: The error that occurred.
// wrappedResponse: The response that was given back from the fetch.
//----------------------------------------------------------------------------------------------------------------
Poller.prototype._handleBatchErrorGeneral = function (error, wrappedResponse) {
    var self = this;

    var lastErrorKey;
    if ((wrappedResponse) && (wrappedResponse.errorData) && (wrappedResponse.errorData.message)) {
        lastErrorKey = wrappedResponse.errorData.message;
    }

    // Publish and log the error if the error we received did not have a "consistent key" we could
    // track against, or if it does and if it is not a duplicate or if it is one and we have
    // surpassed our wait time.
    //------------------------------------------------------------------------------------------------
    if ((!lastErrorKey) || (self._isErrorPublishNeeded(lastErrorKey))) {
        self.log.error('vista-record-poller.processResponse: Failed to invoke vista [%s]', error);
        self.errorPublisher.publishPollerError(self.vistaId, error, function () {
        });

        if (lastErrorKey) {
            self._updateLastBatchErrorPublishTime(lastErrorKey);
        }
    }

    self.success = false;
    self.hmpBatchSize = self.getBatchSize();
    self.environment.metrics.warn('Vista record poller in error', {
        'error': error,
        'process': process.pid,
        'site': self.vistaId
    });

    // If we are in multiple poller mode - we need to make sure we are set up for the next message
    // Since we cannot process this message - we should alert VistA that the allocation should
    // be timed out so that the reduction algorithm will occur and we can get this message processed.
    //--------------------------------------------------------------------------------------------
    if (self.multipleMode) {
        var data = null;
        if ((wrappedResponse) && (wrappedResponse.data)) {
            data = wrappedResponse.data;
        }
        self._updateAllocationInfoSynchronous(data, 'timeout');
        // If there was an allocationToken in the data - then the status will be timeout.  If there was not one, then
        // it will be treated as if we were not given anything.
        //------------------------------------------------------------------------------------------------------------
        if (self.allocationStatus === 'timeout') {
            self.log.warn('vista-record-poller._handleBatchErrorGeneral: (Multiple Poller Mode) Forcing a timeout on this batch.  allocationToken: %s', self.allocationToken);
        }
    }
    return poll(self, self.pollDelayMillis);
};

//----------------------------------------------------------------------------------------------------------------
// This method is used to handle a successful retrieval of a batch from Vista.
//
// wrappedResponse: The response that was given back from the fetch.
//----------------------------------------------------------------------------------------------------------------
Poller.prototype._handleBatchSuccess = function (wrappedResponse) {
    var self = this;
    var data = wrappedResponse.data;

    // Poller may have found some responses that were considered bad JSON.  If it happens, it will start reducing the batch size until it gets
    // a message that it can parse.  When that happens, on the next fetch, we want to use that size, until we find the offending JSON chunk and
    // push that offending JSON chunk to the top of our list so that we can error that one chunk out and move forward.   This will set batch size for
    // the next fetch.
    //------------------------------------------------------------------------------------------------------------------------------------------------
    self.hmpBatchSize = wrappedResponse.hmpBatchSize || self.getBatchSize();

    if (self.success === true) {
        self.hmpBatchSize = self.getBatchSize();  //two successful messages from Vista, reset batch size
    }

    self.success = true;
    self.log.debug('vista-record-poller._handleBatchSuccess: Received batch of data.  Length: [%s];  data: [%j]', (data ? data.totalItems : 0), data);
    if (data && data.items && data.items.length > 0) {
        self._processBatch(data, function (error, result) {
            self.log.debug('vista-record-poller._handleBatchSuccess: Returned from calling _processBatch.  Error: %s; result: %s', error, result);
            // if (!result) {
            //     result = error;
            //     error = undefined;
            // }
            //
            if (error) {
                self.errorPublisher.publishPollerError(self.vistaId, error, function () {
                });
                self.log.warn('vista-record-poller._handleBatchSuccess: Failed to process records [%s]', error);

                // If in multiple mode implement the reduction algorithm by forcing a
                // timeout of this batch on VistA.
                //--------------------------------------------------------------------------
                if (self.multipleMode) {
                    self._updateAllocationInfoSynchronous(data, 'timeout');
                    self.log.warn('vista-record-poller._handleBatchSuccess: (Multiple Poller Mode) Forcing a timeout on this batch.');
                }

                poll(self, self.pollDelayMillis);
            } else {
                self.log.debug('vista-record-poller._handleBatchSuccess: Finished process batch of data');
                poll(self);
            }
        });
    } else if (data) {
        if (self.multipleMode) {
            self._updateAllocationInfoSynchronous(data, 'complete');
        }
        poll(self, self.pollDelayMillis);
    } else {
        // If we got no data back - there is no allocation to "complete".
        //----------------------------------------------------------------
        if (self.multipleMode) {
            self.allocationToken = '';
            self.allocationStatus = 'complete';
        }
        poll(self, self.pollDelayMillis);
    }

};

//-------------------------------------------------------------------------------------------
// If VistA sends back a response that  cannot be parsed as JSON, we need to see if we can
// find the lastUpdate value in this - by simply locating it through a string search.
//
// rawResponse: The string form of the response from VistA.
//-------------------------------------------------------------------------------------------
Poller.prototype._extractLastUpdateFromRawResponse = function (rawResponse) {
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
            } catch (e) {
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
Poller.prototype._processBatch = function (data, callback) {
    var self = this;
    self.log.debug('vista-record-poller._processBatch: processing batch of records');
    var processId = uuid.v4();

    var tasks = [
        self._logMetrics.bind(self, processId, 'start'),
        self._createJobsForUnsolicitedUpdates.bind(self, data),
        self._sendToVistaRecordProcessor.bind(self, data)
    ];

    if (self.multipleMode) {
        tasks.push(self._updateAllocationInfo.bind(self, data, 'complete'));
    } else {
        tasks.push(self._storeLastUpdateTime.bind(self, data));
    }

    tasks.push(self._logMetrics.bind(self, processId, 'stop'));

    // Process all the jobs that we have received
    //--------------------------------------------
    async.series(tasks, function (error, response) {
        self.log.debug('vista-record-poller._processBatch: Completed processing all the jobs.  error: %s; response: %j', error, response);
        if (error) {
            self.errorPublisher.publishPollerError(self.vistaId, error, function () {
            });
        }
        return callback(error, response);
    });
};

Poller.prototype._logMetrics = function (processId, timerValue, callback) {
    this.metrics.debug('Poller process data', {'timer': timerValue, 'process': processId, 'handler': 'vista-poller'});
    callback();
};

//----------------------------------------------------------------------------------------------------
// This method creates a job containing the batch and sends it to the Vista-Record-Processor-Request
// handler.
//
// data: The batch of data received from VistA
// callback: The callback to call when this is done.
//----------------------------------------------------------------------------------------------------
Poller.prototype._sendToVistaRecordProcessor = function (data, callback) {
    var self = this;

    var processorJob = jobUtil.createVistaRecordProcessorRequest(data, null);
    var metricObj = {'handler': 'vista-poller', 'process': uuid.v4(), 'timer': 'start'};
    self.metrics.trace('Poller send vista data to vista-record-processor.', metricObj);
    metricObj.timer = 'stop';

    self.log.debug('vista-record-poller._sendToVistaRecordProcessor: sending job to vista-record-processor-request handler.  processorJob: %j', processorJob);
    self.environment.publisherRouter.publish(processorJob, function (error) {
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
Poller.prototype._getLastUpdateTimeFromJds = function (callback) {
    var self = this;
    self.vprUpdateOpData.retrieveLastUpdateTime(function (error, response) {
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
Poller.prototype._storeLastUpdateTimeToJds = function (lastUpdateTime, callback) {
    var self = this;
    self.vprUpdateOpData.storeLastUpdateTime(lastUpdateTime, function (error, response) {
        self.log.debug('vista-record-poller._storeLastUpdateTimeToJds: Received error: %s; response: %s', error, response);
        callback(error, response);
    });
};

//---------------------------------------------------------------------------------------------
// This method places the allocation information into the object instance - so it can be used
// in the next fetch call.
//
// data: The data that was returned from Vista
// allocationStatus:  The allocation status that should be set for the next fetch.
// callback: The callback handler to call when we are done.
//---------------------------------------------------------------------------------------------
Poller.prototype._updateAllocationInfo = function (data, allocationStatus, callback) {
    var self = this;
    self._updateAllocationInfoSynchronous(data, allocationStatus);
    return setTimeout(callback, 0, null, 'success');
};

//---------------------------------------------------------------------------------------------
// This method places the allocation information into the object instance - so it can be used
// in the next fetch call.  This version of the method does not have a call back function.
//
// data: The data that was returned from Vista
// allocationStatus:  The allocation status that should be set for the next fetch.
//---------------------------------------------------------------------------------------------
Poller.prototype._updateAllocationInfoSynchronous = function (data, allocationStatus) {
    var self = this;
    if ((data) && (data.allocationToken)) {
        self.allocationToken = data.allocationToken;
        self.allocationStatus = allocationStatus;
        self.log.debug('vista-record-poller._updateAllocationInfoSynchronous: Tracking allocationToken for next fetch.  allocationToken: %s, allocationStatus: %s', data.allocationToken, allocationStatus);
    } else {
        self.allocationToken = '';
        self.allocationStatus = 'complete';
    }
};


//---------------------------------------------------------------------------------------------
// This method stores the last update time that was received in the message to JDS.
//
// data: The data that was returned from Vista
// callback: The callback handler to call when we are done.
//---------------------------------------------------------------------------------------------
Poller.prototype._storeLastUpdateTime = function (data, callback) {
    var self = this;
    if ((data) && (data.lastUpdate)) {
        self.log.debug('vista-record-poller._storeLastUpdateTime: Storing new lastUpdateTime: %s', data.lastUpdate);
        self._storeLastUpdateTimeToJds(data.lastUpdate, function (error, response) {
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
// This method extracts all of the unsolicitied updates from a VistA data batch, then it calls
// the _createUnsolicitedUpdateJobStatus() method for any unsolicited update data found.
//
// data - a batch of VistA data
// callback - This is the callback that is called back after the method has completed.
//--------------------------------------------------------------------------------------------
Poller.prototype._createJobsForUnsolicitedUpdates = function (data, callback) {
    var self = this;
    var taskResponses = [];

    self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: entering method');

    var unsolicitedUpdateItems = _.filter(data.items, function(item) {
        return item.collection === 'syncStart' && !item.rootJobId && !item.jobId;
    });

    // Limit this to prevent system overload in case of a high number of unsolicited updates at once.
    async.eachLimit(unsolicitedUpdateItems, 10, function(item, asyncCallback) {
        self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: Found unsolicited update data: %j', item);

        var metaStamp = item.metaStamp;
        var errorMessage;
        if (!metaStamp) {
            errorMessage = util.format('vista-record-poller._createJobsForUnsolicitedUpdates: unsolicited update syncStart missing metastamp: %j', item);
            self.log.error(errorMessage);
            self.errorPublisher.publishPollerError(self.vistaId, item, errorMessage, function() {});
            return asyncCallback(null);
        }

        var syncStartDomain = metaStampUtil.getDomainFromMetastamp(metaStamp, self.vistaId);
        if (!syncStartDomain) {
            errorMessage = util.format('vista-record-poller._createJobsForUnsolicitedUpdates: unable to determine domain of unsolicited update syncStart: %j', item);
            self.log.error(errorMessage);
            self.errorPublisher.publishPollerError(self.vistaId, item, errorMessage, function() {});
            return asyncCallback(null);
        }

        var newRootJobId = uuid.v4();
        var newJobId = newRootJobId;

        self._createUnsolicitedUpdateJobStatus(self.vistaId, syncStartDomain, item.pid, newJobId, self.environment.jobStatusUpdater, self.log, function(error, response) {
            if (error) {
                var errorMessage = util.format('vista-record-poller._createJobsForUnsolicitedUpdates: got error when trying to create job status for unsolicited update. data: %j; error: %s', item, error);
                self.log.error(errorMessage);
                self.errorPublisher.publishPollerError(self.vistaId, item, errorMessage, function() {});
                return asyncCallback(null);
            }

            item.rootJobId = newRootJobId;
            item.jobId = newJobId;
            taskResponses.push(response);
            asyncCallback(null);
        });
    }, function() {
        self.log.debug('vista-record-poller._createJobsForUnsolicitedUpdates: completed method. responses: %s', taskResponses);
        callback(null, taskResponses);
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
Poller.prototype._createUnsolicitedUpdateJobStatus = function (vistaId, domain, pid, pollerJobId, jobStatusUpdater, log, callback) {
    var self = this;

    log.debug('vista-record-poller._createUnsolicitedUpdateJobStatus: Entering method. vistaId: %s; pid: %j; pollerJobId: %s', vistaId, pid, pollerJobId);
    var patientIdentifier = idUtil.create('pid', pid);
    var record = null;
    var eventUid = null;
    var meta = {
        rootJobId: pollerJobId,
        jobId: pollerJobId,
    };
    var isHdr = self.isVistaHdr;
    var pollerJob;
    if (!isHdr) {
        pollerJob = jobUtil.createVistaPollerDomainRequest(vistaId, domain, patientIdentifier, record, eventUid, meta);
    } else {
        pollerJob = jobUtil.createVistaHdrPollerRequest(vistaId, patientIdentifier, record, eventUid, meta);
    }
    jobStatusUpdater.createJobStatus(pollerJob, function(error, response) {
        // Note - right now JDS is returning an error 200 if things worked correctly.   So
        // we need to absorb that error.
        //--------------------------------------------------------------------------------
        if ((error) && (String(error) === '200')) {
            callback(null, response);
        } else {
            callback(error, response);
        }
    });
};

module.exports = Poller;
