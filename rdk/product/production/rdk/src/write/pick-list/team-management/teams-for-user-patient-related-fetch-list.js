'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;
/* jshint -W014 */
var query = 'SELECT DISTINCT PCMM.TEAM.TEAM_ID, PCMM.TEAM.TEAM_NAME, SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.STAFF '
    + 'INNER JOIN PCMM.TEAM_MEMBERSHIP ON PCMM.STAFF.STAFF_ID = PCMM.TEAM_MEMBERSHIP.STAFF_ID '
    + 'INNER JOIN PCMM.TEAM_POSITION ON PCMM.TEAM_MEMBERSHIP.TEAM_POSITION_ID = PCMM.TEAM_POSITION.TEAM_POSITION_ID '
    + 'INNER JOIN PCMM.TEAM ON PCMM.TEAM_POSITION.TEAM_ID = PCMM.TEAM.TEAM_ID '
    + 'INNER JOIN PCMM.PCM_STD_TEAM_ROLE ON PCMM.TEAM_MEMBERSHIP.PCM_STD_TEAM_ROLE_ID = PCMM.PCM_STD_TEAM_ROLE.PCM_STD_TEAM_ROLE_ID '
    + 'INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID '
    + 'INNER JOIN PCMM.TEAM_PATIENT_ASSIGN ON PCMM.TEAM_PATIENT_ASSIGN.TEAM_ID = PCMM.TEAM.TEAM_ID '
    + 'INNER JOIN PCMM.PCMM_PATIENT ON PCMM.PCMM_PATIENT.PCMM_PATIENT_ID = PCMM.TEAM_PATIENT_ASSIGN.PCMM_PATIENT_ID '
    + 'WHERE PCMM.STAFF.STAFF_IEN=:0 AND PCMM.PCMM_PATIENT.BASE_ICN=:1';

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'pcmmDbConfig');

    var bindVars = [];

    var ien = _.get(params, 'staffIEN');
    bindVars.push(ien);

    var baseIcn = _.get(params, 'pid');
    if (!_.isUndefined(baseIcn)) {
        baseIcn = baseIcn.split('V')[0];
    }
    bindVars.push(baseIcn);

    logger.trace('teams-for-user-patient-related picklist: query = ' + query);
    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-user-patient-related picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, true);
        callback(null, result);
    });
};
