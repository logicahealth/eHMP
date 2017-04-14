'use strict';

//-----------------------------------------------------------------------------------
// This is a dummy class for PjdsClient that can be used for unit test purposes.
//-----------------------------------------------------------------------------------

require('../../env-setup');
var _ = require('underscore');


function PjdsClient(setLog, setConfig) {
    if (!(this instanceof PjdsClient)) { return new PjdsClient(setLog, setConfig); }
    this.log = setLog;
    this.config = setConfig.pjds;
    this.error = [null];
    this.response = [''];
    this.result = [undefined];
    this.responseIndex = 0;
}

//-----------------------------------------------------------------------------------
// This will set up the data that will be sent to the callback on a completion of a
// method call.  Allows checking of handler code.
//-----------------------------------------------------------------------------------
PjdsClient.prototype._setResponseData = function(error, response, result) {
    this.responseIndex = 0;

    if (_.isArray(error)) {
        this.error = error;
    }
    else {
        this.error = [error];
    }

    if (_.isArray(response)) {

        this.log.debug('pjds-client-dummy_setResponseData: response %j is an array.', response);
        this.response = response;
        this.log.debug('response: %j', this.response);
    }
    else {
        this.log.debug('pjds-client-dummy_setResponseData: response %j is not array.', response);
        this.response = [response];
        this.log.debug('new response is: %j', this.response);
    }

    if (_.isArray(result)) {
        this.result = result;
    }
    else {
        this.result = [result];
    }
};

PjdsClient.prototype.getOSyncClinicsByUid = function(uid, callback) {
    if ((this.error.length >= this.responseIndex) && (this.response.length >= this.responseIndex) && (this.result.length >= this.responseIndex)) {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.getOSyncClinicsByUid: (from array) responseIndex: %s; error: %s, response: %j, result: %j', this.responseIndex-1, this.error[this.responseIndex-1], this.response[this.responseIndex-1], this.result[this.responseIndex-1]);
        callback(this.error[this.responseIndex-1], this.response[this.responseIndex-1], this.result[this.responseIndex-1]);
    }
    else {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.getOSyncClinicByUid: (from [0]) responseIndex: %s; error: %s, response: %, result: %jj', this.responseIndex-1, this.error[0], this.response[0], this.result[this.responseIndex-1]);
        callback(this.error[0], this.response[0], this.result[0]);
    }
};

PjdsClient.prototype.getOSyncClinicsBySite = function(site, callback) {
    if ((this.error.length >= this.responseIndex) && (this.response.length >= this.responseIndex) && (this.result.length >= this.responseIndex)) {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.getOSyncClinicsBySite: (from array) responseIndex: %s; error: %s, response: %j, result: %j', this.responseIndex-1, this.error[this.responseIndex-1], this.response[this.responseIndex-1], this.result[this.responseIndex-1]);
        callback(this.error[this.responseIndex-1], this.response[this.responseIndex-1], this.result[this.responseIndex-1]);
    }
    else {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.getOSyncClinicsBySite: (from [0]) responseIndex: %s; error: %s, response: %, result: %jj', this.responseIndex-1, this.error[0], this.response[0], this.result[this.responseIndex-1]);
        callback(this.error[0], this.response[0], this.result[0]);
    }
};

PjdsClient.prototype.createOSyncClinic = function(site, uid, callback) {
    if ((this.error.length >= this.responseIndex) && (this.response.length >= this.responseIndex)) {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.createOSyncClinic: (from array) responseIndex: %s; error: %s, response: %j', this.responseIndex-1, this.error[this.responseIndex-1], this.response[this.responseIndex-1]);
        callback(this.error[this.responseIndex-1], this.response[this.responseIndex-1]);
    }
    else {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.createOSyncClinic: (from [0]) responseIndex: %s; error: %s, response: %j', this.responseIndex-1, this.error[0], this.response[0]);
        callback(this.error[0], this.response[0]);
    }
};

PjdsClient.prototype.deleteOSyncClinic = function(uid, callback) {
    if ((this.error.length >= this.responseIndex) && (this.response.length >= this.responseIndex)) {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.deleteOSyncClinic: (from array) responseIndex: %s; error: %s, response: %j', this.responseIndex-1, this.error[this.responseIndex-1], this.response[this.responseIndex-1]);
        callback(this.error[this.responseIndex-1], this.response[this.responseIndex-1]);
    }
    else {
        this.responseIndex++;
        this.log.debug('pjds-client-dummy.deleteOSyncClinic: (from [0]) responseIndex: %s; error: %s, response: %j', this.responseIndex-1, this.error[0], this.response[0]);
        callback(this.error[0], this.response[0]);
    }
};

module.exports = PjdsClient;
