'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;

var fetchBseToken = require('./vix-fetch-bse-token');
var fetchStudyQuery = require('./vix-fetch-study-query');

module.exports.addImagesToDocument = addImagesToDocument;

function addImagesToDocument(req, jdsResponse, callback) {
    var logger = req.logger;
    var pid = req.query.pid;  // TODO pid is not guaranteed to be site;dfn. Get the site;dfn correctly.
    if (!rdk.utils.pidValidator.isSiteDfn(pid)) {
        req.logger.info({pid: pid}, 'pid is not valid site;dfn - skipping vix image document enrichment');
        return callback(null, jdsResponse);
    }
    // all patient records
    var patientRecords = jdsResponse.data.items;
    var icn = req.audit.patientIdentifiers.icn;  // TODO this is not a safe way to get the ICN. Get the ICN from MVI or from the convertPid interceptor.
    var queryRecords = {
        patientICN: icn,
        studies: []
    };
    _.each(patientRecords, function(record) {
        record.thumbnails = [];
        record.viewerUrl = '';
        record.detailsUrl = '';
        record.studyId = '';
        record.contextId = '';
        record.hasImages = false;

        var rec = {};

        rec.patientICN = icn;

        // build the CPRS style  contextID which is used to by vix to search for images
        var splitIdx = pid.indexOf(';') + 1;  // TODO get the dfn safely - you shouldn't rely on manipulating the pid yourself.
        var dfn = pid.substring(splitIdx);
        var category = nullchecker.isNullish(record.category) ? '' : record.category;
        var localId = nullchecker.isNullish(record.localId) ? '' : record.localId;
        var caseNum = nullchecker.isNullish(record.case) ? '' : record.case;
        var facilityName = nullchecker.isNullish(record.facilityName) ? '' : record.facilityName;

        rec.contextId = 'RPT^CPRS^' + dfn + '^' + category + '^' + localId + '^' + caseNum + '^' + facilityName + '^^^^^^0';
        rec.siteNumber = record.facilityCode;
        record.contextId = rec.contextId;

        queryRecords.studies.push(rec);
    });

    logger.trace({patientRecords: patientRecords});

    async.waterfall(
        [
            // get the security token required by VIX
            function(callback) {
                return fetchBseToken.fetch(req, callback);
            },
            // query vix with our list of records
            function(token, callback) {
                logger.debug({bseToken: token});
                return fetchStudyQuery.fetch(req, token, queryRecords, callback);
            },
            // process the returned data
            function(vixBody, callback) {
                logger.debug({vixBody: vixBody});
                if (_.isEmpty(vixBody)) {
                    logger.error('Empty response from VIX');
                    return callback(null, 'done');
                }
                _.each(patientRecords, function(patientRecord) {
                    var splitIdx = pid.indexOf(';') + 1;
                    var dfn = pid.substring(splitIdx);  // TODO delete unused variable
                    var updated = _.find(vixBody.studies, function(o) {
                        return _.startsWith(o.contextId, patientRecord.contextId);
                    });
                    if (_.get(updated, 'imageCount') > 0) {
                        patientRecord.hasImages = true;
                        patientRecord.viewerUrl = updated.viewerUrl;
                        patientRecord.detailsUrl = updated.detailsUrl;
                        patientRecord.studyId = updated.studyId;
                        patientRecord.thumbnails.push(updated.thumbnailUrl);
                        patientRecord.imageCount = updated.imageCount;
                    }
                });
                return callback(null, 'done');
            }
        ],
        function(err, result) {
            if (err) {
                logger.debug({
                    err: err
                }, 'vix not available');
            }
            jdsResponse.data.items = patientRecords;
            return callback(null, jdsResponse);
        }
    );
}
