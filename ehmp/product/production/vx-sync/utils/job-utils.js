'use strict';

var format = require('util').format;
var uuid = require('node-uuid');
var _ = require('underscore');
var domains = require('./domain');
//var log = require(global.VX_UTILS + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
//log = require('bunyan').createLogger({name: 'job-utils', level: 'debug'});

var jobUtil = {};

function createEnterpriseSyncRequest(patientIdentifier, jpid, forceSync, demographics) {
    var job = create(enterpriseSyncRequestType(), patientIdentifier, null, null, null, null, {
        'jpid': jpid,
        'forceSync': forceSync
    });
    if(demographics) {
        job.demographics = demographics;
    }
    return job;
}

function createVistaSubscribeRequest(vistaId, patientIdentifier, rootJob) {
    return create(vistaSubscribeRequestType(vistaId), patientIdentifier, null, null, null, null, rootJob);
}

function createVistaPollerRequest(vistaId, patientIdentifier, record, eventUid, rootJob) {
    return create(vistaPollerRequestType(vistaId), patientIdentifier, null, record, null, eventUid, rootJob);
}

function createVistaPollerDomainRequest(vistaId, domain, patientIdentifier, record, eventUid, rootJob) {
    return create(vistaPollerDomainRequestType(vistaId, domain), patientIdentifier, null, record, null, eventUid, rootJob);
}

function createVistaRecordProcessorRequest(record, rootJob) {
    return create(vistaRecordProcessorRequestType(), null, null, record, null, null, rootJob);
}

function createVistaPrioritizationRequest(patientIdentifier, domain, record, rootJob) {
    return create(vistaPrioritizationRequestType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createHdrSyncRequest(patientIdentifier, rootJob) {
    return create(hdrSyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

// TODO: requestStampTime
function createHdrXformVpr(patientIdentifier, domain, record, rootJob) {
    return create(hdrXformVprType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createOperationalSyncRequest(site) {
    return createSiteRequest(vistaOperationalSubscribeRequestType(site), site);
}

function createVlerSyncRequest(patientIdentifier, rootJob) {
    return create(vlerSyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

function createVlerXformVpr(patientIdentifier, domain, record, requestStampTime, rootJob) {
     return create(vlerXformVprType(), patientIdentifier, domain, record, requestStampTime, null, rootJob);
}

function createPgdSyncRequest(patientIdentifier, rootJob) {
    return create(pgdSyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

// TODO: requestStampTime
function createPgdXformVpr(patientIdentifier, domain, record, rootJob) {
    return create(pgdXformVprType(), patientIdentifier, domain, record, null, null, rootJob);
}

// Here to prevent re-implementation of das/pgd,
// since they are both the same
function createDasSyncRequest(patientIdentifier, rootJob) {
    return createPgdSyncRequest(patientIdentifier, rootJob);
}

// Here to prevent re-implementation of das/pgd,
// since they are both the same
function createDasXformVpr(patientIdentifier, domain, record, rootJob) {
    return createPgdXformVpr(patientIdentifier, domain, record, null, rootJob);
}

function createJmeadowsDocumentRetrievalRequest(patientIdentifier, domain, record, rootJob){
    return create(jmeadowsDocRetrievalType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createJmeadowsSyncRequest(patientIdentifier, rootJob) {
    return create(jmeadowsSyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

function createHdrSyncRequest(patientIdentifier, rootJob) {
    return create(hdrSyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

function createJmeadowsDomainSyncRequest(patientIdentifier, domain, requestStampTime, rootJob) {
    return create(jmeadowsDomainSyncRequestType(domain), patientIdentifier, domain, null, requestStampTime, null, rootJob);
}

function createHdrDomainSyncRequest(patientIdentifier, domain, requestStampTime, rootJob) {
    return create(hdrDomainSyncRequestType(domain), patientIdentifier, domain, null, requestStampTime, null, rootJob);
}

function createJmeadowsDomainXformVpr(patientIdentifier, domain, record, rootJob) {
    return create(jmeadowsDomainXformVprType(domain), patientIdentifier, domain, record, null, null, rootJob);
}
function createJmeadowsDomainXformVpr(patientIdentifier, domain, record, requestStampTime, rootJob) {
     return create(jmeadowsDomainXformVprType(domain), patientIdentifier, domain, record, requestStampTime, null, rootJob);
}

function createHdrDomainXformVpr(patientIdentifier, domain, record, rootJob) {
    return create(hdrDomainXformVprType(domain), patientIdentifier, domain, record, null, null, rootJob);
}
function createHdrDomainXformVpr(patientIdentifier, domain, record, requestStampTime, rootJob) {
    return create(hdrDomainXformVprType(domain), patientIdentifier, domain, record, requestStampTime, null, rootJob);
}


function createRecordEnrichment(patientIdentifier, domain, record, rootJob) {
    return create(recordEnrichmentType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createStoreRecord(patientIdentifier, domain, record, rootJob) {
    return create(storeRecordType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createResyncRequest(patientIdentifier, rootJob) {
    return create(resyncRequestType(), patientIdentifier, null, null, null, null, rootJob);
}

function createPublishVxDataChange(patientIdentifier, domain, record, rootJob) {
    return create(publishVxDataChangeType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createActivityManagementEvent(patientIdentifier, domain, record) {
    return create(publishVxDataChangeType(), patientIdentifier, domain, record, null, null, null);
}

function createSolrRecordStorage(patientIdentifier, domain, record, rootJob) {
    return create(solrRecordStorageType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createJmeadowsPdfDocumentTransformRequest(patientIdentifier,domain,record,rootJob) {
    return create(jmeadowsPdfDocumentTransformType(), patientIdentifier, domain, record, null, null, rootJob);
}

function createOperationalDataStore(record) {
    return createOperational(record);
}

function createVistaHdrSubscribeRequest(siteId, patientIdentifier, rootJob) {
    return create(vistahdrSubScribeRequestType(siteId), patientIdentifier, null, null, null, null, rootJob);
}

function createVistaHdrPollerRequest(siteId, patientIdentifier, record, eventUid, rootJob) {
    return create(vistahdrPollerRequestType(siteId), patientIdentifier, null, record, null, eventUid, rootJob);
}

function createVistaHdrPollerDomainRequest(siteId, domain, patientIdentifier, record, eventUid, rootJob) {
    return create(vistahdrPollerDomainRequestType(siteId, domain), patientIdentifier, null, record, null, eventUid, rootJob);
}

function enterpriseSyncRequestType() {
    return 'enterprise-sync-request';
}

function vistaSubscribeRequestType(vistaId) {
    return format('vista-%s-subscribe-request', vistaId);
}

function vistaPollerDomainRequestType(vistaId, domain) {
    return format('vista-%s-data-%s-poller', vistaId, domain);
}

function vistaPollerRequestType(vistaId) {
    return format('vista-%s-data-poller', vistaId);
}

function vistaRecordProcessorRequestType() {
    return format('vista-record-processor-request');
}

function vistaOperationalSubscribeRequestType() {
    return 'vista-operational-subscribe-request';
}

function vistaPrioritizationRequestType() {
    return 'vista-prioritization-request';
}

function vistahdrSubScribeRequestType(siteId) {
    return format('vistahdr-%s-subscribe-request', siteId);
}

function vistahdrPollerRequestType(siteId) {
    return format('vistahdr-%s-data-poller', siteId);
}

function vistahdrPollerDomainRequestType(siteId, domain) {
    return format('vistahdr-%s-data-%s-poller', siteId, domain);
}

function hdrXformVprType() {
    return 'hdr-xform-vpr';
}

function isVistAHdrSubscribeRequestType(type) {
    if (_.isString(type)) {
        return type.indexOf('vistahdr-') === 0;
    }
    return false;
}

function vlerXformVprType() {
    return 'vler-xform-vpr';
}

function pgdSyncRequestType() {
    return 'pgd-sync-request';
}

function pgdXformVprType() {
    return 'pgd-xform-vpr';
}

// Here to prevent re-implementation of das/pgd,
// since they are both the same
function dasSyncRequestType() {
    return pgdSyncRequestType();
}

// Here to prevent re-implementation of das/pgd,
// since they are both the same
function dasXformVprType() {
    return pgdXformVprType();
}

function jmeadowsSyncRequestType() {
    return 'jmeadows-sync-request';
}

function hdrSyncRequestType() {
    return 'hdr-sync-request';
}

function vlerSyncRequestType() {
    return 'vler-sync-request';
}

function jmeadowsDomainSyncRequestType(domain) {
    return format('jmeadows-sync-%s-request', domain);
}

function hdrDomainSyncRequestType(domain) {
    return format('hdr-sync-%s-request', domain);
}

function jmeadowsDomainXformVprType(domain) {
    return format('jmeadows-xform-%s-vpr', domain);
}

function hdrDomainXformVprType(domain) {
    return format('hdr-xform-%s-vpr', domain);
}

function recordEnrichmentType() {
    return 'record-enrichment';
}

function storeRecordType() {
    return 'store-record';
}

function solrRecordStorageType() {
    return 'solr-record-storage';
}

function jmeadowsCdaDocumentConversionType(){
    return 'jmeadows-cda-document-conversion';
}

function createJmeadowsCdaDocumentConversion(patientIdentifier, domain, record, rootJob){
    return create(jmeadowsCdaDocumentConversionType(), patientIdentifier, domain, record, null, null, rootJob);
}

function jmeadowsDocRetrievalType() {
    return 'jmeadows-document-retrieval';
}

function publishVxDataChangeType() {
    return 'publish-data-change-event';
}

function activityManagementEventType() {
    return 'activity-management-event';
}

function jmeadowsPdfDocumentTransformType(){
    return 'jmeadows-pdf-document-transform';
}

function operationalDataStoreType() {
    return 'operational-store-record';
}

function errorRequestType() {
    return 'error-request';
}

function resyncRequestType() {
    return 'resync-request';
}

// TODO: requestStampTime
function create(type, patientIdentifier, domain, record, requestStampTime, eventUid, meta) {
    var job = {
        type: type,
        timestamp: String(Date.now())
    };

    if (patientIdentifier) {
        job.patientIdentifier = patientIdentifier;
    }

    if ((_.isUndefined(meta)) || (_.isNull(meta))) {
        meta = {};
    }

    if ((!_.isUndefined(meta.jpid)) && (!_.isNull(meta.jpid))) {
        job.jpid = meta.jpid;
    }

    if (!_.isUndefined(meta.rootJobId)) {
        job.rootJobId = meta.rootJobId;
    }

    if (!_.isUndefined(meta.forceSync)) {
        job.forceSync = meta.forceSync;
    }

    if (domain) {
        job.dataDomain = domain;
    }

    if (record) {
        job.record = record;
    }

    if(requestStampTime) {
        job.requestStampTime = requestStampTime;
    }

    if (eventUid) {
        job['event-uid'] = eventUid;
    }

    // if (!_.isUndefined(meta.jobId)) {
    //     job.jobId = meta.jobId;
    // }

    job.jobId = _.isUndefined(meta.jobId) || _.isNull(meta.jobId) ? uuid.v4() : meta.jobId;

    return job;
}

function createOperational(record) {
    return {
        type: operationalDataStoreType(),
        jpid: uuid.v4(),
        record: record
    };
}

function createSiteRequest(type, site) {
    return {
        type: type,
        site: site
    };
}

function isValid(type, job, vistaId) {
    // log.debug('job-utils.isValid: Entered method.  type: %s; job: %j; vistaId: %s', type, job, vistaId);

    if (_.isEmpty(type) || _.isEmpty(job)) {
        return false;
    }

    // log.debug('job-utils.isValid: Job was valid.');

    if (missingOrBlank(job, 'type')) {
        return false;
    }

    // PatientIdentifier should exist for all types except vistaRecordProcessorRequestType
    //--------------------------------------------------------------------------------------
    if (type !== vistaRecordProcessorRequestType()) {
        if (missingOrBlank(job, 'patientIdentifier')) {
            return false;
        }

        // log.debug('job-utils.isValid: Job.type and job.patientIdentifier was valid.');

        if (missingOrBlank(job.patientIdentifier, 'type') || missingOrBlank(job.patientIdentifier, 'value')) {
            return false;
        }
    }

    // log.debug('job-utils.isValid: patientIdentifier.type and patientIdentifier.value was valid.');

    // If this is for a non vista-specific handler.
    //----------------------------------------------
    if (!vistaId) {
        // log.debug('job-utils.isValid: non vista specific.');

        if (!_.has(fields, type)) {
            return false;
        }

        // log.debug('job-utils.isValid: Before allFieldsValid check.');

        var validFields = allFieldsValid(job, fields[type]);

        // log.debug('job-utils.isValid: After allFieldsValid check.  validFields: %s', validFields);

        return validFields;
    }

    // If we got here it means that we are checking a VistA specific job.
    //--------------------------------------------------------------------
    return job.type === vistaSubscribeRequestType(vistaId) && allFieldsValid(job, fields[vistaSubscribeRequestType()]);

}

function isSyncJobType(job) {
    var vistaTypeRegEx = /vista-[0-9,A-F]{4}-subscribe/;
    var vistaHdrTypeRegEx = /vistahdr-[0-9,A-F]{4}-subscribe/;
    if (vistaTypeRegEx.test(job.type) || vistaHdrTypeRegEx.test(job.type) ||
        job.type === jmeadowsSyncRequestType() ||
        job.type === hdrSyncRequestType() || job.type === vlerSyncRequestType()) {
        return true;
    } else {
        return false;
    }
}

function isSecondaryDomainSyncRequestType(job){
    var jmeadowsSyncDomainTypeRegEx = /jmeadows-sync-([a-z]+-)?request/;
    var hdrSyncDomainTypeRegEx = /hdr-sync-([a-z]+-)?request/;
    var vlerSyncDomainTypeRegEx = /vler-sync-request/;

    if(jmeadowsSyncDomainTypeRegEx.test(job.type) || hdrSyncDomainTypeRegEx.test(job.type) || vlerSyncDomainTypeRegEx.test(job.type)){
        return true;
    } else {
        return false;
    }
}

function missingOrBlank(object, field) {
    return _.isUndefined(object) || _.isNull(object) || _.isUndefined(object[field]) || _.isNull(object[field]) || object[field] === '';
}

function allFieldsValid(object, requiredFields) {
    return _.every(requiredFields, function(name) {
        return !missingOrBlank(object, name);
    });
}

var fields = {};
fields[enterpriseSyncRequestType()] = [];
fields[resyncRequestType()] = [];

fields[hdrXformVprType()] = ['domain', 'record', 'jpid'];
fields[vlerSyncRequestType()] = ['jpid'];
fields[vlerXformVprType()] = ['domain', 'record', 'jpid'];
fields[pgdSyncRequestType()] = ['jpid'];
fields[pgdXformVprType()] = ['domain', 'record', 'jpid'];
fields[dasSyncRequestType()] = ['jpid'];
fields[dasXformVprType()] = ['domain', 'record', 'jpid'];
fields[jmeadowsSyncRequestType()] = ['jpid'];
fields[hdrSyncRequestType()] = ['jpid'];

_.each(domains.getJmeadowsDomainList(), function(domain) {
    fields[jmeadowsDomainSyncRequestType(domain)] = ['domain', 'record', 'jpid'];
    fields[jmeadowsDomainXformVprType(domain)] = ['dataDomain', 'patientIdentifier', 'requestStampTime','record', 'jpid'];
});


_.each(domains.getHdrDomainList(), function(domain) {
    fields[hdrDomainSyncRequestType(domain)] = ['domain', 'record', 'jpid'];
    fields[hdrDomainXformVprType(domain)] = ['dataDomain', 'patientIdentifier', 'requestStampTime','record', 'jpid'];
});

// fields[recordEnrichmentType()] = ['record', 'jpid', 'dataDomain'];
fields[recordEnrichmentType()] = ['record', 'dataDomain'];
// fields[recordEnrichmentType()] = [];

// fields[storeRecordType()] = ['record', 'jpid'];
fields[storeRecordType()] = ['record'];

// fields[publishVxDataChangeType()] = ['domain', 'record', 'jpid'];
fields[publishVxDataChangeType()] = ['domain', 'record'];

// fields[vistaPrioritizationRequestType()] = ['record', 'jpid'];
fields[vistaPrioritizationRequestType()] = ['record'];

fields[vistaSubscribeRequestType()] = ['jpid'];
fields[vistaRecordProcessorRequestType()] = ['record'];

module.exports = jobUtil;
jobUtil.create = create;
jobUtil.isValid = isValid;
jobUtil.isSyncJobType = isSyncJobType;
jobUtil._missingOrBlank = missingOrBlank;
jobUtil._allFieldsValid = allFieldsValid;
jobUtil.createEnterpriseSyncRequest = createEnterpriseSyncRequest;
jobUtil.createVistaSubscribeRequest = createVistaSubscribeRequest;
jobUtil.createVistaPollerRequest = createVistaPollerRequest;
jobUtil.createVistaPollerDomainRequest = createVistaPollerDomainRequest;
jobUtil.createVistaRecordProcessorRequest = createVistaRecordProcessorRequest;
jobUtil.createVistaPrioritizationRequest = createVistaPrioritizationRequest;
jobUtil.createHdrSyncRequest = createHdrSyncRequest;
jobUtil.hdrXformVprType = hdrXformVprType;
jobUtil.createHdrXformVpr = createHdrXformVpr;
jobUtil.createVlerSyncRequest = createVlerSyncRequest;
jobUtil.createVlerXformVpr = createVlerXformVpr;
jobUtil.createPgdSyncRequest = createPgdSyncRequest;
jobUtil.createPgdXformVpr = createPgdXformVpr;
jobUtil.createDasSyncRequest = createDasSyncRequest;
jobUtil.createDasXformVpr = createDasXformVpr;
jobUtil.createJmeadowsSyncRequest = createJmeadowsSyncRequest;
jobUtil.createJmeadowsDomainSyncRequest = createJmeadowsDomainSyncRequest;
jobUtil.createRecordEnrichment = createRecordEnrichment;
jobUtil.createStoreRecord = createStoreRecord;
jobUtil.createSolrRecordStorage = createSolrRecordStorage;
jobUtil.createPublishVxDataChange = createPublishVxDataChange;
jobUtil.createActivityManagementEvent = createActivityManagementEvent;
jobUtil.createOperationalDataStore = createOperationalDataStore;
jobUtil.createOperationalSyncRequest = createOperationalSyncRequest;
jobUtil.createSiteRequest = createSiteRequest;
jobUtil.createJmeadowsPdfDocumentTransformRequest = createJmeadowsPdfDocumentTransformRequest;
jobUtil.createJmeadowsDocumentRetrievalRequest = createJmeadowsDocumentRetrievalRequest;

jobUtil.enterpriseSyncRequestType = enterpriseSyncRequestType;
jobUtil.vistaSubscribeRequestType = vistaSubscribeRequestType;
jobUtil.vistaPollerRequestType = vistaPollerRequestType;
jobUtil.vistaPollerDomainRequestType = vistaPollerDomainRequestType;
jobUtil.vistaRecordProcessorRequestType = vistaRecordProcessorRequestType;
jobUtil.vistaPrioritizationRequestType = vistaPrioritizationRequestType;
jobUtil.resyncRequestType = resyncRequestType;
jobUtil.createResyncRequest = createResyncRequest;

jobUtil.vlerSyncRequestType = vlerSyncRequestType;
jobUtil.vlerXformVprType = vlerXformVprType;
jobUtil.pgdSyncRequestType = pgdSyncRequestType;
jobUtil.pgdXformVprType = pgdXformVprType;
jobUtil.dasSyncRequestType = dasSyncRequestType;
jobUtil.dasXformVprType = dasXformVprType;
jobUtil.jmeadowsSyncRequestType = jmeadowsSyncRequestType;
jobUtil.hdrSyncRequestType = hdrSyncRequestType;
jobUtil.hdrXformVprType = hdrXformVprType;

jobUtil.jmeadowsDomainSyncRequestType = jmeadowsDomainSyncRequestType;
jobUtil.hdrDomainSyncRequestType = hdrDomainSyncRequestType;
jobUtil.createHdrDomainSyncRequest = createHdrDomainSyncRequest;

jobUtil.jmeadowsDomainXformVprType = jmeadowsDomainXformVprType;
jobUtil.hdrDomainXformVprType = hdrDomainXformVprType;

jobUtil.recordEnrichmentType = recordEnrichmentType;
jobUtil.storeRecordType = storeRecordType;
jobUtil.solrRecordStorageType = solrRecordStorageType;
jobUtil.publishVxDataChangeType = publishVxDataChangeType;
jobUtil.activityManagementEventType = activityManagementEventType;
jobUtil.operationalDataStoreType = operationalDataStoreType;
jobUtil.vistaOperationalSubscribeRequestType = vistaOperationalSubscribeRequestType;
jobUtil.jmeadowsPdfDocumentTransformType = jmeadowsPdfDocumentTransformType;
jobUtil.jmeadowsDocRetrievalType = jmeadowsDocRetrievalType;
jobUtil.jmeadowsCdaDocumentConversionType = jmeadowsCdaDocumentConversionType;
jobUtil.createJmeadowsCdaDocumentConversion = createJmeadowsCdaDocumentConversion;
jobUtil.createHdrDomainXformVpr = createHdrDomainXformVpr;
jobUtil.createJmeadowsDomainXformVpr = createJmeadowsDomainXformVpr;
jobUtil.isSecondaryDomainSyncRequestType = isSecondaryDomainSyncRequestType;
jobUtil.isVistAHdrSubscribeRequestType = isVistAHdrSubscribeRequestType;
jobUtil.createVistaHdrSubscribeRequest = createVistaHdrSubscribeRequest;
jobUtil.createVistaHdrPollerRequest = createVistaHdrPollerRequest;
jobUtil.createVistaHdrPollerDomainRequest = createVistaHdrPollerDomainRequest;
jobUtil.vistahdrSubScribeRequestType = vistahdrSubScribeRequestType;
jobUtil.vistahdrPollerRequestType = vistahdrPollerRequestType;
jobUtil.errorRequestType = errorRequestType;
