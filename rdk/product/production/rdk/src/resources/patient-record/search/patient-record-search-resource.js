'use strict';
var textSearch = require('./text-search');
var suggestSearch = require('./suggest-search');
var trendDetail = require('./trend-detail');
var documentDetail = require('./document-detail');
var rdk = require('../../../core/rdk');

module.exports.getResourceConfig = function () {
    return [
        {
            name: 'patient-record-search-text',
            path: '/text',
            get: textSearch,
            description: textSearch.description,
            subsystems: ['authorization','jds','solr','jdsSync'],
            requiredPermissions: ['read-patient-record'],
            isPatientCentric: true
        },
        {
            name: 'patient-record-search-suggest',
            path: '/suggest',
            get: suggestSearch,
            description: suggestSearch.description,
            subsystems: ['authorization','jds','solr','jdsSync'],
            requiredPermissions: ['read-patient-record'],
            isPatientCentric: true
        },
        {
            name: 'patient-record-search-detail-trend',
            path: '/detail/trend',
            get: trendDetail,
            description: trendDetail.description,
            subsystems: ['authorization','jds','solr','jdsSync'],
            requiredPermissions: ['read-patient-record'],
            isPatientCentric: true
        },
        {
            name: 'patient-record-search-detail-document',
            path: '/detail/document',
            get: documentDetail,
            description: documentDetail.description,
            subsystems: ['authorization','jds','solr','jdsSync'],
            requiredPermissions: ['read-patient-record'],
            isPatientCentric: true,
            outerceptors: ['asu']
        }
    ];
};
