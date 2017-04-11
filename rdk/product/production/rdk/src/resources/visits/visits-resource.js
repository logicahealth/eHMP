'use strict';

var _ = require('lodash');
var getVisits = require('./get-visits');

module.exports.getResourceConfig = function () {
    return _.map(['providers', 'locations', 'appointments', 'admissions'], function(visitType) {
        return {
            name: 'visits-' + visitType,
            path: '/' + visitType,
            get: getVisits.bind(null, visitType),
            interceptors: getVisits.interceptors[visitType],
            subsystems: ['patientrecord','jds','solr','jdsSync'],
            requiredPermissions: getVisits.permissions[visitType],
            isPatientCentric: getVisits.isPatientCentric[visitType]
        };
    });
};

