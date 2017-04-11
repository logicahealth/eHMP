'use strict';

var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var pidValidator = rdk.utils.pidValidator;
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var dd = require('drilldown');
var parseString = require('xml2js').parseString;
var getGenericJbpmConfig = require('../activity-utils').getGenericJbpmConfig;
var processJsonObject = require('../activity-utils').processJsonObject;
var processValue = require('../activity-utils').processValue;
var wrapValueInCData = require('../activity-utils').wrapValueInCData;
var getJbpmUser = require('../activity-utils').getJbpmUser;
var getFormattedRoutesString = require('../activity-utils').getFormattedRoutesString;
var parseAssignedTo = require('../activity-utils').parseAssignedTo;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var navMapping = require('./navigation-mapping');
var getNotificationsByParams = require('../../notifications/notifications-data-access').getNotificationsByParams;

var dbSchema = 'activitydb';
module.exports.dbSchema = dbSchema;

module.exports.getIcn = function(req, pid, next) {
    var jdsPath = '/vpr/jpid/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            next(error);
            return;
        }

        var icn = _.find(result.patientIdentifiers, pidValidator.isIcn);

        if (!icn) {
            next('jpid did not find an icn');
            return;
        }

        next(null, icn);
    });
};

module.exports.getTeams = function(req, staffIEN, patientID, next) {
    var urlWithParams = '/resource/write-pick-list/teams-for-user-patient-related?staffIEN=' + staffIEN + '&patientID=' + patientID;
    var options = _.extend({}, req.app.config.pickListServer, {
        url: urlWithParams,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            next(error);
            return;
        }

        next(null, nullchecker.isNullish(result));
    });
};

function applyFilterToTasks(taskInstanceId, tasks, removeTask, next) {
    if (removeTask) {
        tasks = _.reject(tasks, {
            'TASKID': taskInstanceId
        });
    }

    next();
}

module.exports.buildTasksResponse = function(tasks, tasksRoutesList, req, parameters, tasksCallback, next) {

    var formattedResponse = {
        data: {
            items: []
        }
    };

    var taskInstanceId;
    async.waterfall([
        function(next) {
            if (!tasksRoutesList) {
                next();
                return;
            }

            async.each(tasksRoutesList, function(po, cb) {
                if (po.TASKINSTANCEID !== taskInstanceId) {
                    taskInstanceId = po.TASKINSTANCEID;
                }

                if (nullchecker.isNotNullish(po.USERID)) {
                    setImmediate(cb);
                    return;
                } else {

                    if (po.PATIENTASSIGNMENT === 1) {
                        //if patient is on the team then dont delete the task
                        var thisTask = _.find(tasks, {
                            'TASKID': taskInstanceId
                        });
                        if (nullchecker.isNotNullish(thisTask) && req && req.session && req.session.user && req.session.user.site && req.session.user.duz) {
                            var staffIEN = req.session.user.duz[req.session.user.site];
                            async.waterfall([
                                exports.getIcn.bind(null, req, thisTask.PATIENTICN),
                                exports.getTeams.bind(null, req, staffIEN),
                                applyFilterToTasks.bind(null, taskInstanceId, tasks)
                            ], function(err) {
                                if (err) {
                                    //handle err
                                    if (req.logger && req.logger.error) {
                                        req.logger.error(err);
                                    }
                                }

                                setImmediate(cb);
                            });
                        } else {
                            //Is this an error/exception condition?
                            setImmediate(cb);
                            return;
                        }
                    } else {
                        setImmediate(cb);
                        return;
                    }
                }
            }, function(err) {
                if (err) {
                    next(err);
                    return;
                }

                next();
            });
        },
        function(next) {
            if (!tasks) {
                next();
                return;
            }

            var icnToNameMap = [];
            var creatorOwnerIds = [];

            _.each(tasks, function(row) {
                if (row.hasOwnProperty('PATIENTICN')) {
                    if (!_.any(icnToNameMap, 'PATIENTICN', row.PATIENTICN)) {
                        icnToNameMap.push({
                            'PATIENTICN': row.PATIENTICN,
                            'PATIENTNAME': '',
                            'LAST4': ''
                        });
                    }
                }

                if (row.hasOwnProperty('CREATEDBYID')) {
                    if (!_.any(creatorOwnerIds, 'ID', row.CREATEDBYID)) {
                        creatorOwnerIds.push({
                            'ID': row.CREATEDBYID,
                            'NAME': ''
                        });
                    }
                }
                if (row.hasOwnProperty('ACTUALOWNERID')) {
                    if (!_.any(creatorOwnerIds, 'ID', row.ACTUALOWNERID)) {
                        creatorOwnerIds.push({
                            'ID': row.ACTUALOWNERID,
                            'NAME': ''
                        });
                    }
                }
                if (row.hasOwnProperty('ASSIGNEDTO') && nullchecker.isNotNullish(row.ASSIGNEDTO)) {
                    row.assignedToRoutes = parseAssignedTo(row.ASSIGNEDTO);
                    _.each(row.assignedToRoutes, function(parsedRoute) {
                        if (!_.isUndefined(parsedRoute.user) && !_.any(creatorOwnerIds, 'ID', parsedRoute.user)) {
                            creatorOwnerIds.push({
                                'ID': parsedRoute.user,
                                'NAME': ''
                            });
                        }
                    });
                }
                if (row.hasOwnProperty('NAVIGATION') && nullchecker.isNotNullish(row.NAVIGATION)) {
                    //parse navigation to a valid JSON
                    try {
                        row.NAVIGATION = JSON.parse(row.NAVIGATION);
                        //add parameters
                        if (_.isObject(row.NAVIGATION)) {
                            if (row.NAVIGATION.hasOwnProperty('channel') && row.NAVIGATION.hasOwnProperty('event')) {
                                row.NAVIGATION.parameters = navMapping.getParameters(row);
                            }
                        }
                    } catch (e) {
                        req.logger.error('Unable to parse task navigation data from task: ' + row);
                    }
                } else {
                    req.logger.info('Missing navigation information for task: ' + row);
                }

                if (row.hasOwnProperty('PERMISSION') && nullchecker.isNotNullish(row.PERMISSION)) {
                    //parse navigation to a valid JSON
                    try {
                        row.PERMISSION = JSON.parse(row.PERMISSION);
                    } catch (e) {
                        req.logger.error('Unable to parse task permission data from task: ' + row);
                    }
                } else {
                    req.logger.info('Missing permission information for task: ' + row);
                }
            });

            //TODO refactor such that patient name lookups and provider name lookups happen in parallel?

            _.each(tasks, function(row) {
                row.TASKTYPE = 'Human';

                if (row.hasOwnProperty('DEPLOYMENTID')) {
                    var service = row.DEPLOYMENTID.split(':', 2);
                    if (service.length > 1) {
                        row.SERVICE = service[1].replace('_', ' ');
                    }
                }

                formattedResponse.data.items.push(row);
            });


            exports.getNamesFromIcns(icnToNameMap, req, function(resultedMap) {
                _.each(tasks, function(row) {
                    if (row.hasOwnProperty('PATIENTICN')) {
                        var name = _.pluck(_.where(resultedMap, {
                            'PATIENTICN': row.PATIENTICN
                        }), 'PATIENTNAME');

                        var last4 = _.pluck(_.where(resultedMap, {
                            'PATIENTICN': row.PATIENTICN
                        }), 'LAST4');

                        if (Array.isArray(name) && name.length > 0) {
                            row.PATIENTNAME = name[0];
                        } else {
                            row.PATIENTNAME = '';
                        }

                        if (Array.isArray(last4) && last4.length > 0) {
                            row.LAST4 = last4[0];
                        } else {
                            row.LAST4 = '';
                        }
                    }
                });

                getProvidersFromIds(creatorOwnerIds, req, function(providerMap) {
                    _.each(tasks, function(row) {
                        var name;
                        if (row.hasOwnProperty('CREATEDBYID')) {
                            name = _.pluck(_.where(providerMap, {
                                'ID': row.CREATEDBYID
                            }), 'NAME');

                            if (Array.isArray(name) && name.length > 0) {
                                row.CREATEDBYNAME = name[0];
                            } else {
                                row.CREATEDBYNAME = '';
                            }
                        }
                        if (row.hasOwnProperty('ACTUALOWNERID')) {
                            name = _.pluck(_.where(providerMap, {
                                'ID': row.ACTUALOWNERID
                            }), 'NAME');

                            if (Array.isArray(name) && name.length > 0) {
                                row.ACTUALOWNERNAME = name[0];
                            } else {
                                row.ACTUALOWNERNAME = '';
                            }
                        }
                        if (row.hasOwnProperty('assignedToRoutes') && nullchecker.isNotNullish(row.assignedToRoutes)) {
                            var userList = _.pluck(row.assignedToRoutes, 'user');
                            var users = {};
                            _.each(userList, function(user) {
                                name = _.pluck(_.where(providerMap, {
                                    'ID': user
                                }), 'NAME');
                                if (Array.isArray(name) && name.length > 0) {
                                    users[user] = name[0];
                                } else {
                                    users[user] = user; // if name not found , display the user id
                                }
                            });

                            row.INTENDEDFOR = getFormattedRoutesString(row.assignedToRoutes, users, true);
                            delete row.assignedToRoutes;

                        } else {
                            row.INTENDEDFOR = '';
                        }
                    });

                    tasksCallback(formattedResponse);
                });

            });
        }
    ], function(err) {
        if (err) {
            if (next) {
                next(err);
            } else {
                req.logger.error('Error building task response: ' + err);
            }
        } else {
            if (next) {
                next();
            }
        }
    });
};

function getProvidersFromIds(creatorOwnerIds, req, cb) {
    //http://IP_ADDRESS:PORT/data/find/user?limit=1&filter=eq(uid,"urn:va:user:9E7A:10000000272")
    var asyncJobs = [];
    _.each(creatorOwnerIds, function(creatorOwner) {
        if (creatorOwner && creatorOwner.ID && creatorOwner.ID.length > 0) {
            //translate from site;duz format to JDS UID format
            var creatorOwnerSegments = creatorOwner.ID.split(';');
            if (creatorOwnerSegments.length >= 2) {
                var creatorOwnerSite = creatorOwnerSegments[0];
                var creatorOwnerDUZ = creatorOwnerSegments[1];

                // refactor this into 1 JDS call using the ?range parameter,
                //   rather than 1 call per user uid, when index becomes available
                //   note that this will require caring about the JDS URL length limit
                asyncJobs.push(function(callback) {
                    var jdsPath = '/data/find/user?limit=1&filter=eq(uid,"urn:va:user:';
                    jdsPath += creatorOwnerSite + ':' + creatorOwnerDUZ + '")';

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
            return cb(creatorOwnerIds);
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
                                var creatorOwnerDUZ = uidSegments[uidSegments.length - 1];
                                var creatorOwnerSite = uidSegments[uidSegments.length - 2];
                                newMap.push({
                                    'ID': creatorOwnerSite + ';' + creatorOwnerDUZ,
                                    'NAME': item.name
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

module.exports.getNamesFromIcns = function(icnToNameMap, req, cb) {
    //http://IP_ADDRESS:PORT/vpr/9E7A;3,9E7A;8,9E7A;253/find/patient
    //http://IP_ADDRESS:PORT/vpr/9E7A;100013/find/patient?filter=in(pid,["9E7A;100013"])
    //http://IP_ADDRESS:PORT/data/index/pt-select-pid?range=9E7A;3,9E7A;8
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
                                'PATIENTNAME': item.displayName,
                                'LAST4': item.last4
                            });
                        }
                    });
                }
            });
            return cb(newMap);
        }
    });
};

module.exports.queryTasksRoutes = function(req, res, tasks, parameters) {

    var cb = function(err, potentialOwners) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        exports.buildTasksResponse(tasks, potentialOwners, req, parameters, function(tasks) {
            // !!Only for demo purposes - US13978 - return assignedTo (now subContext) parameter if provided
            if (nullchecker.isNotNullish(req.body) && nullchecker.isNotNullish(req.body.subContext)) {
                if (nullchecker.isNotNullish(tasks.data)) {
                    tasks.data.subContext = req.body.subContext;
                } else {
                    tasks.subContext = req.body.subContext;
                }
            }
            if (req.body.getNotifications) {
                req.body.callback(null, tasks);
            } else {
                res.rdkSend(tasks);
            }
        });
    };

    var taskInstanceIds = _.pluck(tasks, 'TASKID');
    if (_.isEmpty(taskInstanceIds)) {
        exports.buildTasksResponse(tasks, [], req, parameters, function(tasks) {
            res.rdkSend(tasks);
        });
    } else {
        activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, exports.generateRouteQuery(req.logger, taskInstanceIds), cb);
    }
};

module.exports.generateRouteQuery = function(logger, taskInstanceIds, queryMaxLength) {
    //DE4711
    //prevent error ORA-01795: maximum number of expressions in a list is 1000
    var inQuery = '';
    var subQueryMax = queryMaxLength || 990;
    if (taskInstanceIds.length > subQueryMax) {
        while (taskInstanceIds.length > 0) {
            if (inQuery.length > 0) {
                inQuery += ' OR ';
            }
            var inQueryArr = taskInstanceIds.splice(0, subQueryMax);
            inQuery += 'taskInstanceId IN (' + inQueryArr.join() + ')';
        }
    } else {
        inQuery = 'taskInstanceId IN (' + taskInstanceIds.join() + ')';
    }
    var routeQuery = 'SELECT * FROM ' + dbSchema + '.Am_TaskRoute WHERE ' + inQuery + ' order by taskInstanceId,id';

    logger.debug('task-operation-resource:generateRouteQuery routeQuery %s', routeQuery);

    return routeQuery;
};

module.exports.queryTasksbyId = function(req, res) {
    var parameters = {
        subContext: 'all',
        status: 'All',
        taskId: req.param('taskid')
    };
    if (!parameters.taskId) {
        var idError = new Error('Unable to retrieve Task ID parameter');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }
    exports.buildTaskQuery(req, res, parameters);
};

module.exports.queryTasks = function(req, res) {
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

        exports.buildTaskQuery(req, res, buildQueryParameterObjectFromRequest(req, null, facility));

    } else {
        exports.buildTaskQuery(req, res, buildQueryParameterObjectFromRequest(req, null, null));
    }
    req.logger.debug('queryTasks: Finsihed querying tasks');
};

function buildQueryParameterObjectFromRequest(req, userTeams, facility) {
    var parameters = {};
    parameters.subContext = 'all';

    if (nullchecker.isNotNullish(req) && nullchecker.isNotNullish(req.body)) {
        if (nullchecker.isNotNullish(userTeams)) {
            parameters.userTeams = userTeams;
        }

        if (nullchecker.isNotNullish(facility)) {
            parameters.facility = facility;
        }

        if (nullchecker.isNotNullish(req.body.patientICN)) {
            parameters.patientICN = req.body.patientICN;
        }

        if (nullchecker.isNotNullish(req.body.status)) {
            parameters.status = req.body.status;
        }

        if (nullchecker.isNotNullish(req.body.subContext)) {
            parameters.subContext = req.body.subContext.toLowerCase();
        }

        if (nullchecker.isNotNullish(req.body.startDate)) {
            parameters.startDate = req.body.startDate;
        }

        if (nullchecker.isNotNullish(req.body.endDate)) {
            parameters.endDate = req.body.endDate;
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

function addFacilityCondition(facility, conditions) {
    if (nullchecker.isNotNullish(facility)) {
        if (nullchecker.isNotNullish(conditions)) {
            conditions += ' OR ';
        }
        conditions += 'tr.facility = \'' + facility + '\'';
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

function addTaskIdCondition(taskId, conditions) {
    if (nullchecker.isNotNullish(taskId)) {
        conditions += beginCondition(conditions);
        conditions += 'ti.id = \'' + taskId + '\'';
    }
    return conditions;
}

function addEarliestDateCondition(startDate, endDate, conditions) {
    if (nullchecker.isNotNullish(startDate) && nullchecker.isNotNullish(endDate)) {
        conditions += beginCondition(conditions);
        conditions += '((ti.earliestDate BETWEEN to_date(\'' +
            startDate + '\', \'YYYYMMDDHH24MISS\') AND to_date(\'' +
            endDate + '\', \'YYYYMMDDHH24MISS\') AND ti.statusId IN (4,5,6,8)) OR ti.statusId IN (0,1,2,3))';
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

module.exports.buildTaskQuery = function(req, res, parameters) {

    var cb = function(err, rows) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        exports.queryTasksRoutes(req, res, rows, parameters);
    };


    var site = req.session.user.site; //eg 9E7A
    var stationNumber = dd(req)('app')('config')('vistaSites')(site)('division').val;
    var user_id = getJbpmUser(req);
    var staff_id = user_id;
    if (staff_id.indexOf(';') !== -1) {
        staff_id = staff_id.substring(staff_id.indexOf(';') + 1);
    }
    var taskQuery = 'SELECT DISTINCT ti.id as taskId,' +
        'ti.taskName,' +
        'ti.description,' +
        'tsl.status,' +
        'ti.priority,' +
        'ti.definitionId,' +
        'ti.history,' +
        'ti.navigation,' +
        'ti.permission,' +
        'ti.actualOwner as actualOwnerId,' +
        'ti.actualOwner as actualOwnerName,' +
        'pi.createdById,' +
        'ti.createdOn as taskCreatedOn,' +
        'pi.clinicalObjectUid,' +
        'pi.createdById as createdByName,' +
        'ti.dueDate as expirationTime,' +
        'ti.statusTimeStamp as statusTimeStamp,' +
        'pi.processInstanceId as processInstanceId,' +
        'pi.processDefinitionId as processId,' +
        'pi.processName,' +
        'pi.deploymentId,' +
        'pi.assignedTo,' +
        'pi.domain as activityDomain,' +
        'pi.processName as activityName,' +
        'pi.instanceName as instanceName,' +
        'ti.dueDate as pastDue,' +
        'ti.earliestDate as due,' +
        'ti.icn as patientICN, ' +
        'ti.assignedTo as assignedTo ' +
        'FROM ' + dbSchema + '.Am_TaskInstance ti INNER JOIN ' + dbSchema + '.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id ' +
        'INNER JOIN ' + dbSchema + '.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId ' +
        'INNER JOIN ' + dbSchema + '.Am_TaskRoute tr ON ti.id = tr.taskInstanceId ';

    var conditions = '';

    if (parameters.subContext === 'teams') {
        //patient:teams -- Show me tasks that are routed to my teams
        conditions = '( tr.team IN (SELECT UNIQUE T.team_id ' +
            'FROM   pcmm.team T ' +
            'JOIN pcmm.team_membership TM ' +
            'ON TM.team_id = T.team_id ' +
            'JOIN pcmm.staff S ' +
            'ON S.staff_id = TM.staff_id ' +
            'AND S.staff_ien = \'' + staff_id + '\') ) ' +
            'AND ( ( tr.facility IS NULL ) ' +
            'OR ( tr.facility IS NOT NULL ' +
            'AND 1 = (SELECT UNIQUE 1 ' +
            'FROM   pcmm.team T ' +
            'JOIN pcmm.team_membership TM ' +
            'ON TM.team_id = T.team_id ' +
            'JOIN pcmm.staff S ' +
            'ON S.staff_id = TM.staff_id ' +
            'AND S.staff_ien = \'' + staff_id + '\' ' +
            'WHERE  T.va_institution_id IN ' +
            '(SELECT s.id ' +
            'FROM   sdsadm.std_institution s ' +
            'WHERE  s.stationnumber = \'' + stationNumber + '\')) ' +
            ') ) ';
    } else if (parameters.subContext === 'teamroles') {
        //patient:me -- Show me tasks that are routed to me (either directly to me or via team/role routing)
        conditions = '((tr.userid = \'' + user_id + '\' ' + //routed directly to me
            'OR (ti.actualOwner = \'' + user_id + '\') ' + //claimed/owned by me
            'OR (tr.userid IS NULL ' + //not routed to another user
            'AND (ti.actualOwner IS NULL) ' + // and is not claimed
            'AND ((tr.team IS NULL) OR (tr.team IN  (SELECT unique T.TEAM_ID FROM PCMM.TEAM T ' +
            'JOIN PCMM.TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID ' +
            'JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID AND S.STAFF_IEN= \'' + staff_id + '\'))) ' +
            'AND ((tr.facility IS NULL) OR (tr.facility IS NOT NULL AND 1 = (' +
            'select unique 1 ' +
            'FROM PCMM.TEAM T ' +
            'JOIN PCMM.TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID ' +
            'JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID AND S.STAFF_IEN=\'' + staff_id + '\' ' +
            'WHERE T.VA_INSTITUTION_ID IN ' +
            '(SELECT s.ID FROM sdsadm.STD_Institution s WHERE s.STATIONNUMBER =\'' + stationNumber + '\') ' +
            '))) ' +
            'AND  ((tr.teamfocus IS NULL) OR (tr.teamfocus in (' +
            'select unique TF.CODE ' +
            'FROM PCMM.TEAM T ' +
            'JOIN PCMM.PCM_STD_TEAM_FOCUS TF ON T.PCM_STD_TEAM_FOCUS_ID=TF.PCM_STD_TEAM_FOCUS_ID ' +
            'JOIN PCMM.TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID ' +
            'JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID AND S.STAFF_IEN=\'' + staff_id + '\'))) ' +
            'AND ((tr.TEAMTYPE IS NULL) OR (tr.TEAMTYPE in ( ' +
            'select unique t.PCM_STD_TEAM_CARE_TYPE_ID from pcmm.team t ' +
            'JOIN PCMM.TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID ' +
            'JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID AND S.STAFF_IEN=\'' + staff_id + '\'))) ' +
            'AND ((tr.TEAMROLE is null) OR (tr.TEAMROLE in ( ' +
            'select unique tp.pcm_std_team_role_id  from pcmm.team_membership tm ' +
            'join pcmm.team_position tp on tp.team_position_id = tm.team_position_id ' +
            'join PCMM.STAFF S on S.STAFF_ID = tm.staff_id AND S.STAFF_IEN = \'' + staff_id + '\')))' +
            '))';

    }

    if (req.body.context === 'user') {
        if (parameters.subContext === 'teamroles') {
            //facility-broadcast messages - show only in staff view
            conditions = addFacilityCondition(parameters.facility, conditions);
            conditions += ')';
        }
    } else if (req.body.context === 'patient') {
        if (parameters.subContext === 'any') {
            //patient:anyone -- Show me all tasks for this patient
            //noop - no additional conditions required
            conditions = '';
        } else if (parameters.subContext === 'teamroles') {
            //patient:me -- Show me tasks that are routed to me (either directly to me or via team/role routing) for this patient
            conditions += ')';
        }
    }

    var patientICN = parameters.patientICN;

    if (nullchecker.isNotNullish(patientICN) && req.body.context === 'patient') {
        conditions += beginCondition(conditions);
        conditions += 'ti.icn = \'' + patientICN + '\'';
    }

    // Construct and append condition based on the status
    conditions = addStatusCondition(parameters.status, conditions);

    conditions = addProcessInstanceIdCondition(parameters.processInstanceId, conditions);

    // Construct and append condition based on the priority
    conditions = addPriorityCondition(parameters.priority, conditions);

    // Construct and append taskid condition
    conditions = addTaskIdCondition(parameters.taskId, conditions);

    // Construct and append earliest date range condition
    conditions = addEarliestDateCondition(parameters.startDate, parameters.endDate, conditions);

    conditions = conditions.trim();
    if (conditions.length > 0) {
        taskQuery = taskQuery + ' WHERE ' + conditions;
    }

    req.logger.debug('task-operation-resource:buildTaskQuery taskQuery %s', taskQuery);
    if (req.body.getNotifications) {
        async.parallel([function(callback) {
            //callback();
            var user = req.session.user;
            var userId = user.duz[user.site];
            var params = {
                resolutionState: 0,
                maxSalience: 4,
                userId: userId,
                groupRows: true,
                navigationRequired: true
            };
            var mockReq = {};
            _.extend(mockReq, req);
            mockReq.method = 'GET';
            getNotificationsByParams(mockReq, params, function(err, result) {
                callback(null, result);
            });
        }, function(callback) {
            req.body.callback = callback;
            activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, taskQuery, cb);
        }], function(err, response) {
            if (response.length === 2 && nullchecker.isNullish(response[0]) && nullchecker.isNotNullish(response[1])) {
                res.rdkSend(response[1]);
            } else if (response.length === 2 && nullchecker.isNotNullish(response[0]) && nullchecker.isNotNullish(response[1])) {
                _.each(response[1].data.items, function(task) {
                    var taskId = 'ehmp:task:' + task.TASKID;
                    var notification = _.find(response[0], function(notif) {
                        return _.find(notif.associatedItems, function(asoc) {
                            return asoc === taskId;
                        });
                    });
                    if (notification) {
                        task.NOTIFICATION = true;
                        task.NOTIFICATIONTITLE = notification.message.body;
                    } else {
                        task.NOTIFICATION = false;
                    }
                });
                res.rdkSend(response[1]);
            }

        });
    } else {
        return activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, taskQuery, cb);
    }
};

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

    var deploymentId = req.param('deploymentid') || null;
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
                var complexArrayedObjectPropertiesXML = fs.readFileSync(__dirname + '/complex-arrayed-object-properties-template.xml', {
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
                                    var id = 0;
                                    if (value !== null && value.constructor === Array) {
                                        for (var i = 0; i < value.length; i++) {
                                            id = i + 1;
                                            itemsList = itemsList + complexArrayedObjectPropertiesXML.replace(/{Key}/g, key).replace(/{ID}/, id).replace('{Value}', processValue(value[i], objectItemsXML));
                                        }
                                    } else {
                                        itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value, objectItemsXML));
                                    }
                                } else {
                                    itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', wrapValueInCData(value));
                                }
                            }
                        });
                        taskParametersXML = taskParametersXML.replace('{Value}', itemsList);
                    } else {
                        taskParametersXML = taskParametersXML + primitiveTypeXML.replace('{Key}', key).replace('{Type}', type).replace('{Value}', wrapValueInCData(value));
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

module.exports.getCurrentTask = function(req, res) {
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

    parameters.status = 'Ready,Reserved,InProgress';

    exports.buildTaskQuery(req, res, parameters);
};

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

    async.parallel({
            jbpmTask: function(callback) {
                httpUtil.get(config, function(err, response, returnedData) {
                    if (err) {
                        return callback(err);
                    }
                    if (returnedData.data.items.length > 0 && !nullchecker.isNullish(returnedData.data.items[0].actualOwnerId)) {
                        returnedData.data.items[0].actualOwnerName = undefined;
                        var jdsPath = '/data/find/user?limit=1&filter=eq(uid,"urn:va:user:';
                        jdsPath += returnedData.data.items[0].actualOwnerId.replace(';', ':') + '")';

                        var options = _.extend({}, req.app.config.jdsServer, {
                            url: jdsPath,
                            logger: req.logger,
                            json: true
                        });

                        httpUtil.get(options,
                            function(err, response, data) {
                                if (nullchecker.isNullish(err) && !nullchecker.isNullish(data.data.items) && data.data.items.length > 0 && !nullchecker.isNullish(data.data.items[0].name)) {
                                    returnedData.data.items[0].actualOwnerName = data.data.items[0].name;
                                }
                                return callback(null, returnedData);
                            }
                        );
                    } else {
                        return callback(null, returnedData);
                    }
                });
            },
            dbTask: function(callback) {
                var query = 'SELECT statusTimeStamp FROM ' + dbSchema + '.Am_TaskInstance WHERE id = ' + taskId;
                activityDb.doQuery(req, req.app.config.jbpm.activityDatabase, query, callback);
            }
        },
        function(err, results) {
            if (err) {
                req.logger.error(err);
                return res.status(rdk.httpstatus.not_found).rdkSend(err);
            }
            if (dd(results)('jbpmTask')('data')('items').exists && dd(results)('dbTask').exists &&
                dd(results)('jbpmTask')('data')('items').val.length > 0 && dd(results)('dbTask').val.length > 0 &&
                nullchecker.isNotNullish(results.dbTask[0].STATUSTIMESTAMP)) {
                results.jbpmTask.data.items[0].statusTimeStamp = results.dbTask[0].STATUSTIMESTAMP.getTime();
                return res.rdkSend(results.jbpmTask.data);
            }
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        });
}

module.exports.changeTaskState = changeTaskState;
module.exports.getTask = getTask;
