'use strict';

var pcmm = require('../../../subsystems/jbpm/pcmm-subsystem');
var _ = require('lodash');
var parse = require('./facilities-parser').parse;

var baseQuery = 'SELECT DISTINCT SDSADM.STD_INSTITUTION_MV.STATIONNUMBER, SDSADM.STD_INSTITUTION_MV.VISTANAME, SDSADM.STD_INSTITUTION_MV.STREETCITY, SDSADM.STD_STATE_MV.POSTALNAME FROM SDSADM.STD_INSTITUTION_MV INNER JOIN SDSADM.STD_STATE_MV ON SDSADM.STD_STATE_MV.ID = SDSADM.STD_INSTITUTION_MV.STREETSTATE_ID ';

module.exports.fetch = function(logger, configuration, callback, params) {
    var sites = params.fullConfig.vistaSites;
    var siteCodes = _.keys(sites);

    var query = baseQuery;

    if (params.teamFocus) {
        query = query + 'INNER JOIN PCMM.TEAM ON PCMM.TEAM.VA_INSTITUTION_ID = SDSADM.STD_INSTITUTION_MV.ID INNER JOIN PCMM.PCM_STD_TEAM_FOCUS ON PCMM.PCM_STD_TEAM_FOCUS.PCM_STD_TEAM_FOCUS_ID = PCMM.TEAM.PCM_STD_TEAM_FOCUS_ID ';
    }
    var bindVars = [];
    var whereClause = 'WHERE SDSADM.STD_INSTITUTION_MV.STATIONNUMBER IN (';

    for (var i = 0; i < siteCodes.length; i++) {
        var divisions = sites[siteCodes[i]].division;
        for (var d = 0; d < divisions.length; d++) {
            bindVars.push(divisions[d].id);
        }
    }

    for (var b = 0; b < bindVars.length - 1; b++) {
        whereClause = whereClause + ':' + b + ', ';
    }
    whereClause = whereClause + ':' + (bindVars.length - 1) + ')';

    query = query + whereClause;

    if (params.teamFocus) {
        query = query + ' AND PCM_STD_TEAM_FOCUS.NAME = :teamFocus';
        bindVars.push(params.teamFocus);
    }
    var pcmmDbConfig = _.get(params, 'pcmmDbConfig');

    logger.trace({
        query: query,
        bindVars: bindVars
    }, 'facilities picklist query');

    pcmm.doQueryWithParams(pcmmDbConfig, query, bindVars, function(err, rows) {
        logger.trace({
            error: err,
            rows: rows
        }, 'facilities picklist result');
        if (err) {
            callback(err);
            return;
        }
        var result = parse(rows, (params.division && _.includes(bindVars, params.division)) ? params.division : undefined);
        callback(null, result);
    });
};
