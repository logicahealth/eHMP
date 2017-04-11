'use strict';

var rdk = require('../core/rdk');

function getResourceConfig(app) {
    var config = [ evaluate(app),
                evaluateWithActionNames(app)];
    config.healthcheck = function() {
        return true;
    };
    return config;
}

var evaluate = function(app) {
    return {
        name : 'asu-evaluate',
        path : '/evaluate',
        post : require('../subsystems/asu/asu-subsystem').evaluate,
        interceptors: {
            synchronize: false
        },
        healthcheck: function() {
            return true;
        },
        permitResponseFormat: true,
        requiredPermissions: ['read-document'],
        isPatientCentric: false
    };
};

var evaluateWithActionNames = function(app) {
    return {
        name: 'evaluate-with-action-names',
        path: '/evaluate-with-action-names',
        post: require('../subsystems/asu/asu-subsystem').evaluateWithActionNames,
        interceptors: {
            synchronize: false
        },
        healthcheck: function() {
            return true;
        },
        requiredPermissions: ['read-document'],
        isPatientCentric: false
    };
};

module.exports.getResourceConfig = getResourceConfig;
