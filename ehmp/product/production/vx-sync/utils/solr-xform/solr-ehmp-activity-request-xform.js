'use strict';

require('../../env-setup');

//--------------------------------------------------------------------------
// This module transforms a VPR Request record into a SOLR EHMP Activity 
// Request Record.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------

var _ = require('underscore');
var solrXformUtil = require(global.VX_UTILS + 'solr-xform/solr-xform-utils');

//--------------------------------------------------------------------------
// Transform the VPR Request record into a SOLR ehmp activity request record
//
// vprRecord: The record in VPR format.
// log: A logger to use to log messages.
//--------------------------------------------------------------------------
function transformRecord(vprRecord, log) {
    log.debug('solr-ehmp-activity-request-xform.transformRecord: Entered method.  vprRecord: %j', vprRecord);

    if (!_.isObject(vprRecord)) {
        return null;
    }

    var solrRecord = {};

    solrXformUtil.setCommonFields(solrRecord, vprRecord);
    setDomainSpecificFields(solrRecord, vprRecord);

    log.debug('solr-ehmp-activity-request-xform.transformRecord: Leaving method returning SOLR record: %j', solrRecord);
    if ((_.isObject(solrRecord)) && (!_.isEmpty(solrRecord))) {
        return solrRecord;
    } else {
        return null;
    }
}

//-------------------------------------------------------------------------
// Transform the fields specific to this domain.
//
// solrRecored: The place to put the SOLR fields.
// vprRecord: The record in VPR format.
//-------------------------------------------------------------------------
function setDomainSpecificFields(solrRecord, vprRecord) {
    solrRecord.domain = 'ehmp-activity';
    solrRecord.sub_domain = 'request';
    solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'request_title', vprRecord, 'data', 'requests', 'title');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'request_text', vprRecord, 'data', 'requests', 'request');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'request_accepted_date', vprRecord, 'data', 'requests', 'submittedTimeStamp');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'response_request', vprRecord, 'data', 'responses', 'request');
    solrXformUtil.setStringFromObjectObjectField(solrRecord, 'activity_process_instance_id', vprRecord, 'data', 'activity', 'processInstanceId');
    solrXformUtil.setStringFromObjectObjectField(solrRecord, 'activity_source_facility_id', vprRecord, 'data', 'activity', 'sourceFacilityId');
    solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'signals_data_comment', vprRecord, 'data', 'signals', 'data', 'comment');
}

module.exports = transformRecord;
