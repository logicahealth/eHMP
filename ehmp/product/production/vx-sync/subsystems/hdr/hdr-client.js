'use strict';

var _ = require('underscore');
// var util = require('util');
// var objUtil = require(global.VX_UTILS + 'object-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
// var logUtil = require(global.VX_UTILS + 'log');
var uuid = require('node-uuid');
//var async = require('async');
var request = require('request');
var querystring = require('querystring');
var format = require('util').format;
var moment = require('moment');
var VxSyncForeverAgent = require(global.VX_UTILS+'vxsync-forever-agent');

var JsonErrorString = 'Error parsing JSON body';

//-------------------------------------------------------------------------------------
// Constructor for HDRClient.
//
// log - The logger to be used to log messages.
// config - The configuration information that was established for this environment.
//-------------------------------------------------------------------------------------
function HDRClient(log, metrics, config) {
    var self = this;
    if (!(this instanceof HDRClient)) {
        return new HDRClient(log, metrics, config);
    }

    self.log = log;
    self.config = config;
    self.metrics = metrics;
    self.hdrConfig = config.hdr.pubsubConfig;
    self.params = {
        server: self.hdrConfig.server,
        _type: self.hdrConfig._type,
        clientName: self.hdrConfig.clientName,
    };
    log.debug('hdr-client: creating hdr proxy');
}

//-------------------------------------------------------------------------------------
// This function makes an rest call to HDR to subscribe the patient.
//
// stationId - The HDR site station number.
// patientIdentifier - This is an object that represents the patient identifier.  It
//                     must be a pid type.
// rootJobId - This is the job Id of the root job that triggered this subscription
// jobId - This is the job Id of the job that represents the poller's job when it
//         receives the data for this patient.
// subscribeCallback - The is the function that is called when the HDR rest call is completed.
//-------------------------------------------------------------------------------------
HDRClient.prototype.subscribe = function(siteId, patientIdentifier, rootJobId, jobId, subscribeCallback) {
    var self = this;

    var stationId = self.getStationIdBySiteId(siteId);
    if (!stationId) {
        return subscribeCallback('Invalid HDR siteId', null);
    }

    var requestId = uuid.v4();
    var metricsObj = {
        'subsystem':'HDR',
        'action':'subscribe',
        'pid':patientIdentifier,
        'stationId':stationId,
        'jobId':jobId,
        'rootJobId':rootJobId,
        'process': requestId,
        'timer': 'start'
    };
    self.metrics.debug('HDR Subscribe', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('hdr-client.subscribe: stationId: %s; patient: %j; rootJobId: %s; jobId: %s', stationId, patientIdentifier, rootJobId, jobId);

    if (!patientIdentifier) {
        self.log.error('hdr-client.subscribe, invalid patientIdentifier %s', patientIdentifier);
        return subscribeCallback('Invalid Patient Indentifier', null);
    }
    var pid = patientIdentifier.value || patientIdentifier;
    var dfn = idUtil.extractDfnFromPid(pid);
    if (!dfn) {
        self.log.error('hdr-client.subscribe, invalid patientIdentifier %s', patientIdentifier);
        return subscribeCallback('Invalid Patient Indentifier', null);
    }
    if (!rootJobId || !jobId) {
        self.log.error('hdr-client.subscribe, invalid job ids %s, %s', rootJobId, jobId);
        return subscribeCallback('Invalid Patient Indentifier', null);
    }

    var subParams = {
        resolvedIdentifier: self._getHDRResolvedIdentifier(dfn, stationId),
        requestId: requestId,
        clientRequestInitiationTime: moment().format(),
        //jobId: jobId,
        rootJobId: rootJobId,
        HMPSVERS: 1
    };
    _.each(jobId, function(domainAndJobId){
        subParams['jobDomainId-' + domainAndJobId.domain]= domainAndJobId.jobId;
    });

    self._sendRequest('subscribe', 'POST', subParams, function(error, hdrResponse) {
        if (!error) {
            self.log.info('hdr-client.handleSubscribeResponse: successfully subscribed for patient %s', pid);
            self.metrics.debug('HDR Subscribe', metricsObj);
            self.log.debug('hdr-client.handleSubscribeResponse: response for pid: %s; response: %s', pid, hdrResponse);
            return subscribeCallback(null, 'success');
        }
        self.metrics.debug('HDR Subscribe in Error', metricsObj);
        self.log.error('%s response: %j', error, hdrResponse);
        return subscribeCallback(error, null);
    });

};


//-------------------------------------------------------------------------------------
// This function makes an REST call to HDR to unsubscribe the patient.
//
// pid - The pid of the patient to be unsubscribed.
// unsubscribeCallback - The is the function that is called when the RPC call is completed.
//-------------------------------------------------------------------------------------
HDRClient.prototype.unsubscribe = function(siteId, patientIdentifier, unsubscribeCallback) {
    var self = this;

    var stationId = self.getStationIdBySiteId(siteId);
    if (!stationId) {
        return unsubscribeCallback('Invalid HDR siteId', null);
    }

    var requestId = uuid.v4();
    var metricsObj = {
        'subsystem':'hdr',
        'action':'unsubscribe',
        'pid':patientIdentifier,
        'stationId': stationId,
        'process':uuid.v4(),
        'timer': 'start'
    };
    self.metrics.debug('hdr Unsubscribe', metricsObj);
    metricsObj.timer = 'stop';
    self.log.debug('hdr-client.unsubscribe: stationId: %s; patient: %j', stationId, patientIdentifier);
    if (!patientIdentifier) {
        self.log.error('hdr-client.unsubscribe, invalid patientIdentifier %s', patientIdentifier);
        return unsubscribeCallback('Invalid Patient Indentifier', null);
    }
    var pid = patientIdentifier.value || patientIdentifier;
    var dfn = idUtil.extractDfnFromPid(pid);
    if (!dfn) {
        self.log.error('hdr-client.unsubscribe, invalid patientIdentifier %s', patientIdentifier);
        return unsubscribeCallback('Invalid Patient Indentifier', null);
    }

    var unsubParams = {
        resolvedIdentifier: self._getHDRResolvedIdentifier(dfn, stationId),
        requestId: requestId,
        clientRequestInitiationTime: moment().format()
    };

    self._sendRequest('cancel', 'POST', unsubParams, function(error, hdrResponse) {
        if (!error) {
            self.log.info('hdr-client.handleUnsubscribeResponse: successfully subscribed for patient %s', pid);
            self.metrics.debug('HDR Unsubscribe', metricsObj);
            self.log.debug('hdr-client.handleUnsubscribeResponse: response for pid: %s; response: %s', pid, hdrResponse);
            return unsubscribeCallback(null, 'success');
        }
        self.metrics.debug('HDR Unsubscribe in Error', metricsObj);
        self.log.error('%s response: %s', error, hdrResponse);
        return unsubscribeCallback(error, null);
    });
};

//-------------------------------------------------------------------------------------
// This function makes an REST call to HDR to fetch latest the data for a specific site.
//
// siteId - The siteId of the patient data to be fetched.
// unsubscribeCallback - The is the function that is called when the RPC call is completed.
//-------------------------------------------------------------------------------------
HDRClient.prototype.fetchNextBatch = function(siteId, lastUpdateTime, batchSize, batchCallback) {
    var self = this;

    var stationId = self.getStationIdBySiteId(siteId);
    if (!stationId) {
        return batchCallback('Invalid HDR siteId', null);
    }

    var requestId = uuid.v4();
    var metricsObj = {
        'subsystem':'hdr',
        'action':'fetchNextBatch',
        'stationId': stationId,
        'process':uuid.v4(),
        'timer': 'start'
    };

    // Make sure the batchSize does not exceed the maxBatchSize
    var batchSz = parseInt(batchSize);
    if (!batchSize || batchSize > self.hdrConfig.maxBatchSize) {
        batchSz = self.hdrConfig.maxBatchSize;
    }
    self.metrics.debug('hdr fetchNextBatch', metricsObj);
    metricsObj.timer = 'stop';

    var fetchParam = {
        requestId: requestId,
        last: lastUpdateTime,
        max: batchSz,
        extractSchema: self.hdrConfig.extractSchema,
        clientRequestInitiationTime: moment().format()
    };


    self._sendRequest('patientdata/' + stationId, 'GET', fetchParam, function(error, hdrResponse, data) {
        if (!error) {
            // make sure the data is in the right format.
            if (data && _.isArray(data.sites) && data.sites.length >= 1) {
                // only get the data related to this site
                var dataSection = _.find(data.sites, function(siteData) {
                    var isValidSite = siteData && siteData.params && siteData.params.systemId && siteData.params.systemId === siteId;
                    if (!isValidSite) {
                        self.log.error('hdr-client.fetchNextBatch: receive invalid site data %s, skipping', siteData);
                    }
                    return isValidSite;
                });
                if (dataSection) {
                    self.log.info('hdr-client.fetchNextBatch: successfully fetched data from site %s', siteId);
                    self.metrics.debug('HDR fetchNextBatch', metricsObj);
                    self.log.debug('hdr-client.fetchNextBatch: response for siteId: %s; response: %s', siteId, hdrResponse);
                    return batchCallback(null, {data: dataSection.data, hmpBatchSize: batchSz, rawResponse: null});
                }
                else {
                    self.metrics.debug('HDR fetchNextBatch in Error', metricsObj);
                    self.log.error('Invalid response data format: %s, no %s data found!', data, siteId);
                    return batchCallback(error, {data: null, hmpBatchSize: batchSz, rawResponse: null});
                }
            }
            else {
                self.metrics.debug('HDR fetchNextBatch in Error', metricsObj);
                self.log.error('Invalid response data format: %s', data);
                return batchCallback(error, {data: null, hmpBatchSize: batchSz, rawResponse: null});
            }
        }
        else if (error === JsonErrorString) {
            if (batchSz === 1) { // this is the offending record, just skip this one
                self.metrics.debug('HDR fetchNextBatch in Error', metricsObj);
                self.log.error('batch size is set to 1, %s response: %s', error, hdrResponse);
                return batchCallback(error, {data: null, hmpBatchSize: batchSz, rawResponse: data});
            }
            // If there is an error parsing json body, try to do a half batch to skip the bad record
            return self.fetchNextBatch(siteId, lastUpdateTime, Math.ceil(batchSz/2), batchCallback);
        }
        else {
            self.metrics.debug('HDR fetchNextBatch in Error', metricsObj);
            self.log.error('%s response: %s', error, hdrResponse);
            return batchCallback(error, {data: null, hmpBatchSize: batchSz, rawResponse: null});
        }
    });
};

HDRClient.prototype.getStationIdBySiteId = function (siteId) {
    if (!siteId) {
        return undefined;
    }
    var config = this.config;
    if (config && config.hdr && config.hdr.hdrSites && config.hdr.hdrSites[siteId]) {
        return config.hdr.hdrSites[siteId].stationNumber;
    }
    return undefined;
};

// Private functions
// This is the function that actually send a request to HDR and revoke the callBack after the response.
//
// path: the extra path that will be appended to HDR base URL
// method: can be GET, PUT, POST etc, the default is GET
// extraParam: extra query parameters
// callBack: callback function.
HDRClient.prototype._sendRequest = function (path, method, extraQueryParam, callBack) {
    var self = this;
    var baseUrl = self._getHDRBaseUrl();
    var formatStr = '%s/%s?%s';
    if (baseUrl.charAt(baseUrl.length - 1) === '/'){
        formatStr = '%s%s?%s';
    }
    var url = format(formatStr, baseUrl, path, querystring.stringify(_.defaults(extraQueryParam, self.params)));
    var hdrReqOpt = {
        url: url,
        method: method || 'GET',
        timeout: self.hdrConfig.timeout,
        agentClass: VxSyncForeverAgent
    };

    request(hdrReqOpt, function(error, response, body) {
        if (error) {
            self.log.debug('hdr-client._sendRequest(): error: %s', error);
            return callBack(error, response);
        }
        if (!response || _.isEmpty(response) || !response.statusCode) {
            self.log.debug('hdr-client._sendRequest(): invalide response: %s', response);
            return callBack('invalid response', null);
        }
        if (response.statusCode !== 200) {
            self.log.debug('hdr-client._sendRequest(): Status Code: %s', response.statusCode);
            return callBack('Non 200 Response Status', response);
        }
        var data;
        if (_.isEmpty(body)) {
            return callBack(null, response);
        }
        try {
            data = JSON.parse(body);
            return callBack(null, response, data);
        } catch (parseError) {
            // Could not parse response - probably would work at a different time
            self.log.debug('hdr-client._sendRequest(): Status Code: %s', response.statusCode);
            self.log.debug('hdr-client._sendRequest(): Unable to parse JSON: %s', body);
            return callBack(JsonErrorString, response, body);
        }
    });
};

HDRClient.prototype._getHDRResolvedIdentifier = function (pid, stationId) {
    return format('%s-%s-%s', pid, stationId, this.hdrConfig.identifier);
};

HDRClient.prototype._getHDRBaseUrl = function() {
    return format('%s://%s:%s/%s', this.hdrConfig.protocol, this.hdrConfig.host, this.hdrConfig.port, this.hdrConfig.path);
};

module.exports = HDRClient;
