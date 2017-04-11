'use strict';

require('../../env-setup');

//--------------------------------------------------------------------------
// This module transforms a VPR PTF record into a SOLR PTF Record.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------

var _ = require('underscore');
var solrXformUtil = require(global.VX_UTILS + 'solr-xform/solr-xform-utils');

//--------------------------------------------------------------------------
// Transform the VPR PTF record into a SOLR PTF record.
//
// vprRecord: The record in VPR format.
// log: A logger to use to log messages.
//--------------------------------------------------------------------------
function transformRecord(vprRecord, log) {
    log.debug('solr-ptf-xform.transformRecord: Entered method.  vprRecord: %j', vprRecord);

    if (!_.isObject(vprRecord)) {
        return null;
    }

    var solrRecord = {};

    solrXformUtil.setCommonFields(solrRecord, vprRecord);
    setDomainSpecificFields(solrRecord, vprRecord);

    log.debug('solr-ptf-xform.transformRecord: Leaving method returning SOLR record: %j', solrRecord);
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
    solrRecord.domain = 'ptf';
    solrXformUtil.setStringFromSimple(solrRecord, 'admission_uid', vprRecord, 'admissionUid');
    solrXformUtil.setStringFromSimple(solrRecord, 'arrival_date_time', vprRecord, 'arrivalDateTime');
    solrXformUtil.setStringFromSimple(solrRecord, 'discharge_date_time', vprRecord, 'dischargeDateTime');
    solrXformUtil.setStringFromSimple(solrRecord, 'drg', vprRecord, 'drg');
    solrXformUtil.setStringFromSimple(solrRecord, 'icd_code', vprRecord, 'icdCode');
    solrXformUtil.setStringFromSimple(solrRecord, 'icd_name', vprRecord, 'icdName');

    // solrXformUtil.setStringFromSimple(solrRecord, 'datetime', vprRecord, 'entered');
}

module.exports = transformRecord;