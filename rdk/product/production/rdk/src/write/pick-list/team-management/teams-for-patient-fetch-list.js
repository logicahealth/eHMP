'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;
/* jshint -W014 */
var query = 'BEGIN PCMM.PCMM_API.GET_TEAMS_FOR_PATIENT(:pid, :recordset); END;';

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'ehmpDatabase');

    var icn = _.get(params, 'pid');
    var bindVars = {
        pid: icn
    };

    logger.debug('teams-for-patient picklist: query = ' + query);
    pcmm.doExecuteProcWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-patient picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, false);
        callback(null, result);
    });
};
