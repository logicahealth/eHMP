'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var dd = require('drilldown');
var activityDb = rdk.utils.pooledJbpmDatabase;


function searchDataForTeamByParameter(data, teamField, teamFieldValue) {
    if (!data || !teamField || !teamFieldValue) {
        return {};
    }

    if (data && data.items && data.items.length === 1) {
        //exactly 1 matching site..
        var facilityDefinition = data.items[0];
        if (facilityDefinition.teams && facilityDefinition.teams.length > 0) {
            for (var i = 0; i < facilityDefinition.teams.length; i++) {
                if (facilityDefinition.teams[i].hasOwnProperty(teamField) && facilityDefinition.teams[i][teamField] == teamFieldValue) {
                    return facilityDefinition.teams[i];
                }
            }
        }
    }

    return {};
}

function getTeamIndexByParameter(data, teamField, teamFieldValue) {
    if (!data || !teamField || !teamFieldValue) {
        return -1;
    }

    if (data && data.items && data.items.length === 1) {
        //exactly 1 matching site..
        var facilityDefinition = data.items[0];
        if (facilityDefinition.teams && facilityDefinition.teams.length > 0) {
            for (var i = 0; i < facilityDefinition.teams.length; i++) {
                if (facilityDefinition.teams[i].hasOwnProperty(teamField) && facilityDefinition.teams[i][teamField] == teamFieldValue) {
                    return i;
                }
            }
        }
    }

    return -1;
}

function parseDataForPatientTeam(data, icn) {
    var returnTeams = [];

    if (data && data.hasOwnProperty('items') && data.items instanceof Array && data.items.length === 1) {
        data = data.items[0];

        if (data && data.hasOwnProperty('teams') && data.teams instanceof Array) {
            _.each(data.teams, function(team, teamIdx) {
                if (team && team.hasOwnProperty('patients') && team.patients instanceof Array) {
                    _.each(team.patients, function(patient, patIdx) {
                        if (patient && patient.hasOwnProperty('icn') && patient.icn == icn) {
                            returnTeams.push(team);
                        }
                    });
                }
            });
        }
    }

    return returnTeams;
}

///////////////////////////// End Utility functions


///////////////////////////// GETs
function getTeamList(req, res) {


    req.audit.dataDomain = 'team';
    req.audit.logCategory = 'RETRIEVE';

    var cb = function(err, response) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        req.logger.debug('team-operation-resource:getTeamList rows %j',response);
        return res.status('200').rdkSend(response);
    };

    var facility = req.param('facility') || req.session.user.site;

    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var stationNumber = dd(req)('app')('config')('vistaSites')(facility)('division').val;

    var query ='SELECT UNIQUE(T.TEAM_ID) FROM PCMM.TEAM T WHERE T.VA_INSTITUTION_ID IN'+
        '(SELECT s.ID FROM sdsadm.STD_Institution s where s.STATIONNUMBER =\''+stationNumber+'\')';

    req.logger.debug('team-operation-resource:getTeamList query %j',query);

    activityDb.doQuery(req, req.app.config.jbpm.activityDatabase,query, cb);

}

function getTeamById(req, res) {

    //RETURN 501 FOR NOW UNTIL WE MAKE SURE THE PCMM SQL IN THE COMMENTED CODE IS APPROPRIATE.
    return res.status('501').rdkSend(null);

    /*
    req.audit.dataDomain = 'team';
    req.audit.logCategory = 'RETRIEVE';

    var facility = req.param('facility') || req.session.user.site;
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var teamId = req.param('teamId');
    if (nullchecker.isNullish(teamId)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: teamId');
    }

    var cb = function(err, response) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        req.logger.debug('team-operation-resource:getTeamById rows %j',response);

        return res.status('200').rdkSend(response);
     };

    var stationNumber = dd(req)('app')('config')('vistaSites')(facility)('division').val;

    var query ='SELECT * FROM PCMM.TEAM T WHERE T.TEAM_ID=\''+teamId+'\' AND T.VA_INSTITUTION_ID IN'+
        '(SELECT s.ID FROM sdsadm.STD_Institution s where s.STATIONNUMBER =\''+stationNumber+'\')';

    req.logger.debug('team-operation-resource:getTeamById query %j',query);

    activityDb.doQuery(req, query, cb);
    */
}



function getTeamsForPatient(req, res) {

    //RETURN 501 FOR NOW UNTIL WE MAKE SURE THE PCMM SQL IN THE COMMENTED CODE IS APPROPRIATE.
    return res.status('501').rdkSend(null);

    /*
    var icn = req.param('icn'); //TODO is selected patient ICN in the session?
    if (nullchecker.isNullish(icn)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: patient ICN');
    }

    var facility = req.param('facility') || req.session.user.site; //eg 9E7A
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var cb = function(err, response) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        req.logger.debug('team-operation-resource:getTeamsForPatient rows %j',response);

       // return res.status('200').rdkSend(response);

        //RETURN 501 FOR NOW UNTIL WE MAKE SURE PCMM SQL'S ARE CORRECT.
        return res.status('501');
    };

    var stationNumber = dd(req)('app')('config')('vistaSites')(facility)('division').val;

    var query ='SELECT UNIQUE(T.TEAM_ID) FROM PCMM.TEAM T '+
    'INNER JOIN sdsadm.STD_Institution S ON S.id=T.VA_INSTITUTION_ID '+
    'INNER JOIN PCMM.TEAM_PATIENT_ASSIGN TP ON T.TEAM_ID=TP.TEAM_ID '+
    'INNER JOIN PCMM.PCMM_PATIENT P ON TP.PCMM_PATIENT_ID=P.PCMM_PATIENT_ID '+
    'WHERE s.STATIONNUMBER =\''+stationNumber+'\' AND P.ICN = \''+icn+'\'';

    req.logger.debug('team-operation-resource:getTeamsForPatient query %j',query);

    activityDb.doQuery(req, query, cb);
    */

}
///////////////////////////// End GETs



///////////////////////////// End POSTs

function isValidFacility(facility) {
    if (facility && facility.teams && Array.isArray(facility.teams)) {
        var teamDisplayNames = [];
        var teamIds = [];
        var hasError = false;
        _.each(facility.teams, function(team) {
            if (team.teamDisplayName) {
                teamDisplayNames.push(team.teamDisplayName);
            }
            if (team.teamId) {
                teamIds.push(team.teamId);
            } else {
                hasError = true;
            }
        });

        if (hasError) {
            return false;
        }

        if (teamDisplayNames.length === _.uniq(teamDisplayNames).length) {
            if (teamIds.length === _.uniq(teamIds).length) {
                return true;
            }
        }
    }
    return false;
}

///////////////////////////// Exports
module.exports.getTeamList = getTeamList;
module.exports.getTeamById = getTeamById;
module.exports.getTeamsForPatient = getTeamsForPatient;

///////////////////////////// Unit Test Exports
module.exports._searchDataForTeamByParameter = searchDataForTeamByParameter;
module.exports._getTeamIndexByParameter = getTeamIndexByParameter;
module.exports._parseDataForPatientTeam = parseDataForPatientTeam;
module.exports._isValidFacility = isValidFacility;
