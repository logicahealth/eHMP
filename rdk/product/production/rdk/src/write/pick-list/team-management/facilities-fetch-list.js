'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./facilities-parser').parse;

var baseQuery = 'SELECT DISTINCT SDSADM.STD_INSTITUTION.STATIONNUMBER, SDSADM.STD_INSTITUTION.VISTANAME, SDSADM.STD_INSTITUTION.STREETCITY, SDSADM.STD_STATE.POSTALNAME FROM SDSADM.STD_INSTITUTION INNER JOIN SDSADM.STD_STATE ON SDSADM.STD_STATE.ID = SDSADM.STD_INSTITUTION.STREETSTATE_ID ';

module.exports.fetch = function(logger, configuration, callback, params) {
    var sites = params.fullConfig.vistaSites;
    var siteCodes = _.keys(sites);

    var query = baseQuery;

    if (params.teamFocus) {
        query = query + 'INNER JOIN PCMM.TEAM ON PCMM.TEAM.VA_INSTITUTION_ID = SDSADM.STD_INSTITUTION.ID INNER JOIN PCMM.PCM_STD_TEAM_FOCUS ON PCMM.PCM_STD_TEAM_FOCUS.PCM_STD_TEAM_FOCUS_ID = PCMM.TEAM.PCM_STD_TEAM_FOCUS_ID ';
    }
    var bindVars = [];
    var whereClause = 'WHERE SDSADM.STD_INSTITUTION.VISTANAME IN (';
    for (var i = 0; i < siteCodes.length - 1; i++) {
        whereClause = whereClause + ':' + i + ', ';
        bindVars.push(sites[siteCodes[i]].name);
    }
    whereClause = whereClause + ':' + (siteCodes.length - 1) + ')';
    bindVars.push(sites[siteCodes[siteCodes.length - 1]].name);

    query = query + whereClause + ' ';

    if (params.teamFocus) {
        query = query + ' AND PCM_STD_TEAM_FOCUS.NAME = :teamFocus';
        bindVars.push(params.teamFocus);
    }

    var pcmmDbConfig = _.get(params, 'pcmmDbConfig');

    logger.trace('facilities picklist: query = ' + query);
    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({error: err, rows: rows}, 'facilities picklist');
        if (err) {
            callback(err);
            return;
        }

        var result = parse(rows, sites, (params.siteCode && sites[params.siteCode]) ? sites[params.siteCode].name : undefined);
        callback(null, result);
    });
};
