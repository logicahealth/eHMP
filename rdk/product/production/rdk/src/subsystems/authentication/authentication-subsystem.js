'use strict';

var _ = require('lodash');

function getDependancies(app) {
    var list = ['jds', 'pjds', 'vistaReadOnly'];
    if (_.get(app, 'config.enableMultidivisionProxyHealthcheck')) {
        list.push('vistaMultidivision');
    }
    return list;
}

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'authentication',
            interval: 100000,
            check: function(callback) {
                //if they can hit this then they can hit the authentication endpoint
                //dependancies are listed below and are expected to be up and running
                return callback(true);
            },
            dependencies: getDependancies(app)
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
