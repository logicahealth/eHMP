'use strict';

var util = require('util');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var storeInJds = require(global.VX_HANDLERS + 'store-record-request/store-record-request-handler').store;
var storeInSolr = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler').writebackWrapper;
var recordEnrichmentLocation = global.VX_HANDLERS + 'record-enrichment-request';

function handle(log, config, environment, job, handlerCallback) {
    log.debug('record-update-handler.handle: Received record update job: %j', job);

    // Make sure that this job is valid.
    //----------------------------------
    if (!jobUtil.isValid(jobUtil.recordUpdateType(), job)) {
        log.warn('record-update-handler.handle: Invalid job received %j', job);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid format for job', job));
    }

    storeMetaStamp(log, config, environment, job, handlerCallback);
}

function storeMetaStamp(log, config, environment, job, handlerCallback){
    var uid = job.record.uid;
    log.debug('record-update-handler.storeMetaStamp for uid %s: Entering method.', uid);

    if(!job.metaStamp){
        log.debug('record-update-handler.storeMetaStamp: No metaStamp included with job. Skipping to next step.');
        return recordEnrichmentStep(log, config, environment, job, handlerCallback);
    }

    var metaStamp = job.metaStamp;
    var patientIdentifier = job.patientIdentifier;

    environment.jds.saveSyncStatus(metaStamp, patientIdentifier, function(error, response){
        log.debug('VistaRecordProcessor._storeMetaStamp: Returned from storing patient metaStamp for pid: %s.  Error: %s;  Response: %j', patientIdentifier.value, error, response);

        var errorMessage;
        if (error) {
            errorMessage = util.format('VistaRecordProcessor._storeMetaStamp:  Received error while attempting to store metaStamp for pid: %s.  Error: %s; Response: %j; metaStamp:[%j]', patientIdentifier.value, util.inspect(error), response, metaStamp);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient(errorMessage, error));
        }

        if (!response) {
            errorMessage = util.format('VistaRecordProcessor._storeMetaStamp:  Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', patientIdentifier.value, error, response, metaStamp);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient(errorMessage, error));
        }

        if (response.statusCode !== 200) {
            errorMessage = util.format('VistaRecordProcessor._storeMetaStamp:  Failed to store metaStamp for pid: %s - incorrect status code returned. Error: %s;  Response: %j; metaStamp:[%j]', patientIdentifier.value, error, response, metaStamp);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient(errorMessage, error));
        }

        recordEnrichmentStep(log, config, environment, job, handlerCallback);
    });
}

function recordEnrichmentStep(log, config, environment, job, handlerCallback){
    var uid = job.record.uid;
    log.debug('record-update-handler.recordEnrichmentStep for uid %s. Entering method', uid);
    var domain = job.dataDomain;

    // load record enrichment xformer for this domain
    var enrichmentXformer;
    try {
        enrichmentXformer = require(util.format(recordEnrichmentLocation + '/record-enrichment-%s-xformer', domain));
    } catch (e) {
        // Ignore 'not found' exception; is a normal situation.
    }

    if(!enrichmentXformer){
        //continue to next step
        log.debug('record-update-handler.recordEnrichmentStep: No record enrichment transformation found for domain %s. Continuing to next step. (uid: %s)', domain, uid);
        storeRecordStep(log, config, environment, domain, job.patientIdentifier, job.record, handlerCallback);
    } else {
        log.debug('record-update-handler.recordEnrichmentStep: Calling record-enrichment-%s-transformer for uid %s', domain, uid);
        enrichmentXformer(log, config, environment, job.record, function(error, enrichedRecord){
            if(error){
                log.error('record-update-handler.recordEnrichmentStep: Record enrichment returned error: %s', util.inspect(error));
                return handlerCallback(errorUtil.createTransient('record-update-handler.recordEnrichmentStep: Record enrichment returned error.', error));
            }

            log.debug('record-update-handler.recordEnrichmentStep: Record-enrichment-%s-transformer completed for uid %s. Continuing to next step.', domain, uid);
            storeRecordStep(log, config, environment, domain, job.patientIdentifier, enrichedRecord, handlerCallback);
        });
    }
}

function storeRecordStep(log, config, environment, domain, patientIdentifier, record, handlerCallback){
    var uid = record.uid;
    log.debug('record-update-handler.storeRecordStep for uid %s. Attempting to store record to JDS', uid);
    storeInJds(log, environment, domain, patientIdentifier, record, function(error, result){
        if(error){
            log.error('record-update-handler.storeRecordStep: Got error while attempting to store record to JDS: %s', util.inspect(error));
            return handlerCallback(errorUtil.createTransient('record-update-handler.storeRecordStep: Got error while attempting to store record to JDS.', error));
        }

        log.debug('record-update-handler.storeRecordStep for uid %s. JDS record storage successful. Continunig to next step.', uid);
        publishDataChangeEvent(log, environment, domain, patientIdentifier, record,function(error) {
            if (error) {
                log.error('record-update-handler.storeRecordStep: Got error while attempting to publish data change event: %s', util.inspect(error));
            }

            solrStorageStep(log, config, environment, domain, record, handlerCallback);
        });
    });
}

function solrStorageStep(log, config, environment, domain, record, handlerCallback){
    var uid = record.uid;
    log.debug('record-update-handler.solrStorageStep for uid %s. Attempting to store record to SOLR', uid);
    storeInSolr(log, config, environment, domain, record , function(error, result){
        if(error){
            log.error('record-update-handler.solrStorageStep: Got error while attempting to store record to SOLR: %s', util.inspect(error));
            return handlerCallback(errorUtil.createTransient('record-update-handler.solrStorageStep: Got error while attempting to store record to SOLR.', error));
        }

        log.debug('record-update-handler.solrStorageStep for uid %s. SOLR record storage successful. Record update completed.', uid);
        return handlerCallback(null, 'success');
    });
}

function publishDataChangeEvent(log, environment, domain, patientIdentifier, record, handlerCallback){
    log.debug('record-update-handler.publishDataChangeEvent for record %s.', record);

    var job = jobUtil.createPublishVxDataChange(patientIdentifier, domain, record);
    environment.publisherRouter.publish(job, handlerCallback);
}

module.exports = handle;