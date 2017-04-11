'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var jdsFilter = require('jds-filter');
var _ = require('lodash');
var querystring = require('querystring');

var fs = require('fs'); //temporarily needed for reading in JSON data
var async = require('async');

var jdsResource = 'teamlist';

///////////////////////////// Utility functions
function doTeamListQuery(req, filters, callback) {
    var jdsServer = req.app.config.generalPurposeJdsServer;

    var jdsFilterQuery = jdsFilter.build(filters);

    var jdsQuery = {};
    jdsQuery.filter = jdsFilterQuery;

    var jdsQueryString = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '/?' + jdsQueryString;

    var options = _.extend({}, jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    httpUtil.get(options, callback);
}

function doTeamListUpdate(req, team, callback) {
    if (!team.hasOwnProperty('uid')) {
        return {};
    }

    var jdsServer = req.app.config.generalPurposeJdsServer;
    var jdsPath = jdsResource + '/' + team.uid;

    var options = _.extend({}, jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true,
        body: team
    });

    httpUtil.put(options, callback);
}

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

    var facility = req.param('facility') || req.session.user.site;

    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else if (response.statusCode >= 300) {
            return res.status(response.statusCode).rdkSend(data);
        }

        return res.rdkSend(data);
    };

    doTeamListQuery(req, jdsFilters, cb);
}

function getTeamById(req, res) {
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

    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else if (response.statusCode >= 300) {
            return res.status(response.statusCode).rdkSend(data);
        }

        var foundTeam = searchDataForTeamByParameter(data, 'teamId', teamId);
        if (Object.keys(foundTeam).length > 0) {
            return res.rdkSend(foundTeam);
        } else {
            return res.status(rdk.httpstatus.not_found).rdkSend('No team found for id ' + teamId);
        }

    };

    doTeamListQuery(req, jdsFilters, cb);
}

function deleteTeamById(req, res) {
    req.audit.dataDomain = 'team';
    req.audit.logCategory = 'DELETE';

    var facility = req.param('facility') || req.session.user.site;
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var teamId = req.param('teamId');
    if (nullchecker.isNullish(teamId)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: teamId');
    }

    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else if (response.statusCode >= 300) {
            return res.status(response.statusCode).rdkSend(data);
        }

        if (teamId) {
            var teamIndex = getTeamIndexByParameter(data, 'teamId', teamId);

            if (teamIndex < 0) {
                return res.status(rdk.httpstatus.not_found).rdkSend('Team with this teamId does not exist');
            }

            //remove from data
            var sitelist = data.items[0];
            sitelist.teams.splice(teamIndex, 1);

            //TODO if teamlist is now empty, should we delete the site from JDS?

            var updateCb = function(err, response, data) {
                if (!nullchecker.isNullish(err)) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                } else if (response.statusCode >= 300) {
                    return res.status(response.statusCode).rdkSend(data);
                }

                return res.rdkSend(data);
            };

            doTeamListUpdate(req, sitelist, updateCb);
        }
    };

    doTeamListQuery(req, jdsFilters, cb);
}

function getTeamsAndPositionsForUser(req, res) {
    req.audit.dataDomain = 'team';
    req.audit.logCategory = 'GET USER';
    //TODO use JDS index

    //req.session.facility is eg. PANORAMA
    var facility = req.param('facility') || req.session.user.site; //eg 9E7A
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    // req.session.user.accessCode; //eg PW    
    var user = req.param('siteUser') || req.session.user.username; //is eg. 9E7A;PW    
    if (nullchecker.isNullish(user)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: user');
    }

    var callback = function(err, response) {
        if (!nullchecker.isNullish(err)) {
            return res.status(err.status || rdk.httpstatus.internal_server_error).rdkSend(err.data || err);
        } else {
            return res.rdkSend(response);
        }
    };

    getTeamsForUser(req, facility, user, callback);
}

function getTeamsForUser(req, facility, user, callback) {
    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return callback(err);
        } else if (response.statusCode >= 300) {
            return callback({
                status: response.statusCode,
                data: data
            });
        }

        var returnPositions = [];

        if (data && data.hasOwnProperty('items') && data.items instanceof Array && data.items.length === 1) {
            data = data.items[0];

            if (data && data.hasOwnProperty('teams') && data.teams instanceof Array) {
                _.each(data.teams, function(team, teamIdx) {
                    if (team && team.hasOwnProperty('position') && team.position instanceof Array) {
                        _.each(team.position, function(position, posIdx) {
                            if (position && position.hasOwnProperty('ien') && position.ien == user) {
                                var returnedTeam = team;
                                delete returnedTeam.position;
                                delete returnedTeam.patients;
                                returnedTeam.position = position;
                                returnedTeam.facility = facility;
                                returnPositions.push(returnedTeam);
                            }
                        });
                    }
                });
            }
        }

        callback(null, returnPositions);
    };

    doTeamListQuery(req, jdsFilters, cb);
}

function getTeamsForPatient(req, res) {
    //TODO create and use index

    var icn = req.param('icn'); //TODO is selected patient ICN in the session?
    if (nullchecker.isNullish(icn)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: patient ICN');
    }

    var facility = req.param('facility') || req.session.user.site; //eg 9E7A
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else if (response.statusCode >= 300) {
            return res.status(response.statusCode).rdkSend(data);
        }

        return res.rdkSend(parseDataForPatientTeam(data, icn));
    };

    doTeamListQuery(req, jdsFilters, cb);
}
///////////////////////////// End GETs

///////////////////////////// POSTs
function addTeam(req, res) {
    req.audit.dataDomain = 'team';
    req.audit.logCategory = 'ADD';

    var facility = req.param('facility') || req.session.user.site;
    if (nullchecker.isNullish(facility)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: facility');
    }

    //TODO apply business logic to validate passed-in team
    var team = req.param('team');
    if (nullchecker.isNullish(team)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required parameter: team');
    }

    var jdsFilters = [
        ['eq', 'facility', facility]
    ];

    var cb = function(err, response, data) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else if (response.statusCode >= 300) {
            return res.status(response.statusCode).rdkSend(data);
        }

        if (team && team.teamDisplayName) {
            var foundTeamName = searchDataForTeamByParameter(data, 'teamDisplayName', team.teamDisplayName);

            if (foundTeamName && (Object.keys(foundTeamName).length > 0)) {
                return res.status(rdk.httpstatus.bad_request).rdkSend('Team with this display name already exists at this site');
            }
        }

        if (team && team.teamId) {
            var foundTeamId = searchDataForTeamByParameter(data, 'teamId', team.teamId);

            if (foundTeamId && (Object.keys(foundTeamId).length > 0)) {
                return res.status(rdk.httpstatus.bad_request).rdkSend('Team with this team ID already exists at this site');
            }
        }

        //add to data
        var sitelist = data.items[0];
        sitelist.teams.push(team);

        var updateCb = function(err, response, data) {
            if (!nullchecker.isNullish(err)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            return res.rdkSend(data);
        };

        doTeamListUpdate(req, sitelist, updateCb);
    };

    doTeamListQuery(req, jdsFilters, cb);
}

function addFacilities(req, res) {
    var jdsServer = req.app.config.generalPurposeJdsServer;
    var jdsPath = jdsResource;
    var facilities = req.body.facilities;

    if (!facilities instanceof Array) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid JSON facilities format');
    }

    var asyncTracker = {};

    _.each(facilities, function(facility, index) {

        if (isValidFacility(facility)) {

            var options = _.extend({}, jdsServer, {
                url: jdsPath,
                logger: req.logger,
                json: true,
                body: facility
            });

            asyncTracker['' + index] = function(callback) {
                httpUtil.post(options, function(err, responseInfo, responseBody) {
                    if (!nullchecker.isNullish(err)) {
                        return callback(err);
                    } else {
                        //JDS response is pretty worthless - just return the file info
                        return callback(null, facility);
                    }
                });
            };
        }
    });

    async.parallelLimit(asyncTracker, 5, function(err, results) {
        if (!nullchecker.isNullish(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        } else {
            return res.rdkSend(results);
        }
    });
}
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
module.exports.addTeam = addTeam;
module.exports.getTeamsAndPositionsForUser = getTeamsAndPositionsForUser;
module.exports.getTeamsForPatient = getTeamsForPatient;
module.exports.deleteTeamById = deleteTeamById;
module.exports.getTeamsForUser = getTeamsForUser;
module.exports.addFacilities = addFacilities;

///////////////////////////// Unit Test Exports
module.exports._searchDataForTeamByParameter = searchDataForTeamByParameter;
module.exports._getTeamIndexByParameter = getTeamIndexByParameter;
module.exports._parseDataForPatientTeam = parseDataForPatientTeam;
module.exports._isValidFacility = isValidFacility;
