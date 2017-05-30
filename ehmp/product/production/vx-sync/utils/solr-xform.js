'use strict';

//---------------------------------------------------------------------------------------------
// This is used to create a transform to the SOLR format of the record.
//
// @Author: Les Westberg, Will McVay
//---------------------------------------------------------------------------------------------

require('../env-setup');

var _ = require('underscore');
var util = require('util');
var uidUtil = require(global.VX_UTILS + 'uid-utils');

//---------------------------------------------------------------------------------------------
// This is used to create a transform to the SOLR format of the record.
//
// record: The record in VPR format.
// log: The logger to output log messages to.
//---------------------------------------------------------------------------------------------
function xformVprToSolr(record, log, config, callback) {
    var errorMessage;

    var domain;
    if ((_.isObject(record)) && (_.isString(record.uid))) {
        domain = uidUtil.extractDomainFromUID(record.uid);
    }

    if ((!_.isString(domain)) || (_.isEmpty(domain))) {
        errorMessage = util.format('solr-xform.xformVprToSolr: Record did not contain a uid with a valid domain.  record: %j', record);
        log.error(errorMessage);
        return callback(errorMessage);
    }

    var subDomain;
    if ((_.isString(record.subDomain))) {
        subDomain = record.subDomain;
    }
    if ((domain === 'ehmp-activity') && ((!_.isString(subDomain)) || (_.isEmpty(subDomain)))) {
        errorMessage = util.format('solr-xform.xformVprToSolr: Record domain was ehmp-activity, but the subDomain field was not valid.  record: %j', record);
        log.error(errorMessage);
        return callback(errorMessage);
    }

    var xformer;

    try {
        if (domain === 'ehmp-activity') {
            xformer = require(util.format('./solr-xform/solr-%s-%s-xform', domain, subDomain));
        } else {
            xformer = require(util.format('./solr-xform/solr-%s-xform', domain));
        }
    }
    catch (e) {
        errorMessage = util.format('solr-xform.xformVprToSolr: No solr transform available for domain: %s', domain);
        log.info(errorMessage);
        return callback(errorMessage);
    }

    if (domain === 'vlerdocument') {
        return xformer(record, log, config['solr-xform'], callback);
    }

    return callback(null, xformer(record, log));
}

module.exports = xformVprToSolr;
