/*jslint node: true */
'use strict';

var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var uuid = require('node-uuid');
var util = require('util');

function handleWrapper(log, config, environment, job, handlerCallback) {
    store(log, config, environment, job.dataDomain, job.record, handlerCallback);
}

function store(log, config, environment, dataDomain, record, handlerCallback) {
    log.info('solr-record-storage-handler.handle: Received request to store record to SOLR (%s) %j', dataDomain, record);

    // We do not store patient demographics or treatement to SOLR.  See what kind of record we have here...
    //------------------------------------------------------------------------------------------------------
    if (_.contains(config.vista.domainsNoSolrTracking, dataDomain)) {
        return handlerCallback(null, 'success');
    }

    var metricsObj = {'subsystem':'SOLR','action':'transform','uid':record.uid, 'pid':record.pid,'process':uuid.v4(),'timer':'start'};
    environment.metrics.debug('SOLR record transformation', metricsObj);

    var errorMessage = '';

    // This gives us a hook so that we can test this better via Unit tests.
    //---------------------------------------------------------------------
    var solrXform;
    if (!environment.solrXform) {
        solrXform = require(global.VX_UTILS + 'solr-xform');
    } else {
        solrXform = environment.solrXform;
    }
    var solrRecord = solrXform(record, log);
    metricsObj.timer = 'stop';
    environment.metrics.debug('SOLR record transformation', metricsObj);
    if (_.isObject(solrRecord)) {
        log.debug('solr-record-storage-handler.handle: Storing SOLR record.  uid: %s; solrRecord: %j', record.uid, solrRecord);
        metricsObj.timer = 'start';
        metricsObj.action = 'storeRecord';
        environment.metrics.debug('SOLR record storage', metricsObj);
        environment.solr.add(solrRecord, function(error) {
            metricsObj.timer = 'stop';
            if (error) {
                environment.metrics.debug('SOLR record storage in Error', metricsObj);
                errorMessage = util.format('solr-record-storage-handler.handle: Error storing to SOLR.  error: %s; uid: %s, solrRecord: %j', error, record.uid, solrRecord);
                log.error(errorMessage);
                return handlerCallback(errorUtil.createTransient('Unable to store record in solr', errorMessage));
            } else {
                environment.metrics.debug('SOLR record storage', metricsObj);
                log.info('solr-record-storage-handler.handle: Record stored to SOLR successfully.  uid: %s', record.uid);
                return trackSolrStorage(log, config, environment, record, handlerCallback);
            }
        });
    } else {
        errorMessage = util.format('solr-record-storage-handler.handle: SOLR xform returned null There is no SOLR record to store.  uid: %s', record.uid);
        log.error(errorMessage);
        return handlerCallback(errorUtil.createTransient('Unable to store record in solr', errorMessage));
    }
}

//-------------------------------------------------------------------------------------
// If the trackSolrStorage flag is turned on, then this function will notify JDS that
// the event has been successfully sent to SOLR.
//
// log: The logger which should be used to send log messages.
// config: The configuration settings to be used.
// environment: The environment containing shared objects, etc.
// record: The event that was sent to SOLR.
// handlerCallback: The callback method to call when this is done.
//        The signature is:
//           function (error, successString)
//--------------------------------------------------------------------------------------
function trackSolrStorage(log, config, environment, record, handlerCallback) {

    // If we are not tracking SOLR storage - then there is nothing to do here.  Call the call back handler and get out.
    //------------------------------------------------------------------------------------------------------------------
    if (!config.trackSolrStorage) {
        log.debug('solr-record-storage-handler.trackSolrStorage: trackSolrStorage is turned off - no message being sent to JDS.  Record: %j', record);
        return handlerCallback(null, 'success');
    }

    log.debug('solr-record-storage-handler.trackSolrStorage: trackSolrStorage is turned on - sending notification to JDS of Solr storage of this event.  Record: %j', record);

    // Make sure our record has all the items it needs to proceed.
    //------------------------------------------------------------
    if ((!_.isObject(record)) || (_.isEmpty(record))) {
        log.error('solr-record-storage-handler.trackSolrStorage: Missing record.  Record: %j', record);
        return handlerCallback(errorUtil.createFatal('Missing record', record));
    }
    if ((!_.isString(record.uid)) || (_.isEmpty(record.uid))) {
        log.error('solr-record-storage-handler.trackSolrStorage: Missing uid.  Record: %j', record);
        return handlerCallback(errorUtil.createFatal('Missing UID', record));
    }

    // If for some reason the stampTime has come in as a numeric value rather than a string.  Fix it now.
    //---------------------------------------------------------------------------------------------------
    if (_.isNumber(record.stampTime)) {
        record.stampTime = String(record.stampTime);
    }

    if ((!_.isString(record.stampTime)) || (_.isEmpty(record.stampTime))) {
        log.error('solr-record-storage-handler.trackSolrStorage: Missing stampTime.  Record: %j', record);
        return handlerCallback(errorUtil.createFatal('Missing stampTime', record));
    }
    if ((!_.isString(record.pid)) || (_.isEmpty(record.pid))) {
        log.error('solr-record-storage-handler.trackSolrStorage: Missing pid.  Record: %j', record);
        return handlerCallback(errorUtil.createFatal('Missing pid', record));
    }

    var storeEventInfo = {
        'uid' : record.uid,
        'eventStamp': record.stampTime,
        'type': 'solr'
    };

    var errorMessage = '';
    var metricsObj = {
        'uid': record.uid,
        'pid': record.pid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    environment.metrics.warn('Notify JDS status of Solr Storage', metricsObj);
    metricsObj.timer = 'stop';
    environment.jds.setEventStoreStatus(record.pid, storeEventInfo, function(error, response, body) {
        log.debug('solr-record-storage-handler.trackSolrStorage: JDS response code: %s', (response ? response.statusCode : undefined));
        if (error) {
            environment.metrics.warn('Notify JDS status of Solr Storage in Error', metricsObj);
            errorMessage = util.format('solr-record-storage-handler.trackSolrStorage: Error encountered when notifying JDS status of Solr storage. error: %s; response: %j; body: %j', error, response, body);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient('Unable to notify JDS status of Solr storage', errorMessage));
        } else if (response.statusCode !== 201) {
            environment.metrics.warn('Notify JDS status of Solr Storage in Error', metricsObj);
            errorMessage = util.format('solr-record-storage-handler.trackSolrStorage: Unexpected statusCode received when notifying JDS Status of Solr storage. error: (no error received); response: %j; body: %j', response, body);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient('Unable to notify JDS status of Solr storage', errorMessage));
        } else {
            environment.metrics.warn('Notify JDS status of Solr Storage', metricsObj);
            log.debug('solr-record-storage-handler.trackSolrStorage: Notify JDS status of Solr Storage success!  error: (no error received); response: %j; body: %j', response, body);
            return handlerCallback(null, 'success');
        }
    });
}

module.exports = handleWrapper;
module.exports.writebackWrapper = store;
module.exports.trackSolrStorage = trackSolrStorage;
