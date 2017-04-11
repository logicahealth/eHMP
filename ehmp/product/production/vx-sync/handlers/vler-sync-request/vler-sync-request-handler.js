'use strict';

var _ = require('underscore');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var request = require('request');
var format = require('util').format;
var inspect = require(global.VX_UTILS + 'inspect');
var timeUtil = require(global.VX_UTILS + 'time-utils');
var errorUtil = require(global.VX_UTILS + 'error');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var metastampUtil = require(global.VX_UTILS + 'metastamp-utils');
var uuid = require('node-uuid');
var VxSyncForeverAgent = require(global.VX_UTILS+'vxsync-forever-agent');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('vler-sync-request-handler.handle : received request to VLER job: %j', job);

    if (!job) {
        log.debug('vler-sync-request-handler.handle : Job was null or undefined');
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
    }

    if (!job.type || job.type !== jobUtil.vlerSyncRequestType()) {
        log.debug('vler-sync-request-handler..handle : job type was invalid: %s', job.type);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type', job.type), job);
    }

    if (!jobUtil.isValid(jobUtil.vlerSyncRequestType(), job)) {
        log.debug('vler-sync-request-handler.handle : job was invalid jpid=%s', job.jpid);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job', job.type), job);
    }

    var documentListConfig = getVlerDocumentListConfiguration(log, config, job);
    if (documentListConfig === null) {
        log.warn('vler-sync-request-handler.handle: No configuration for job: %j', job);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('VLER has no configuration', job.type), job);
        // return handlerCallback('vler-sync-request-handler.handle: No configuration');
    }

    // Create an ability to test this through a unit test...    By allowing us to pass in a request object to be used
    // in place of the real one.
    //----------------------------------------------------------------------------------------------------------------
    if ((_.isFunction(environment.request))) {
        log.debug('vler-sync-request-handler.handle: Setting request to dummy value for unit test.');
        request = environment.request;
    }
    var metricsObj = {'timer':'start','process':uuid.v4(),'pid':job.patientIdentifier.value,'subsystem':'VLER','action':'sync','jobId':job.jobId,'rootJobId':job.rootJobId,'jpid':job.jpid};
    environment.metrics.debug('VLER domain sync',metricsObj);
    metricsObj.timer='stop';

    log.debug('vler-sync-request-handler.handle: sending request to VLER for icn: %s; config: %j.', idUtil.extractIcnFromPid(job.patientIdentifier.value, config), documentListConfig);
    request(documentListConfig, function(error, response, body) {
        log.debug('vler-sync-request-handler,handle: Received VLER document list response.  error: %s; ', error);
        if ((!error) && (response) && (response.statusCode === 200) && (body)) {
            environment.metrics.debug('VLER domain sync',metricsObj);
            log.debug('vler-sync-request-handler.handle: response body (string form): %s', body);
            var jsonObj;
            if (typeof body !== 'object') {
                log.debug('vler-sync-request-handler.handle: was a string.  Parsing to object now...');
                try {
                    jsonObj = JSON.parse(body);
                } catch (e) {
                    log.error('vler-sync-request-handler.handle: Failed to parse JSON.  body: %s', body);
                    return handlerCallback(errorUtil.createFatal('Failed to parse JMeadows response.'));
                }
            } else {
                log.debug('vler-sync-request-handler.handle: was an object - no parsing necessary.', body);
                jsonObj = body;
            }

            var requestStampTime = timeUtil.createStampTime();

            var vprRecord = {
                data: {
                    items: []
                }
            };
            var icn = idUtil.extractIcnFromPid(job.patientIdentifier.value, config);
            var jobsToPublish = _.map(jsonObj.documentList, function(document) {
                document.localId = format('%s_%s_%s', document.homeCommunityId, document.repositoryUniqueId, document.documentUniqueId);
                document.localId = document.localId.replace(/:/g, '.');
                document.uid = uidUtils.getUidForDomain('vlerdocument', 'VLER', icn, document.localId);
                document.pid = 'VLER;'+icn;
                vprRecord.data.items.push(document);
                var record = {
                    icn: idUtil.extractIcnFromPid(job.patientIdentifier.value, config),
                    document: document
                };
                return jobUtil.createVlerXformVpr(job.patientIdentifier, 'vlerdocument', record, requestStampTime, job);
            });

            // If we have no data coming back - then there is no need to create a meta-stamp or go any further on this one.
            //--------------------------------------------------------------------------------------------------------------
            if (_.isEmpty(vprRecord.data.items)) {
                log.debug('vler-sync-request-handler.handle: Received no VLER data for %s', job.patientIdentifier.value);
                return setTimeout(handlerCallback, 0, null, 'NoDataReceived');
            }

            var domainMetastamp = metastampUtil.metastampDomain(vprRecord, requestStampTime, null);
            log.debug('vler-to-vpr-xform-handler.handle: metastamp created: %j', domainMetastamp);

            environment.jds.saveSyncStatus(domainMetastamp, job.patientIdentifier, function(error, response) {
                log.debug('vler-to-vpr-xform-handler.handle: saveSyncStatus returned.  error: %s; response: %j', error, response);
                if (error) {
                    log.error('vler-to-vpr-xform-handler.handle: Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, domainMetastamp);
                    error = errorUtil.createTransient('Unable to store metastamp', error);

                    // TODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                    //--------------------------------------------------------------------------------------------------------------------------
                    return handlerCallback(null, 'FailedVlerError');
                }

                if (!response) {
                    log.error('vler-to-vpr-xform-handler.handle:  Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, domainMetastamp);

                    // TODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                    //--------------------------------------------------------------------------------------------------------------------------
                    // return callback(util.format('Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

                    return handlerCallback(null, 'FailedVlerNoResponse');
                }

                if (response.statusCode !== 200) {
                    log.error('vler-to-vpr-xform-handler.handle:  Failed to store metaStamp for pid: %s - incorrect status code returned. Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, domainMetastamp);

                    // TODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                    //--------------------------------------------------------------------------------------------------------------------------
                    // return callback(util.format('Failed to store metaStamp for pid: %s - incorrect status code returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

                    return handlerCallback(null, 'FailedVlerWrongStatusCode');
                }
                log.debug('vler-sync-request-handler.handle: publishing %d jobs', jobsToPublish.length);
                environment.publisherRouter.publish(jobsToPublish, handlerCallback);
            });

        } else {
            environment.metrics.debug('VLER domain sync in Error',metricsObj);
            var statusCode;
            if ((response) && (response.statusCode)) {
                statusCode = response.statusCode;
            }

            var errorMessage = format('vler-sync-request-handler.handle: Unable to retrieve VLER document list via Soap Handler. domain: %s, patient: %s, error: %s, response.statusCode: %s', job.dataDomain, inspect(job.patientIdentifier), inspect(error), statusCode);
            log.error(errorMessage);
            return setTimeout(handlerCallback, 0, errorUtil.createTransient(errorMessage, job.type), job);
        }
    });

}

function getVlerDocumentListConfiguration(log, config, job) {
    var query = {};
    query.icn = idUtil.extractIcnFromPid(job.patientIdentifier.value, config);
    if (!config.vler) {
        log.error('vler-sync-request-handler.getVlerDocumentListConfiguration: Missing VLER configuration');
        return null;
    }

    var vlerConfig = {
        'qs': query
    };
    vlerConfig = _.defaults(vlerConfig, config.vler);
    var url = format('%s://%s:%s%s', 'http', vlerConfig.defaults.host, vlerConfig.defaults.port, vlerConfig.vlerdocument.documentListPath);
    vlerConfig.url = url;
    vlerConfig.agentClass = VxSyncForeverAgent;

    return vlerConfig;
}

module.exports = handle;
module.exports._getVlerDocumentListConfiguration = getVlerDocumentListConfiguration;