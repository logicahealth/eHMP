'use strict';
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var RdkError = rdk.utils.RdkError;
var _ = require('lodash');
var async = require('async');
var getFormattedRoutesString = require('../activity-utils').getFormattedRoutesString;
var parseAssignedTo = require('../activity-utils').parseAssignedTo;
var getDatabaseConfigFromRequest = require('../activity-utils').getDatabaseConfigFromRequest;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var parse = require('../../../write/pick-list/team-management/teams-parser').parse;
var helpers = require('./all-instances-helper');
var resultUtils = rdk.utils.results;

function getTeams(req, callback) {
    var dbConfig = getDatabaseConfigFromRequest(req);
    if (!dbConfig) {
        return callback(new RdkError({
            code: 'oracledb.503.1001',
            logger: req.logger
        }));
    }

    var site = req.session.user.site;
    var userDuz = req.session.user.duz[site];
    var stationNumber = req.session.user.division;

    var procParams = {
        p_user_duz: userDuz,
        p_station_number: stationNumber
    };

    var procQuery = 'BEGIN activitydb.activities.getTeamsForUser(:p_user_duz, :p_station_number, :recordset); END;';
    req.logger.debug({query: procQuery, parameters: procParams}, 'all-instances-resource:getTeams executing stored procedure');

    activityDb.doExecuteProcWithParams(req, dbConfig, procQuery, procParams, function (err, data) {
        req.logger.debug({
            err: err,
            rows: data
        });

        if (err) {
            return callback(err);
        }
        var teams = parse(data, req.app.config.vistaSites, false);
        req.logger.debug({
            parsedTeams: teams
        });

        return callback(null, teams);
    });
}

function getTeamMembers(req, teams, callback) {
    var logger = req.logger;
    logger.debug({
        teams: teams
    });

    var retVal = {};
    retVal.teams = teams;

    if (_.isEmpty(teams)) {
        logger.debug({
            teams: 'None'
        });
        retVal.teamsMembership = [];
        return callback(null, retVal);
    }

    var dbConfig = getDatabaseConfigFromRequest(req);
    if (!dbConfig) {
        return callback(new RdkError({
            code: 'oracledb.503.1001',
            logger: logger
        }));
    }

    var teamsIds = '';

    _.map(teams, function(team, index) {
        if (index !== 0) {
            teamsIds += ',';
        }
        teamsIds += team.teamID;
    });

    var procParams = {
        p_team_ids: teamsIds
    };

    var procQuery = 'BEGIN activitydb.activities.getMembersForTeam(:p_team_ids, :recordset); END;';
    req.logger.debug({query: procQuery, parameters: procParams}, 'all-instances-resource:getTeamMembers executing stored procedure');

    activityDb.doExecuteProcWithParams(req, dbConfig, procQuery, procParams, function (err, data) {
        req.logger.debug({
            err: err,
            rows: data
        });

        if (err) {
            return callback(err);
        }

        retVal.teamsMembership = data;
        return callback(null, retVal);
    });
}

function updateIdentities(req, rows, results) {
    _.each(rows, function(activity) {
        req.logger.debug({
            activityInCallback: activity
        });

        if (!_.isNull(activity.CREATEDBYID)) {
            activity.CREATEDBYNAME = results.users[activity.CREATEDBYID];
        }
        if (!_.isNull(activity.ASSIGNEDTOID)) {
            //activity.ASSIGNEDTONAME = results.users[activity.ASSIGNEDTOID];
            activity.INTENDEDFOR = getFormattedRoutesString(activity.assignedToRoutes, results.users, false);
            delete activity.assignedToRoutes;
        } else {
            activity.INTENDEDFOR = '';
        }

        if (helpers.isStaffRequest(req)) {
            var patientMatch = results.patients[activity.PID];
            if (!_.isUndefined(patientMatch)) {
                activity.PATIENTNAME = patientMatch.fullName;
                activity.PATIENTSSNLASTFOUR = patientMatch.last4;
                activity.ISSENSITIVEPATIENT = patientMatch.sensitive;
            }
        }
    });
}

function getDemographics(req, input, callback) {
    var rows = input.rows;

    queryJDSForDemographics(rows, req, helpers.isStaffRequest(req), function(err, results) {
        if (err) {
            return callback(err);
        }
        updateIdentities(req, rows, results);

        var finalAnswer = {};
        finalAnswer.input = input;
        finalAnswer.rows = rows;
        return callback(null, finalAnswer);
    });
}

function queryJDSForDemographics(response, req, includePatientData, callback) {
    var pidList = [];
    var users = {};
    var JDSQueries = [];

    if (includePatientData) {
        _.each(response, function(activity) {
            pidList.push(activity.PID);
        });

        var JDSQueriesForPatient = helpers.getJDSQueryFromIds(req.logger, 'patient', pidList);

        _.each(JDSQueriesForPatient, function(query) {
            JDSQueries.push(function(callback) {
                runJDSQuery(req, query, callback);
            });
        });
    }

    _.each(response, function(activity) {
        if (!_.isNull(activity.CREATEDBYID)) {
            users[activity.CREATEDBYID] = {};
        }

        if (!_.isNull(activity.ASSIGNEDTOID)) {
            activity.assignedToRoutes = parseAssignedTo(activity.ASSIGNEDTOID);
            _.each(activity.assignedToRoutes, function(parsedRoute) {
                if (!_.isUndefined(parsedRoute.user)) {
                    users[parsedRoute.user] = {};
                }
            });
        }
    });

    var userList = _.keys(users);
    userList = helpers.adjustUserIds(req.logger, userList);

    var JDSQueriesForUsers = helpers.getJDSQueryFromIds(req.logger, 'user', userList);
    _.each(JDSQueriesForUsers, function(query) {
        JDSQueries.push(function(callback) {
            runJDSQuery(req, query, callback);
        });
    });

    async.parallelLimit(JDSQueries, 15, function(err, results) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var resultObj = {
            users: {},
            patients: {}
        };

        _.each(results, function(result) {
            // each result is now an array of demographics
            _.each(result, function(item) {
                if (item.uid.indexOf('user') !== -1) {
                    var uidSplit = item.uid.split(':');
                    var pid = uidSplit[uidSplit.length - 2] + ';' + uidSplit[uidSplit.length - 1];
                    resultObj.users[pid] = item.name;
                } else if (item.uid.indexOf('pt-select') !== -1) {
                    resultObj.patients[item.pid] = {
                        fullName: item.fullName,
                        last4: item.last4,
                        sensitive: item.sensitive
                    };
                }
            });
        });

        req.logger.debug({
            resultObj: resultObj
        });

        return callback(null, resultObj);
    });
}

function runJDSQuery(req, query, callback) {
    var logger = req.logger;
    var jdsServer = req.app.config.jdsServer;
    var options = _.extend({}, jdsServer, {
        url: query,
        logger: logger || {},
        json: true
    });

    httpUtil.get(options, function(err, response, returnedData) {
        if (err) {
            logger.error(err.message);
            return callback(err);
        }

        if (!_.isUndefined(_.get(returnedData, 'data.items'))) {
            return callback(null, returnedData.data.items);
        }

        logger.error('Unexpected JSON format. Could not find patient or user in JDS. Will not include fields in the response.');
        return callback(null, {});
    });
}

function getInstances(req, results, callback) {
    var dbConfig = getDatabaseConfigFromRequest(req);
    if (!dbConfig) {
        return callback(new RdkError({
            code: 'oracledb.503.1001',
            logger: req.logger
        }));
    }

    var teamIds = '';
    var teamPrimaryFociIds = '';
    var teamSecondaryFociIds = '';
    var teamFocusIds = '';

    if (!_.isEmpty(results.teams)) {
        teamIds = _.map(results.teams, 'teamID').join(',');
        teamPrimaryFociIds = _.map(results.teams, 'teamPrimaryFoci').join(',');
        teamSecondaryFociIds = _.map(results.teams, 'teamSecondaryFoci').join(',');
        teamFocusIds = teamPrimaryFociIds + teamSecondaryFociIds;
    }

    var userId = helpers.getUserId(req);
    var patientIds = '';
    var counter = 0;

    _.each(results.patientIdentifiers, function(pid) {
        if (counter > 0) {
            patientIds += ',';
        }

        patientIds += pid;
        counter++;
    });
    var convertReqBooleanToNumber = function(reqParam) {
        var number = 0;
        if (reqParam === 'true') {
            number = 1;
        }
        return number;
    };
    var p_process_definition_id = 'none';
    if (!_.isUndefined(req.query.domain) && !_.isEmpty(req.query.domain)) {
        p_process_definition_id = 'Order.' + _.capitalize(req.query.domain);
    }

    var mode;
    if(!_.isEmpty(req.query.mode) && req.query.mode !== 'all'){
        mode = req.query.mode;
    }
    var procParams = {
        p_created_by_me: convertReqBooleanToNumber(req.query.createdByMe),
        p_intended_for_me: convertReqBooleanToNumber(req.query.intendedForMeAndMyTeams),
        p_user_id: userId,
        p_patient_ids: patientIds,
        p_team_ids: teamIds,
        p_team_focus_ids: teamFocusIds,
        p_mode: mode,
        p_start_date: req.query.startDate,
        p_end_date: req.query.endDate,
        p_process_definition_id: p_process_definition_id,
        p_show_only_flagged: convertReqBooleanToNumber(req.query.showOnlyFlagged)
    };

    var procQuery = 'BEGIN activitydb.activities.getActivites(:p_created_by_me, :p_intended_for_me, :p_user_id, :p_patient_ids, :p_team_ids, :p_team_focus_ids, :p_mode, :p_start_date, :p_end_date, :p_process_definition_id, :p_show_only_flagged, :recordset); END;';
    req.logger.debug({query: procQuery, parameters: procParams}, 'all-instances-resource:getInstances executing stored procedure');

    activityDb.doExecuteProcWithParams(req, dbConfig, procQuery, procParams, function(err, data) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }
        var retVal = results;
        retVal.rows = data;
        return callback(null, retVal);
    });
}

function getActivityInstances(req, res) {
    req.audit.dataDomain = 'Activities';
    req.audit.logCategory = 'ACTIVITY_INSTANCES';

    var errorMessage = helpers.getErrorMessage(req);
    if (!_.isEmpty(errorMessage)) {
        return res.status(rdk.httpstatus.internal_server_error).rdkSend(errorMessage);
    }

    var teams = getTeams.bind(null, req);
    var teamMembers = getTeamMembers.bind(null, req);
    var patientIdentifiers = getPatientIdentifiers.bind(null, req);
    var instances = getInstances.bind(null, req);
    var demographics = getDemographics.bind(null, req);
    var jobs = [];
    jobs.push(teams);
    jobs.push(teamMembers);

    if (!helpers.isStaffRequest(req)) {
        jobs.push(patientIdentifiers);
    }

    jobs.push(instances);
    jobs.push(demographics);

    async.waterfall(jobs,
        function(err, results) {
            if (err) {
                req.logger.error(err);
                return res.status(rdk.httpstatus.bad_request).rdkSend(err.message);
            }

            var finalAnswer = {};
            finalAnswer.teams = results.input.teams;
            finalAnswer.teamsMembership = results.input.teamsMembership;
            finalAnswer.items = resultUtils.unescapeSpecialCharacters(results.rows, ['ACTIVITYHEALTHDESCRIPTION', 'INSTANCENAME']);

            req.logger.debug({
                teams: finalAnswer.teams
            }, {
                teamsMembership: finalAnswer.teamsMembership
            });

            _.each(finalAnswer.items, function(item) {
                req.logger.debug({
                    returnValues: item
                });
            });

            delete finalAnswer.teams;
            delete finalAnswer.teamsMembership;
            return res.status(rdk.httpstatus.ok).rdkSend(finalAnswer);
        });
}

function getPatientIdentifiers(req, results, callback) {
    var retVal = results;
    retVal.patientIdentifiers = [];

    var jdsResource = '/vpr/jpid';
    var pid = req.query.pid;
    var jdsPath = jdsResource + '/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            return callback(error);
        }
        retVal.patientIdentifiers = result.patientIdentifiers;
        return callback(null, retVal);
    });
}

module.exports.getActivityInstances = getActivityInstances;
