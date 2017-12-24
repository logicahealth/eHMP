'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./roles-parser').parse;

var query = 'BEGIN PCMM.PCMM_API.GET_ROLES_FOR_TEAM(:team, :recordset); END;';

module.exports.fetch = function(logger, configuration, callback, params, appConfig) {
    var pcmmDbConfig = _.get(appConfig, 'oracledb.ehmpDatabase');

    if (_.isEmpty(pcmmDbConfig)) {
        return callback('roles-for-team: missing PCMM DB config');
    }

    var bindVars = {};
    bindVars.team = _.get(params, 'teamID');

    logger.trace('roles picklist: query = ' + query);
    pcmm.doExecuteProcWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({
            err: err,
            rows: rows
        }, 'roles picklist');
        if (err) {
            return callback(err);
        }
        return callback(null, parse(rows));
    });
};
