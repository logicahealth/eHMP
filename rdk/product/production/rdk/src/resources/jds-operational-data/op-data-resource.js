'use strict';

var _ = require('lodash');
var getOpData = require('./get-op-data');

module.exports.getResourceConfig = function() {
    return _.map(['vital', 'laboratory', 'medication'], function(opType) {
        var resource = {
            name: 'operational-data-type-' + opType,
            path: '/' + opType,
            get: getOpData.bind(null, opType),
            interceptors: getOpData.interceptors,
            requiredPermissions: [],
            isPatientCentric: false,
            subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync']
        };

        return resource;

    });
};
