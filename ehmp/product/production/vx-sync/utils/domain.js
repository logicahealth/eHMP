'use strict';

require('../env-setup');
var _ = require('underscore');
var vistaDomainList = require(global.VX_ROOT + 'worker-config').vista.domains;
var jmeadowsDomainList = require(global.VX_ROOT + 'worker-config').jmeadows.domains;
var hdrDomainList = require(global.VX_ROOT + 'worker-config').hdr.domains;
var vlerDomainList = require(global.VX_ROOT + 'worker-config').vler.domains;
var recordEnrichmentDomainList = require(global.VX_ROOT + 'worker-config').recordEnrichment.domains;

var domainList = [
    'allergy',
    'appointment',
    'consult',
    'cpt',
    'document',
    'vlerdocument',
    'exam',
    'education',
    'factor',
    'immunization',
    'lab',
    'med',
    'mh',
    'obs',
    'order',
    'problem',
    'procedure',
    'patient',
    'pov',
    'ptf',
    'image',
    'skin',
    'surgery',
    'task',
    'visit',
    'vital'
];

// This list is necessary to complete the list of domains that are stored in SOLR
// These domains are not in VPR/JDS, and are the result of SOLR transforms
var solrList = [
    'encounter',
    'result'
];

var operationalDomainList = [
    'asu-rule',
    'doc-def',
    'immunization',
    'labgroup',
    'labpanel',
    'location',
    'orderable',
    'pt-select',
    'qo',
    'route',
    'schedule',
    'sign-symptom',
    'user',
    'vital-category',
    'vital-qualifier',
    'vital-type'
];

function getDomainList() {
    return _.clone(domainList);
}

function getSolrList() {
    return _.clone(solrList);
}

function getOperationalDomainList() {
    return _.clone(operationalDomainList);
}

function getVistaDomainList(){
    return _.clone(vistaDomainList);
}

function getJmeadowsDomainList(){
    return _.clone(jmeadowsDomainList);
}

function getHdrDomainList() {
    return _.clone(hdrDomainList);
}

function getVlerDomainList() {
    return _.clone(vlerDomainList);
}

function getPjdsDomainList() {
    return ['ehmp-activity'];
}

function getRecordEnrichmentDomainList() {
    return _.clone(recordEnrichmentDomainList);
}

// The SOLR domain list needs the VistA and VLER domains, and the domains that have changed between VPR and SOLR due to SOLR xforms
// The jMeadows domains are not stored in SOLR, and the HDR domains are a subset of the VistA domains
function getSolrDomainList() {
    return _.union(getVistaDomainList(), getVlerDomainList(), getSolrList());
}

function getAllSourcesDomainList() {
    return _.union(getVistaDomainList(), getJmeadowsDomainList(), getHdrDomainList(), getVlerDomainList());
}

module.exports.getDomainList = getDomainList;
module.exports.getOperationalDomainList = getOperationalDomainList;
module.exports.getVistaDomainList = getVistaDomainList;
module.exports.getJmeadowsDomainList = getJmeadowsDomainList;
module.exports.getHdrDomainList = getHdrDomainList;
module.exports.getVlerDomainList = getVlerDomainList;
module.exports.getPjdsDomainList = getPjdsDomainList;
module.exports.getRecordEnrichmentDomainList = getRecordEnrichmentDomainList;
module.exports.getSolrDomainList = getSolrDomainList;
module.exports.getAllSourcesDomainList = getAllSourcesDomainList;
