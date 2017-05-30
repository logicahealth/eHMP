'use strict';

var logUtil = require(global.VX_UTILS + 'log');
var _ = require('underscore');
//var async = require('async');

function VistaClient(log, config, rpcClient) {
    this.log = log;
    this.rpcLog = logUtil.get('rpc', log);
    this.config = config.vistaSites;
//    this.hmpServerId = config['hmp.server.id'];
    this.rpcClient = rpcClient;
    this.fetchError = [null];
    this.fetchResponse = [{}];
    this.fetchResponseIndex = 0;
}

//-----------------------------------------------------------------------------------
// This will set up the data that will be sent to the callback on on completion of a
// fetch method call.
//-----------------------------------------------------------------------------------
VistaClient.prototype._setFetchResponseData = function (error, response) {
    this.fetchResponseIndex = 0;

    if (_.isArray(error)) {
        this.fetchError = error;
    }
    else {
        this.fetchError = [error];
    }

    if (_.isArray(response)) {

        this.log.debug('vista-client-dummy._setFetchResponseData: response %j is an array.', response);
        this.fetchResponse = response;
        this.log.debug('response: %j', this.fetchResponse);
    }
    else {
        this.log.debug('vista-client-dummy._setFetchResponseData: response %j is not array.', response);
        this.fetchResponse = [response];
        this.log.debug('new response is: %j', this.fetchResponse);
    }
};

//callback: err, metastamp
VistaClient.prototype.subscribe = function (vistaId, patientIdentifier, rootJobId, jobId, priority, referenceInfo, subscribeCallback) {
    setTimeout(subscribeCallback, 0, null, 'success');
};

VistaClient.prototype.unsubscribe = function (pid, unsubscribeCallback) {
    setTimeout(unsubscribeCallback, 0, null, 'success');
};

VistaClient.prototype.status = function (patientIdentifier, statusCallback) {
    setTimeout(statusCallback, 0, null, {});
};

VistaClient.prototype.fetchNextBatch = function (vistaId, batchCallback) {
    if ((this.fetchError.length >= this.fetchResponseIndex) && (this.fetchResponse.length >= this.fetchResponseIndex)) {
        this.fetchResponseIndex++;
        this.log.debug('vista-client-dummy.fetchNextBatch: (from array) fetchResponseIndex: %s; fetchError: %s, fetchResponse: %j', this.fetchResponseIndex - 1, this.fetchError[this.fetchResponseIndex - 1], this.fetchResponse[this.fetchResponseIndex - 1]);
        return setTimeout(batchCallback, 0, this.fetchError[this.fetchResponseIndex - 1], this.fetchResponse[this.fetchResponseIndex - 1]);
    }
    else {
        this.fetchResponseIndex++;
        this.log.debug('vista-client-dummy.fetchNextBatch: (from [0]) fetchResponseIndex: %s; fetchError[0]: %s, fetchResponse[0]: %j', this.fetchResponseIndex - 1, this.fetchError[0], this.response[0]);
        return setTimeout(batchCallback, 0, this.error[0], this.response[0]);
    }
};

VistaClient.prototype.fetchAppointment = function (vistaId, batchCallback) {
    setTimeout(batchCallback, 0, null, {});
};

function _createRpcConfigVprContext(config, vistaId) {
    return ({});
}

VistaClient.prototype.fetchAdmissionsForSite = function (vistaId, callback) {
    if ((this.fetchError.length >= this.fetchResponseIndex) && (this.fetchResponse.length >= this.fetchResponseIndex)) {
        this.fetchResponseIndex++;
        this.log.debug('vista-client-dummy.fetchAdmissionsForSite: (from array) fetchResponseIndex: %s; fetchError: %s, fetchResponse: %j', this.fetchResponseIndex - 1, this.fetchError[this.fetchResponseIndex - 1], this.fetchResponse[this.fetchResponseIndex - 1]);
        return setTimeout(callback, 0, this.fetchError[this.fetchResponseIndex - 1], this.fetchResponse[this.fetchResponseIndex - 1]);
    }
    else {
        this.fetchResponseIndex++;
        this.log.debug('vista-client-dummy.fetchAdmissionsForSite: (from [0]) fetchResponseIndex: %s; fetchError[0]: %s, fetchResponse[0]: %j', this.fetchResponseIndex - 1, this.fetchError[0], this.response[0]);
        return setTimeout(callback, 0, this.error[0], this.response[0]);
    }
};

VistaClient.prototype.childInstance = function(log) {
    return this;
};

module.exports = VistaClient;
module.exports._createRpcConfigVprContext = _createRpcConfigVprContext;
