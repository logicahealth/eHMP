/*jslint node: true */
'use strict';

var _ = require('underscore');
var solrXform = require(global.VX_UTILS + 'solr-xform');
var uuid = require('node-uuid');

function handleWrapper(log, config, environment, job, handlerCallback) {
    store(log, config, environment, job.dataDomain, job.record, handlerCallback);
}

function store(log, config, environment, dataDomain, record, handlerCallback) {
    log.info('solr-record-storage-handler.handle: Received request to store record to SOLR (%s) %j', dataDomain, record);
    var solrClient = environment.solr;
    var metricsObj = {'subsystem':'SOLR','action':'transform','uid':record.uid, 'pid':record.pid,'process':uuid.v4(),'timer':'start'};
    environment.metrics.debug('SOLR record transformation', metricsObj);

    var solrRecord = solrXform(record, log);
    metricsObj.timer = 'stop';
    environment.metrics.debug('SOLR record transformation', metricsObj);
    if (_.isObject(solrRecord)) {
        log.debug('store-record-request-handler.handle: Storing SOLR record.  uid: %s; solrRecord: %j', record.uid, solrRecord);
        metricsObj.timer = 'start';
        metricsObj.action = 'storeRecord';
        environment.metrics.debug('SOLR record storage', metricsObj);
        solrClient.add(solrRecord, function(error) {
            metricsObj.timer = 'stop';
            if (error) {
                environment.metrics.debug('SOLR record storage in Error', metricsObj);
                // error storing to solr.  log it, but don't kill stuff
                log.error('store-record-request-handler.handle: Error storing to SOLR.  error: %s; uid: %s, solrRecord: %j', error, record.uid, solrRecord);

                return handlerCallback(null, 'success');
            } else {
                environment.metrics.debug('SOLR record storage', metricsObj);
                log.info('store-record-request-handler.handle: Record stored to SOLR successfully.  uid: %s', record.uid);
                return handlerCallback(null, 'success');
            }
        });
    } else {
        log.warn('store-record-request-handler.handle: SOLR xform returned null There is no SOLR record to store.  uid: %s', record.uid);
        return handlerCallback(null, 'success');
    }
}

module.exports = handleWrapper;
module.exports.writebackWrapper = store;
module.exports._units = {};