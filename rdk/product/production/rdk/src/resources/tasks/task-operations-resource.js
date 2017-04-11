'use strict';

var rdk = require('../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var async = require('async');
var parseString = require('xml2js').parseString;
var fs = require('fs');
var getGenericJbpmConfig = require('./task-utils').getGenericJbpmConfig;
var filterVariablesForRecency = require('./task-utils').filterVariablesForRecency;
var handleTaskStatuses = require('./task-utils').handleTaskStatuses;
var processJsonObject = require('./task-utils').processJsonObject;
var getJbpmUser = require('./task-utils').getJbpmUser;
var activityDb = require('./activity-database-utils');
var teamOperations = require('../teams/team-operations-resource');
var nullchecker = rdk.utils.nullchecker;
var dd = require('drilldown');

function getTaskStatusList(req, res) {
    var cb = function(err, rows, fields) {
        if (err) {
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        res.rdkSend(rows);
    };
    activityDb.doQuery(req, 'SELECT * FROM activitydb.Am_TaskStatusLookup', cb);
}


var FacilityCodeLookup = {
    101: 'Panorama',
    102: 'Kodak'
};

var TeamTypeLookup = {
    301: 'Primary Care',
    302: 'Women Health'
};

var TeamFocusLookup = {
    201: 'Primary Care'
};

var TeamLookup = {
    501: 'Primary Care Team A 3rd Floor'
};

var TeamRoleLookup = {
    403: 'Physician',
    410: 'Nurse Practitioner',
    411: 'Registered Nurse',
    412: 'Licensed Practical Nurse'
};

function buildTasksResponse(tasks, tasksRoutesList, req, tasksCallback) {

    var formattedResponse = {
        data: {
            items: []
        }
    };

    var tasksRoutes = {};

    var routes = [];
    var taskInstanceId;
    _.each(tasksRoutesList, function(po) {
        if (po.TASKINSTANCEID !== taskInstanceId) {
            if (routes.length > 0) {
                tasksRoutes[taskInstanceId] = routes.join(',');
            }
            routes = [];
            taskInstanceId = po.TASKINSTANCEID;
        }

        if (nullchecker.isNotNullish(po.USERID)) {
            routes.push(po.USERID);
        } else {

            var routingParameters = [];
            if (nullchecker.isNotNullish(po.FACILITY)) {
                routingParameters.push('FC:' + _.get(FacilityCodeLookup, po.FACILITY, '') + '(' + po.FACILITY + ')');
            }
            if (nullchecker.isNotNullish(po.TEAM)) {
                routingParameters.push('TM:' + _.get(TeamLookup, po.TEAM, '') + '(' + po.TEAM + ')');
            }

            if (nullchecker.isNotNullish(po.TEAMFOCUS)) {
                routingParameters.push('TF:' + _.get(TeamFocusLookup, po.TEAMFOCUS, '') + '(' + po.TEAMFOCUS + ')');
            }

            if (nullchecker.isNotNullish(po.TEAMTYPE)) {
                routingParameters.push('TT:' + _.get(TeamTypeLookup, po.TEAMTYPE, '') + '(' + po.TEAMTYPE + ')');
            }
            if (nullchecker.isNotNullish(po.TEAMROLE)) {
                routingParameters.push('TR:' + _.get(TeamRoleLookup, po.TEAMROLE, '') + '(' + po.TEAMROLE + ')');
            }

            if (routingParameters.length > 0) {
                routes.push('[' + routingParameters.join('/') + ']');
            }
        }
    });

    if (routes.length > 0) {
        tasksRoutes[taskInstanceId] = routes.join(',');
    }

    var icnToNameMap = [];
    var creatorIds = [];

    _.each(tasks, function(row) {
        if (row.hasOwnProperty('PATIENTICN')) {
            if (!_.any(icnToNameMap, 'PATIENTICN', row.PATIENTICN)) {
                icnToNameMap.push({
                    'PATIENTICN': row.PATIENTICN,
                    'PATIENTNAME': ''
                });
            }
        }

        if (row.hasOwnProperty('CREATEDBYID')) {
            if (!_.any(icnToNameMap, 'CREATEDBYID', row.CREATEDBYID)) {
                creatorIds.push({
                    'CREATEDBYID': row.CREATEDBYID,
                    'CREATEDBYNAME': ''
                });
            }
        }
    });

    //TODO refactor such that patient name lookups and provider name lookups happen in parallel?

    _.each(tasks, function(row) {
        row.TASKTYPE = 'Human';
        row.POTENTIALOWNERS = _.get(tasksRoutes, row.TASKID, null);

        var service = row.DEPLOYMENTID.split(':', 2);
        row.SERVICE = service[1].replace('_', ' ');
        formattedResponse.data.items.push(row);
    });


    getNamesFromIcns(icnToNameMap, req, function(resultedMap) {
        _.each(tasks, function(row) {
            if (row.hasOwnProperty('PATIENTICN')) {
                var name = _.pluck(_.where(resultedMap, {
                    'PATIENTICN': row.PATIENTICN
                }), 'PATIENTNAME');

                if (Array.isArray(name) && name.length > 0) {
                    row.PATIENTNAME = name[0];
                } else {
                    row.PATIENTNAME = '';
                }
            }
        });

        getProvidersFromIds(creatorIds, req, function(providerMap) {
            _.each(tasks, function(row) {
                if (row.hasOwnProperty('CREATEDBYID')) {
                    var name = _.pluck(_.where(providerMap, {
                        'CREATEDBYID': row.CREATEDBYID
                    }), 'CREATEDBYNAME');

                    if (Array.isArray(name) && name.length > 0) {
                        row.CREATEDBYNAME = name[0];
                    } else {
                        row.CREATEDBYNAME = '';
                    }
                }
            });

            tasksCallback(formattedResponse);
        });

    });
}

function getProvidersFromIds(creatorIds, req, cb) {
    //http://IP             /data/find/user?limit=1&filter=eq(uid,"urn:va:user:9E7A:10000000272")
    var asyncJobs = [];
    _.each(creatorIds, function(creator) {
        if (creator && creator.CREATEDBYID && creator.CREATEDBYID.length > 0) {
            //translate from site;duz format to JDS UID format
            var creatorSegments = creator.CREATEDBYID.split(';');
            if (creatorSegments.length >= 2) {
                var creatorSite = creatorSegments[0];
                var creatorDUZ = creatorSegments[1];

                // refactor this into 1 JDS call using the ?range parameter,
                //   rather than 1 call per user uid, when index becomes available
                //   note that this will require caring about the JDS URL length limit
                asyncJobs.push(function(callback) {
                    var jdsPath = '/data/find/user?limit=1&filter=eq(uid,"urn:va:user:';
                    jdsPath += creatorSite + ':' + creatorDUZ + '")';

                    var options = _.extend({}, req.app.config.jdsServer, {
                        url: jdsPath,
                        logger: req.logger,
                        json: true
                    });

                    httpUtil.get(options,
                        function(err, response, data) {
                            if (!nullchecker.isNullish(err)) {
                                return callback(err);
                            }

                            return callback(null, data);
                        }
                    );
                });
            }
        }
    });

    async.parallelLimit(asyncJobs, 5, function(err, results) {
        if (err) {
            return cb(creatorIds);
        } else {
            // smash results back into a map
            var newMap = [];
            _.forEach(results, function(result) {
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('items')) {
                    _.forEach(result.data.items, function(item) {
                        //translate back from uid to site;duz format
                        if (item && item.uid && item.uid.indexOf(':')) {
                            var uidSegments = item.uid.split(':');
                            if (uidSegments.length >= 2) {
                                var creatorDUZ = uidSegments[uidSegments.length - 1];
                                var creatorSite = uidSegments[uidSegments.length - 2];
                                newMap.push({
                                    'CREATEDBYID': creatorSite + ';' + creatorDUZ,
                                    'CREATEDBYNAME': item.name
                                });
                            }
                        }
                    });
                }
            });
            return cb(newMap);
        }
    });
}

function getNamesFromIcns(icnToNameMap, req, cb) {
    //http://IP             /vpr/9E7A;3,9E7A;8,9E7A;253/find/patient
    //http://IP             /vpr/9E7A;100013/find/patient?filter=in(pid,["9E7A;100013"])
    //http://IP             /data/index/pt-select-pid?range=9E7A;3,9E7A;8
    var jdsUrlStringLimit = dd(req)('app')('config')('jdsServer')('urlLengthLimit').val || 120;
    var jdsServer = req.app.config.jdsServer;
    var preSegmentUrl = '/data/index/pt-select-pid?range=';
    var maxSegmentLength = jdsUrlStringLimit - (jdsServer.baseUrl.length + preSegmentUrl.length);

    var urlSegments = [];
    var curUrlSegment = '';

    //break the ICNs into appropriately sized, comma-delimited chunks for JDS querying
    _.each(icnToNameMap, function(map) {
        var icn = map.PATIENTICN;
        if (nullchecker.isNotNullish(icn)) {
            var segmentLength = icn.length;

            if ((curUrlSegment.length + segmentLength + 1) > maxSegmentLength) {
                urlSegments.push(curUrlSegment);
                curUrlSegment = icn;

            } else {
                if (curUrlSegment.length === 0) {
                    curUrlSegment = icn;
                } else {
                    curUrlSegment += ',' + icn;
                }
            }
        }
    });

    if (curUrlSegment.length !== 0) {
        urlSegments.push(curUrlSegment);
    }

    var asyncJobs = [];

    _.forEach(urlSegments, function(segment, index) {
        asyncJobs.push(function(callback) {
            //do jds call
            var jdsPath = preSegmentUrl + segment;

            var options = _.extend({}, jdsServer, {
                url: jdsPath,
                logger: req.logger,
                json: true
            });

            httpUtil.get(options,
                function(err, response, data) {
                    if (!nullchecker.isNullish(err)) {
                        return callback(err);
                    }

                    return callback(null, data);
                }
            );
        });
    });

    async.parallelLimit(asyncJobs, 5, function(err, results) {
        // results is now equal to: [{icnToNameMapChunk}, {icnToNameMapChunk} ...]
        if (err) {
            return cb(icnToNameMap);
        } else {
            // smash results back into a map
            var newMap = [];
            _.forEach(results, function(result) {
                if (result.hasOwnProperty('data') && result.data.hasOwnProperty('items')) {
                    _.forEach(result.data.items, function(item) {
                        if (item.hasOwnProperty('pid') && item.hasOwnProperty('displayName')) {
                            newMap.push({
                                'PATIENTICN': item.pid,
                                'PATIENTNAME': item.displayName
                            });
                        }
                    });
                }
            });
            return cb(newMap);
        }
    });
}

function queryTasksRoutes(req, res, tasks) {

    var cb = function(err, potentialOwners) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        buildTasksResponse(tasks, potentialOwners, req, function(tasks) {
            res.rdkSend(tasks);
        });
    };

    var taskInstanceIds = _.pluck(tasks, 'TASKID');


    if (_.isEmpty(taskInstanceIds)) {
        buildTasksResponse(tasks, [], req, function(tasks) {
            res.rdkSend(tasks);
        });
    } else {
        var query = 'SELECT * FROM activitydb.Am_TaskRoute WHERE taskInstanceId in (' + taskInstanceIds.join() + ') order by taskInstanceId,id';

        activityDb.doQuery(req, query, cb);
    }
}

function queryTasks(req, res) {

    var context = req.body.context;
    var idError;
    if (nullchecker.isNullish(context)) {
        idError = new Error('Missing context property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    if (context !== 'user' && context !== 'patient') {
        idError = new Error('Invalid context property value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var patientICN = req.body.patientICN;
    if (context === 'patient' && nullchecker.isNullish(patientICN)) {
        idError = new Error('Missing patientICN property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    if (context === 'user') {
        //req.session.facility is eg. PANORAMA
        var facility = req.session.user.site; //eg 9E7A
        if (nullchecker.isNullish(facility)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Missing required parameter: facility');
        }

        var user = getJbpmUser(req);
        if (nullchecker.isNullish(user)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Missing required parameter: user');
        }

        var callback = function(err, result) {
            if (!nullchecker.isNullish(err)) {
                req.logger.error(err);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            } else {
                buildTaskQuery(req, res, buildQueryParameterObjectFromRequest(req, result));
            }
        };

        teamOperations.getTeamsForUser(req, facility, user, callback);
    } else {
        buildTaskQuery(req, res, buildQueryParameterObjectFromRequest(req, null));
    }

}

function buildQueryParameterObjectFromRequest(req, userTeams) {
    var parameters = {};

    if (nullchecker.isNotNullish(userTeams)) {
        parameters.userTeams = userTeams;
    }

    if (nullchecker.isNotNullish(req.body.patientICN)) {
        parameters.patientICN = req.body.patientICN;
    }

    if (nullchecker.isNotNullish(req.body.status)) {
        parameters.status = req.body.status;
    }

    var pii = req.body.processInstanceId;
    if (nullchecker.isNotNullish(pii) &&
        typeof pii === 'number' &&
        isFinite(pii) &&
        pii === Math.floor(pii)) {
        parameters.processInstanceId = pii;
    }

    if (nullchecker.isNotNullish(req.body.priority)) {
        parameters.priority = req.body.priority;
    }

    return parameters;
}

function beginCondition(conditions) {
    if (nullchecker.isNotNullish(conditions)) {
        conditions = ' AND ';
    }
    return conditions;
}

function addStatusCondition(status, conditions) {
    if (nullchecker.isNotNullish(status)) {
        if (status !== 'All') {
            conditions += beginCondition(conditions);
            var arrStatus = status.split(',');
            if (arrStatus.length > 1) {
                conditions += 'tsl.status in (\'' + arrStatus.join('\',\'') + '\')';
            } else {
                conditions += 'tsl.status = \'' + status + '\'';
            }
        }
    } else {
        conditions += beginCondition(conditions);
        conditions += 'ti.statusId IN (1,2,3)';
    }
    return conditions;
}

function addProcessInstanceIdCondition(id, conditions) {
    if (nullchecker.isNotNullish(id) && _.isNumber(id)) {
        conditions += beginCondition(conditions);
        conditions += 'ti.processInstanceId = \'' + id + '\'';
    }
    return conditions;
}

function addPriorityCondition(priority, conditions) {
    if (nullchecker.isNotNullish(priority)) {
        var priorityRange = priority.split('-');
        if (priorityRange.length > 0) {
            priorityRange = _.map(priorityRange, function(n) {
                return _.parseInt(n.trim());
            });

            priorityRange.sort(function(a, b) {
                return a - b;
            });

            var minPriority = priorityRange[0];
            var maxPriority = minPriority;
            if (priorityRange.length > 1) {
                maxPriority = priorityRange[1];
            }

            conditions += beginCondition(conditions);
            if (minPriority === maxPriority) {
                conditions += 'ti.priority = ' + minPriority;
            } else {
                conditions += 'ti.priority BETWEEN ' + minPriority + ' AND ' + maxPriority;
            }
        }
    }
    return conditions;
}

function buildTaskQuery(req, res, parameters) {

    var cb = function(err, rows) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        queryTasksRoutes(req, res, rows);
    };

    var taskQuery = 'SELECT ti.id as taskId,' +
        'ti.taskName,' +
        'ti.description,' +
        'tsl.status,' +
        'ti.priority,' +
        'ti.skippable,' +
        'ti.actualOwner as actualOwnerId,' +
        'ti.actualOwner as actualOwnerName,' +
        'pi.createdById,' +
        'pi.createdById as createdByName,' +
        'ti.createdOn as taskCreatedOn,' +
        'ti.dueDate as expirationTime,' +
        'pi.id as processInstanceId,' +
        'pi.processDefinitionId as processId,' +
        'pi.processName,' +
        'pi.deploymentId,' +
        'ti.icn as patientICN ' +
        'FROM activitydb.Am_TaskInstance ti INNER JOIN activitydb.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id ' +
        'INNER JOIN activitydb.Am_ProcessInstance pi ON ti.processInstanceId = pi.id ';

    var conditions = '';
    if (nullchecker.isNotNullish(parameters.userTeams)) {
        taskQuery += 'INNER JOIN activitydb.Am_TaskRoute tr ON ti.id = tr.taskInstanceId ';
        conditions = '(tr.userid = \'' + getJbpmUser(req) + '\'';
        _.each(parameters.userTeams, function(team) {
            conditions += ' OR (tr.userid IS NULL ' +
                'AND (tr.team = ' + _.result(team, 'teamId', '\'\'') + ' OR tr.team IS NULL) ' +
                'AND (tr.teamFocus = ' + _.result(team, 'teamFocus', '\'\'') + ' OR tr.teamFocus IS NULL) ' +
                'AND (tr.teamType = ' + _.result(team, 'teamType', '\'\'') + ' OR tr.teamType IS NULL) ' +
                'AND (tr.teamRole = ' + _.result(team, 'position.teamRole', '\'\'') + ' OR tr.teamRole IS NULL))';
        });
        conditions += ')';
    }

    var patientICN = parameters.patientICN;

    if (nullchecker.isNotNullish(patientICN)) {
        conditions += beginCondition(conditions);
        conditions += 'ti.icn = \'' + patientICN + '\'';
    }

    // Construct and append condition based on the status
    conditions = addStatusCondition(parameters.status, conditions);

    conditions = addProcessInstanceIdCondition(parameters.processInstanceId, conditions);

    // Construct and append condition based on the priority
    conditions = addPriorityCondition(parameters.priority, conditions);

    conditions = conditions.trim();
    if (conditions.length > 0) {
        taskQuery = taskQuery + ' WHERE ' + conditions;
    }
    activityDb.doQuery(req, taskQuery, cb);
}

function getTasks(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_TASKS';

    // JBPM endpoint: /task/query
    // parameters:
    // potentialOwner
    // status
    // taskOwner
    // workItemId
    // taskId
    // businessAdministrator
    // processInstanceId
    // union
    // language

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url).path('/query/runtime/task');

    var queryStatuses = handleTaskStatuses(req.param('status'));

    if (queryStatuses !== null && queryStatuses !== []) {
        _.each(queryStatuses, function(status) {
            uri.query('tst', status);
        });
    }

    if (req.param('initiator')) {
        // a task within a process created by user
        var initiator = req.param('initiator');
        uri.query('init', initiator);
    }

    config.url = uri.build();

    doTasksFetch(req, res, config);
}

function doTasksFetch(req, res, config) {
    httpUtil.get(config, function(err, response, returnedData) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        var formattedResponse = {
            data: {
                items: []
            }
        };

        if (returnedData.hasOwnProperty('taskInfoList') && Array.isArray(returnedData.taskInfoList)) {
            _.each(returnedData.taskInfoList, function(taskInfo) {
                if (taskInfo.hasOwnProperty('taskSummaries') && Array.isArray(taskInfo.taskSummaries)) {
                    //if a task has more than 1 summary, take the last summary
                    var localReturnObj = taskInfo.taskSummaries[taskInfo.taskSummaries.length - 1];
                    if (taskInfo.hasOwnProperty('variables')) {
                        localReturnObj.variables = filterVariablesForRecency(taskInfo.variables);
                    }

                    //assign the parent's process instance id if it isn't included in the task summary
                    if (!localReturnObj.hasOwnProperty('processInstanceId') && taskInfo.hasOwnProperty('processInstanceId')) {
                        localReturnObj.processInstanceId = taskInfo.processInstanceId;
                    }
                    formattedResponse.data.items.push(localReturnObj);
                }
            });
        }

        return res.rdkSend(formattedResponse);
    });
}

function getTasksByParameter(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_TASKS_BY_PARAMETER';

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url).path('/query/runtime/process');

    //process definition variables
    var processDefinitionVars = [
        'patientid',
        'patientname',
        'priority',
        'service',
        'duedate',
        'tasktype',
        'role',
        'team',
        'todonote',
        'taskreason'
    ];

    //status, initiator are also used to filter on tasks

    _.each(processDefinitionVars, function(processDefVar) {
        if (req.param(processDefVar)) {
            uri.query('var_' + processDefVar, req.param(processDefVar));
        }
    });

    config.url = uri.build();

    httpUtil.get(config, function(err, response, returnedData) {
        if (err) {
            req.logger.error(err);
            res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        var formattedResponse = {
            data: {
                items: []
            }
        };

        if (returnedData.hasOwnProperty('processInstanceInfoList') && Array.isArray(returnedData.processInstanceInfoList)) {
            var taskObj = {};
            var queryStatuses = handleTaskStatuses(req.param('status'));
            var initiator = req.param('initiator');

            _.each(returnedData.processInstanceInfoList, function(process, index) {
                if (process.processInstance.hasOwnProperty('id')) {
                    taskObj['' + index] =

                        function(callback) {

                            var contentConfig = getGenericJbpmConfig(req);

                            var taskUri = uriBuilder.fromUri(contentConfig.url)
                                .path('/query/runtime/task')
                                .query('piid', process.processInstance.id);

                            if (queryStatuses !== null && queryStatuses !== []) {
                                _.each(queryStatuses, function(status) {
                                    taskUri.query('tst', status);
                                });
                            }

                            if (initiator) {
                                taskUri.query('init', initiator.toLowerCase());
                            }

                            contentConfig.url = taskUri.build();

                            //fetch the task content data
                            httpUtil.get(contentConfig, function(contentErr, contentResponse, returnedContent) {
                                if (contentErr) {
                                    return callback(contentErr);
                                }
                                return callback(null, returnedContent);
                            });

                        };
                }
            });

            async.parallelLimit(taskObj, 5, function(err, returnedData) {
                if (!err) {
                    _.each(returnedData, function(data) {
                        if (data.hasOwnProperty('taskInfoList') && Array.isArray(data.taskInfoList)) {
                            _.each(data.taskInfoList, function(taskInfo) {
                                if (taskInfo.hasOwnProperty('taskSummaries') && Array.isArray(taskInfo.taskSummaries)) {
                                    //no idea what it means if a task has more than 1 summary.. take the last summary
                                    var localReturnObj = taskInfo.taskSummaries[taskInfo.taskSummaries.length - 1];
                                    if (taskInfo.hasOwnProperty('variables')) {
                                        localReturnObj.variables = filterVariablesForRecency(taskInfo.variables);
                                    }

                                    //assign the parent's process instance id if it isn't included in the task summary
                                    if (!localReturnObj.hasOwnProperty('processInstanceId') && taskInfo.hasOwnProperty('processInstanceId')) {
                                        localReturnObj.processInstanceId = taskInfo.processInstanceId;
                                    }
                                    formattedResponse.data.items.push(localReturnObj);
                                }
                            });
                        }
                    });
                } else {
                    //return the list of tasks without content if the content queries errored
                    req.logger.error('Error while retrieving task content: ' + err);
                }
                return res.rdkSend(formattedResponse);
            });
        }
    });

}

function buildChangeTaskStateResponse(req, res, err, result) {
    if (err) {
        req.logger.error(err);
        res.status(rdk.httpstatus.bad_request).rdkSend(err);
    }

    var resultJson;
    try {
        resultJson = JSON.parse(result);
    } catch (e) {
        // ignore
    }

    if (resultJson) {
        return res.rdkSend('Success');
    }

    parseString(result, function(err, resultJson) {
        if (err) {
            req.logger.error(result);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Invalid error XML received(' + err + ')');
        }

        var exception;
        if (resultJson['command-response']) {
            if (resultJson['command-response'].exception) {
                exception = resultJson['command-response'].exception[0];
            }
        } else {
            exception = resultJson.exception;
        }

        if (exception) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(exception.message[0]);
        }

        return res.rdkSend('Success');
    });
}

function handleComplete(req, res) {

    var deploymentId = req.body.deploymentid || null;
    var idError;
    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    } else if (deploymentId === 'All') {
        // Map deploymentid to actual value
        if (!req.app.config.jbpm.deployments[deploymentId]) {
            idError = new Error('Invalid deploymentId property value.');
            req.logger.error(idError);
            return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
        }
        deploymentId = req.app.config.jbpm.deployments[deploymentId];
    }

    var taskId = req.param('taskid');

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url)
        .path('/execute')
        .build();

    config.url = uri;
    config.json = false;
    if (!config.headers) {
        config.headers = {};
    }

    config.headers['Content-Type'] = 'application/xml';
    config.headers.Accept = 'application/xml';
    config.headers['Kie-Deployment-Id'] = deploymentId;


    async.parallel([
        function(callback) {
            var completeTaskCommandXml;
            var completeTaskCommandTemplateXml = fs.readFileSync(__dirname + '/complete-task-command-template.xml', {
                encoding: 'utf8',
                flag: 'r'
            });

            var user = getJbpmUser(req);

            completeTaskCommandXml = completeTaskCommandTemplateXml.replace('{DeploymentId}', deploymentId).replace('{TaskId}', taskId).replace('{User}', user);
            callback(null, completeTaskCommandXml);
        },
        function(callback) {
            var taskParametersXML = '';
            var itemsList = '';
            if (req.body.parameter) {
                var primitiveTypeXML = fs.readFileSync(__dirname + '/parameter-template.xml', {
                    encoding: 'utf8',
                    flag: 'r'
                });
                var complexObjectXML = fs.readFileSync(__dirname + '/complex-object-template.xml', {
                    encoding: 'utf8',
                    flag: 'r'
                });
                var complexObjectPropertiesXML = fs.readFileSync(__dirname + '/complex-object-properties-template.xml', {
                    encoding: 'utf8',
                    flag: 'r'
                });
                _.each(req.body.parameter, function(value, key) {
                    var type = typeof value;

                    //**** Parent Container Object
                    if (type === 'object') {
                        var objectItems = value;
                        taskParametersXML = taskParametersXML + complexObjectXML.replace('{Key}', key);
                        _.each(objectItems, function(value, key) {
                            type = typeof value;
                            if (key === 'objectType') {
                                taskParametersXML = taskParametersXML.replace('{Type}', value);
                            } else {
                                if (type === 'object') {
                                    var objectItemsXML = '';
                                    itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value, objectItemsXML));
                                } else {
                                    itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', value);
                                }
                            }
                        });
                        taskParametersXML = taskParametersXML.replace('{Value}', itemsList);
                    } else {
                        taskParametersXML = taskParametersXML + primitiveTypeXML.replace('{Key}', key).replace('{Type}', type).replace('{Value}', value);
                    }
                });
            }
            callback(null, taskParametersXML);
        }
    ], function(err, results) {

        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        var completeTaskCommandXml = results[0].replace('{Parameters}', results[1]);
        config.body = completeTaskCommandXml;
        httpUtil.post(config, function(err, response, result) {
            return buildChangeTaskStateResponse(req, res, err, result);
        });
    });
}

function changeTaskState(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'CHANGE_TASK_STATE';

    // JBPM endpoint: /task/{taskID}/{state}
    //state:
    //  activate
    //  claim
    //  claimnextavailable
    //  complete
    //  delegate
    //  exit
    //  fail
    //  forward
    //  nominate
    //  release
    //  resume
    //  skip
    //  start
    //  stop
    //  suspend
    // parameters:
    //  parameters may be needed to complete task

    var taskId = req.param('taskid');
    var newState = req.param('state');

    var idError;

    if (!taskId) {
        idError = new Error('Unable to retrieve Task ID parameter');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    if (!newState) {
        idError = new Error('Unable to retrieve Task New State parameter');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    if (newState.toLowerCase() === 'complete') {
        return handleComplete(req, res);
    }

    var config = getGenericJbpmConfig(req);

    var builder = uriBuilder.fromUri(config.url)
        .path('/task/' + taskId + '/' + newState);

    var uri = builder.build();
    config.url = uri;
    config.json = false;

    httpUtil.post(config, function(err, response, result) {
        return buildChangeTaskStateResponse(req, res, err, result);
    });
}

function getCurrentTask(req, res) {
    // Takes an process Instance ID
    // Returns the current task for that process/activity, including: taskID, taskType (Human or System), and task state.
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_CURRENT_TASK';

    var parameters = buildQueryParameterObjectFromRequest(req, null);
    var processInstanceIdError;
    if (nullchecker.isNullish(parameters.processInstanceId)) {
        processInstanceIdError = new Error('Missing processInstanceId value in input JSON.');
        req.logger.error(processInstanceIdError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(processInstanceIdError.message);
    }

    parameters.status = 'Ready,Reserved';

    buildTaskQuery(req, res, parameters);
}

function getTask(req, res) {
    // Takes an Task ID
    // Returns the details of the task with that id, including: taskID, taskType (Human or System), and task state etc.
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_TASK';

    var taskId = req.param('taskid');
    var idError;

    if (!taskId) {
        idError = new Error('Unable to retrieve \'taskid\' parameter');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri('/tasksservice').path('/task/' + taskId);

    config.url = uri.build();

    httpUtil.get(config, function(err, response, returnedData) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        return res.rdkSend(returnedData);
    });
}

module.exports.getTasks = getTasks;
module.exports.queryTasks = queryTasks;
module.exports.getTasksByParameter = getTasksByParameter;
module.exports.changeTaskState = changeTaskState;
module.exports.getTaskStatusList = getTaskStatusList;
module.exports.getCurrentTask = getCurrentTask;
module.exports.getTask = getTask;
