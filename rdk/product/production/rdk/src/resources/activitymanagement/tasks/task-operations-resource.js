'use strict';

var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var pidValidator = rdk.utils.pidValidator;
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var async = require('async');
var parseString = require('xml2js').parseString;
var activityUtils = require('../activity-utils');
var getGenericJbpmConfig = activityUtils.getGenericJbpmConfig;
var processJsonObject = activityUtils.processJsonObject;
var processValue = activityUtils.processValue;
var wrapValueInCData = activityUtils.wrapValueInCData;
var getJbpmUser = activityUtils.getJbpmUser;
var getFormattedRoutesString = activityUtils.getFormattedRoutesString;
var parseAssignedTo = activityUtils.parseAssignedTo;
var filterIdentifiers = activityUtils.filterIdentifiers;
var activityDb = require('../../../subsystems/jbpm/jbpm-subsystem');
var navMapping = require('./navigation-mapping');
var patientRelatedTeams = require('../../../write/pick-list/team-management/teams-for-user-patient-related-fetch-list');
var moment = require('moment');
var oracledb = require('oracledb');
var facilitiesList = require('../../facility-moniker/vha-sites').data.items;
var resultUtils = rdk.utils.results;
var xmlTemplates = activityUtils.xmlTemplates;

var dbSchema = 'activitydb';
module.exports.dbSchema = dbSchema;

module.exports.callJpid = function(req, pid, callback) {
    if (!pid) {
        return callback('No pid provided to callJpid');
    }
    var jdsPath = '/vpr/jpid/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, callback);
};

module.exports.getIcn = function(req, pid, patientIdentifiers, next) {
    patientIdentifiers = patientIdentifiers || [];

    var evaluateIcn = function(ids, next) {
        var icn = _.find(ids, pidValidator.isIcn);

        if (!icn) {
            next('jpid did not find an icn');
            return;
        }

        next(null, icn);
    };

    if (patientIdentifiers.length > 1) {
        //if more than 1 pid we have already done lookup in tasks query
        evaluateIcn(patientIdentifiers, next);
    } else {
        //patientidentifiers is null or was defaulted to the passed-in pid value
        // so do a jpid lookup
        var cb = function(error, response, result) {
            if (error) {
                next(error);
                return;
            }

            evaluateIcn(result.patientIdentifiers, next);
        };

        exports.callJpid(req, pid, cb);
    }
};

module.exports.getTeams = function(req, staffIEN, patientID, next) {
    var patientRelatedTeamsCallback = function(error, result) {
        if (error) {
            next(error);
            return;
        }
        next(null, nullchecker.isNullish(result));
    };

    patientRelatedTeams.fetch(req.logger, req.app.config.activityDatabase, patientRelatedTeamsCallback, {
        staffIEN: staffIEN,
        patientID: patientID,
        site: _.get(req, 'session.user.site'),
        pcmmDbConfig: req.app.config.jbpm.activityDatabase,
        fullConfig: req.app.config.pickListServer
    });
};

function getFacilityCorrespondingToTeam(req, teamID, next) {
    var procParams = {
        p_team_id: teamID
    };

    var procQuery = 'BEGIN PCMMDATA.getFacilityCorrespondingToTeam(:p_team_id, :recordset); END;';

    return activityDb.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, procQuery, procParams, next);
}

module.exports.buildTasksResponse = function(tasks, tasksRoutesList, req, parameters, patientIdentifiers, tasksCallback, next) {
    var taskInstanceIdsToRemove = [];
    var formattedResponse = {
        data: {
            items: []
        }
    };
    async.waterfall([

        function(next) {
            if (!tasksRoutesList) {
                next();
                return;
            }

            async.each(tasksRoutesList, function(po, cb) {
                var taskInstanceId = po.TASKINSTANCEID;
                if (nullchecker.isNotNullish(po.USERID)) {
                    setImmediate(cb);
                    return;
                } else {
                    async.waterfall([

                        function(next) {
                            if (po.PATIENTASSIGNMENT === 1) {
                                //if patient is on the team then dont delete the task
                                var thisTask = _.find(tasks, {
                                    'TASKID': taskInstanceId
                                });
                                if (nullchecker.isNotNullish(thisTask) && req && req.session && req.session.user && req.session.user.site && req.session.user.duz && (_.isUndefined(parameters.removeTask) || parameters.removeTask)) {
                                    var staffIEN = req.session.user.duz[req.session.user.site];
                                    async.waterfall([
                                        exports.getIcn.bind(null, req, thisTask.PATIENTICN, patientIdentifiers),
                                        exports.getTeams.bind(null, req, staffIEN)
                                    ], function(err, removeTask) {
                                        if (err) {
                                            if (req.logger && req.logger.error) {
                                                req.logger.error(err);
                                            }
                                        }
                                        if (removeTask) {
                                            taskInstanceIdsToRemove.push(taskInstanceId);
                                        }

                                        next();
                                    });
                                } else {
                                    //Is this an error/exception condition?
                                    next();
                                    return;
                                }
                            } else {
                                next();
                                return;
                            }
                        },
                        function(next) {
                            if (nullchecker.isNotNullish(po.TEAM)) {
                                async.waterfall([
                                    getFacilityCorrespondingToTeam.bind(null, req, po.TEAM),
                                    function(result, nextStep) {
                                        if (_.isArray(result) && (result.length > 0) && (_.isUndefined(parameters.removeTask) || parameters.removeTask)) {
                                            var stationNumber = req.session.user.division;

                                            //screen for teams at the wrong facility
                                            var ind = _.findIndex(result, function(o) {
                                                return o.STATIONNUMBER === stationNumber;
                                            });

                                            if (ind !== -1) {
                                                //have the task remember the facility name
                                                var facilityName = _.find(facilitiesList, {
                                                    'facilityCode': result[ind].STATIONNUMBER
                                                }).facilityName;
                                                tasks = _.map(tasks, function(task) {
                                                    if (task.TASKID === taskInstanceId) {
                                                        task.assignedFacilityName = facilityName;
                                                    }
                                                    return task;
                                                });
                                            }

                                            nextStep(null, ind === -1);
                                            return;
                                        }
                                        nextStep(null, false);
                                    }
                                ], function(err, removeTask) {
                                    if (err) {
                                        if (req.logger && req.logger.error) {
                                            req.logger.error(err);
                                        }
                                    }
                                    if (removeTask && req.body.context === 'user') {
                                        taskInstanceIdsToRemove.push(taskInstanceId);
                                    }

                                    next();
                                });
                            } else {
                                next();
                            }
                        }
                    ], function(err) {
                        if (err) {
                            if (req.logger && req.logger.error) {
                                req.logger.error(err);
                            }
                        }

                        setImmediate(cb);
                    });
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
            if (!_.isEmpty(taskInstanceIdsToRemove)) {
                _.each(_.unique(taskInstanceIdsToRemove), function(removeTaskInstanceId) {
                    tasks = _.reject(tasks, {
                        'TASKID': removeTaskInstanceId
                    });
                });
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

            _.each(tasks, function(row) {
                row.TASKTYPE = 'Human';

                if (row.hasOwnProperty('DEPLOYMENTID')) {
                    var service = row.DEPLOYMENTID.split(':', 2);
                    if (service.length > 1) {
                        row.SERVICE = service[1].replace('_', ' ');
                    }
                }
            });

            // Unescape special characters for DESCRIPTION and INSTANCENAME fields
            if (_.size(tasks) > 0) {
                _.set(formattedResponse, 'data.items', resultUtils.unescapeSpecialCharacters(tasks, ['DESCRIPTION', 'INSTANCENAME']));
            }

            async.parallel([

                function(parallelCb) {
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
                        //getNamesFromIcns does not return an error - it will either fill in values
                        // into the resultant map or not - proceed in either case
                        parallelCb(null);
                    });
                },
                function(parallelCb) {
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

                                if (row.hasOwnProperty('assignedFacilityName') && nullchecker.isNotNullish(row.assignedFacilityName)) {
                                    row.INTENDEDFOR = row.assignedFacilityName + ' - ' + row.INTENDEDFOR;
                                    delete row.assignedFacilityName;
                                }
                            } else {
                                row.INTENDEDFOR = '';
                            }
                        });
                        //getProvidersFromIds does not return an error - it will either fill in values
                        // into the resultant map or not - proceed in either case
                        parallelCb(null);
                    });
                }
            ], function(err, results) {
                tasksCallback(formattedResponse);
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
    // /data/index/user-uid?range=urn:va:user:9E7A:10000000272,urn:va:user:9E7A:10000000270
    var jdsUrlStringLimit = _.get(req, 'app.config.jdsServer.urlLengthLimit', 120);
    var jdsServer = req.app.config.jdsServer;
    var preSegmentUrl = '/data/index/user-uid?range=';
    var maxSegmentLength = jdsUrlStringLimit - (jdsServer.baseUrl.length + preSegmentUrl.length);

    var urlSegments = [];
    var curUrlSegment = '';

    //break the UIDs into appropriately sized, comma-delimited chunks for JDS querying
    _.each(creatorOwnerIds, function(creatorOwner) {
        if (_.get(creatorOwner, 'ID.length', 0) > 0) {
            //translate from site;duz format to JDS UID format
            var creatorOwnerSegments = creatorOwner.ID.split(';');
            if (creatorOwnerSegments.length >= 2) {
                var creatorOwnerSite = creatorOwnerSegments[0];
                var creatorOwnerDUZ = creatorOwnerSegments[1];

                var uidString = 'urn:va:user:';
                uidString += creatorOwnerSite + ':' + creatorOwnerDUZ;

                if (nullchecker.isNotNullish(uidString)) {
                    var segmentLength = uidString.length;

                    if ((curUrlSegment.length + segmentLength + 1) > maxSegmentLength) {
                        urlSegments.push(curUrlSegment);
                        curUrlSegment = uidString;

                    } else {
                        if (curUrlSegment.length === 0) {
                            curUrlSegment = uidString;
                        } else {
                            curUrlSegment += ',' + uidString;
                        }
                    }
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
    //http://IP             /data/index/pt-select-pid?range=9E7A;3,9E7A;8
    var jdsUrlStringLimit = _.get(req, 'app.config.jdsServer.urlLengthLimit') || 120;
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

module.exports.queryTasksRoutes = function(req, res, tasks, parameters, patientIdentifiers) {

    var cb = function(err, potentialOwners) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        exports.buildTasksResponse(tasks, potentialOwners, req, parameters, patientIdentifiers, function(tasks) {
            // !!Only for demo purposes - US13978 - return assignedTo (now subContext) parameter if provided
            if (nullchecker.isNotNullish(req.body) && nullchecker.isNotNullish(req.body.subContext)) {
                if (nullchecker.isNotNullish(tasks.data)) {
                    tasks.data.subContext = req.body.subContext;
                } else {
                    tasks.subContext = req.body.subContext;
                }
            }
            res.rdkSend(tasks);
        });
    };

    var taskInstanceIds = _.pluck(tasks, 'TASKID');
    if (_.isEmpty(taskInstanceIds)) {
        exports.buildTasksResponse(tasks, [], req, parameters, patientIdentifiers, function(tasks) {
            res.rdkSend(tasks);
        });
    } else {
        exports.getTasksRoutes(req, taskInstanceIds, cb);
    }
};

module.exports.getTasksRoutes = function(req, taskInstanceIds, routesCallback) {
    var subQueryMax = 990;
    var data = [];
    var routeQuery = 'BEGIN TASKS.getTaskRoutes(:p_task_instance_ids, :recordset); END;';

    async.whilst(
        function() {
            return taskInstanceIds.length > 0;
        },
        function(callback) {
            var inQueryArr = taskInstanceIds.splice(0, subQueryMax);
            var procParams = {
                p_task_instance_ids: inQueryArr.join()
            };

            var cb = function(err, rows) {
                if (err) {
                    return callback(err);
                }

                data = _.union(data, rows);
                return callback(null);
            };
            return activityDb.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, routeQuery, procParams, cb);
        },
        function(err) {
            if (err) {
                req.logger.error(err);
                return routesCallback(err);
            }

            return routesCallback(null, data);
        }
    );
};

module.exports.queryTasksbyId = function(req, res) {
    var parameters = {
        subContext: 'all',
        status: 'All',
        taskId: req.param('taskid'),
        removeTask: false
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

    var pid = _.get(req, 'body.pid', null);
    if (context === 'patient' && nullchecker.isNullish(pid)) {
        idError = new Error('Missing pid property/value in input JSON.');
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

        if (nullchecker.isNotNullish(req.body.pid)) {
            parameters.patientICN = req.body.pid;
        }

        if (nullchecker.isNotNullish(req.body.status)) {
            parameters.status = req.body.status;
        }

        if (nullchecker.isNotNullish(req.body.subContext)) {
            parameters.subContext = req.body.subContext.toLowerCase();
        }

        if (nullchecker.isNotNullish(req.body.startDate)) {
            parameters.startDate = moment(req.body.startDate, 'YYYYMMDDHHmmss').toDate();
        }

        if (nullchecker.isNotNullish(req.body.endDate)) {
            parameters.endDate = moment(req.body.endDate, 'YYYYMMDDHHmmss').toDate();
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

module.exports.buildTaskQuery = function(req, res, parameters) {
    var patientIdentifiers = null;
    var prepFunctions = [];

    var cb = function(err, rows) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        var tasks = rows[0];
        var potentialOwners = rows[1];
        exports.buildTasksResponse(tasks, potentialOwners, req, parameters, patientIdentifiers, function(tasks) {
            if (nullchecker.isNotNullish(req.body) && nullchecker.isNotNullish(req.body.subContext)) {
                if (nullchecker.isNotNullish(tasks.data)) {
                    tasks.data.subContext = req.body.subContext;
                } else {
                    tasks.subContext = req.body.subContext;
                }
            }
            res.rdkSend(tasks);
        });
    };

    var patientICN = parameters.patientICN;

    if (nullchecker.isNotNullish(patientICN) && req.body.context === 'patient') {

        var preparePatientIdentifiers = function(callback) {
            //gather all available User IDs for this patient
            exports.callJpid(req, patientICN, function(err, response, results) {
                if (err) {
                    req.logger.error(err);
                    patientIdentifiers = [patientICN];
                } else {
                    patientIdentifiers = _.get(results, 'patientIdentifiers') || null;
                    patientIdentifiers = filterIdentifiers(patientIdentifiers);
                    if (!patientIdentifiers || !Array.isArray(patientIdentifiers) || patientIdentifiers.length < 1) {
                        patientIdentifiers = [patientICN];
                    }
                }
                return callback(null, patientIdentifiers);
            });
        };

        prepFunctions.push(preparePatientIdentifiers);
    }

    async.series(prepFunctions, function(err, results) {
        var stationNumber = req.session.user.division;
        var user_id = getJbpmUser(req);
        var staff_id = user_id;
        if (staff_id.indexOf(';') !== -1) {
            staff_id = staff_id.substring(staff_id.indexOf(';') + 1);
        }

        var procParams = {
            p_task_statuses: parameters.status,
            p_process_instance_id: parameters.processInstanceId || null,
            p_priority: parameters.priority || null,
            p_task_instance_id: parameters.taskId || null,
            p_start_date: parameters.startDate ? {
                val: parameters.startDate,
                dir: oracledb.BIND_IN,
                type: oracledb.DATE
            } : null,
            p_end_date: parameters.endDate ? {
                val: parameters.endDate,
                dir: oracledb.BIND_IN,
                type: oracledb.DATE
            } : null,
            p_patient_identifiers: null,
            p_resolution_state: 0,
            p_max_salience: 4,
            p_ntf_user_id: null


        };

        var taskQuery = 'BEGIN TASKS.getAllTasks(:p_task_statuses, :p_process_instance_id, :p_priority, :p_task_instance_id, :p_start_date, :p_end_date, :p_patient_identifiers, :p_resolution_state, :p_max_salience, :p_ntf_user_id, :recordset, :recordset2); END;';

        if (parameters.subContext === 'teams' || parameters.subContext === 'teamroles') {
            procParams.p_staff_id = staff_id;
            procParams.p_station_number = stationNumber;
            if (parameters.subContext === 'teams') {
                taskQuery = 'BEGIN TASKS.getTasksForTeams(:p_staff_id, :p_station_number, :p_task_statuses, :p_process_instance_id, :p_priority, :p_task_instance_id, :p_start_date, :p_end_date, :p_patient_identifiers, :p_resolution_state, :p_max_salience, :p_ntf_user_id, :recordset, :recordset2); END;';
                //patient:teams -- Show me tasks that are routed to my teams
            } else if (parameters.subContext === 'teamroles') {
                //patient:me -- Show me tasks that are routed to me (either directly to me or via team/role routing)
                procParams.p_user_id = user_id;
                procParams.p_facility = null;
                taskQuery = 'BEGIN TASKS.getTasksForTeamRoles(:p_user_id, :p_staff_id, :p_station_number, :p_facility, :p_task_statuses, :p_process_instance_id, :p_priority, :p_task_instance_id, :p_start_date, :p_end_date, :p_patient_identifiers, :p_resolution_state, :p_max_salience, :p_ntf_user_id, :recordset, :recordset2); END;';
            }
        }

        if (req.body.context === 'user') {
            if (parameters.subContext === 'teamroles') {
                //facility-broadcast messages - show only in staff view
                procParams.p_facility = parameters.facility || null;
            }
        } else if (req.body.context === 'patient') {
            if (nullchecker.isNotNullish(patientIdentifiers)) {
                procParams.p_patient_identifiers = patientIdentifiers.join(',');
            }
        }

        req.logger.debug('task-operation-resource:buildTaskQuery taskQuery %s', taskQuery);
        req.logger.debug('task-operation-resource:buildTaskQuery proc parameters:', procParams);

        //notifications
        procParams.p_ntf_user_id = null;
        if (req.session.user && req.session.user.site && req.session.user.duz) {
            var user = req.session.user;
            var userId = user.duz[user.site];
            if (!nullchecker.isNullish(user.site) || !nullchecker.isNullish(userId)) {
                procParams.p_ntf_user_id = user.site + ';' + userId;
            }
        }
        return activityDb.doExecuteProcMultipleRecordSets(req, req.app.config.jbpm.activityDatabase, taskQuery, procParams, cb);

    });
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

    var deploymentId = req.param('deploymentId') || null;
    var idError;
    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
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
            var completeTaskCommandTemplateXml = xmlTemplates.completeTaskCommandTemplate;
            var user = getJbpmUser(req);

            completeTaskCommandXml = completeTaskCommandTemplateXml.replace('{DeploymentId}', deploymentId).replace('{TaskId}', taskId).replace('{User}', user);
            callback(null, completeTaskCommandXml);
        },
        function(callback) {
            var taskParametersXML = '';
            var itemsList = '';
            if (req.body.parameter) {
                var primitiveTypeXML = xmlTemplates.parameterTemplate;
                var complexObjectXML = xmlTemplates.complexObjectTemplate;
                var complexObjectPropertiesXML = xmlTemplates.complexObjectPropertiesXML;
                var complexArrayedObjectPropertiesXML = xmlTemplates.complexArrayedObjectPropertiesXML;

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
                if (returnedData && returnedData.data && returnedData.data.items && returnedData.data.items.length > 0 && returnedData.data.items[0].hasOwnProperty('actualOwnerId') && !nullchecker.isNullish(returnedData.data.items[0].actualOwnerId)) {
                    returnedData.data.items[0].actualOwnerName = undefined;
                    var jdsPath = '/data/urn:va:user:';
                    jdsPath += returnedData.data.items[0].actualOwnerId.replace(';', ':');

                    var options = _.extend({}, req.app.config.jdsServer, {
                        url: jdsPath,
                        logger: req.logger,
                        json: true
                    });

                    httpUtil.get(options, function(err, response, data) {
                        if (nullchecker.isNullish(err) && !nullchecker.isNullish(data.data.items) && data.data.items.length > 0 && !nullchecker.isNullish(data.data.items[0].name)) {
                            returnedData.data.items[0].actualOwnerName = data.data.items[0].name;
                        }
                        return callback(null, returnedData);
                    });
                } else {
                    return callback(null, returnedData);
                }
            });
        },
        dbTask: function(callback) {
            var procParams = {
                p_task_definition_id: null,
                p_task_instance_id: taskId,
                p_patient_identifiers: null,
                p_task_statuses: null
            };

            var query = 'BEGIN TASKS.getTasksByIds(:p_task_definition_id, :p_task_instance_id, :p_patient_identifiers, :p_task_statuses, :recordset); END;';
            activityDb.doExecuteProcWithParams(req, req.app.config.jbpm.activityDatabase, query, procParams, callback);
        }
    }, function(err, results) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }
        if (_.size(_.get(results, 'jbpmTask.data.items')) < 1 || _.size(_.get(results, 'dbTask')) < 1 ||
            _.isUndefined(results.dbTask[0].STATUSTIMESTAMP) || _.isNull(results.dbTask[0].STATUSTIMESTAMP)) {
                return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }
        results.jbpmTask.data.items[0].statusTimeStamp = results.dbTask[0].STATUSTIMESTAMP.getTime();
        //the following mappings were added to keep the UI backward compatible
        if (results.jbpmTask.data.items[0].hasOwnProperty('actual-owner')) {
            results.jbpmTask.data.items[0].actualOwnerId = results.jbpmTask.data.items[0]['actual-owner'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('created-by')) {
            results.jbpmTask.data.items[0].createdById = results.jbpmTask.data.items[0]['created-by'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('created-on')) {
            results.jbpmTask.data.items[0].createdOn = results.jbpmTask.data.items[0]['created-on'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('activation-time')) {
            results.jbpmTask.data.items[0].activationTime = results.jbpmTask.data.items[0]['activation-time'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('expiration-time')) {
            results.jbpmTask.data.items[0].expirationTime = results.jbpmTask.data.items[0]['expiration-time'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('process-instance-id')) {
            results.jbpmTask.data.items[0].processInstanceId = results.jbpmTask.data.items[0]['process-instance-id'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('process-id')) {
            results.jbpmTask.data.items[0].processId = results.jbpmTask.data.items[0]['process-id'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('process-session-id')) {
            results.jbpmTask.data.items[0].processSessionId = results.jbpmTask.data.items[0]['process-session-id'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('deployment-id')) {
            results.jbpmTask.data.items[0].deploymentId = results.jbpmTask.data.items[0]['deployment-id'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('quick-task-summary')) {
            results.jbpmTask.data.items[0].quickTaskSummary = results.jbpmTask.data.items[0]['quick-task-summary'];
        }
        if (results.jbpmTask.data.items[0].hasOwnProperty('parent-id')) {
            results.jbpmTask.data.items[0].parentId = results.jbpmTask.data.items[0]['parent-id'];
        }
        return res.rdkSend(results.jbpmTask.data);
    });
}

module.exports.changeTaskState = changeTaskState;
module.exports.getTask = getTask;
