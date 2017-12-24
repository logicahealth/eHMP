'use strict';

require('../../env-setup');

//--------------------------------------------------------------------------------
// This module transforms a VPR vlerdocument record into a SOLR vlerdocument Record.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------

var _ = require('underscore');
var solrXformUtil = require(global.VX_UTILS + 'solr-xform/solr-xform-utils');
var lzma = require('lzma');
var html2text = require('html-to-text');
var format = require('util').format;

//--------------------------------------------------------------------------
// Transform the VPR vlerdocument record into a SOLR vlerdocument record.
//
// vprRecord: The record in VPR format.
// log: A logger to use to log messages.
//--------------------------------------------------------------------------
function transformRecord(vprRecord, log, xformConfig, callback) {
    log.debug('solr-vlerdocument-xform.transformRecord: Entered method.  vprRecord: %j', vprRecord);

    if (!_.isObject(vprRecord)) {
        return null;
    }

    var solrRecord = {};

    solrXformUtil.setCommonFields(solrRecord, vprRecord);
    setDomainSpecificFields(solrRecord, vprRecord);
    xformHtmlToTxt(solrRecord, vprRecord, log, xformConfig, function(error) {
        if (error) {
            var errorMessage = format('solr-vlerdocument-xform.transformRecord: transformation encountered error: %s, SOLR record: %j', error, solrRecord);
            log.error(errorMessage);
            return callback(errorMessage);
        }

        log.debug('solr-vlerdocument-xform.transformRecord: Leaving method returning SOLR record: %j', solrRecord);
        if (!(_.isObject(solrRecord)) || (_.isEmpty(solrRecord))) {
            return callback(null);
        }

        callback(null, solrRecord);
    });
}

//-------------------------------------------------------------------------
// Transform the fields specific to this domain.
//
// solrRecord: The place to put the SOLR fields.
// vprRecord: The record in VPR format.
//-------------------------------------------------------------------------
function setDomainSpecificFields(solrRecord, vprRecord) {
    solrRecord.domain = 'vlerdocument';
    solrXformUtil.setStringFromSimple(solrRecord, 'creation_time', vprRecord, 'creationTime');
    solrXformUtil.addStringFromSimple(solrRecord, 'datetime_all', vprRecord, 'creationTime');
    solrXformUtil.setStringFromSimple(solrRecord, 'datetime', vprRecord, 'creationTime');
    solrXformUtil.setStringFromSimple(solrRecord, 'name', vprRecord, 'name');
    solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'section', vprRecord, 'sections', 'title', 'text', ' ');
    solrXformUtil.setStringFromSimple(solrRecord, 'document_unique_id', vprRecord, 'documentUniqueId');
    solrXformUtil.setStringFromSimple(solrRecord, 'home_community_id', vprRecord, 'homeCommunityId');
    solrXformUtil.setStringFromSimple(solrRecord, 'repository_unique_id', vprRecord, 'repositoryUniqueId');
    solrXformUtil.setStringFromSimple(solrRecord, 'source_patient_id', vprRecord, 'sourcePatientId');
}

function xformHtmlToTxt(solrRecord, vprRecord, log, xformConfig, callback) {
    if (!vprRecord.fullHtml) {
        return callback();
    }

    var documentHtml = vprRecord.fullHtml;

    if (!vprRecord.compressed) {
        solrRecord.body = getTextFromHtml(xformConfig, documentHtml);
        return callback();
    }

    var compressedHtmlAsBuffer = new Buffer(documentHtml, 'base64');

    log.debug('solr-vlerdocument-xform.xformHtmlToTxt: Decompressing HTML...');
    lzma.decompress(compressedHtmlAsBuffer, function(result, error) {
        if (error) {
            return callback(format('solr-vlerdocument-xform.xformHtmlToTxt: Could not decompress html. error: %s, html: %j', error, documentHtml));
        }
        log.debug('solr-vlerdocument-xform.xformHtmlToTxt: Finished decompressing HTML');

        solrRecord.body = getTextFromHtml(xformConfig, result);
        callback();
    });
}

function getTextFromHtml(xformConfig, htmlString){
    //Remove any Base64 encoded multiparts
    //htmlString = htmlString.replace(/\^multipart\^\^Base64\^\w*/g, '');

    if (xformConfig && xformConfig.vlerdocument) {
        _.each(xformConfig.vlerdocument.regexFilters, function(regexString) {
            var regex = new RegExp(regexString, 'g');
            htmlString = htmlString.replace(regex, '');
        });
    }

    return html2text.fromString(htmlString, {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true,
        format: {
            text: function(node) {
                var text = node.data;
                if (/^\s+$/.test(text)) {
                    return '';
                }
                return text + ' ';
            },
            lineBreak: function() {
                return '';
            }
        }
    });
}


module.exports = transformRecord;
module.exports._steps = {
    xformHtmlToTxt: xformHtmlToTxt,
    getTextFromHtml: getTextFromHtml
};