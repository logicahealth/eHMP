'use strict';
var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var jbpm = require('../../../subsystems/jbpm/jbpm-subsystem');
var async = require('async');
var processJsonObject = require('../activity-utils').processJsonObject;
var processValue = require('../activity-utils').processValue;
var getGenericJbpmConfig = require('../activity-utils').getGenericJbpmConfig;
var getFormattedRoutesString = require('../activity-utils').getFormattedRoutesString;
var parseAssignedTo = require('../activity-utils').parseAssignedTo;
var activityDb = rdk.utils.pooledJbpmDatabase;

var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var dd = require('drilldown');
var parse = require('../../../write/pick-list/team-management/teams-parser').parse;

function getTeamsQuery(req) {
    var query = 'SELECT DISTINCT PCMM.TEAM.TEAM_ID, PCMM.TEAM.PCM_STD_TEAM_FOCUS_ID, PCMM.TEAM.PCM_STD_TEAM_FOCUS2_ID, PCMM.TEAM.TEAM_NAME, SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.STAFF ' +
        'INNER JOIN PCMM.TEAM_MEMBERSHIP ON PCMM.STAFF.STAFF_ID = PCMM.TEAM_MEMBERSHIP.STAFF_ID ' +
        'INNER JOIN PCMM.TEAM_POSITION ON PCMM.TEAM_MEMBERSHIP.TEAM_POSITION_ID = PCMM.TEAM_POSITION.TEAM_POSITION_ID ' +
        'INNER JOIN PCMM.TEAM ON PCMM.TEAM_POSITION.TEAM_ID = PCMM.TEAM.TEAM_ID ' +
        'INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID ' +
        'WHERE PCMM.STAFF.STAFF_IEN=';

    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    query += user;
    req.logger.debug({
        query: query
    });
    return query;
}

function getTeams(req, callback) {
    var query = getTeamsQuery(req);
    req.logger.debug({
        getTeamsquery: query
    });

    activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, query, function (err, rows) {
        req.logger.debug({
            err: err,
            rows: rows
        });
        if (err) {
            return callback(err);
        }
        var teams = parse(rows, req.app.config.vistaSites, false);
        req.logger.debug({
            parsedTeams: teams
        });

        return callback(null, teams);
    });
}

function getTeamMembersQuery(req, teams) {
    if (_.isEmpty(teams)) {
        req.logger.debug({
            teams: 'None'
        });
        return '';
    }

    var query = 'SELECT DISTINCT PCMM.TEAM_MEMBERSHIP.STAFF_ID FROM PCMM.TEAM_MEMBERSHIP' +
        ' INNER JOIN PCMM.TEAM ON PCMM.TEAM.TEAM_ID = PCMM.TEAM_MEMBERSHIP.TEAM_ID ' +
        ' WHERE ';

    _.map(teams, function (team, index) {
        if (index !== 0) {
            query += ' OR ';
        }
        query += ' PCMM.TEAM.TEAM_ID= ';
        query += team.teamID;
    });
    query += ' ORDER BY PCMM.TEAM_MEMBERSHIP.STAFF_ID ASC ';

    req.logger.debug({
        teams: teams,
        getTeamMembersQuery: query
    });
    return query;
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
        return callback(null, retVal);
    }

    var query = getTeamMembersQuery(req, teams);

    activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, query, function (err, rows) {
        req.logger.debug({
            err: err,
            rows: rows
        });
        if (err) {
            return callback(err);
        }
        retVal.teamMates = rows;

        return callback(null, retVal);
    });
}

function getDemographics(req, input, callback) {
    var rows = input.rows;

    var vistaSites = req.app.config.vistaSites;

    _.each(rows, function (activity) {
        if (!_.isUndefined(activity.STATUS)) {
            if (activity.STATUS.toUpperCase() === 'ACTIVE' || activity.STATUS.toUpperCase() === 'SUSPENDED') {
                activity.MODE = 'Open';
            } else if (activity.STATUS.toUpperCase() === 'COMPLETED' || activity.STATUS.toUpperCase() === 'ABORTED') {
                activity.MODE = 'Closed';
            }
        }

        if (!_.isUndefined(activity.CREATEDATID) && !_.isUndefined(vistaSites[activity.CREATEDATID])) {
            var divisionId = vistaSites[activity.CREATEDATID].division;
            activity.CREATEDATDIVISIONID = divisionId;
        }

        if (!_.isUndefined(activity.ASSIGNEDTOFACILITYID) && !_.isUndefined(vistaSites[activity.ASSIGNEDTOFACILITYID])) {
            var divisionId = vistaSites[activity.ASSIGNEDTOFACILITYID].division;
            activity.ASSIGNEDTODIVISIONID = divisionId;
        }
    });

    var context = req.query.context;
    var staff = (context === 'staff');
    addPatientAndUserJdsDataToActivities(rows, req, staff, function (err, results) {
        if (err) {
            return callback(err);
        }
        _.each(rows, function (activity) {
            req.logger.debug({
                activityInCallback: activity
            });
            if (!_.isNull(activity.CREATEDBYID)) {
                activity.CREATEDBYNAME = results.users[activity.CREATEDBYID];
            }
            if (!_.isNull(activity.ASSIGNEDTOID)) {
                activity.ASSIGNEDTONAME = results.users[activity.ASSIGNEDTOID];
                activity.INTENDEDFOR = getFormattedRoutesString(activity.assignedToRoutes, results.users, false);
                delete activity.assignedToRoutes;
            } else {
                activity.INTENDEDFOR = '';
            }

            if (staff) {
                var patientMatch = results.patients[activity.PID];
                if (!_.isUndefined(patientMatch)) {
                    activity.PATIENTNAME = patientMatch.fullName;
                    activity.PATIENTSSNLASTFOUR = patientMatch.last4;
                    activity.ISSENSITIVEPATIENT = patientMatch.sensitive;
                }
            }
        });

        var finalAnswer = {};
        finalAnswer.input = input;
        finalAnswer.rows = rows;
        return callback(null, finalAnswer);
    });
}

function addPatientAndUserJdsDataToActivities(response, req, includePatientData, callback) {
    var pids = {};
    var pidList;
    var users = {};
    var asyncTasks = [];

    if (includePatientData) {
        _.each(response, function (activity) {
            pids[activity.PID] = {};
        });
        pidList = _.keys(pids);

        _.each(pidList, function (pid) {
            asyncTasks.push(function (callback) {
                retrieveUserAndPatientDataFromJds(req.app.config, 'patient', pid, req.logger, callback);
            });
        });
    }

    _.each(response, function (activity) {
        if (!_.isNull(activity.CREATEDBYID)) {
            users[activity.CREATEDBYID] = {};
        }

        if (!_.isNull(activity.ASSIGNEDTOID)) {
            activity.assignedToRoutes = parseAssignedTo(activity.ASSIGNEDTOID);
            _.each(activity.assignedToRoutes, function (parsedRoute) {
                if (!_.isUndefined(parsedRoute.user)) {
                    users[parsedRoute.user] = {};
                }
            });
        }
    });

    var userList = _.keys(users);

    _.each(userList, function (userId) {
        asyncTasks.push(function (callback) {
            retrieveUserAndPatientDataFromJds(req.app.config, 'user', userId, req.logger, callback);
        });
    });

    async.parallelLimit(asyncTasks, 15, function (err, results) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var resultObj = {
            users: {},
            patients: {}
        };

        _.each(results, function (result) {
            if (result.data && result.data.items && result.data.items.length > 0) {
                // Should only ever be one result for each query
                var item = result.data.items[0];
                if (item.uid.indexOf('user') !== -1) {
                    var uidSplit = item.uid.split(':');
                    var pid = uidSplit[uidSplit.length - 2] + ';' + uidSplit[uidSplit.length - 1];
                    resultObj.users[pid] = item.name;
                } else if (item.uid.indexOf('patient') !== -1) {
                    resultObj.patients[item.pid] = {
                        fullName: item.fullName,
                        last4: item.last4,
                        sensitive: item.sensitive
                    };
                }
            }
        });

        req.logger.debug({
            resultObj: resultObj
        });

        return callback(null, resultObj);
    });

}

function retrieveUserAndPatientDataFromJds(appConfig, type, id, logger, callback) {
    var jdsPath, filter;
    var jdsQuery = {};

    if (type === 'user') {
        var idSplit = id.split(';');
        var uid = 'urn:va:user:' + idSplit[0] + ':' + idSplit[1];
        jdsPath = '/data/' + uid;
    } else if (type === 'patient') {
        jdsPath = '/vpr/' + id;
    }


    var options = _.extend({}, appConfig.jdsServer, {
        url: jdsPath,
        logger: logger || {},
        json: true
    });

    httpUtil.get(options, function (err, response, returnedData) {
        if (err) {
            logger.error(err.message);
            return callback(err);
        }

        if (dd(returnedData)('data').exists) {
            return callback(null, returnedData);
        }

        logger.error('Unexpected JSON format. Could not find patient or user in JDS. Will not include fields in the response.');
        return callback(null, {});
    });
}

function generatePatientQuery(pid, mode) {
    var modeCondition = !_.isUndefined(mode) ? '(  psl.ID = 1 OR psl.ID = 4) AND ' : '';
    var query = 'SELECT pi.PROCESSINSTANCEID as processId, ' +
        'pi.PROCESSNAME as name, ' +
        'pi.ICN as pid, ' +
        'pi.CREATEDBYID as createdById, ' +
        'pi.URGENCY as urgency, ' +
        'pi.STATE as taskState, ' +
        'pi.ASSIGNEDTO as assignedToId, ' +
        'pi.INSTANCENAME as instanceName, ' +
        'pi.DESTINATIONFACILITYID as assignedToFacilityId, ' +
        'pi.FACILITYID as createdAtId, ' +
        'pi.INITIATIONDATE as createdOn, ' +
        'psl.STATUS as status, ' +
        'pi.DOMAIN as domain, ' +
        'pi.DEPLOYMENTID as deploymentId, ' +
        'pi.ACTIVITYHEALTHY as isActivityHealthy, ' +
        'pi.ACTIVITYHEALTHDESCRIPTION as activityHealthDescription, ' +
        '(SELECT listagg(TEAMFOCUS, \',\') WITHIN GROUP (ORDER BY teamFocus) teamFocus ' +
        'FROM ACTIVITYDB.AM_PROCESSROUTE ' +
        '   WHERE PROCESSINSTANCEID = pi.PROCESSINSTANCEID AND TEAMFOCUS IS NOT NULL) as teamFoci, ' +
        '(SELECT listagg(TEAM, \',\') WITHIN GROUP (ORDER BY team) team ' +
        'FROM ACTIVITYDB.AM_PROCESSROUTE ' +
        '   WHERE PROCESSINSTANCEID = pi.PROCESSINSTANCEID AND TEAM IS NOT NULL) as teams, ' +
        '(SELECT listagg(USERID, \',\') WITHIN GROUP (ORDER BY userid) userid ' +
        'FROM ACTIVITYDB.AM_PROCESSROUTE WHERE ACTIVITYDB.AM_PROCESSROUTE.USERID IS NOT NULL ' +
        'AND ACTIVITYDB.AM_PROCESSROUTE.PROCESSINSTANCEID = pi.PROCESSINSTANCEID) as intendedForUsers ' +
        'FROM ACTIVITYDB.AM_PROCESSINSTANCE pi ' +
        'INNER JOIN ACTIVITYDB.Am_PROCESSSTATUSLOOKUP psl ' +
        '   ON pi.statusId = psl.id ' +
        'WHERE (pi.STATE <> \'Draft\' OR pi.STATE IS NULL) AND ' +
        modeCondition +
        ' pi.ICN = \'' + pid + '\' ';
    return query;
}


function generateQuery(req, results) {
    var context = req.query.context;

    if (context === 'patient') {
        return generatePatientQuery(req.query.pid, req.query.mode);
    }

    var teams = results.teams;
    var teamIds = [];
    var teamFocusIds = [];
     _.each(results.teams, function(team){
         teamIds.push(team.teamID);

         if(!_.isNull(team.teamPrimaryFoci)){
            teamFocusIds.push(team.teamPrimaryFoci);
         }

         if(!_.isNull(team.teamSecondaryFoci)){
            teamFocusIds.push(team.teamSecondaryFoci);
         }
    });

    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var userId = site + ';' + user;
    var modeCondition = !_.isUndefined(req.query.mode) ? '(  psl.ID = 1 OR psl.ID = 4) AND ' : '';

    var query = 'SELECT pi.PROCESSINSTANCEID as processId, ' +
        'pi.PROCESSNAME as name, ' +
        'pi.ICN as pid, ' +
        'pi.CREATEDBYID as createdById, ' +
        'pi.URGENCY as urgency, ' +
        'pi.STATE as taskState, ' +
        'pi.ASSIGNEDTO as assignedToId, ' +
        'pi.INSTANCENAME as instanceName, ' +
        'pi.DESTINATIONFACILITYID as assignedToFacilityId, ' +
        'pi.FACILITYID as createdAtId, ' +
        'pi.INITIATIONDATE as createdOn, ' +
        'psl.STATUS as status, ' +
        'pi.DOMAIN as domain, ' +
        'pi.DEPLOYMENTID as deploymentId, ' +
        'pi.ACTIVITYHEALTHY as isActivityHealthy, ' +
        'pi.ACTIVITYHEALTHDESCRIPTION as activityHealthDescription, ' +
        '(SELECT listagg(TEAMFOCUS, \',\') WITHIN GROUP (ORDER BY teamFocus) teamFocus ' +
        'FROM ACTIVITYDB.AM_PROCESSROUTE ' +
        '   WHERE PROCESSINSTANCEID = pi.PROCESSINSTANCEID AND TEAMFOCUS IS NOT NULL) as teamFoci, ' +
        '(SELECT listagg(TEAM, \',\') WITHIN GROUP (ORDER BY team) team FROM ACTIVITYDB.AM_PROCESSROUTE WHERE PROCESSINSTANCEID = pi.PROCESSINSTANCEID AND TEAM IS NOT NULL) as teams, ' +
        '(SELECT listagg(USERID, \',\') WITHIN GROUP (ORDER BY userid) userid FROM ACTIVITYDB.AM_PROCESSROUTE WHERE ACTIVITYDB.AM_PROCESSROUTE.USERID IS NOT NULL AND ACTIVITYDB.AM_PROCESSROUTE.PROCESSINSTANCEID = pi.PROCESSINSTANCEID) as intendedForUsers ' +
        'FROM ACTIVITYDB.AM_PROCESSINSTANCE pi ' +
        'INNER JOIN ACTIVITYDB.Am_PROCESSSTATUSLOOKUP psl ' +
        '   ON pi.statusId = psl.id ' +
        'WHERE (pi.STATE <> \'Draft\' OR pi.STATE IS NULL) AND ' +
        modeCondition +
        ' pi.CREATEDBYID = \'' + userId + '\' ' +
        '       OR pi.PROCESSINSTANCEID IN (SELECT ACTIVITYDB.AM_PROCESSROUTE.PROCESSINSTANCEID ' +
        '       FROM ACTIVITYDB.AM_PROCESSROUTE ' +
        '       WHERE USERID = \'' + userId + '\' OR ' +
        '       TEAM IN (' + teamIds.join(',') + ') OR ' +
        '       TEAMFOCUS IN (' + teamFocusIds.join(',') + ') )';

    return query;
}

function getInstances(req, results, callback) {
    var query = generateQuery(req, results);
    req.logger.debug({
        getInstancesQuery: query
    });

    activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, query, function (err, response) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var retVal = results;
        retVal.rows = response;
        return callback(null, retVal);
    }, 10000);
}

function getActivityInstances(req, res) {
    req.audit.dataDomain = 'Activities';
    req.audit.logCategory = 'ACTIVITY_INSTANCES';

    var context = req.query.context;
    if (context !== 'patient' && context !== 'staff') {
        return res.status(rdk.httpstatus.internal_server_error).rdkSend('Context must be either patient or staff');
    }

    var teams = getTeams.bind(null, req);
    var teamMembers = getTeamMembers.bind(null, req);
    var instances = getInstances.bind(null, req);
    var demographics = getDemographics.bind(null, req);

    async.waterfall([teams, teamMembers, instances, demographics],
        function (err, results) {
            if (err) {
                req.logger.error(err);
                return res.status(rdk.httpstatus.bad_request).rdkSend(err.message);
            }

            var finalAnswer = {};
            finalAnswer.teams = results.input.teams;
            finalAnswer.teamMates = results.input.teamMates;
            finalAnswer.items = results.rows;
            return res.status(rdk.httpstatus.ok).rdkSend(finalAnswer);
        });
}

module.exports.getActivityInstances = getActivityInstances;
module.exports._retrieveUserAndPatientDataFromJds = retrieveUserAndPatientDataFromJds;
module.exports._addPatientAndUserJdsDataToActivities = addPatientAndUserJdsDataToActivities;
module.exports._getTeamMembersQuery = getTeamMembersQuery;
module.exports._generateQuery = generateQuery;
