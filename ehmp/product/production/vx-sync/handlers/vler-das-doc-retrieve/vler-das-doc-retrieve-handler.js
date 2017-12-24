'use strict';

const _ = require('lodash');
const idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
const jobUtil = require(global.VX_UTILS + 'job-utils');
const errorUtil = require(global.VX_UTILS + 'error');
const request = require('request');
const format = require('util').format;
const inspect = require(global.VX_UTILS + 'inspect');
const uuid = require('node-uuid');
const metastampUtils = require(global.VX_UTILS + 'metastamp-utils');
const uidUtils = require(global.VX_UTILS + 'uid-utils');
const async = require('async');

const parseXmlString = require('xml2js').parseString;
const CCDA_TEMPLATE_ID = '2.16.840.1.113883.10.20.22.1.1';
const C32_TEMPLATE_ID = '2.16.840.1.113883.3.88.11.32.1';

//-----------------------------------------------------------------------------------------------------------
// The handler's main function.  This is called when a job is retrieved that this handler can service.
//
// log: The logger to use for log messages.
// config: The properties to use (worker-config.json)
// job: The job that was pulled from the Beanstalk tube
// handlerCallback: The call back to call when the handler is done.
//------------------------------------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback) {
    log.debug('vler-das-doc-retrieve-handler.handle : received request to VLER job: %j', job);

    if (!job) {
        log.debug('vler-das-doc-retrieve-handler.handle : Job was null or undefined');
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
    }

    if (!job.type || job.type !== jobUtil.vlerDasDocRetrieveType()) {
        log.debug('vler-das-doc-retrieve-handler.handle : job type was invalid: %s', job.type);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type', job.type));
    }

    if (!jobUtil.isValid(jobUtil.vlerDasDocRetrieveType(), job)) {
        log.debug('vler-das-doc-retrieve-handler.handle : job was invalid jpid=%s', job.jpid);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job', job.type));
    }

    let readServiceConfig = getVlerDasReadConfiguration(log, config, job);
    if (readServiceConfig === null) {
        log.warn('vler-das-doc-retrieve-handler.handle: No configuration for job: %j', job);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('VLER DAS has no configuration', job.type));
    }

    let metricsObj = {
        'timer': 'start',
        'process': uuid.v4(),
        'pid': job.patientIdentifier.value,
        'subsystem': 'VLERDAS',
        'action': 'doc retrieve',
        'jobId': job.jobId,
        'rootJobId': job.rootJobId,
        'jpid': job.jpid
    };
    environment.metrics.debug('VLERDAS doc retrieve', metricsObj);
    metricsObj.timer = 'stop';

    log.debug('vler-das-doc-retrieve-handler.handle: sending request to VLER DAS for icn: %s; config: %j.', idUtil.extractIcnFromPid(job.patientIdentifier.value, config), readServiceConfig);
    request.get(readServiceConfig, function(error, response, result) {
        log.debug('vler-das-doc-retrieve-handler.handle: Received VLER DAS read response.  error: %s; ', error);
        if (error || !response || response.statusCode !== 200 || !result) {
            environment.metrics.debug('VLERDAS doc retrieve in Error', metricsObj);
            let statusCode = _.get(response, 'statusCode');
            let errorMessage = format('vler-das-doc-retrieve-handler.handle: Failed to retrieve VLERDAS documents. patient: %s, error: %s, response.statusCode: %s, result: %s', inspect(job.patientIdentifier), inspect(error), statusCode, inspect(result));
            log.error(errorMessage);
            return setTimeout(handlerCallback, 0, errorUtil.createTransient(errorMessage, job.type));
        }

        let documentList = result.entry;

        // If we have no data coming back - then there is no need to create a meta-stamp or go any further on this one.
        //--------------------------------------------------------------------------------------------------------------
        if (_.isEmpty(documentList)) {
            log.debug('vler-das-doc-retrieve-handler.handle: Received no VLER data for %s', job.patientIdentifier.value);
            return setTimeout(handlerCallback, 0, null, 'NoDataReceived');
        }

        processDocuments(log, config, job, documentList, function(domainMetastamp, jobsToPublish) {
            storeMetastamp(log, config, environment, job, domainMetastamp, handlerCallback, function() {
                log.debug('vler-das-doc-retrieve-handler.handle: publishing %d jobs', jobsToPublish.length);
                environment.publisherRouter.publish(jobsToPublish, handlerCallback);
            });
        });
    });
}

//-----------------------------------------------------------------------------------------------------------
// Determines the type of the document based on the given xml string.
//
// log: The logger to use for log messages.
// xmlString: the xml contents of the VLER document
// callback: The call back to call when this function is done.
//
// returns (via callback): A string indicating the type of document (CCDA, C32)
//                         OR a string indicating an XML parse error or unsupported document type
//------------------------------------------------------------------------------------------------------------
function determineKind(log, xmlString, callback) {
    log.debug('vler-das-doc-retrieve-handler.determineKind: parsing document XML string to determine document type.');
    parseXmlString(xmlString, function(error, result) {
        if (error) {
            log.error('vler-das-doc-retrieve-handler.determineKind: Error encountered when parsing XML string. Error: %s, xmlString: %s', error, xmlString);
            return callback('xmlParseError');
        }
        log.debug('vler-das-doc-retrieve-handler.determineKind: parsed XML string.');

        let templateIdList = _.map(_.get(result, 'ClinicalDocument.templateId'), function(templateIdNode) {
            return _.get(templateIdNode, '$.root');
        });

        if (_.contains(templateIdList, CCDA_TEMPLATE_ID)) {
            //check for CCDA first because CCDAs may contain other CDA templateIds
            return callback('CCDA');
        } else if (_.contains(templateIdList, C32_TEMPLATE_ID)) {
            return callback('C32');
        } else {
            log.error('vler-das-doc-retrieve-handler.determineKind: xmlString contained a document with an unspported format. xmlString: %s', xmlString);
            return callback('unsupportedFormat');
        }
    });
}

/*
    Compiles a metastamp and a list of vler-das-xform-vpr jobs for a given list of documents received from VLER.
    Also determines what kind of document from the XML.
    Ignores documents that are not CCDA or C32. Unsupported documents are excluded from the metastamp and from job creation.
    If an error is returned by determineKind, the job will still be created for that document so that we do not error out the
    whole batch of documents. Instead,the vler-das-xform-vpr-handler will add a placeholder
    message to the document stating that it is corrupted.

    Parameters:
      log: The logger to use for log messages.
      config: The properties to use (worker-config.json)
      job: The job that was pulled from the Beanstalk tube
      documentList: array of documents and metadata received from VLER
      callback: The call back to call when the handler is done.

    Returns multiple items via callback:
        1. The metastamp created from the list of vlerdocuments
        2. An array of vler-to-vpr-xform jobs created from the list of vlerdocuments (1 job per vlerdocument)
 */
function processDocuments(log, config, job, documentList, callback) {
    let metastampRecords = [];
    let icn = idUtil.extractIcnFromPid(job.patientIdentifier.value, config);
    let jobsToPublish = [];

    log.debug('vler-das-doc-retrieve-handler.processDocuments: entered method');
    async.eachSeries(documentList, function(document, asyncCallback) {
        //decode xml from Base 64
        let documentContent = _.first(_.get(document, 'content'));
        let xmlDoc = Buffer.from(_.get(documentContent, 'attachment.Data') || '', 'base64').toString();

        determineKind(log, xmlDoc, function(kind) {
            if (kind === 'unsupportedFormat') {
                log.debug('vler-das-doc-retrieve-handler.processDocuments: ignoring document that is in unsupported format');
                return asyncCallback();
            }

            let record = {
                xmlDoc: xmlDoc,
                kind: kind,
                resource: _.get(document, 'resource'),
                pid: job.patientIdentifier.value,
                uid: uidUtils.getUidForDomain('vlerdocument', 'VLER', icn, uuid.v4())
            };
            metastampRecords.push(record);

            // Create meta object for job information for all new VlerDasXformVpr jobs.
            // This shouldn't contain a jobId, as the jobUtil will create one for us.
            let meta = {
                jpid: job.jpid,
                rootJobId: job.rootJobId,
                priority: job.priority
            };

            if (job.referenceInfo) {
                meta.referenceInfo = job.referenceInfo;
            }

            jobsToPublish.push(jobUtil.createVlerDasXformVpr(job.patientIdentifier, record, job.requestStampTime, meta));
            asyncCallback();
        });
    }, function() {
        //create metastamp
        let domainMetastamp = metastampUtils.metastampDomain({
            data: {
                items: metastampRecords
            }
        }, job.requestStampTime, null);

        log.debug('vler-das-doc-retrieve-handler.processDocuments: completed');
        callback(domainMetastamp, jobsToPublish);
    });
}

/*
    Sends the metastamp to JDS and handles any returned errors.

    log: The logger for log messages.
    config: The configuration settings.
    environment: contains the shared jds-client instance.
    job: The job that we received that triggered this work.
    metastamp: The metastamp generated in createMetastampAndJobs
    handlerCallback: The callback to call when the handler is done; here it is only called in an error situation.
    callback: The callback to call when ready to move on to the next step of this handler's processing.
 */
function storeMetastamp(log, config, environment, job, metastamp, handlerCallback, callback) {
    log.debug('vler-to-vpr-xform-handler.storeMetastamp: Attempting to store metastamp to JDS for pid: %s', job.patientIdentifier.value);
    environment.jds.saveSyncStatus(metastamp, job.patientIdentifier, function(error, response) {
        log.debug('vler-to-vpr-xform-handler.storeMetastamp: saveSyncStatus returned.  error: %s; response: %j', error, response);
        if (error) {
            log.error('vler-to-vpr-xform-handler.storeMetastamp: Received error while attempting to store metaStamp for pid: %s.  Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, metastamp);
            error = errorUtil.createTransient('Unable to store metastamp', error);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            return handlerCallback(null, 'FailedJdsError');
        }

        if (!response) {
            log.error('vler-to-vpr-xform-handler.storeMetastamp:  Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, metastamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - no response returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            return handlerCallback(null, 'FailedJdsNoResponse');
        }

        if (response.statusCode !== 200) {
            log.error('vler-to-vpr-xform-handler.storeMetastamp:  Failed to store metaStamp for pid: %s - incorrect status code returned. Error: %s;  Response: %j; metaStamp:[%j]', job.patientIdentifier.value, error, response, metastamp);

            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
            //--------------------------------------------------------------------------------------------------------------------------
            // return callback(util.format('Failed to store metaStamp for pid: %s - incorrect status code returned.  Error: %s;  Response: %j; metaStamp:[%j]', syncStartJob.pid, error, response, syncStartJob.metaStamp), null);

            return handlerCallback(null, 'FailedJdsWrongStatusCode');
        }

        callback();
    });
}

//-----------------------------------------------------------------------------------------------------
// Create the config object that will be passed to request.
//
// log: The logger for log messages.
// config: The configuration settings.
// job: The job that we received that triggered this work.
// returns: The request config object that will be passed to request for this service call.
//-----------------------------------------------------------------------------------------------------
function getVlerDasReadConfiguration(log, config, job) {
    if (!_.get(config, 'vlerdas', null)) {
        log.error('vler-das-doc-retrieve-handler.getVlerDasReadConfiguration: Missing VLERDAS configuration');
        return null;
    }

    let dasProtocol = _.get(config, 'vlerdas.defaults.protocol', '');
    let dasHost = _.get(config, 'vlerdas.defaults.host', '');
    let dasPort = _.get(config, 'vlerdas.defaults.port', '');
    let dasReadPath = _.get(config, 'vlerdas.vlerdocument.readDocPath', '');

    let vlerConfig = {};
    vlerConfig.url = format('%s://%s:%s%s', dasProtocol, dasHost, dasPort, dasReadPath);
    vlerConfig.forever = true;
    vlerConfig.agentOptions = {
        maxSockets: config.handlerMaxSockets || 5
    };
    vlerConfig.qs = {
        'subject.Patient.identifier': idUtil.extractIcnFromPid(job.patientIdentifier.value, config),
        _format: 'application/json+fhir'
    };
    vlerConfig.json = true;

    return vlerConfig;
}



module.exports = handle;
module.exports._steps = {
    processDocuments: processDocuments,
    storeMetastamp: storeMetastamp,
    getVlerDasReadConfiguration: getVlerDasReadConfiguration,
    determineKind: determineKind
};