'use strict';

var _ = require('lodash');
var getVisits = require('./get-visits');

module.exports.getResourceConfig = function () {
    return _.map(['appointments', 'admissions'], function(visitType) {
        return {
            name: 'visits-' + visitType,
            path: '/' + visitType,
            get: getVisits.bind(null, visitType),
            interceptors: {
                synchronize: false,
                convertPid: true
            },
            subsystems: ['patientrecord','jds','solr','jdsSync'],
            requiredPermissions: ['read-encounter'],
            isPatientCentric: true
        };
    });
};

