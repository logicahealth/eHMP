'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;
/* jshint -W014 */
var query = 'BEGIN PCMM.PCMM_API.GET_TEAMS_FOR_FACILITY_PATIENT(:facility, :patient, :recordset); END;';

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'ehmpDatabase');

    var bindVars = {};
    bindVars.facility = _.get(params, 'facilityID');
    bindVars.patient = _.get(params, 'pid');

    logger.trace('teams-for-facility-patient-related picklist: query = ' + query);
    pcmm.doExecuteProcWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-facility-patient-related picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, true);
        callback(null, result);
    });
};
