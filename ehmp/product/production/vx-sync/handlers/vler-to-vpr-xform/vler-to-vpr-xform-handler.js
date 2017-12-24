'use strict';

const _ = require('underscore');
const get = require('lodash').get;
const jobUtil = require(global.VX_UTILS + 'job-utils');
const idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
const request = require('request');
const format = require('util').format;
const inspect = require(global.VX_UTILS + 'inspect');
const errorUtil = require(global.VX_UTILS + 'error');
const lzma = require('lzma');

/*

The following properties are used in the config object:
vler: {
    domains: [
        'vlerdocument'
    ],
    compression: {
        minSize: 1887436  // if this is a non-numeric value or if it is missing, compression is turned off
    },
    disabled: false,
    defaults: {
        host: 'localhost',
        port: 5400,
        adminPort: 5401,
        method: 'GET',
        timeout: 60000
    },
    vlerdocument: {
        documentListPath: '/vler/documentList',
        documentPath: '/vler/document'
    }
},
*/
function handle(log, config, environment, job, handlerCallback) {
    log.debug('vler-to-vpr-xform-handler.handle : received request to VLER xform %j', job);
    if (!job.patientIdentifier || !job.patientIdentifier.type || job.patientIdentifier.type !== 'pid' || !idUtil.isVler(job.patientIdentifier.value) ||
        !job.record || !job.record.document.documentUniqueId || !job.record.document.homeCommunityId || !job.record.document.repositoryUniqueId) {
        log.error('vler-to-vpr-xform-handler.handle: Missing param(s).');
        return handlerCallback(errorUtil.createFatal('vler-to-vpr-xform-handler.handle: Missing parameter(s).'));
    }

    let documentConfig = getVlerDocumentConfiguration(log, config, job);
    if (documentConfig === null) {
        log.warn('vler-to-vpr-xform-handler.handle: No configuration for job: %j', job);
        return handlerCallback(errorUtil.createFatal('vler-to-vpr-xform-handler.handle: No configuration'));
    }

    log.debug('vler-to-vpr-xform-handler.handle: sending request to VLER for pid: %s; config: %s.', job.patientIdentifier.value, documentConfig);

    request(documentConfig, function(error, response, body) {
        log.debug('vler-to-vpr-xform-handler.handle: Received VLER document response.  error: %s; ', error);
        if ((!error) && (response) && (response.statusCode === 200)) {
            log.debug('vler-to-vpr-xform-handler.handle: response body (string form): %s', body);
            let jsonBody;
            if (typeof body !== 'object') {
                log.debug('vler-to-vpr-xform-handler.handle: was a string.  Parsing to object now...');
                try {
                    jsonBody = JSON.parse(body);
                } catch (e) {
                    log.error('vler-to-vpr-xform-handler.handle: Failed to parse JSON.  body: %s', body);
                    return handlerCallback(errorUtil.createFatal('Failed to parse VLER response.'));
                }

                let compress = compressionRequired(config, jsonBody);

                getFullHtml(log, compress, jsonBody.vlerDocHtml, function(err, result) {
                    if (!result) {
                        log.error(err);
                        return handlerCallback(errorUtil.createFatal('Failed to get full HTML'));
                    }

                    let vprItem = xformItem(log, job.record.document, result, jsonBody.vlerDocType, compress, job.requestStampTime);

                    log.debug('vler-to-vpr-xform-handler.handle: We are now preparing jobs for publishing.  record: %j', vprItem);
                    let meta = {
                        jpid: job.jpid,
                        rootJobId: job.rootJobId,
                        param: job.param,
                        priority: job.priority
                    };
                    if (job.referenceInfo) {
                        meta.referenceInfo = job.referenceInfo;
                    }
                    let jobsToPublish = jobUtil.createEventPrioritizationRequest(job.patientIdentifier, 'vlerdocument', vprItem, meta);

                    log.debug('vler-to-vpr-xform-handler.handle: Jobs prepared.  jobsToPublish: %j', jobsToPublish);

                    environment.publisherRouter.publish(jobsToPublish, function(error, response) {
                        log.debug('vler-to-vpr-xform-handler.handle: Jobs published.  error: %s, response: %j', error, response);
                        if (error) {
                            log.error('vler-to-vpr-xform-handler.handle:  Failed to publish jobs.  error: %s; response: %s; jobs: %j', error, response, jobsToPublish);

                            // FUTURETODO:   Push this to an error message location.  We do not want to error out the entire set of messages for one problem.
                            //--------------------------------------------------------------------------------------------------------------------------
                            return handlerCallback(null, 'FailedToPublishJobs');
                        }

                        return handlerCallback(null, 'success');
                    });
                });

            } else {
                log.error('vler-to-vpr-xform-handler.handle: invalid response body: $s', body);
                return handlerCallback(errorUtil.createFatal('invalid response body'));
            }
        } else {
            let statusCode;
            if ((response) && (response.statusCode)) {
                statusCode = response.statusCode;
            }

            let errorMessage = format('vler-to-vpr-xform-handler.handle: Unable to retrieve VLER document for %s because %s', inspect(job.patientIdentifier), statusCode);
            log.error(errorMessage);
            return handlerCallback(errorUtil.createTransient(errorMessage));
        }

    });

}

function compressionRequired(config, jsonBody) {
    let minSize = get(config, 'vler.compression.minSize');
    minSize = minSize === null ? undefined : minSize;
    minSize = Number(minSize);

    // a missing or NaN value for minSize will disable compression
    if (Number.isNaN(minSize)) {
        return false;
    }

    return Buffer.byteLength(jsonBody.vlerDocHtml, 'utf8') >= minSize;
}

function getVlerDocumentConfiguration(log, config, job) {
    let query = {};
    query.icn = idUtil.extractIcnFromPid(job.patientIdentifier.value, config);
    query.documentUniqueId = job.record.document.documentUniqueId;
    query.homeCommunityId = job.record.document.homeCommunityId;
    query.repositoryUniqueId = job.record.document.repositoryUniqueId;
    log.debug('vler-sync-request-handler.getVlerDocumentConfiguration: query: %j', query);

    if (!config.vler) {
        log.error('vler-sync-request-handler.getVlerDocumentConfiguration: Missing VLER Document configuration');
        return null;
    }

    let vlerConfig = {
        'qs': query
    };
    vlerConfig = _.defaults(vlerConfig, config.vler);
    let url = format('%s://%s:%s%s', 'http', vlerConfig.defaults.host, vlerConfig.defaults.port, vlerConfig.vlerdocument.documentPath);
    vlerConfig.url = url;
    vlerConfig.forever = true;
    vlerConfig.agentOptions = {
        maxSockets: config.handlerMaxSockets || 5
    };

    return vlerConfig;
}

function xformItem(log, document, fullHtml, vlerDocType, compressed, stampTime) {
    if (!document) {
        return;
    }

    let vprItem = vlerDocumentToVPR(document, fullHtml, vlerDocType, compressed);
    vprItem.stampTime = stampTime;
    log.debug('vler-to-vpr-xform-handler.xformItem: vprItemTimeStamp: %j', vprItem.stampTime);
    return vprItem;
}

function vlerDocumentToVPR(document, fullHtml, vlerDocType, compressed) {
    let vprVlerDocument = {};
    vprVlerDocument.kind = vlerDocType;
    vprVlerDocument.creationTime = document.creationTime;
    vprVlerDocument.name = document.name;
    vprVlerDocument.uid = document.uid;
    if (document.summary) {
        vprVlerDocument.summary = document.summary;
    } else {
        vprVlerDocument.summary = document.name;
    }
    vprVlerDocument.pid = document.pid;
    vprVlerDocument.authorList = document.authorList;
    vprVlerDocument.documentUniqueId = document.documentUniqueId;
    vprVlerDocument.homeCommunityId = document.homeCommunityId;
    vprVlerDocument.mimeType = document.mimeType;
    vprVlerDocument.repositoryUniqueId = document.repositoryUniqueId;
    vprVlerDocument.sourcePatientId = document.sourcePatientId;
    vprVlerDocument.fullHtml = fullHtml;
    if (compressed) {
        vprVlerDocument.compressed = compressed;
    }
    return vprVlerDocument;
}

function getFullHtml(log, compressRequired, vlerDocHtml, callback) {
    if (compressRequired) {
        let startTime = new Date();
        lzma.compress(vlerDocHtml, 1, function(result) {
            if (result === false) {
                callback('vler-to-vpr-xform-handler: Failed to compress VLER HTML', null);
            }
            let resultStr = new Buffer(result).toString('base64');
            log.debug('before compress: ' + vlerDocHtml.length + ' -> after compress: ' + resultStr.length + ', elapsed time: ' + (((new Date()) - startTime) / 1000));
            callback(null, resultStr);
        });
    } else {
        callback(null, vlerDocHtml);
    }
}

module.exports = handle;
module.exports._getVlerDocumentConfiguration = getVlerDocumentConfiguration;
module.exports._getFullHtml = getFullHtml;
module.exports._vlerDocumentToVPR = vlerDocumentToVPR;
module.exports._compressionRequired = compressionRequired;