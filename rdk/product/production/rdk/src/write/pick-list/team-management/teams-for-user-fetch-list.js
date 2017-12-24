'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;
/* jshint -W014 */
var query = 'BEGIN PCMM.PCMM_API.GET_TEAMS_FOR_USER(i_staff_ien => :staff_ien, i_staff_site => :site, o_cursor => :recordset); END;';

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'ehmpDatabase');

    var bindVars = {};
    bindVars.staff_ien = _.get(params, 'staffIEN');
    bindVars.site = _.get(params, 'site');

    logger.trace('teams-for-user picklist: query = ' + query);
    pcmm.doExecuteProcWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-user picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, false);
        callback(null, result);
    });
};
