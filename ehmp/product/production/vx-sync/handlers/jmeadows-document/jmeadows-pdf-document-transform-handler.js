'use strict';

var async = require('async');
var fsUtil = require(global.VX_UTILS + 'fs-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var uidUtil = require(global.VX_UTILS + 'uid-utils');
var docUtil = require(global.VX_UTILS + 'doc-utils');
var errorUtil = require(global.VX_UTILS + 'error');
var uuid = require('node-uuid');
var _ = require('underscore');
var pdf2text = require(global.VX_UTILS + 'pdf2text');
var inspect = require(global.VX_UTILS + 'inspect');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('jmeadows-pdf-document-transform-handler.handle : received request to JMeadows PDF conversion handler %j', job);

    if (!job || !job.patientIdentifier || !job.patientIdentifier.value) {
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Job has no patient identifier'));
    }
    if (!job.record || !job.record.fileId || !job.record.fileJobId) {
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Job is missing required information about the file'));
    }
    if (!config || !config.documentStorage || !config.documentStorage.staging || !config.documentStorage.staging.path) {
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Configuration missing document staging information'));
    }
    if (!config.documentStorage.publish || !config.documentStorage.publish.path) {
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Configuration missing document publish information'));
    }
    if (!config.documentStorage.uriRoot) {
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Configuration missing document retrieval endpoint'));
    }

    var logPatientIdentifier = inspect(job.patientIdentifier);

    var pdfFile = docUtil.getPdfDocPathByJob(job, config);
    var dir = docUtil.getPatientDirByJob(job);
    var outPath = docUtil.getDocOutPath(dir, config);

    var pdfFilename = job.record.fileId;
    //var txtFilename = pdfFilename.replace(/\.html/, '.txt');

    var jobs = [function(callback) {
        var metricsObj = {
            'subsystem':'dodPdfNote',
            'action':'copyPdfNote',
            'process':uuid.v4(),
            'timer':'start',
            'jobId':job.jobId,
            'rootJobId':job.rootJobId,
            'jpid':job.jpid,
            'uid':job.record.uid
        };
        environment.metrics.debug('Copy PDF note to publish dir', metricsObj);
        log.debug('jmeadows-pdf-document-transform-handler.handle : Copying PDF note to publish dir...');
        //copy PDF to publish output location
        fsUtil.copyFile(pdfFile, outPath + '/' + pdfFilename, function(err) {
            if(err){
                log.error('jmeadows-pdf-document-transform-handler.handle for patient %s: Error copying pdf document to published location: %s', logPatientIdentifier, err);
            }

            return callback(err);
        });
    },
    //pdf to text conversion
    function (callback) {
        var metricsObj = {
            'subsystem':'dodPdfNote',
            'action':'pdf2text',
            'process':uuid.v4(),
            'timer':'start',
            'jobId':job.jobId,
            'rootJobId':job.rootJobId,
            'jpid':job.jpid,
            'uid':job.record.uid
        };
        environment.metrics.debug('PDF to text conversion', metricsObj);
        log.debug('jmeadows-pdf-document-transform-handler.handle : PDF to text conversion');
        pdf2text(pdfFile, function (err, pdfTxt) {

            if (err) {
                log.warn("jmeadows-pdf-document-transform-handler.handle for patient %s: Could not parse PDF and extract TXT. Error: %s", logPatientIdentifier, err);
            }

            callback(err, pdfTxt);
        });
    }];

    async.parallel(jobs, function(err, results) {
        if (!err) {
            //delete source document (clean up staging directory)
            fsUtil.deleteFile(pdfFile);
            //change document uri
            job.record.dodComplexNoteUri = docUtil.getDodComplexNoteUri(config.documentStorage.uriRoot, dir, pdfFilename);

            //Second job contains pdf to plain-text conversion results
            if (results[1]) {
                updateRecordText(job.record, results[1]);
            }

            delete job.record.fileId;
            delete job.record.fileJobId;
            //fsUtil.deleteFile(outPath + '/' + txtFilename);

            // Get correct VPR domain
            //-----------------------
            var vprDataDomain = uidUtil.extractDomainFromUID(job.record.uid);

            var jobToPublish = jobUtil.createEventPrioritizationRequest(job.patientIdentifier, vprDataDomain, job.record, job);
            environment.publisherRouter.publish(jobToPublish, handlerCallback);
        } else {
            log.warn('jmeadows-pdf-document-transform-handler.handle for patient %s: Could not create HTML and/or TXT file because the document %s appears to be corrupted. error: %s', logPatientIdentifier, pdfFile, err);
            //corrupted document example: http://HOST:8080/MockDoDAdaptor/async/complex/note/2151767199

            //delete source document (clean up staging directory)
            fsUtil.deleteFile(pdfFile);

            //copy placeholder document
            fsUtil.copyFile('./handlers/jmeadows-document/corruptedDocPlaceholder.pdf', outPath + '/' + pdfFilename, function(err) {
                if(err){
                    log.error('jmeadows-pdf-document-transform-handler.handle for patient %s: Error copying corrupted document placeholder: %s', logPatientIdentifier, err);
                } else{
                    log.debug('jmeadows-pdf-document-transform-handler.handle for patient %s: Copied placeholder document as a stand-in for the corrupted document.', logPatientIdentifier);
                }

                //change document uri
                job.record.dodComplexNoteUri = docUtil.getDodComplexNoteUri(config.documentStorage.uriRoot, dir, pdfFilename);
                //job.record.content = '-This is a placeholder for a DOD patient document- Patient data on the jMeadows system indicates that the patient has a document here, but the document appears to be corrupted.'; //fsUtil.readFileSync(outPath+'/'+txtFilename).toString();
                updateRecordText(job.record, '-Placeholder for a DOD Patient Document- Unfortunately this document is corrupted and cannot be displayed.  Please report it so the problem can be rectified.');
                delete job.record.fileId;
                delete job.record.fileJobId;

                // Get correct VPR domain
                //-----------------------
                var vprDataDomain = uidUtil.extractDomainFromUID(job.record.uid);

                var jobToPublish = jobUtil.createEventPrioritizationRequest(job.patientIdentifier, vprDataDomain, job.record, job);
                environment.publisherRouter.publish(jobToPublish, handlerCallback);
            });

        }
    });
}


function updateRecordText(record, textContent){
    if(!record.text || !_.isArray(record.text)){
        record.text = [];
    }

    record.text.push({
        content: textContent,
        dateTime: record.referenceDateTime,
        status: 'completed',
        uid: record.uid
        });
}

module.exports = handle;