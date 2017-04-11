'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./teams-parser').parse;

var query = "SELECT DISTINCT PCMM.TEAM.TEAM_ID, PCMM.TEAM.TEAM_NAME, SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.STAFF "
            + "INNER JOIN PCMM.TEAM_MEMBERSHIP ON PCMM.STAFF.STAFF_ID = PCMM.TEAM_MEMBERSHIP.STAFF_ID "
            + "INNER JOIN PCMM.TEAM_POSITION ON PCMM.TEAM_MEMBERSHIP.TEAM_POSITION_ID = PCMM.TEAM_POSITION.TEAM_POSITION_ID "
            + "INNER JOIN PCMM.TEAM ON PCMM.TEAM_POSITION.TEAM_ID = PCMM.TEAM.TEAM_ID "
            + "INNER JOIN PCMM.PCM_STD_TEAM_ROLE ON PCMM.TEAM_MEMBERSHIP.PCM_STD_TEAM_ROLE_ID = PCMM.PCM_STD_TEAM_ROLE.PCM_STD_TEAM_ROLE_ID "
            + "INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID "
            + "WHERE SDSADM.STD_INSTITUTION.STATIONNUMBER=:facilityID"

module.exports.fetch = function(logger, configuration, callback, params) {
    var pcmmDbConfig = _.get(params, 'pcmmDbConfig');

    var stationNumber = _.get(params, 'facilityID');

    var bindVars = [stationNumber];

    logger.trace("teams-for-facility picklist: query = " + query);
    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({err: err, rows: rows}, 'teams-for-facility picklist');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, params.fullConfig.vistaSites, false);
        callback(null, result);
    });
};
