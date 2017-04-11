'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;
/* jshint -W014 */
var query = 'SELECT DISTINCT PCMM.TEAM.TEAM_ID, PCMM.TEAM.TEAM_NAME, SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.TEAM '
+ 'INNER JOIN PCMM.TEAM_PATIENT_ASSIGN ON PCMM.TEAM.TEAM_ID = PCMM.TEAM_PATIENT_ASSIGN.TEAM_ID '
+ 'INNER JOIN PCMM.PCMM_PATIENT ON PCMM.PCMM_PATIENT.PCMM_PATIENT_ID = PCMM.TEAM_PATIENT_ASSIGN.PCMM_PATIENT_ID '
+ 'INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID '
+ 'WHERE PCMM.PCMM_PATIENT.ICN=:icn';

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'pcmmDbConfig');

    var icn = _.get(params, 'pid');

    var bindVars = [icn];

    logger.debug('teams-for-patient picklist: query = ' + query);
    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-patient picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, false);
        callback(null, result);
    });
};
