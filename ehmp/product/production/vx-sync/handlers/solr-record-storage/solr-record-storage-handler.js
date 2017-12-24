/*jslint node: true */
'use strict';

var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var uuid = require('node-uuid');
var util = require('util');
var async = require('async');
var SolrStorageRulesEngine = require(global.VX_SOLRSTORAGERULES + 'solr-storage-rules-engine');
var objUtil = require(global.VX_UTILS + 'object-utils');
var domain = require(global.VX_UTILS + 'domain');

function handleWrapper(log, config, environment, job, handlerCallback, touchBack) {
    store(log, config, environment, job.dataDomain, job.record, handlerCallback, touchBack);
}

function store(log, config, environment, dataDomain, record, handlerCallback, touchBack) {
    log.info('solr-record-storage-handler.handle: Received request to store record to SOLR (%s) %j', dataDomain, record);

    // We do not store patient demographics or treatment to SOLR.  See what kind of record we have here...
    //------------------------------------------------------------------------------------------------------
    if (_.contains(config.vista.domainsNoSolrTracking, dataDomain)) {
        return setTimeout(handlerCallback, 0, null, 'success');
    }

    // If it is in the environment - then use that one.  Otherwise - create our instance of it.
    var rulesEngine = objUtil.getProperty(environment, 'solrStorageRulesEngine');
    if (!_.isObject(rulesEngine)) {
        rulesEngine = new SolrStorageRulesEngine(log, config, environment);
    }

    rulesEngine.store(dataDomain, record, function(error, result) {
        if (error) {
            return setTimeout(handlerCallback, 0, errorUtil.createFatal(error, record));
        }

        if (!result) {
            return setTimeout(handlerCallback, 0, null, 'success');      //exit handler if rules fail i.e. result = false
        }

        if (!_.isFunction(touchBack)) {
            touchBack = function() {};
        }

        var tasks = [
            runSolrXform.bind(null, log, config, environment, record),
            function(solrRecord, callback) {
                touchBack();
                //pass solrRecord to the next function
                callback(null, solrRecord);
            },
            storeInSolr.bind(null, log, config, environment, record),
            function(callback) {
                touchBack();
                callback(null);
            },
            trackSolrStorage.bind(null, log, config, environment, record)
        ];

        async.waterfall(tasks, function(error, result) {
            if (error) {
                log.error('solr-record-storage-handler.store: exiting with error: %j, result: %s', error, result);
                return handlerCallback(error);
            }

            log.debug('solr-record-storage-handler.store: completed successfully');
            handlerCallback(null, 'success');
        });
    });
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

    // Do not store tracking for pjds domain data - then there is nothing to do here.  Call the call back handler and get out.
    //------------------------------------------------------------------------------------------------------------------
    if (record.domain && _.contains(domain.getPjdsDomainList(), record.domain)) {
        log.debug('solr-record-storage-handler.trackSolrStorage: do not track pjds domain data - no message being sent to JDS.  Record: %j', record);
        return handlerCallback(null, 'success');
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
        'uid': record.uid,
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
            // Only log the response here as it contains the body and any statusCodes, etc.
            errorMessage = util.format('solr-record-storage-handler.trackSolrStorage: Error encountered when notifying JDS status of Solr storage. error: %s; response: %j; record: %j', error, response, record);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient('Unable to notify JDS status of Solr storage', errorMessage));
        } else if (response.statusCode !== 201) {
            environment.metrics.warn('Notify JDS status of Solr Storage in Error', metricsObj);
            // Only log the response here as it contains the body and any statusCodes, etc.
            errorMessage = util.format('solr-record-storage-handler.trackSolrStorage: Unexpected statusCode received when notifying JDS Status of Solr storage. error: (no error received); response: %j; record: %j', response, record);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient('Unable to notify JDS status of Solr storage', errorMessage));
        } else {
            environment.metrics.warn('Notify JDS status of Solr Storage', metricsObj);
            // Only log the response here as it contains the body and any statusCodes, etc.
            log.debug('solr-record-storage-handler.trackSolrStorage: Notify JDS status of Solr Storage success!  error: (no error received); response: %j; record: %j', response, record);
            return handlerCallback(null, 'success');
        }
    });
}

//--------------------------------------------------------------------------------------------
// Transforms a VPR record to a format suitable for storage in SOLR via the solr-xform utility
//
// log: The logger which should be used to send log messages.
// config: The configuration settings to be used.
// environment: The environment containing shared objects, etc.
// record: The event that was sent to SOLR.
// callback: The callback method to call when this is done.
//        The signature is:
//           function (error, solrRecord)
//        where solrRecord is the transformed version of the record that will be sent to SOLR.
//        ** solrRecord will be passed into the arguments of the next function in async.waterfall **
//--------------------------------------------------------------------------------------------
function runSolrXform(log, config, environment, vprRecord, callback) {
    var metricsObj = {
        'subsystem': 'SOLR',
        'action': 'transform',
        'uid': vprRecord.uid,
        'pid': vprRecord.pid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    environment.metrics.debug('SOLR record transformation', metricsObj);

    // This gives us a hook so that we can test this better via Unit tests.
    //---------------------------------------------------------------------
    var solrXform;
    if (!environment.solrXform) {
        solrXform = require(global.VX_UTILS + 'solr-xform');
    } else {
        solrXform = environment.solrXform;
    }

    solrXform(vprRecord, log, config, function(error, result) {
        metricsObj.timer = 'stop';

        var errorMessage;
        if (error) {
            environment.metrics.debug('SOLR record transformation in error', metricsObj);
            errorMessage = util.format('solr-record-storage-handler.runSolrXform: SOLR xform returned error: %s', error);
            log.error(errorMessage);
            return callback(errorUtil.createTransient('Unable to store record in solr', errorMessage));
        }

        if (!result) {
            environment.metrics.debug('SOLR record transformation in error', metricsObj);
            errorMessage = util.format('solr-record-storage-handler.handle: SOLR xform returned null. There is no SOLR record to store.  uid: %s', vprRecord.uid);
            log.error(errorMessage);
            return callback(errorUtil.createTransient('Unable to store record in solr', errorMessage));
        }

        environment.metrics.debug('SOLR record transformation', metricsObj);
        callback(null, result);
    });
}

//-------------------------------------------------------------------------------------
// Sends a record to SOLR for storage
//
// log: The logger which should be used to send log messages.
// config: The configuration settings to be used.
// environment: The environment containing shared objects, etc.
// vprRecord: The record in VPR format
// solrRecord: The transformed record that will be sent to SOLR
//             ** This will be passed in as the result of the previous function's callback in async.waterfall **
// callback: The callback method to call when this is done.
//--------------------------------------------------------------------------------------
function storeInSolr(log, config, environment, vprRecord, solrRecord, callback) {
    log.debug('solr-record-storage-handler.handle: Storing SOLR record.  uid: %s; solrRecord: %j', vprRecord.uid, solrRecord);
    var metricsObj = {
        'subsystem': 'SOLR',
        'action': 'store',
        'uid': vprRecord.uid,
        'pid': vprRecord.pid,
        'process': uuid.v4(),
        'timer': 'start'
    };

    metricsObj.timer = 'start';
    metricsObj.action = 'storeRecord';
    environment.metrics.debug('SOLR record storage', metricsObj);
    environment.solr.add(solrRecord, function(error) {
        metricsObj.timer = 'stop';
        if (error) {
            environment.metrics.debug('SOLR record storage in Error', metricsObj);
            var errorMessage;
            errorMessage = util.format('solr-record-storage-handler.handle: Error storing to SOLR.  error: %s; uid: %s, solrRecord: %j', error, vprRecord.uid, solrRecord);
            log.error(errorMessage);
            return callback(errorUtil.createTransient('Unable to store record in solr', errorMessage));
        }

        environment.metrics.debug('SOLR record storage', metricsObj);
        log.info('solr-record-storage-handler.handle: Record stored to SOLR successfully.  uid: %s', vprRecord.uid);
        callback(null);
    });
}

module.exports = handleWrapper;
module.exports.writebackWrapper = store;
module.exports.trackSolrStorage = trackSolrStorage;
