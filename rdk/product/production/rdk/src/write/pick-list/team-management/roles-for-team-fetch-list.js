'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./roles-parser').parse;

var query =
    'SELECT DISTINCT PCMM.PCM_STD_TEAM_ROLE.PCM_STD_TEAM_ROLE_ID, PCMM.PCM_STD_TEAM_ROLE.NAME FROM PCMM.STAFF ' +
    'INNER JOIN PCMM.TEAM_MEMBERSHIP ON PCMM.STAFF.STAFF_ID = PCMM.TEAM_MEMBERSHIP.STAFF_ID ' +
    'INNER JOIN PCMM.TEAM_POSITION ON PCMM.TEAM_MEMBERSHIP.TEAM_POSITION_ID = PCMM.TEAM_POSITION.TEAM_POSITION_ID ' +
    'INNER JOIN PCMM.TEAM ON PCMM.TEAM_POSITION.TEAM_ID = PCMM.TEAM.TEAM_ID ' +
    'INNER JOIN PCMM.PCM_STD_TEAM_ROLE ON PCMM.TEAM_MEMBERSHIP.PCM_STD_TEAM_ROLE_ID = PCMM.PCM_STD_TEAM_ROLE.PCM_STD_TEAM_ROLE_ID ' +
    'INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID ' +
    'WHERE PCMM.TEAM.TEAM_ID=:teamID';

module.exports.fetch = function(logger, configuration, callback, params, appConfig) {
    var pcmmDbConfig = _.get(appConfig, 'jbpm.activityDatabase');

    var teamID = _.get(params, 'teamID');

    var bindVars = [teamID];

    if (_.isEmpty(pcmmDbConfig)) {
        return callback('roles-for-team: missing PCMM DB config');
    }

    logger.trace('roles picklist: query = ' + query);
    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
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
