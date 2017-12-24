'use strict';

var _ = require('lodash');

function getHealthcheck(app, logger) {
    return {
        name: 'oracle',
        interval: 100000,
        /*
         * This is a simple configuration check to ensure the oracle config object exists
         * Individual schemas within Oracle such as PCMM are covered in their own subsystems to allow
         *  for more complicated healthchecks without introducing unnecessary
         *  database connections at this level.
         */
        check: function(callback) {
            var oracleConfig = _.get(app, 'config.oracledb', null);
            if (oracleConfig && typeof oracleConfig === 'object') {
                return callback(true);
            }
            return callback(false);
        }
    };
}

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: getHealthcheck(app, logger)
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getHealthcheck = getHealthcheck;
