'use strict';

const _ = require('lodash');
const jobUtil = require(global.VX_UTILS + 'job-utils');
const errorUtil = require(global.VX_UTILS + 'error');
const lzma = require('lzma');
const xslt = require('xslt4node');
const moment = require('moment');

const XSL_PATH_C32 = global.VX_HANDLERS + 'vler-das-xform-vpr/xsl/c32styles/nhin/cda2detail.xsl';
const XSL_PATH_CCDA = global.VX_HANDLERS + 'vler-das-xform-vpr/xsl/ccdaStyles/cdaHFG.xsl';

const placeholderHtml = require('./placeholderHtml');

//-----------------------------------------------------------------------------------------------------------
// The handler's main function.  This is called when a job is retrieved that this handler can service.
//
// log: The logger to use for log messages.
// config: The properties to use (worker-config.json)
// job: The job that was pulled from the Beanstalk tube
// handlerCallback: The call back to call when the handler is done.

// If there is a value for 'config.vler.compression.minSize', the following occurs:
//  1. Numeric: documents as large or larger than the size given will be compressed
//  2. Non-numberic or missing: compression is disabled
//------------------------------------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback) {
    log.debug('vler-das-xform-vpr-handler.handle : received job %j', job);

    if (!job) {
        log.error('vler-das-xform-vpr-handler.handle : Job was null or undefined');
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
    }

    if (!job.type || job.type !== jobUtil.vlerDasXformVprType()) {
        log.error('vler-das-xform-vpr-handler.handle : job type was invalid: %s', job.type);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type'));
    }

    if (!jobUtil.isValid(jobUtil.vlerDasXformVprType(), job)) {
        log.error('vler-das-xform-vpr-handler.handle : job was invalid jpid=%s', job.jpid);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job'));
    }

    let document = job.record;

    let kind = _.get(document, 'kind');
    let xmlDoc = _.get(document, 'xmlDoc');

    convertXmltoHtml(log, xmlDoc, kind, function(htmlDoc) {
        compressHtml(log, config, htmlDoc, function(resultHtml, compressed) {
            let vprVlerDocument = vlerDasDocumentToVPR(document, resultHtml, kind, job.requestStampTime, compressed);
            createAndPublishJob(log, environment, job, vprVlerDocument, handlerCallback);
        });
    });
}

//-----------------------------------------------------------------------------------------------------------
// Converts the given xml document to html
//
// log: The logger to use for log messages.
// kind: The type of document contained in xmlDoc returned by vler-das-doc-retrieve-handler.determineKind()
// xmlDoc: the xml contents of the VLER document
// callback: The call back to call when this function is done.
//
// returns (via callback): The HTML version of the XML document
//                         OR a placeholder HTML document indicating an XML conversion error or unsupported document type
//------------------------------------------------------------------------------------------------------------
function convertXmltoHtml(log, xmlDoc, kind, callback) {
    log.debug('vler-das-xform-vpr-handler.convertXmltoHtml: entering method');
    let xsltPath = '';
    if (kind === 'xmlParseError') {
        //xmlParseError was returned by determineKind()
        return callback(placeholderHtml.processingError);
    } else if (kind === 'CCDA') {
        xsltPath = XSL_PATH_CCDA;
    } else if (kind === 'C32') {
        xsltPath = XSL_PATH_C32;
    } else {
        //This condition should never be reached because vler-das-doc-retrieve-handler ignores documents of unsupported formats.
        return callback(placeholderHtml.unsupportedFormat);
    }

    let xsltConfig = {
        xsltPath: xsltPath,
        source: xmlDoc,
        result: String
    };

    log.debug('vler-das-xform-vpr-handler.convertXmltoHtml: Beginning conversion of XML document to HTML...');
    xslt.transform(xsltConfig, function(error, htmlString) {
        if (error) {
            log.error('vler-das-xform-vpr-handler.convertXmltoHtml: Error encountered when converting XML to HMTL. Error: %s. XML: %s', error, xmlDoc);
            return callback(placeholderHtml.processingError);
        }
        log.debug('vler-das-xform-vpr-handler.convertXmltoHtml: Successfully converted XML document to HTML.');
        callback(htmlString);
    });
}

//-----------------------------------------------------------------------------------------------------------
// Compresses the given string if it is larger than MAX_SIZE_HTML.
//
// log: The logger to use for log messages.
// htmlString: String containing the html form of the document
// maxSize: Number indicating the maximum allowed size (in bytes) for html documents
// callback: The call back to call when this function is done.
//
// returns (via callback): 1. A compressed AND base64 encoded string
//                         2. A boolean indicating whether the document has been compressed
//------------------------------------------------------------------------------------------------------------
function compressHtml(log, config, htmlString, callback) {
    log.debug('vler-das-xform-vpr-handler.compressHtml: entering method');

    var startTime = new Date();
    log.debug('vler-das-xform-vpr-handler.compressHtml: Beginning document compression.');

    if(!compressionRequired(config, htmlString)) {
        log.debug('vler-das-xform-vpr-handler.compressHtml: html size is less than max allowed size. Skipping compression.');
        return setTimeout(callback, 0, htmlString, false);
    }

    lzma.compress(htmlString, 1, function(result) {
        if (result === false) {
            log.error('vler-das-xform-vpr-handler.compressHtml: Error encountered when compressing HTML document. Error: %s. htmlString: %s', result, htmlString);
            return callback(placeholderHtml.processingError, false);
        }
        var resultStr = new Buffer(result).toString('base64');
        log.debug('vler-das-xform-vpr-handler.compressHtml: before compress: ' + htmlString.length + ' -> after compress: ' + resultStr.length + ', elapsed time: ' + (((new Date()) - startTime) / 1000));

        return callback(resultStr, true);
    });
}


function compressionRequired(config, htmlString) {
    // a missing or NaN value for minSize will disable compression
    let minSize = _.get(config, 'vler.compression.minSize');
    minSize = minSize === null ? undefined : minSize;
    minSize = Number(minSize);

    // a missing or NaN value for minSize will disable compression
    if(Number.isNaN(minSize)) {
        return false;
    }

    return Buffer.byteLength(htmlString, 'utf8') >= minSize;
}

//-----------------------------------------------------------------------------------------------------------
// Transforms the VLER document to VPR format
//
// document: The VLER document and metadata
// fullHtml: The VLER document contents converted to HTML, potentially compressed and base64 encoded.
// vlerDocType: The type of document (C32, CCDA), returned by determineKind()
// requestStampTime: The value of job.requestStampTime, required for eventual storage
// compressed: A boolean indicating whether the document has been compressed
//
// returns (via callback): The VPR-formatted VLER document
//------------------------------------------------------------------------------------------------------------
function vlerDasDocumentToVPR(document, fullHtml, vlerDocType, requestStampTime, compressed) {
    var vprVlerDocument = {};
    vprVlerDocument.kind = vlerDocType;
    vprVlerDocument.name = _.get(document, 'resource.description');
    vprVlerDocument.uid = document.uid;
    vprVlerDocument.summary = _.get(document, 'resource.description');
    vprVlerDocument.pid = document.pid;
    vprVlerDocument.documentUniqueId = _.get(document, 'resource.masterIdentifier.Value');
    vprVlerDocument.homeCommunityId = _.get(document, 'resource.masterIdentifier.system');
    vprVlerDocument.stampTime = requestStampTime;
    vprVlerDocument.fullHtml = fullHtml;
    if (compressed) {
        vprVlerDocument.compressed = compressed;
    }

    //Drop timezone offset from creationTime
    let creationTimeWithOffset = _.get(document, 'resource.created', '');
    vprVlerDocument.creationTime = moment(creationTimeWithOffset, 'YYYYMMDDHHmmss[ZZ]').format('YYYYMMDDHHmmss');

    vprVlerDocument.authorList = getAuthorListFromFHIRContainedResources(document);

    return vprVlerDocument;
}

function getAuthorListFromFHIRContainedResources(document){
    let authorList = [];
    let resourceAuthors = _.get(document, 'resource.author', []);
    let containedResources = _.get(document, 'resource.contained', []);

    _.each(resourceAuthors, function(author){
        let reference = _.last(_.get(author, 'reference', '').split('#'));

        let organization = _.find(containedResources, function(resource){
            return _.get(resource, 'id') === reference;
        });

        authorList.push({institution: _.get(organization, 'name', 'Unknown - could not find contained resource')});
    });

    return authorList;
}

//-----------------------------------------------------------------------------------------------------------
// Creates and publishes a job containing the VPR transformed VLER document to Event Prioritization
//
// log: The logger to use for log messages.
// environment: Object containing shared instances.
// job: The job that was pulled from the Beanstalk tube
// vprVlerDocument: The VPR-formatted VLER document
// handlerCallback: The call back to call when the handler is done.
//------------------------------------------------------------------------------------------------------------
function createAndPublishJob(log, environment, job, vprVlerDocument, handlerCallback) {
    var meta = {
        jpid: job.jpid,
        rootJobId: job.rootJobId,
        param: job.param,
        priority: job.priority
    };
    if (job.referenceInfo) {
        meta.referenceInfo = job.referenceInfo;
    }
    var jobsToPublish = jobUtil.createEventPrioritizationRequest(job.patientIdentifier, 'vlerdocument', vprVlerDocument, meta);

    log.debug('vler-to-vpr-xform-handler.handle: Jobs prepared.  jobsToPublish: %j', jobsToPublish);

    environment.publisherRouter.publish(jobsToPublish, handlerCallback);
}

module.exports = handle;
module.exports._steps = {
    convertXmltoHtml: convertXmltoHtml,
    compressHtml: compressHtml,
    vlerDasDocumentToVPR: vlerDasDocumentToVPR,
    createAndPublishJob: createAndPublishJob,
    getAuthorListFromFHIRContainedResources: getAuthorListFromFHIRContainedResources,
    compressionRequired: compressionRequired
};