'use strict';

require('../../env-setup');

//--------------------------------------------------------------------------
// This module transforms a VPR ehmp-activity consult record into a
// SOLR ehmp-activity consult Record.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------

var _ = require('underscore');
var solrXformUtil = require(global.VX_UTILS + 'solr-xform/solr-xform-utils');

//--------------------------------------------------------------------------
// Transform the VPR Allergy record into a SOLR allergy record.
//
// vprRecord: The record in VPR format.
// log: A logger to use to log messages.
//--------------------------------------------------------------------------
function transformRecord(vprRecord, log) {
    log.debug('solr-ehmp-activity-consult-xform.transformRecord: Entered method.  vprRecord: %j', vprRecord);

    if (!_.isObject(vprRecord)) {
        return null;
    }

    var solrRecord = {};

    solrXformUtil.setCommonFields(solrRecord, vprRecord);
    setDomainSpecificFields(solrRecord, vprRecord);

    log.debug('solr-ehmp-activity-consult-xform.transformRecord: Leaving method returning SOLR record: %j', solrRecord);
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
    solrRecord.sub_domain = 'consult';
    solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
    solrXformUtil.setStringFromSimple(solrRecord, 'consult_name', vprRecord, 'displayName');
    solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'consult_orders_override_reason', vprRecord, 'data', 'consultOrders', 'overrideReason');
    solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'consult_orders_order_result_comment', vprRecord, 'data', 'consultOrders', 'orderResultComment');
    solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'consult_orders_conditions', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
    solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'consult_orders_request', vprRecord, 'data', 'consultOrders', 'request');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'consult_orders_comment', vprRecord, 'data', 'consultOrders', 'comment');
    solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'consult_orders_accepting_provider_uid', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'uid');
    solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'consult_orders_accepting_provider_display_name', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
    solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'consult_orders_order_results_order_name', vprRecord, 'data', 'consultOrders', 'orderResults', 'orderName');
    solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'consult_orders_order_results_order_status', vprRecord, 'data', 'consultOrders', 'orderResults', 'status');
    solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'consult_orders_accepted_date', vprRecord, 'data', 'consultOrders', 'executionDateTime');
    solrXformUtil.setStringFromObjectObjectField(solrRecord, 'activity_process_instance_id', vprRecord, 'data', 'activity', 'processInstanceId');
    solrXformUtil.setStringFromObjectObjectField(solrRecord, 'activity_source_facility_id', vprRecord, 'data', 'activity', 'sourceFacilityId');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'schedules_comment', vprRecord, 'data', 'schedules', 'comment');
    solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'triages_comment', vprRecord, 'data', 'triages', 'comment');
    solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'signals_data_comment', vprRecord, 'data', 'signals', 'data', 'comment');
}

module.exports = transformRecord;