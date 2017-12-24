'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;

var query = 'BEGIN PCMM.PCMM_API.GET_TEAMS_FOR_FACILITY(:station, :recordset); END;';

module.exports.fetch = function(logger, siteConfig, callback, params, appConfig) {
    var pcmmDbConfig = _.get(appConfig, 'oracledb.ehmpDatabase');

    if (_.isEmpty(pcmmDbConfig)) {
        return callback('teams-for-facility: missing PCMM DB config');
    }

    var bindVars = {};
    bindVars.station = _.get(params, 'facilityID');

    logger.trace('teams-for-facility picklist: query = ' + query);
    pcmm.doExecuteProcWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({
            err: err,
            rows: rows
        }, 'teams-for-facility picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, appConfig.vistaSites, false);
        callback(null, result);
    });
};
