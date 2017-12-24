'use strict';

var _ = require('underscore');
var util = require('util');
var objUtil = require(global.VX_UTILS + 'object-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var logUtil = require(global.VX_UTILS + 'log');
var uuid = require('node-uuid');
var vistaSyncUtil = require(global.VX_UTILS + 'vista-sync-util');
//var async = require('async');

var rpcClients = [];


//-------------------------------------------------------------------------------------
// Constructor for VistaClient.
//
// log - The logger to be used to log messages.
// config - The configuration information that was established for this environment.
// rpcClient - The handle to the client used to make RPC calls to VistA.
//-------------------------------------------------------------------------------------
function VistaClient(log, metrics, config, rpcClient) {
    var self = this;
    if (!(this instanceof VistaClient)) {
        return new VistaClient(log, metrics, config, rpcClient);
    }

    // Set up our error constants
    //----------------------------
    this.ERROR_LIST = {
        INVALID_JSON_ERROR: 'Invalid JSON with hmpBatchSize = 1',
        RPC_ERROR: 'RPC Error',
        INVALID_CONFIGURATION_ERROR: 'Invalid Configuration',
        VISTA_LOCK_DOWN_MODE: 'VistA Allocations Locked',
        INVALID_BATCH_SIZE: 'Invalid batch size'
    };

    this.log = log;
    // this.log = require('bunyan').createLogger({
    //     name: 'vista-client',
    //     level: 'debug'
    // });
    this.rpcLog = logUtil.get('rpc', log);
    this.config = config;
    this.metrics = metrics;
    this.hmpServerId = config['hmp.server.id'];
    this.hmpVersion = config['hmp.version'];
    this.hmpBatchSize = config['hmp.batch.size'];
    this.extractSchema = config['hmp.extract.schema'];
    log.debug('vista-client.constructor: creating vista subscribe proxy');
    if (rpcClient) {
        this.rpcClient = rpcClient;
    } else {
        this.rpcClient = require('vista-js').RpcClient;
    }
    _.each(config.vistaSites, function (siteConfig, siteId) {
        log.debug('vista-client.constructor: siteId: %s, siteConfig: %j', siteId, siteConfig);
        if (!rpcClients[siteId]) {
            var vistaConfig = _.clone(siteConfig);
            vistaConfig.context = 'HMP SYNCHRONIZATION CONTEXT';
            rpcClients[siteId] = new self.rpcClient(self.rpcLog, vistaConfig);
            log.debug('vista-client.constructor: rpcClient for siteId: %s added to rpcClients array.', siteId);
        } else {
            log.debug('vista-client.constructor: rpcClient for siteId: %s Failed to be added to rpcClients array.', siteId);
        }
    });
}

VistaClient.prototype.childInstance = function (log) {
    var newInstance = new VistaClient(log, this.metrics, this.config);

    return newInstance;
};

VistaClient.prototype._getRpcClient = function (vistaId) {
    if (rpcClients[vistaId]) {
        return rpcClients[vistaId];
    } else {
        return null;
    }
};

/**
 * This function invokes the HMP SUBSCRIPTION STATUS RPC to determine the subscriptiong
 * status of the provided DFN on the client's connected server.
 *
 * patientIdentifier - Should be a PID value for a VistA source
 * statusCallback - Callback function to receive results
 */
VistaClient.prototype.status = function (patientIdentifier, statusCallback) {
    var vistaId = patientIdentifier.split(';')[0];
    var dfn = patientIdentifier.split(';')[1];
    var self = this;
    var rpcClient = self._getRpcClient(vistaId);

    var params = {
        '"server"': self.hmpServerId,
        '"localId"': dfn
    };

    rpcClient.execute('HMP SUBSCRIPTION STATUS', params, function (error, response) {
        if (!error) {
            try {
                var result = JSON.parse(response);
                result.siteId = vistaId;
                return statusCallback(null, result);
            } catch (e) {
                self.log.error('VistaClient.status() : ERROR - %j', e);
                error = e;
            }
        }

        statusCallback(error);
    });
};

//-------------------------------------------------------------------------------------
// This function makes an RPC call to VistA to subscribe the patient.
//
// vistaId - The site hash for the vistaId that this handler is configured to process.
// patientIdentifier - This is an object that represents the patient identifier.  It
//                     must be a pid for the site represented in vistaId.
// rootJobId - This is the job Id of the root job that triggered this subscription
// jobId - This is the job Id of the job that represents the poller's job when it
//         receives the data for this patient.
// priority - The priority of the job.
// referenceInfo - Reference information that should be passed to Vista.
// subscribeCallback - The is the function that is called when the RPC call is completed.
//-------------------------------------------------------------------------------------
VistaClient.prototype.subscribe = function (vistaId, patientIdentifier, rootJobId, jobId, priority, referenceInfo, subscribeCallback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'subscribe',
        'pid': patientIdentifier.value,
        'site': vistaId,
        'jobId': jobId,
        'priority': priority,
        'rootJobId': rootJobId,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Subscribe', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.subscribe: vistaId: %s; patient: %j; rootJobId: %s; jobId: %s', vistaId, patientIdentifier, rootJobId, jobId);
    var pid = patientIdentifier.value;
    var dfn = idUtil.extractDfnFromPid(pid);

    self.log.debug('vista-client.subscribe: rpcConfig for pid: %s', pid);
    var rpcClient = self._getRpcClient(vistaId);

    var params;

    if (rpcClient) {
        params = {
            '"server"': self.hmpServerId,
            '"command"': 'putPtSubscription',
            '"localId"': dfn,
            '"rootJobId"': rootJobId,
            //'"jobId"': jobId,
            '"HMPSVERS"': '1'
        };
        if (priority) {
            params['\"HMPPriority\"'] = priority.toString();
        }
        if (!_.isEmpty(referenceInfo)) {
            _.each(referenceInfo, function (value, key) {
                if ((value) && (key)) {
                    params['\"refInfo-' + key + '\"'] = value;
                }
            });
        }
        _.each(jobId, function (domainAndJobId) {
            params['\"jobDomainId-' + domainAndJobId.domain + '\"'] = domainAndJobId.jobId;
        });
        self.log.debug('putPtSubscription param %j', params);
        rpcClient.execute('HMPDJFS API', params, function (error, response) {
            self.log.debug('vista-client.subscribe: Completed calling RPC for pid: %s; error: %s', pid, error);
            var responseWithoutPwd = objUtil.removeProperty(objUtil.removeProperty(response, 'accessCode'), 'verifyCode');
            self.log.debug('vista-client.subscribe: Completed calling RPC for pid: %s; result: %j', pid, responseWithoutPwd);
            if (!_.isObject(response)) {
                try {
                    response = JSON.parse(response);
                } catch (parseError) {
                    error = 'Could not parse response: ' + response + '. Error is: ' + parseError;
                }
            }
            if (response && response.error && response.error.message) {
                error = response.error.message;
            }
            if (!error) {
                return handleSuccessfulResponse(response, pid);
            } else {
                return handleFailedRequestResponse(error, response, pid);
            }
        });
    } else {
        self.metrics.debug('Vista Subscribe in Error', metricsObj);
        return handleFailedRequestResponse('Failed to subscribe patient for pid: ' + pid + ', invalid config', null, pid);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // vistaResponse - the result returned from VistA through the RPC.
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(vistaResponse, pid) {
        self.log.info('vista-client.handleSuccessfulResponse: successfully subscribed for patient %s', pid);
        var vistaResponseWithoutPwd = objUtil.removeProperty(objUtil.removeProperty(vistaResponse, 'accessCode'), 'verifyCode');
        self.metrics.debug('Vista Subscribe', metricsObj);
        self.log.debug('vista-client.handleSuccessfulResponse: response for pid: %s; response: %s', pid, vistaResponseWithoutPwd);
        return subscribeCallback(null, 'success');
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // response - The result returned from VistA through the RPC
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleFailedRequestResponse(error, response, pid) {
        var errorMessage = 'Subscribe error for pid: ' + pid + '; error: ' + error;
        self.metrics.debug('Vista Subscribe in Error', metricsObj);
        self.log.error('vista-client.handleFailedRequestResponse: %s response: %j', errorMessage, response);
        return subscribeCallback(errorMessage, null);
    }
};

//-----------------------------------------------------------------------------------------------
// This method fetches the next batch of messages from a VistA site.
//
// vistaId: The vista site to fetch from.
// lastUpdateTime: The last time a fetch was done to this site.
// hmpBatchSize:  This is the setting for hmpBatchSize.
// batchCallBack: The callback function to call when the fetch completes.
//-----------------------------------------------------------------------------------------------
VistaClient.prototype.fetchNextBatch = function (vistaId, lastUpdateTime, hmpBatchSize, batchCallback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'fetchNextBatch',
        'site': vistaId,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Fetch Next', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.fetchNextBatch: Entering VistaClient.fetchNextBatch vistaId: %s.  lastUpdateTime: %s', vistaId, lastUpdateTime);

    self.log.debug('vista-client.fetchNextBatch: rpcConfig for fetchNextBranch: %s', vistaId);
    var rpcClient = self._getRpcClient(vistaId);

    var params;

    if (rpcClient) {
        params = {
            '"command"': 'getPtUpdates',
            '"lastUpdate"': lastUpdateTime,
            '"getStatus"': true,
            '"max"': String(hmpBatchSize),
            '"hmpVersion"': self.hmpVersion,
            '"extractSchema"': self.extractSchema,
            '"server"': self.hmpServerId
        };
        rpcClient.execute('HMPDJFS API', params, function (error, response) {
            self.log.info('vista-client.fetchNextBatch: Completed calling RPC: getPtUpdates: for vistaId: %s; error: %s', vistaId, error);
            self.log.trace('vista-client.fetchNextBatch: Completed calling RPC: getPtUpdates: for vistaId: %s; response (String): %s', vistaId, response);
            if ((!error) && (response)) {
                var jsonResponse;
                try {
                    jsonResponse = JSON.parse(response);
                    self.log.debug('vista-client.fetchNextBatch: Completed calling RPC: getPtUpdates: for vistaId: %s', vistaId);
                    self.log.trace('vista-client.fetchNextBatch: Completed calling RPC: getPtUpdates: for vistaId: %s; jsonResponse: %j', vistaId, jsonResponse);
                } catch (e) {
                    if ((hmpBatchSize === 1) || (hmpBatchSize === '1')) {
                        return handleFailedRequestWithRawResponse(util.format('Failed to parse the vista response into JSON for vistaId: %s; hmpBatchSize: %s; exception: %j', vistaId, hmpBatchSize, e),
                            hmpBatchSize, response, {message: self.ERROR_LIST.INVALID_JSON_ERROR});
                    } else {
                        self.log.error('vista-client.fetchNextBatch: Failed to parse the vista response into JSON for vistaId: %s; hmpBatchSize: %s.  Attempting retry with smaller batch size of %s. response: %s', vistaId, hmpBatchSize, hmpBatchSize / 2, response);
                        return self.fetchNextBatch(vistaId, lastUpdateTime, String(Math.ceil(hmpBatchSize / 2)), batchCallback);
                    }
                }
                // This condition is generally a server error condition.  Setup is not right.
                //----------------------------------------------------------------------------
                if ((jsonResponse) && (jsonResponse.error)) {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatch: Vista returned an error condition.', hmpBatchSize, jsonResponse, jsonResponse.error);

                    // Batch level error message - most likely server lock down mode.
                    //---------------------------------------------------------------
                } else if ((jsonResponse) && (jsonResponse.data) && (jsonResponse.data.error)) {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatch: Vista returned a batch level error condition. ', hmpBatchSize, jsonResponse, jsonResponse.data.error);

                    // In some cases we may get no data - but it is not an error.  One case is if staging is not complete yet.   So look for this special case.
                    // If it occurs - it is not an error situation.  We just want to ignore it.
                    //------------------------------------------------------------------------------------------------------------------------------------------
                } else if ((jsonResponse) && (jsonResponse.warning) && (jsonResponse.warning === 'Staging is not complete yet!')) {
                    self.log.debug('vista-client.fetchNextBatch.handleFailedRequestResponse: Staging is not yet complete');
                    return handleSuccessfulResponse(jsonResponse, hmpBatchSize);

                    // Valid response
                    //---------------
                } else if ((jsonResponse) && (jsonResponse.data)) {
                    return handleSuccessfulResponse(jsonResponse, hmpBatchSize);

                    // Any other error conditions...
                    //-------------------------------
                } else {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatch: jsonResponse did not contain any data attribute.', hmpBatchSize, jsonResponse, null);
                }
            } else {
                return handleFailedRequestWithRawResponse(util.format('vista-client.fetchNextBatch: Error received from RPC call.  Error: %s', error), hmpBatchSize, response, {message: self.ERROR_LIST.RPC_ERROR});
            }
        });
    } else {
        return handleFailedRequestWithRawResponse('vista-client.fetchNextBatch: Failed to call RPC getPtUpdates for vistaId: ' + vistaId + ', invalid configuration information.',
            hmpBatchSize, null, {message: self.ERROR_LIST.INVALID_CONFIGURATION_ERROR});
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // jsonResponse - the result returned from VistA through the RPC in JSON format.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(jsonResponse, hmpBatchSize) {
        self.log.debug('vista-client.fetchNextBatch: Successfully called RPC for getPtUpdates.');
        self.metrics.debug('Vista Fetch Next', metricsObj);
        var wrappedResponse = {
            data: jsonResponse.data,
            hmpBatchSize: hmpBatchSize,
            rawResponse: null,
            errorData: null
        };
        return batchCallback(null, wrappedResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.  When
    // we have to log an error where we have not or cannot parse the response - so we need
    // to deal with it as a raw response.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    // rawVistaResponse - The result returned from VistA through the RPC in its original form.
    // errorData:  An object containing more information regarding the error that occurred.
    //----------------------------------------------------------------------------------------
    function handleFailedRequestWithRawResponse(error, hmpBatchSize, rawVistaResponse, errorData) {
        var localError = util.format('%s rawVistaResponse: %s', error, rawVistaResponse);
        self.metrics.debug('Vista Fetch Next (raw response) in Error', metricsObj);
        var wrappedResponse = {
            data: null,
            hmpBatchSize: hmpBatchSize,
            rawResponse: rawVistaResponse,
            errorData: errorData
        };
        return batchCallback(localError, wrappedResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    // vistaResponse - The result returned from VistA through the RPC
    // vistaError - The error that Vista returned.
    //-------------------------------------------------------------------------------------
    function handleFailedRequestWithParsedResponse(error, hmpBatchSize, vistaResponse, vistaError) {
        var localError = util.format('%s vistaResponse: %j', error, vistaResponse);
        self.metrics.debug('Vista Fetch Next (parsed response) in Error', metricsObj);
        var wrappedResponse = {
            data: null,
            hmpBatchSize: hmpBatchSize,
            rawResponse: null,
            errorData: vistaError
        };
        return batchCallback(localError, wrappedResponse);
    }

};


//-----------------------------------------------------------------------------------------------
// This method fetches the next batch of messages from a VistA site.
//
// vistaId: The vista site to fetch from.
// allocationToken: The last time a fetch was done to this site.
// hmpBatchSize:  This is the setting for hmpBatchSize.
// allocationStatus: The status to pass in as the allocationStatus value.  Valid values are:
//                   'complete', 'reduce', 'reject'.
// batchCallBack: The callback function to call when the fetch completes.
//-----------------------------------------------------------------------------------------------
VistaClient.prototype.fetchNextBatchMultipleMode = function (vistaId, allocationToken, allocationStatus, hmpBatchSize, batchCallback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'fetchNextBatchMultipleMode',
        'site': vistaId,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Fetch Next', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.fetchNextBatchMultipleMode: Entering VistaClient.fetchNextBatchMultipleMode vistaId: %s.  allocationToken: %s', vistaId, allocationToken);

    self.log.debug('vista-client.fetchNextBatchMultipleMode: rpcConfig for fetchNextBatchMultipleMode: %s', vistaId);
    var rpcClient = self._getRpcClient(vistaId);

    // If hmpBatchSize is not a numeric value - we have a serious issue...
    //---------------------------------------------------------------------
    if (isNaN(hmpBatchSize)) {
        return handleFailedRequestWithRawResponse('vista-client.fetchNextBatchMultipleMode: Failed to call RPC getPtUpdates for vistaId: ' + vistaId + ', hmpBatchSize was not numeric.  hmpBatchSize: \'' + hmpBatchSize + '\'',
            hmpBatchSize, null, {message: self.ERROR_LIST.INVALID_BATCH_SIZE});
    }

    if (_.isString(hmpBatchSize)) {
        hmpBatchSize = parseInt(hmpBatchSize);
    }

    var params;

    if (rpcClient) {
        params = {
            '"command"': 'getPtUpdates',
            '"getStatus"': true,
            '"allocationSize"': String(hmpBatchSize),
            '"hmpVersion"': self.hmpVersion,
            '"extractSchema"': self.extractSchema,
            '"server"': self.hmpServerId
        };

        if (allocationToken) {
            params['"allocationToken"'] = allocationToken;

            if (allocationStatus) {
                params['"allocationStatus"'] = allocationStatus;
            }
        }

        rpcClient.execute('HMPDJFS API', params, function (error, response) {
            self.log.info('vista-client.fetchNextBatchMultipleMode: Completed calling RPC: getPtUpdates: for vistaId: %s; error: %s', vistaId, error);
            self.log.trace('vista-client.fetchNextBatchMultipleMode: Completed calling RPC: getPtUpdates: for vistaId: %s; response (String): %s', vistaId, response);
            if ((!error) && (response)) {
                var jsonResponse;
                try {
                    jsonResponse = JSON.parse(response);
                    self.log.debug('vista-client.fetchNextBatchMultipleMode: Completed calling RPC: getPtUpdates: for vistaId: %s', vistaId);
                    self.log.trace('vista-client.fetchNextBatchMultipleMode: Completed calling RPC: getPtUpdates: for vistaId: %s; jsonResponse: %j', vistaId, jsonResponse);
                } catch (e) {
                    if ((hmpBatchSize === 1) || (hmpBatchSize === '1')) {
                        return handleFailedRequestWithRawResponse(util.format('Failed to parse the vista response into JSON for vistaId: %s; hmpBatchSize: %s; exception: %j', vistaId, hmpBatchSize, e),
                            hmpBatchSize, response, {message: self.ERROR_LIST.INVALID_JSON_ERROR});
                    } else {
                        // If we have a bad JSON - we want to reduce fast...  So if we asked for 500, but only got back 20 and they were bad.  No need to reduce to 250,
                        // lets reduce to 1/2 the size we actually got back.  If we cannot figure out how many is in there - we will just do simple reduction of what we
                        // asked for.
                        //-----------------------------------------------------------------------------------------------------------------------------------------------
                        var totalItems = self._extractTotalItemsFromRawResponse(response);
                        if (totalItems === 1) {
                            return handleFailedRequestWithRawResponse(util.format('Failed to parse the vista response into JSON for vistaId: %s; totalItems: %s; exception: %j', vistaId, totalItems, e),
                                1, response, {message: self.ERROR_LIST.INVALID_JSON_ERROR});
                        }

                        var newBatchSize;
                        if ((totalItems) && (totalItems <= hmpBatchSize)) {
                            newBatchSize = String(Math.ceil(totalItems / 2));
                        } else {
                            newBatchSize = String(Math.ceil(hmpBatchSize / 2));
                        }

                        // Retreive allocationToken from the message.
                        //-------------------------------------------
                        var allocationTokenFromResponse = vistaSyncUtil.extractAllocationTokenFromRawResponse(self.log, response);

                        // Without an allocationToken in the response - we cannot correctly tell VistA what to do with it.  The error response here will end up skipping this message.
                        // On the VistA side, that will result in this allocation being "timed out".  That will cause the 'reduction" algorithm to be handled by VistA and if that does
                        // not resolve it, it will end up in Vista-Sync going into "Lock Down" mode.
                        //-------------------------------------------------------------------------------------------------------------------------------------------------------------
                        if (!allocationTokenFromResponse) {
                            return handleFailedRequestWithRawResponse(util.format('Failed to parse the vista response into JSON for vistaId: %s.  There is no allocationToken.  totalItems: %s; exception: %j', vistaId, totalItems, e),
                                hmpBatchSize, response, {message: self.ERROR_LIST.INVALID_JSON_ERROR});
                        }

                        self.log.error('vista-client.fetchNextBatchMultipleMode: Failed to parse the vista response into JSON for vistaId: %s; hmpBatchSize: %s; allocationTokenFromResponse: %s.  Attempting retry with smaller batch size of %s. response: %s', vistaId, hmpBatchSize, allocationTokenFromResponse, newBatchSize, response);

                        return self.fetchNextBatchMultipleMode(vistaId, allocationTokenFromResponse, 'reduce', newBatchSize, batchCallback);
                    }
                }

                // This condition is generally a server error condition.  Setup is not right.
                //----------------------------------------------------------------------------
                if ((jsonResponse) && (jsonResponse.error)) {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatchMultipleMode: Vista returned an error condition.', hmpBatchSize, jsonResponse, jsonResponse.error);

                    // Batch level error message - most likely server lock down mode.
                    //---------------------------------------------------------------
                } else if ((jsonResponse) && (jsonResponse.data) && (jsonResponse.data.error)) {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatchMultipleMode: Vista returned a batch level error condition. ', hmpBatchSize, jsonResponse, jsonResponse.data.error);

                    // In some cases we may get no data - but it is not an error.  One case is if staging is not complete yet.   So look for this special case.
                    // If it occurs - it is not an error situation.  We just want to ignore it.
                    //------------------------------------------------------------------------------------------------------------------------------------------
                } else if ((jsonResponse) && (jsonResponse.warning) && (jsonResponse.warning === 'Staging is not complete yet!')) {
                    self.log.debug('vista-client.fetchNextBatchMultipleMode.handleFailedRequestResponse: Staging is not yet complete');
                    return handleSuccessfulResponse(jsonResponse, hmpBatchSize);

                    // Valid response
                    //---------------
                } else if ((jsonResponse) && (jsonResponse.data)) {
                    return handleSuccessfulResponse(jsonResponse, hmpBatchSize);

                    // Any other error conditions...
                    //-------------------------------
                } else {
                    return handleFailedRequestWithParsedResponse('vista-client.fetchNextBatchMultipleMode: jsonResponse did not contain any data attribute.', hmpBatchSize, jsonResponse, null);
                }
            } else {
                return handleFailedRequestWithRawResponse(util.format('vista-client.fetchNextBatchMultipleMode: Error received from RPC call.  Error: %s', error),
                    hmpBatchSize, response, {message: self.ERROR_LIST.RPC_ERROR});
            }
        });
    } else {
        return handleFailedRequestWithRawResponse('vista-client.fetchNextBatchMultipleMode: Failed to call RPC getPtUpdates for vistaId: ' + vistaId + ', invalid configuration information.',
            hmpBatchSize, null, {message: self.ERROR_LIST.INVALID_CONFIGURATION_ERROR});
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // jsonResponse - the result returned from VistA through the RPC in JSON format.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(jsonResponse, hmpBatchSize) {
        self.log.debug('vista-client.fetchNextBatchMultipleMode: Successfully called RPC for getPtUpdates.');
        self.metrics.debug('Vista Fetch Next', metricsObj);
        var wrappedResponse = {
            data: jsonResponse.data,
            hmpBatchSize: hmpBatchSize,
            rawResponse: null,
            errorData: null
        };
        return batchCallback(null, wrappedResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.  When
    // we have to log an error where we have not or cannot parse the response - so we need
    // to deal with it as a raw response.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    // rawVistaResponse - The result returned from VistA through the RPC in its original form.
    // errorData:  An object containing more information regarding the error that occurred.
    //----------------------------------------------------------------------------------------
    function handleFailedRequestWithRawResponse(error, hmpBatchSize, rawVistaResponse, errorData) {
        var localError = util.format('%s rawVistaResponse: %s', error, rawVistaResponse);
        self.metrics.debug('Vista Fetch Next (raw response) in Error', metricsObj);
        var wrappedResponse = {
            data: null,
            hmpBatchSize: hmpBatchSize,
            rawResponse: rawVistaResponse,
            errorData: errorData
        };
        return batchCallback(localError, wrappedResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // hmpBatchSize - The batch size that was used when calling the RPC.
    // vistaResponse - The result returned from VistA through the RPC
    // vistaError - The error that Vista returned.
    //-------------------------------------------------------------------------------------
    function handleFailedRequestWithParsedResponse(error, hmpBatchSize, vistaResponse, vistaError) {
        var localError = util.format('%s vistaResponse: %j', error, vistaResponse);
        self.metrics.debug('Vista Fetch Next (parsed response) in Error', metricsObj);
        var wrappedResponse = {
            data: null,
            hmpBatchSize: hmpBatchSize,
            rawResponse: null,
            errorData: vistaError
        };
        return batchCallback(localError, wrappedResponse);
    }

};

//-------------------------------------------------------------------------------------------
// If VistA sends back a response that cannot be parsed as JSON, we need to see if we can
// find the totalItems value in this - by simply locating it through a string search.  If we
// find it, then extract it and return it.  Otherwise return -1.
//
// rawResponse: The string form of the response from VistA.
// returns: The 'totalItems' in the batch returned as a numeric value or null if it coud not
//          be extracted.
//-------------------------------------------------------------------------------------------
VistaClient.prototype._extractTotalItemsFromRawResponse = function (rawResponse) {
    var self = this;

    var totalItems = null;
    if ((_.isString(rawResponse)) && (!_.isEmpty(rawResponse))) {
        // Quickest way to get this, is to extract just the allocationToken fields.  Ours should always be first.  So get them,
        // if we get an array of them throw away all but the first.  Wrap it in {} and parse it as JSON.
        //----------------------------------------------------------------------------------------------------------------
        var totalItemsFields = rawResponse.match(/\"totalItems\"\s*\:\s*\"*\d+\"*/g);
        if (_.isArray(totalItemsFields)) {
            totalItemsFields = totalItemsFields[0];
        }
        if ((_.isString(totalItemsFields)) && (!_.isEmpty(totalItemsFields))) {
            var totalItemsObj = null;
            try {
                totalItemsObj = JSON.parse('{' + totalItemsFields + '}');
                if (!isNaN(totalItemsObj.totalItems)) {
                    totalItems = parseInt(totalItemsObj.totalItems);
                }
            }
            catch (e) {
                self.log.error('viata-client._extractTotalItemsFromRawResponse: Failed to extract the totalItems value from the raw response.  rawResponse: %s', rawResponse);
            }
        }
    }

    return totalItems;
};

//-----------------------------------------------------------------------------------------
// This function retrieves the patient demographics for the given site and dfn from VistA
// and returns it as the response in the callback.
//
// vistaId: The vistaId of the site.
// dfn: The dfn of the patient.
// callback: The handler to call when the data is received.  It will pass the information
// in the response parameter of the callback.
//-----------------------------------------------------------------------------------------
VistaClient.prototype.getDemographics = function (vistaId, dfn, callback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'getDemographics',
        'site': vistaId,
        'pid': vistaId + ';' + dfn,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Get Demographics', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.getDemographics: vistaId: %s; dfn: %s', vistaId, dfn);
    var pid = vistaId + ';' + dfn;

    self.log.debug('vista-client.getDemographics: rpcConfig for pid: %s;', pid);
    var rpcClient = self._getRpcClient(vistaId);

    var params;

    if (rpcClient) {
        params = {
            '"patientId"': dfn,
            '"domain"': 'patient',
            '"extractSchema"': self.extractSchema
        };
        rpcClient.execute('HMP GET PATIENT DATA JSON', params, function (error, response) {
            self.log.debug('vista-client.getDemographics: Completed calling RPC for pid: %s; error: %s', pid, error);
            self.log.trace('vista-client.getDemographics: Completed calling RPC for pid: %s; result: %j', pid, response);
            if (!error) {
                return handleSuccessfulResponse(response, pid);
            } else {
                return handleFailedRequestResponse(error, response, pid);
            }
        });

    } else {
        return handleFailedRequestResponse('Failed to subscribe patient for pid: ' + pid + ', invalid configuration information', null, pid);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // vistaResponse - the result returned from VistA through the RPC.
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(vistaResponse, pid) {
        self.metrics.debug('Vista Get Demographics', metricsObj);
        if (typeof vistaResponse === 'string') {
            try {
                self.log.debug('vista-client.getDemographics.handleSuccessfulResponse: Response was a string - parse to an object.');
                vistaResponse = JSON.parse(vistaResponse);
            } catch (e) {
                self.log.error('vista-client.getDemographics.handleSuccessfulResponse: Failed to parse response for pid: %s; vistaResponse: %s', pid, vistaResponse);
                return callback('Failed to parse response.', vistaResponse);
            }
        }

        // Find the actual Demographics data and return that...
        //-----------------------------------------------------
        if ((vistaResponse) && (vistaResponse.data) && (vistaResponse.data.totalItems) && (vistaResponse.data.totalItems === 1) && (vistaResponse.data.items) && (vistaResponse.data.items.length === 1)) {
            self.log.debug('vista-client.getDemographics.handleSuccessfulResponse: successfully retrieved demographics for patient %s; vistaResponse: %s', pid, vistaResponse);
            return callback(null, vistaResponse.data.items[0]);
        }

        self.log.error('vista-client.getDemographics.handleSuccessfulResponse:  Response did not contain the expected data.  pid: %s; vistaResponse: %j', pid, vistaResponse);
        return callback(util.format('Response did not contain the expected data.  pid: %s; vistaResponse: %j', pid, vistaResponse), vistaResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // vistaResponse - The result returned from VistA through the RPC
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleFailedRequestResponse(error, vistaResponse, pid) {
        self.metrics.debug('Vista Get Demographics in Error', metricsObj);
        var errorMessage = 'Failed to retrieve demographics for pid: ' + pid + '; error: ' + error;
        self.log.error('vista-client.getDemographics.handleFailedRequestResponse: %s vistaResponse: %j', errorMessage, vistaResponse);
        return callback(errorMessage, null);
    }
};

//-----------------------------------------------------------------------------------------
// This function retrieves the patient data by domain from a VistA site
//
// vistaId: The vistaId of the site.
// dfn: The dfn of the patient.
// callback: The handler to call when the data is received.  It will pass the information
// in the response parameter of the callback.
//-----------------------------------------------------------------------------------------
VistaClient.prototype.getPatientDataByDomain = function (vistaId, dfn, domain, callback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'getPatientDataByDomain',
        'site': vistaId,
        'pid': vistaId + ';' + dfn,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Get Patient Data', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.getPatientDataByDomain: vistaId: %s; dfn: %s', vistaId, dfn);
    var pid = vistaId + ';' + dfn;

    self.log.debug('vista-client.getPatientDataByDomain: rpcConfig for pid: %s;', pid);
    var rpcClient = self._getRpcClient(vistaId);

    var params;

    if (rpcClient) {
        params = {
            '"patientId"': dfn,
            '"domain"': domain,
            '"extractSchema"': self.extractSchema
        };
        rpcClient.execute('HMP GET PATIENT DATA JSON', params, function (error, response) {
            self.log.debug('vista-client.getPatientDataByDomain: Completed calling RPC for pid: %s; error: %s', pid, error);
            self.log.trace('vista-client.getPatientDataByDomain: Completed calling RPC for pid: %s; result: %j', pid, response);
            if (!error) {
                return handleSuccessfulResponse(response, pid);
            } else {
                return handleFailedRequestResponse(error, response, pid);
            }
        });

    } else {
        return handleFailedRequestResponse('Failed to subscribe patient for pid: ' + pid + ', invalid configuration information', null, pid);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // vistaResponse - the result returned from VistA through the RPC.
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(vistaResponse, pid) {
        self.metrics.debug('Vista Get Patient Data', metricsObj);
        if (typeof vistaResponse === 'string') {
            try {
                self.log.debug('vista-client.getPatientDataByDomain.handleSuccessfulResponse: Response was a string - parse to an object.');
                vistaResponse = JSON.parse(vistaResponse);
            } catch (e) {
                self.log.error('vista-client.getPatientDataByDomain.handleSuccessfulResponse: Failed to parse response for pid: %s; vistaResponse: %s', pid, vistaResponse);
                return callback('Failed to parse response.', vistaResponse);
            }
        }

        // Find the actual data and return that...
        //-----------------------------------------------------
        if (vistaResponse && vistaResponse.data && !_.isUndefined(vistaResponse.data.items)) {
            self.log.debug('vista-client.getPatientDataByDomain.handleSuccessfulResponse: successfully retrieved domain data for patient %s; vistaResponse: %s', pid, vistaResponse);
            return callback(null, vistaResponse.data.items);
        }

        self.log.error('vista-client.getPatientDataByDomain.handleSuccessfulResponse:  Response did not contain the expected data.  pid: %s; vistaResponse: %j', pid, vistaResponse);
        return callback(util.format('Response did not contain the expected data.  pid: %s; vistaResponse: %j', pid, vistaResponse), vistaResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // vistaResponse - The result returned from VistA through the RPC
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleFailedRequestResponse(error, vistaResponse, pid) {
        self.metrics.debug('Vista Get Patient Data in Error', metricsObj);
        var errorMessage = 'Failed to retrieve patient data for pid: ' + pid + '; error: ' + error;
        self.log.error('vista-client.getPatientDataByDomain.handleFailedRequestResponse: %s vistaResponse: %j', errorMessage, vistaResponse);
        return callback(errorMessage, null);
    }
};

VistaClient.prototype.fetchAppointment = function (vistaId, batchCallback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'getDemographics',
        'site': vistaId,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Fetch Appointment', metricsObj);
    metricsObj.timer = 'stop';
    var rpcClient = self._getRpcClient(vistaId);

    self.log.debug('vista-client.fetchAppointment: rpcConfig for fetchAppointment');
    if (rpcClient) {
        var parameter = [];
        rpcClient.execute('HMP PATIENT ACTIVITY', parameter, function (error, response) {
            if (error) {
                return handleFailedRequestWithRawResponse(util.format('vista-client.fetchAppointment: Error received from RPC call.  Error: %s', error), response);
            }

            if (_.isEmpty(response) || (_.isString(response) && _.isEmpty(response.trim()))) {
                return handleSuccessfulResponse(JSON.parse('[]'));
            } else {
                self.log.debug('vista-client.fetchAppointment: Completed calling RPC. Got response back for vistaId: %s; response (String): %s', vistaId, response);
                var jsonResponse;
                try {
                    jsonResponse = JSON.parse(response);
                    self.log.debug('vista-client.fetchAppointment: Completed calling RPC: getPtUpdates: for vistaId: %s; jsonResponse: %j', vistaId, jsonResponse);
                    return handleSuccessfulResponse(jsonResponse);
                } catch (e) {
                    return handleFailedRequestWithRawResponse(util.format('vista-client.fetchAppointment: Failed to parse the vista response into JSON for vistaId: %s; exception: %j', vistaId, e), response);
                }

                // Commenting this code out... It should have been dead code - but could also have been bad code.  The handleSuccessfulResponse call above did not have a return
                // on it.  That would potentially cause two call backs from ths routine.  Not a good idea.  I fixed the one above - which makes this code never called.
                // commenting it out - just in case there was some reason some of this behavior was really wanted.
                //---------------------------------------------------------------------------------------------------------------------------------------------------------------
                // if (!_.isArray(jsonResponse)) {
                //     return handleFailedRequestResponse('vista-client.fetchAppointment: jsonResponse did not contain any data attribute.', jsonResponse);
                // }
            }

        });
    } else {
        return handleFailedRequestWithRawResponse('vista-client.fetchAppointment: Failed to call RPC getPtUpdates for vistaId: ' + vistaId + ', invalid configuration information.', null);
    }


    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // jsonResponse - the result returned from VistA through the RPC in JSON format.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(jsonResponse) {
        self.metrics.debug('Vista Fetch Appointment', metricsObj);
        self.log.debug('vista-subscribe.fetchAppointment.handleSuccessfulResponse: Successfully called RPC.', jsonResponse);
        return batchCallback(null, jsonResponse);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.  When
    // we have to log an error where we have not or cannot parse the response - so we need
    // to deal with it as a raw response.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // rawVistaResponse - The result returned from VistA through the RPC in its original form.
    //----------------------------------------------------------------------------------------
    function handleFailedRequestWithRawResponse(error, rawVistaResponse) {
        self.metrics.debug('Vista Fetch Appointment in Error', metricsObj);
        self.log.error('%s rawVistaResponse: %s', error, rawVistaResponse);
        return batchCallback(error, rawVistaResponse);
    }
};

//-------------------------------------------------------------------------------------
// This function makes an RPC call to VistA to unsubscribe the patient.
//
// pid - The pid of the patient to be unsubscribed.
// unsubscribeCallback - The is the function that is called when the RPC call is completed.
//-------------------------------------------------------------------------------------
VistaClient.prototype.unsubscribe = function (pid, unsubscribeCallback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'unsubscribe',
        'pid': pid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Unsubscribe', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.unsubscribe: pid: %s', pid);
    var vistaId = idUtil.extractSiteFromPid(pid);

    self.log.debug('vista-client.unsubscribe: rpcConfig for pid: %s', pid);
    var rpcClient = self._getRpcClient(vistaId);

    var params;

    if (rpcClient) {
        params = {
            '"hmpSrvId"': self.hmpServerId,
            '"pid"': pid
        };
        rpcClient.execute('HMPDJFS DELSUB', params, function (error, response) {
            self.log.debug('vista-client.unsubscribe: Completed calling RPC for pid: %s; error: %s', pid, error);
            self.log.debug('vista-client.unsubscribe: Completed calling RPC for pid: %s; result: %j', pid, response);
            if (!error) {
                return handleSuccessfulResponse(response, pid);
            } else {
                return handleFailedRequestResponse(util.format('vista-client.unsubscribe: Error received from VistA when attempting to unsubscribe patient.  error: %s; pid: %s.', error, pid), response);
            }
        });

    } else {
        return handleFailedRequestResponse(util.format('vista-client.unsubscribe: Failed to unsubscribe patient for pid: %s - invalid configuration information.', pid), null);
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a sucessful response from the RPC.
    //
    // vistaResponse - the result returned from VistA through the RPC.
    // pid - The pid that identifies the patient.
    //-------------------------------------------------------------------------------------
    function handleSuccessfulResponse(vistaResponse, pid) {
        self.metrics.debug('Vista Unsubscribe', metricsObj);
        self.log.debug('vista-client.unsubscribe.handleSuccessfulResponse: successfully unsubscribed for patient %s; vistaResponse: %s', pid, vistaResponse);
        return unsubscribeCallback(null, 'success');
    }

    //-------------------------------------------------------------------------------------
    // This function handles calling the callback for a failed response from the RPC.
    //
    // error - The error message to be sent - because of the failed rPC call.
    // response - The result returned from VistA through the RPC
    //-------------------------------------------------------------------------------------
    function handleFailedRequestResponse(error, response) {
        self.metrics.debug('Vista Unsubscribe in Error', metricsObj);
        self.log.error('%s response: %s', error, response);
        return unsubscribeCallback(error, null);
    }
};

//------------------------------------------------------------------------------------
// This method creates the configuration context that is to be sent to the RPC.  Most
// of the context is the same for every RPC call and can be obtained from the
// configuration.  But some items are specific to the RPC call.  This adds in the
// items that are specific to the RPC call.
//------------------------------------------------------------------------------------
function _createRpcConfigVprContext(config, vistaId) {
    var siteConfig = config[vistaId];
    var rpcConfig = _.clone(siteConfig);
    rpcConfig.context = 'HMP SYNCHRONIZATION CONTEXT';
    return (rpcConfig);
}


//-----------------------------------------------------------------------------------------
// This function retrieves all the ids this patient has in all sites she has
// records in. Used by mviClient ...
//
// dfn: The dfn of the patient.
// stationNumber: station number for the patient
// Typical input:
//          3^PI^USVHA^500
// callback: The handler to call when the data is received.  It will pass the information
// in the response parameter of the callback.
// Response is a string such as:
//      10108V420871^NI^200M^USVHA^A\r\n3^PI^SITE^USVHA^A\r\n0000000003^NI^200DOD^USDOD^A\r\n
//        Where this represents the following:
//          icn 10108V420871
//          pid SITE;3
//          edipi 0000000003
//-----------------------------------------------------------------------------------------
VistaClient.prototype.getIds = function (vistaId, dfn, stationNumber, callback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'getIds',
        'site': vistaId,
        'pid': vistaId + ';' + dfn,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Get IDs', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('vista-client.getIds: dfn: %s; stationNumber: %s', dfn, stationNumber);

    if (_.isUndefined(vistaId) || _.isUndefined(dfn) || _.isUndefined(stationNumber)) {
        self.log.error('vista-client.getIds: called with missing parameters...');
        return callback('Failed to getIds');
    }
    var rpcClient = self._getRpcClient(vistaId);

    var params = dfn + '^PI^USVHA^' + stationNumber;

    if (rpcClient) {
        rpcClient.execute('VAFC LOCAL GETCORRESPONDINGIDS', params, function (error, response) {
            if (error) {
                self.metrics.debug('Vista Get IDs in Error', metricsObj);
                self.log.error('vista-client.getIds: Error received when call RPC for dfn: %s; error: %s', dfn, error);
                return callback(error);
            } else {
                self.metrics.debug('Vista Get IDs', metricsObj);
                self.log.debug('vista-client.getIds: Successful call to RPC for dfn: %s; result: %j', dfn, response);
                return callback(null, response);
            }
        });
    } else {
        self.metrics.debug('Vista Get IDs in Error', metricsObj);
        self.log.error('vista-client.getIds: Unable to find RPC client for vistaId: %s', vistaId);
        callback('No RPC client found for Vista ' + vistaId);
    }
};

//-----------------------------------------------------------------------------------------
// This function retrieves all admissions for a given site
//
// site: The dfn of the patient.
// callback: The handler to call when the data is received.  It will pass the information
// in the response parameter of the callback.
// Response is a string such as:
//      3^3140814.13073^7A GEN MED^722-B^38\r\n6^2950418.08304^4E NORTH^403-1^31
//        Where this represents the following:
//          DFN
//          Admission Date/Time in VA FileMan format
//          Ward Name
//          Room-Bed
//          Location IEN from the VistA Ward file
//-----------------------------------------------------------------------------------------
VistaClient.prototype.fetchAdmissionsForSite = function (vistaId, callback) {
    var self = this;
    var metricsObj = {
        'subsystem': 'Vista',
        'action': 'getfetchAdmissionsForSite',
        'site': vistaId,
        'process': uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('Vista Fetch Admissions for Site', metricsObj);
    metricsObj.timer = 'stop';

    if (_.isUndefined(vistaId)) {
        self.log.error('vista-client.fetchAdmissionsForSite: called with missing parameters...');
        return callback('Failed to fetchAdmissionsForSite');
    }
    var rpcClient = self._getRpcClient(vistaId);

    if (rpcClient) {
        // RPC Parameters:
        // IEN: optional (this call will never pass this parameter), if '' process all wards,
        //      otherwise the IEN in the Ward location file (#42)
        // RETURN: DFN^Admission Date/Time in VA FileMan format^Ward Name^Room-Bed^Location IEN from the VistA Ward file
        rpcClient.execute('HMP PATIENT ADMIT SYNC', '', function (error, response) {
            if (error) {
                self.metrics.debug('Vista Fetch Admissions for Site in Error', metricsObj);
                self.log.error('vista-client.fetchAdmissionsForSite: Error received from RPC for vistaId: %s; error: %s', vistaId, error);
                return callback(error);
            } else {
                self.metrics.debug('Vista Fetch Admissions for Site', metricsObj);
                self.log.debug('vista-client.fetchAdmissionsForSite: Successful call to RPC for vistaId: %s; result: %j', vistaId, response);
                return callback(null, response);
            }
        });
    } else {
        self.metrics.debug('Vista Fetch Admissions for Site in Error', metricsObj);
        self.log.error('vista-client.fetchAdmissionsForSite: Unable to find RPC client for vistaId: %s', vistaId);
        callback('No RPC client found for Vista ' + vistaId);
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method can be used to make API calls to a site that is configured to run in multiple poller mode.  It
// is primarily used by command line tools that can be used to inspect and manage allocations within Vista.
//
// vistaId: The Site hash for the VistA site.
// allocationSize: The value to place in the allocationSize.  If this is not passed, then it will default to 1000.
// allocationToken: The value to send for the allocationToken.  If this is not passed, then no allocationToken will
//                  be sent to VistA.
// allocationStatus: The value to send for allocaationStatus.  If this is is not passed, then no allocationStatus
//                   will be sent to VistA.
// max: The value to send for max.  If this is not passed, then no max will be sent to VistA.
// maxSize: The value to send for maxSize.  if this is not passed, then no maxSize will be sent to VistA.
// callback:  The function called when the RPC call is complete.  Its signature is:
//            function(error, response) where both are string values.   Although response is a string, unless
//                  there is a functional issue it is in the from of a JSON string that can be parsed.
//-----------------------------------------------------------------------------------------------------------------
VistaClient.prototype.multiplePollerModeApi = function (vistaId, allocationSize, allocationToken, allocationStatus, max, maxSize, callback) {
    var self = this;
    self.log.debug('vista-client.multiplePollerModeApi: Entered method.   vistaId: %s, allocationSize: %s, ' +
        'allocationToken: %s, allocationStatus: %s; max: %s; maxSize: %s', vistaId, allocationSize, allocationToken, allocationStatus, max, maxSize);

    if (!vistaId) {
        self.log.error('vista-client.multiplePollerModeApi: Called with missing vistaId parameter...');
        return callback('Called with missing vistaId parameter');
    }
    var rpcClient = self._getRpcClient(vistaId);

    var params;
    if (rpcClient) {
        params = {
            '"command"': 'getPtUpdates',
            '"server"': self.config['hmp.server.id'] || 'hmp-development-box',
            '"extractSchema"': self.config['hmp.extract.schema'] || '3.001',
            '"hmpVersion"': self.config['hmp.version'] || '0.7-S65'
        };

        if ((_.isString(allocationSize)) || (_.isFinite(allocationSize))) {
            params['"allocationSize"'] = String(allocationSize);
        }

        if ((_.isString(allocationToken)) || (_.isFinite(allocationToken))) {
            params['"allocationToken"'] = String(allocationToken);
        }

        if (_.isString(allocationStatus))  {
            params['"allocationStatus"'] = allocationStatus;
        }

        if ((_.isString(max)) || (_.isFinite(max))) {
            params['"max"'] = String(max);
        }

        if ((_.isString(maxSize)) || (_.isFinite(maxSize))) {
            params['"maxSize"'] = String(maxSize);
        }

        rpcClient.execute('HMPDJFS API', params, function (error, response) {
            self.log.info('vista-client.multiplePollerModeApi: Completed calling RPC: getPtUpdates: for vistaId: %s; error: %s', vistaId, error);
            self.log.trace('vista-client.multiplePollerModeApi: Completed calling RPC: getPtUpdates: for vistaId: %s; response (String): %s', vistaId, response);

            return callback(error, response);
        });
    }
};

//----------------------------------------------------------------------------------------------------------------
// This method retrieves the API version that the Vista site is running.
//
// vistaId: The Site hash for the VistA site.
// callback:  The function called when the RPC call is complete.  Its signature is:
//            function(error, response) where both are string values.   Although response is a string, unless
//                  there is a functional issue it is in the from of a JSON string that can be parsed.
//-----------------------------------------------------------------------------------------------------------------
VistaClient.prototype.retrieveApiVersion = function (vistaId, callback) {
    var self = this;
    self.log.debug('vista-client.retrieveApiVersion: Entered method.   vistaId: %s', vistaId);

    if (!vistaId) {
        self.log.error('vista-client.retrieveApiVersion: Called with missing vistaId parameter...');
        return setTimeout(callback, 0, 'Called with missing vistaId parameter');
    }
    var rpcClient = self._getRpcClient(vistaId);

    var params;
    if (rpcClient) {
        params = {
            '"command"': 'checkHealth',
            '"server"': self.config['hmp.server.id'] || 'hmp-development-box',
            '"extractSchema"': self.config['hmp.extract.schema'] || '3.001',
            '"hmpVersion"': self.config['hmp.version'] || '0.7-S65'
        };

        rpcClient.execute('HMPDJFS API', params, function (error, response) {
            self.log.info('vista-client.multiplePollerModeApi: Completed calling RPC: getPtUpdates: for vistaId: %s; error: %s', vistaId, error);
            self.log.trace('vista-client.multiplePollerModeApi: Completed calling RPC: getPtUpdates: for vistaId: %s; response (String): %s', vistaId, response);

            return callback(error, response);
        });
    }
};


module.exports = VistaClient;
module.exports._createRpcConfigVprContext = _createRpcConfigVprContext;

