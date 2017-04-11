'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var configImport = require('./config');

// set up the packages we need
var metricDbName = configImport.metricDbName;
var definitionList = configImport.definedMetricDefinitions;
var groupList = configImport.definedMetricGroups;

// Database
var ObjectID = require('mongoskin').ObjectID;
var thisApp;

var definitionName = [];
var definitionId = [];
var logger;

var messageBodyError = 'Message body cannot be empty and must contain valid JSON';
var idParameterError = 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters';
var notFoundError = 'Not Found';


function init(app, subsystemLogger) {
    thisApp = app;
    logger = subsystemLogger;
}

var initDefinitions = function(dbConnection) {

    //Clear out the existing definitions and re-seed them
    dbConnection.collection('definitions').remove({}, function(error, result) {
        if (error) {
            logger.debug({
                error: error,
                result: result
            });
        }
    });

    _.each(definitionList, function(definition, index) {
        dbConnection.collection('definitions').update({
            _id: definition._id
        }, definition, {
            upsert: true
        }, function(error, result) {
            if (error) {
                logger.error({
                    error: error
                });
            }
        });
        definitionName[definition.name] = index;
        definitionId[definition._id] = index;
    });

    _.each(groupList, function(group) {
        dbConnection.collection('groups').update({
            name: group.name
        }, group, {
            upsert: true
        }, function(error, result) {
            if (error) {
                logger.error({
                    error: error
                });
            }
        });
    });
};
module.exports.initDefinitions = initDefinitions;

// Checks if a string, such as a message body, is a valid JSON object
function isJsonString(inputString) {
    try {
        JSON.parse(inputString);
    } catch (e) {
        return false;
    }
    return true;
}

/*
 * Validate the the required parameters are passed and that the parameters passed are correct
 */
function invalidMetricSearchParameters(req) {
    req.logger.debug('Validate metric search parameters: ' + req.query.metricId);

    if (_.isUndefined(req.query.metricId)) {
        return 'Error: You must enter a valid metricId';
    }
    if (_.isUndefined(req.query.startPeriod)) {
        return 'Error: You must enter a valid startPeriod';
    }

    var metricIdRegex = /^.{1,}$/; // minimum 3 chars? /^\d+$/;     either a name or an id
    var dateTimeRegex = /^\d+$/;
    var granularityRegex = /^\d+$/;
    var originRegex = /^.{1,}$/; // minimum 1 chars?;
    var invocationTypeRegex = /^.{1,}$/; // minimum 1 chars?;

    // just a string for the demo
    if (!metricIdRegex.test(req.query.metricId)) {
        return 'Metric id contains illegal characters.';
    }
    if (!dateTimeRegex.test(req.query.startPeriod)) {
        return 'Start time contains illegal characters.';
    }
    if (req.query.endPeriod !== undefined && !dateTimeRegex.test(req.query.endPeriod)) {
        return 'End time contains illegal characters.';
    }
    if (req.query.granularity !== undefined && !granularityRegex.test(req.query.granularity)) {
        return 'A granularity is a whole number in milliseconds.';
    }
    if (req.query.origin !== undefined && !originRegex.test(req.query.origin)) {
        return 'origin contains illegal characters.';
    }
    if (!invocationTypeRegex.test(req.query.invocationType)) {
        return 'invocationType contains illegal characters.';
    }
    return false;
}

/*
 * Creates an aggregating query pipeline for MongoDB. Granularity is a required
 * value for this type of query.
 */
function createAggregatedQuery(query) {

    //    req.logger.debug({query:query}, 'Create Aggregated Query');

    var match = {
        $match: {
            'time': {
                $gt: query.startPeriod
            }
        }
    };

    if (query.endPeriod) {
        match.$match.time.$lt = query.endPeriod;
    }
    if (query.origin) {
        match.$match.origin = query.origin;
    }
    if (query.type) {
        match.$match.type = query.type;
    }
    if (query.invocationType) {
        match.$match.invocationType = query.invocationType;
    }
    if (query.event === undefined) {
        match.$match.name = query.name;
    } else {
        match.$match.event = query.event;
    }

    if (!query.granularity) {
        query.granularity = 1;
    }
    // if we're rounding the grouping based on granularity, we should also round the start period match
    match.$match.time.$gt = roundToGranularity(query.startPeriod, query.granularity);

    var group = {
        '$group': {
            '_id': {
                'time': {
                    '$subtract': [
                        '$time', {
                            '$mod': ['$time', Number(query.granularity)]
                        } // granularity
                        // in
                        // ms...
                    ]
                }
            },
        }
    };

    var aggregation = query.aggregation;

    _.each(aggregation, function(aggregate) {
        group.$group[aggregate] = {};
        if (aggregate === 'count') {
            //            group.$group[aggregate]['$sum'] = 1;
            group.$group[aggregate].$sum = 1;
        } else {
            group.$group[aggregate]['$' + aggregate] = '$' + query.property;
        }
    });

    var sort = {
        $sort: {
            '_id.time': -1
        }
    }; // descending chronological
    // order
    var limit = {
        $limit: 500
    }; // 500 record max, per documentation.
    var project = {
        $project: {
            _id: 0,
            datetime: '$_id.time',
            count: 1,
            min: 1,
            max: 1,
            avg: 1,
            sum: 1
        }
    };

    //    req.logger.debug({
    //        match_$gt: toISOString(match.$match.time.$gt),
    //        match_$lt: toISOString(match.$match.time.$lt)
    //    }, 'Create Aggregated Query');

    return [match, group, sort, limit, project];
}

/*
 * Creates an count query pipeline for MongoDB
 */
function createQuery(query) {

    //    req.logger.debug({query:query}, 'Create Event Query');

    var match = {
        $match: {
            'time': {
                $gt: query.startPeriod
            }
        }
    };

    if (query.endPeriod) {
        match.$match.time.$lt = query.endPeriod;
    }
    if (query.origin) {
        match.$match.origin = query.origin;
    }
    if (query.type) {
        match.$match.type = query.type;
    }
    if (query.invocationType) {
        match.$match.invocationType = query.invocationType;
    }
    if (query.event === undefined) {
        match.$match.name = query.name;
    } else {
        match.$match.event = query.event;
    }

    var group = {};
    if (query.granularity) {
        // if we're rounding the grouping based on granularity, we should also round the start period match
        match.$match.time.$gt = roundToGranularity(query.startPeriod, query.granularity);
        group = {
            '$group': {
                '_id': {
                    'time': {
                        '$subtract': [
                            '$time', {
                                '$mod': ['$time', Number(query.granularity)]
                            }
                        ]
                    }
                },
                'count': {
                    '$sum': 1
                }
            }
        };
    }

    var sort = {
        $sort: {
            '_id.time': -1
        }
    };
    var limit = {
        $limit: 500
    };
    var project = {
        $project: {
            _id: 0,
            count: 1,
            datetime: '$_id.time'
        }
    };

    if (query.granularity) {
        return [match, group, sort, limit, project];
    }
    return [match, sort, limit, project];
}


var getMetricDefinition = function (metricId) {
    try {
        if (isNaN(metricId)) {
            return definitionList[definitionName[metricId]];
        }
        return definitionList[definitionId[metricId]];
    } catch (e) {
        return null;
    }
};

/**
 * Adds the missing time interval metrics results with null values for a given time range.
 *
 * @param startPeriod {Number} Epoch time representation of the start of the time period.
 * @param endPeriod {Number} Epoch time representation of the end of the time period.
 * @param granularity {Number} The time step size in milliseconds.
 * @param list {Array} The list of metric items to check for missing time steps.
 * @returns {Array} A list of metrics padded with null values for the missing time steps.
 */
function padMissingValues(startPeriod, endPeriod, granularity, list) {
    list = list || [];

    // round start/end periods to line up with granularity
    var roundedStartTime = roundToGranularity(startPeriod, granularity);
    var roundedEndTime = roundToGranularity(endPeriod, granularity);

    // the last time slot should happen before the end period
    var timeSlot = roundedEndTime < endPeriod ? roundedEndTime : (endPeriod - granularity);
    var listIndex = 0;
    var paddedList = [];

    // The list of metrics is sorted decreasing time. We start
    // at the end and work our way backwards to the start of the time range.
    while (timeSlot >= roundedStartTime) {
        var item = listIndex < list.length ? list[listIndex] : null;

        if (!item || timeSlot > item.datetime) {
            paddedList.push({
                count: null,
                min: null,
                max: null,
                avg: null,
                sum: null,
                datetime: timeSlot,
                isoDate: toISOString(timeSlot)
            });
        } else {
            item.isoDate = toISOString(item.datetime);
            paddedList.push(item);
            listIndex++;
        }
        timeSlot -= granularity;
    }
    return paddedList;
}


/**
 * Rounds a given epoch to align with a given granularity.
 *
 * @param {Number} epoch Epoch (unix time).
 * @param {Number} granularity Granularity in milliseconds.
 * @returns {Number} Returns an epoch that aligns with the given granularity.
 */
function roundToGranularity(epoch, granularity) {
    return epoch - (epoch % granularity);
}

/**
 * Converts an epoch time to its corresponding UTC ISO 8601 string.
 *
 * @param {Number} epoch Unix epoch time to convert.
 * @returns {String}
 */
function toISOString(epoch) {
    return (new Date(epoch)).toISOString();
}

/**
 * @api {get} /resource/cds/metrics/metrics Get Metrics
 * @apiName GetMetrics
 * @apiGroup Metrics
 * @apiDescription Returns a list of metric data points. Points will contain a sequence of values
 * over time which can be turned into a chart.
 * @apiParam {String} metricId The id of the type of metric to be displayed
 * @apiParam {long} startPeriod the beggining range of when a queried metric is captured (Unix time in milliseconds)
 * @apiParam {long} [endPeriod] the end range of when a queried metric is captured (Unix time in milliseconds)
 * @apiParam {long} [granularity] the length of time in milliseconds in which metrics are aggregated
 * @apiParam {String} [origin] Used to filter by using the name of the source from where a metric originated
 * @apiParam {String="Direct","Background"} [invocationType] describes how a metric is generated
 * @apiExample {js} Example usage:
 * curl -i http://10.4.4.105:8888/resource/metrics/metrics?metricId=1&startPeriod=1431607947079&endPeriod=1431636747079&granularity=3600000&origin=SystemA&invocationType=Direct
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *      "status": "400"
 *       "error": "Undefined Metric Requested."
 *     }
 * @apiSuccess {json} data Json object containing a list of all datapoint values
 * @apiSuccessExample {json} GetMetrics-Response
 * {
 *  "status": "200"
 *  "data": [
 *    {
 *      "datetime": 1431633600000,
 *      "count": 19,
 *      "min": 0.0,
 *      "max": 0.0,
 *      "sum": 0.0
 *    }
 *   ]
 * }
 */
var getMetricSearch = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getMetricSearch called');

        var message = invalidMetricSearchParameters(req);
        if (message) {
            res.status(rdk.httpstatus.bad_request).rdkSend(message);
            return;
        }

        var metricId = req.query.metricId;
        var query = getMetricDefinition(metricId);
        if (!query) {
            message = 'Undefined Metric Requested.';
            res.status(400).send({
                status: 400,
                error: message
            });
            return;
        }

        query.startPeriod = +req.query.startPeriod;
        query.endPeriod = null;
        query.granularity = null;
        query.origin = null;
        query.invocationType = null;

        if (req.query.endPeriod) {
            query.endPeriod = +req.query.endPeriod;
        }
        if (req.query.granularity) {
            if (+req.query.granularity > 0) {
                query.granularity = +req.query.granularity;
            }
        }
        if (req.query.origin) {
            query.origin = req.query.origin;
        }
        if (req.query.invocationType) {
            query.invocationType = req.query.invocationType;
        }

        var pipeline;
        // this assumes that 'event type call metrics' defined as only having the count defined.
        if (query.aggregation.length > 1) {
            pipeline = createAggregatedQuery(query);
        } else {
            pipeline = createQuery(query);
        }

        req.logger.debug('Executing: db.collection(query.collection).aggregate(pipeline)');
        req.logger.debug('collection: ' + query.collection);
        req.logger.debug(pipeline, 'Pipeline: \n');

        dbConnection.collection(query.collection).aggregate(pipeline, function(error, result) {
            if (error) {
               req.logger.debug({
                    error: error
                });
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            req.logger.debug('Result count: ' + (result ? result.length : 0));
            return res.status(200).send({
                status: 200,
                data: padMissingValues(query.startPeriod, query.endPeriod, query.granularity, result)
            });
        });
    });
};
module.exports.getMetricSearch = getMetricSearch;

// DASHBOARD ....

/**
 * @api {get} /resource/cds/metrics/dashboards/:userIdParam Get All Dashboards
 * @apiName GetDashboards
 * @apiGroup Dashboards
 * @apiDescription Gets a list of dashboards that were saved by an associated user. A dashboard is an object which contains settings
 * for charts which can be displayed visually. This list will only contain dashboard metadata, and will not store chart details. This is
 * useful for populating a selection list of dashboards.  To load an entire dashboard, see @GetDashboard
 * @apiParam {String} userIdParam The id of the type of metric to be displayed
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data Json object containing a list of all user dashboards
 * @apiSuccessExample {json} GetDashboards-Response:
 * {
 *  "status": "200"
 *  "data": {
 *   "_id": "5554c5f4e17664dc31573ae9",
 *    "userId": "testuser",
 *    "name": "New Dashboard",
 *    "description": "This is a dashboard example",
 *    "dashboardSettings": {
 *      "startPeriod": 0,
 *      "endPeriod": 0,
 *      "periodSelected": false,
 *      "granularitySelected": false
 *    }
 *  }
 * }
 */
var getUserDashBoards = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getDashboards called');

        //FUTURE-TODO - get the authenticated user
        //    var uid = req.param('userIdParam');
        //    var uid = req.session.user.username; //getKeyValue(req.session.user.duz);
        //    if (req.query.userId !== undefined) {
        //        uid = req.query.userId;
        //    }

        var userId = req.param('userIdParam');
        if (userId === 'all') {
            dbConnection.collection('dashboards').find().toArray(function(error, result) {
                handleToArrayResult(req, res, error, result);
            });
        } else {
            dbConnection.collection('dashboards').find({
                userId: userId
            }).toArray(function(error, result) {
                handleToArrayResult(req, res, error, result);
            });
        }
    });
};
module.exports.getUserDashBoards = getUserDashBoards;

function handleToArrayResult(req, res, error, result) {
    var responseObject;
    if (error) {
        responseObject = {
            status: 404,
            error: error
        };
        req.logger.debug(responseObject);
        return res.status(404).rdkSend(responseObject);
    }
    if (!result) {
        responseObject = {
            status: 404,
            error: notFoundError
        };
        req.logger.debug(responseObject);
        return res.status(404).rdkSend(responseObject);
    }
    responseObject = {
        status: 200,
        data: result
    };
    req.logger.debug(responseObject);
    return res.status(200).rdkSend(responseObject);
}

/**
 * @api {get} /resource/cds/metrics/dashboard/:dashboardId Get Dashboard
 * @apiName GetDashboard
 * @apiGroup Dashboards
 * @apiDescription Gets a complete dashboard that was saved by an associated user.  A dashboard serves as a container for
 * visual information - collected metrics that can be displayed as a chart
 * @apiParam {String} dashboardId The id of the type of metric to be displayed
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data Json object containing a list of all user dashboards
 * @apiSuccessExample {json} GetDashboard-Response
 * {
 *     "status": 200,
 *     "data": [
 *     {
 *      "_id": "5554c5f4e17664dc31573ae9",
 *      "userId": "testuser",
 *      "name": "New Dashboard",
 *      "description": "This is a dashboard example",
 *      "dashboardSettings": {
 *          "startPeriod": 1431534434120,
 *          "endPeriod": 1431620834120,
 *          "periodSelected": true,
 *          "granularitySelected": true,
 *          "period": "D1",
 *          "granularity": "H8",
 *          "hours": "1",
 *          "minutes": "00",
 *          "amPm": "AM"
 *      },
 *          "charts": [
 *          {
 *              "title": "Session Count Chart",
 *              "period": "D1",
 *              "startPeriod": 1431534434113,
 *              "endPeriod": 1431620834113,
 *              "granularity": "H8",
 *              "metricGroupId": "SessionCount",
 *              "selectedMetaDefinitions": [
 *              {
 *                  "name": "SessionCount",
 *                  "methodName": "avg",
 *                  "definitionId": "1"
 *              },
 *              {
 *                  "name": "SessionCount",
 *                  "methodName": "count",
 *                  "definitionId": "1"
 *               }
 *              ],
 *              "chartType": "COMBO",
 *              "liveUpdates": false,
 *              "hours": "1",
 *              "minutes": "00",
 *              "amPm": "AM"
 *           }
 *         ]
 *     }
 *]
 *}
 */
var getDashBoard = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        //    var message = invalidDashboardParameters(req);
        //    if (message) {
        //        res.status(rdk.httpstatus.bad_request).rdkSend(message);
        //    } else {

        var id = req.param('dashboardId');
        if (ObjectID.isValid(id) === false) {
            return res.status(400).send({
                status: 400,
                error: idParameterError
            });
        }

        dbConnection.collection('dashboards').findOne({
            _id: new ObjectID(id)
        }, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: result
            });
        });
    });
};
module.exports.getDashBoard = getDashBoard;

/**
 * @api {post} /resource/cds/metrics/dashboard Create Dashboard
 * @apiName CreateDashboard
 * @apiGroup Dashboards
 * @apiDescription Creates a new dashboard.  Once a dashboard is created, it can be updated to have charts assigned to it.
 * @apiParamExample {json} Dashboard-Example:
 * {
 *     "userId": "testuser",
 *     "name": "New Dashboard",
 *     "description": "This is a dashboard example",
 * }
 * @apiSuccess (201) {json} data the dashboard how it exists after it was initialized (id created) and persisted
 * @apiSuccessExample {json} CreateDashboard-Response
 *{
 *    "status": "201"
 *    "data": [
 *        {
 *            "userId": "testuser",
 *            "name": "New Dashboard",
 *            "description": "This is a dashboard example",
 *            "_id": "5567648f4ecbd1dcf18df799"
 *        }
 *    ]
 *}
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Message body cannot be empty and must contain valid JSON"
 *     }
 */
var createDashboard = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics POST createDashboard called');

        var dashboard = req.body;
        if (dashboard === null || Object.keys(dashboard).length === 0) {
            return res.status(400).send({
                status: 400,
                error: messageBodyError
            });
        }

        dbConnection.collection('dashboards').insert(dashboard, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            return res.status(201).send({
                status: 201,
                data: result.ops
            });
        });
    });
};
module.exports.createDashboard = createDashboard;

/**
 * @api {put} /resource/cds/metrics/dashboard/:dashboardId Update Dashboard
 * @apiName UpdateDashboard
 * @apiGroup Dashboards
 * @apiDescription Updates an existing dashboard
 * @apiParam {String} dashboardId the id of the dashboard to be updated
 * @apiParamExample {json} UpdateDashboard-PutBody
 * {
 * "_id": "5554c5f4e17664dc31573ae9",
 * "userId": "testuser",
 * "name": "New Dashboard",
 * "description": "This is a dashboard example",
 * "dashboardSettings": {
 *    "startPeriod": 1431534434120,
 *    "endPeriod": 1431620834120,
 *    "periodSelected": true,
 *    "granularitySelected": true,
 *     "period": "D1",
 *     "granularity": "H8",
 *     "hours": "1",
 *     "minutes": "00",
 *      "amPm": "AM"
 *  },
 *  "charts": [
 *    {
 *      "title": "Session Count Chart",
 *      "period": "D1",
 *      "startPeriod": 1431534434113,
 *      "endPeriod": 1431620834113,
 *      "granularity": "H8",
 *      "metricGroupId": "SessionCount",
 *      "selectedMetaDefinitions": [
 *        {
 *          "name": "SessionCount",
 *          "methodName": "avg",
 *          "definitionId": "1"
 *        },
 *        {
 *          "name": "SessionCount",
 *          "methodName": "count",
 *         "definitionId": "1"
 *        }
 *      ],
 *      "chartType": "COMBO",
 *      "liveUpdates": false,
 *      "hours": "1",
 *      "minutes": "00",
 *      "amPm": "AM"
 *    }
 *  ]
 *}
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Message body cannot be empty and must contain valid JSON"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data the integer value of 1
 * @apiSuccessExample {json} UpdateDashboard-Response
 *{
 * "data": {
 *    "result": "1"
 *  },
 *  "status": "200"
 *}
 */
var updateDashboard = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics PUT updateDashboard called');

        var id = req.param('dashboardId');
        if (ObjectID.isValid(id) === false) {
            res.status(400).send({
                status: 400,
                error: idParameterError
            });
            return;
        }

        var dashboard = req.body;
        if (dashboard === null || Object.keys(dashboard).length === 0 || isJsonString(dashboard)) {
            return res.status(400).send({
                status: 400,
                error: messageBodyError
            });
        }

        delete dashboard._id;
        dbConnection.collection('dashboards').update({
            _id: new ObjectID(id)
        }, dashboard, {}, function(err, result) {
            if (err) {
                return res.status(404).send({
                    status: 404,
                    error: err
                });
            }
            if (!result || result === 0) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: {
                    result: result
                }
            });
        });
    });
};
module.exports.updateDashboard = updateDashboard;

/**
 * @api {delete} /resource/cds/metrics/dashboard/:dashboardId Delete Dashboard
 * @apiName DeleteDashboard
 * @apiGroup Dashboards
 * @apiDescription Deletes a dashboard
 * @apiParam {String} dashboardId The id of the dashboard to be deleted
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data An integer value of 1
 * @apiSuccessExample {json} DeleteDashboard-Response
 *{
 * "data": {
 *    "result": "1"
 *  },
 *  "status": "200"
 *}
 */
var deleteDashboard = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics DELETE deleteDashboard called');

        var id = req.param('dashboardId');
        if (ObjectID.isValid(id) === false) {
            return res.status(400).send({
                status: 400,
                error: idParameterError
            });
        }

        dbConnection.collection('dashboards').remove({
            _id: new ObjectID(id)
        }, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result || result === 0) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: {
                    result: result
                }
            });
        });
    });
};
module.exports.deleteDashboard = deleteDashboard;

// GROUPS ...

/**
 * @api {get} /resource/cds/metrics/groups Get Groups
 * @apiName GetGroups
 * @apiGroup Groups
 * @apiDescription Gets a list of metric groups.  Groups functions are for convenience. Metric clients can choose
 * how to use these groups, if at all
 * @apiSuccess {json} data Json object containing a list of all groups
 * @apiSuccessExample {json} GetGroups-Response
 * {
 * "status": "200"
 * "data": [
 *    {
 *      "_id": "54d46c139bb12bc802bb92cc",
 *      "name": "All Metrics",
 *      "description": "A list of all metric definitions currently available",
 *      "metricList": [
 *        "SessionCount",
 *        "Execution_Begin",
 *        "Invocation_Begin",
 *        "Summary_Total"
 *      ]
 *    }
 *  ]
 *}
 */
var getMetricGroups = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getMetricGroups called');

        dbConnection.collection('groups').find().toArray(function(error, result) {
            handleToArrayResult(req, res, error, result);
        });
    });
};
module.exports.getMetricGroups = getMetricGroups;

/**
 * @api {post} /resource/cds/metrics/groups Create Group
 * @apiName CreateGroups
 * @apiGroup Groups
 * @apiDescription Creates a new metric group
 * @apiParamExample {json} CreateGroup-PostBody
 *{
 *  "name": "test Metrics group",
 *  "description": "This group contains test metrics",
 *              "metricList": [
 *                "SessionCount",
 *                "Execution_Begin",
 *                "Invocation_Begin",
 *                "Summary_Total"
 *            ]
 *}
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Message body cannot be empty and must contain valid JSON"
 *     }
 * @apiSuccess (201) {json} data the group how it exists after it gets initialized (id created) and persisted
 * @apiSuccessExample {json} CreateGroup-Response
 *{
 *  "status": "201"
 *    "data": [
 *        {
 *            "name": "test Metrics group",
 *            "description": "This group contains test metrics",
 *            "metricList": [
 *                "SessionCount",
 *                "Execution_Begin",
 *                "Invocation_Begin",
 *                "Summary_Total"
 *            ],
 *            "_id": "556763204ecbd1dcf18df798"
 *        }
 *    ]
 *}
 */
var createMetricGroup = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics POST createMetricGroup called');

        // FUTURE-TODO:  ADMIN FUNCTION ONLY - check user using auth
        // req.session.user.vistaKeys[]

        var group = req.body;
        if (group === null || Object.keys(group).length === 0) {
            return res.status(400).send({
                error: messageBodyError
            });
        }

        dbConnection.collection('groups').insert(group, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(201).send({
                status: 201,
                data: result.ops
            });
        });
    });
};
module.exports.createMetricGroup = createMetricGroup;

/**
 * @apiIgnore 1) this is an admin function 2) the implementation is missing on CDSInvocation 3) as a workaround a group can be deleted and recreated
 * @api {post} /resource/cds/metrics/groups Update Group
 * @apiName UpdateGroups
 * @apiGroup Groups
 * @apiDescription Updates a metric group
 * @apiParamExample {json} UpdateGroup-PostBody
 * {
 *  "_id": 4
 *  "name": "Example Group",
 *  "description": "This is an example group",
 *  "metricList": [
 *    "0",
 *    "1",
 *    "2"
 *  ]
 * }
 * @apiError (400) ErrorMessage bad request
 * @apiError (404) ErrorMessage not found
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Message body cannot be empty and must contain valid JSON"
 *     }
 * @apiSuccess {json} data Json object containing a list of all groups
 * @apiSuccess {json} data the integer value of 1
 * @apiSuccessExample {json} UpdateGroup-Response
 *{
 * "data": {
 *    "result": "1"
 *  },
 *  "status": "200"
 *}
 */
var updateMetricGroup = function(req, res) {
    req.logger.debug('updateMetricGroup PUT updateMetricGroup called - method not implemented');
    res.status(501).send({
        status: 501,
        error: 'Method not implemented'
    });
};
module.exports.updateMetricGroup = updateMetricGroup;

/**
 * @api {delete} /resource/cds/metrics/groups/:metricGroupId Delete Group
 * @apiName DeleteGroup
 * @apiGroup Groups
 * @apiDescription Delete Group
 * @apiParam {String} metricGroupId the id of the group to be deleted
 * @apiError (400) ErrorMessage bad request
 * @apiError (404) ErrorMessage not found
 * @apiSuccess {json} data An integer value of 1
 * @apiSuccessExample {json} DeleteGroup-Response
 *{
 * "data": {
 *    "result": "1"
 *  },
 *  "status": "200"
 *}
 */
var deleteMetricGroup = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics DELETE deleteMetricGroup called');

        // FUTURE-TODO:  ADMIN FUNCTION ONLY - check user using auth
        // req.session.user.???

        var id = req.param('metricGroupId');
        if (ObjectID.isValid(id) === false) {
            res.status(400).send({
                status: 400,
                error: idParameterError
            });
            return;
        }

        id = new ObjectID(id);
        dbConnection.collection('groups').remove({
            _id: id
        }, function(error, result) {
            if (error) {
                res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result || result === 0) {
                res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            res.status(200).send({
                status: 200,
                data: {
                    result: result
                }
            });
        });
    });
};
module.exports.deleteMetricGroup = deleteMetricGroup;

// DEFINITIONS ...

/**
 * @api {get} /resource/cds/metrics/definitions Get Definitions
 * @apiName GetDefinitions
 * @apiGroup Definitions
 * @apiDescription Returns a static list of the metrics that are supported by this service, along with additional clarifying information,
 * including a description of that metric and the attributes of the type of charts that it can support. The reason they are
 * static is because unique, back end logic must be written to capture and process each metric
 * @apiSuccess {json} data Json object containing a list of all metric definitions
 * @apiSuccessExample {json} GetDefinitions-Response
 * {
 *  "status": "200"
 *  "data": [
 *    {
 *      "_id": "8",
 *      "name": "Summary_Total",
 *      "description": "Summary, total timings report.",
 *      "unitOfMeasure": "Count",
 *      "updateInterval": 15000,
 *      "aggregation": [
 *        "count",
 *        "min",
 *        "max",
 *        "avg",
 *        "sum"
 *      ],
 *      "origins": [
 *        "EngineOne",
 *        "SystemB"
 *      ],
 *      "invocationTypes": [
 *        "Direct",
 *        "Background"
 *      ],
 *      "type": "invoke",
 *      "event": "summary",
 *      "property": "timings.total",
 *      "collection": "metrics"
 *    }
 *  ]
 *}
 */
var getMetricDefinitions = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getMetricDefinitions called');

        dbConnection.collection('definitions').find().toArray(function(error, result) {
            handleToArrayResult(req, res, error, result);
        });
    });
};
module.exports.getMetricDefinitions = getMetricDefinitions;

/**
 * @apiIgnore - FUTURE-TODO - restrict method access to some sort of admin role
 * @api {post} /resource/cds/metrics/definitions Create Definition
 * @apiName CreateDefinitions
 * @apiGroup Definitions
 * @apiDescription Create
 * @apiSuccess (201) {json} data the genereated id of the new definition
 * @apiSuccessExample {json} CreateDefinition-Response
 * {
 *  "data":<new_definition_id>
 * }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 */
var createMetricDefinitions = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics POST createDefinition called');

        var metDef = req.body;
        if (metDef === null || Object.keys(metDef).length === 0) {
            res.status(400).send({
                status: 400,
                error: messageBodyError
            });
            return;
        }

        dbConnection.collection('definitions').insert(metDef, function(error, result) {
            if (error) {
                res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            return res.status(201).send({
                status: 201,
                data: result.ops
            });
        });
    });
};
module.exports.createMetricDefinitions = createMetricDefinitions;

/**
 * @apiIgnore - FUTURE-TODO - restrict method access to some sort of admin role
 * @api {delete} /resource/cds/metrics/definitions/:definitionId Delete Definition
 * @apiName DeleteDefinitions
 * @apiGroup Definitions
 * @apiDescription
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data 1
 * @apiSuccessExample {json} CreateDefinition-Response
 *{
 * "data": {
 *    "result": "1"
 *  },
 *  "status": "200"
 *}
 */
var deleteMetricDefinition = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics POST deleteDefinition called');

        //FUTURE-TODO - standardize the way IDs are used for definitions
        var id = req.param('definitionId');
        if (ObjectID.isValid(id) === false) {
            return res.status(400).send({
                status: 400,
                error: idParameterError
            });
        }

        id = new ObjectID(id);
        dbConnection.collection('definitions').remove({
            _id: id
        }, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result || result.result.ok === 0) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: {
                    result: result
                }
            });
        });
    });
};
module.exports.deleteMetricDefinition = deleteMetricDefinition;

// ROLES ...

/**
 * @api {get} /resource/cds/metrics/roles Get Roles
 * @apiName GetRoles
 * @apiGroup Roles
 * @apiDescription Gets a list of roles
 * @apiSuccess {json} data Json object containing a list of all roles
 * @apiSuccessExample {json} GetRoles-Response
 * {
 *  "status": "200"
 *  "data": [
 *    {
 *      "_id": "8",
 *      "name": "Admin",
 *      "description": "Admin has unrestricted privilege"
 *    }
 *  ]
 * }
 */
var getRoles = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getRoles called');

        dbConnection.collection('roles').find().toArray(function(error, result) {
            handleToArrayResult(req, res, error, result);
        });
    });
};
module.exports.getRoles = getRoles;

/**
 * @apiIgnore Has not been fully scoped and implemented
 * @api {post} /resource/cds/metrics/roles Update Role
 * @apiName UpdateRoles
 * @apiGroup Roles
 * @apiDescription Gets a list of roles supported by this system
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiParamExample
 * {
 *  "status": 200,
 *  "data": [
 *    {
 *      "_id": "8",
 *      "name": "Admin",
 *      "description": "Admin has unrestricted privilege"
 *    }
 *  ]
 * }
 */
var updateRoles = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getRoles called');

        //FUTURE-TODO - CDS Invocation did not have an updateRoles method, this method appears to insert a list of roles instead.
        //This will need to be tested if a requirement for dashboard roles emerges
        var roles = req.body;
        if (roles === null || Object.keys(roles).length === 0) {
            return res.status(400).send({
                status: 400,
                error: messageBodyError
            });
        }

        dbConnection.collection('roles').insert(roles, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            return res.status(201).send({
                status: 201,
                data: result.ops
            });
        });
    });
};
module.exports.updateRoles = updateRoles;

// USER ROLES ...

/**
 * @apiIgnore Has not been fully scoped and implemented
 * @api {get} /resource/cds/metrics/userRoles/:userId Get Roles
 * @apiName GetUserRoles
 * @apiGroup UserRoles
 * @apiDescription Gets a list of roles associated to a particular user
 * @apiParam {String} userId The id of the type of metric to be displayed
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 */
var getUserRoles = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET getRoles called');
        //FUTURE-TODO - this method will also need to be tested / examined more closely should requirements for user based roles emerge

        var id = req.param('userId');
        dbConnection.collection('userRoles').findOne({
            userId: id
        }, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: result
            });
        });
    });
};
module.exports.getUserRoles = getUserRoles;

/**
 * @apiIgnore Has not been fully scoped and implemented
 * @api {post} /resource/cds/metrics/userRoles Update Roles
 * @apiName GetUserRoles
 * @apiGroup UserRoles
 * @apiDescription Updates roles associated with a user
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "400"
 *       "error": "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "404"
 *       "error": "Not Found"
 *     }
 * @apiSuccess {json} data Json object containing a list of all roles
 */
var updateUserRoles = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS metrics resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(metricDbName, initDefinitions, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Metrics GET updateRoles called');

        // var id = req.param('userId');

        //FUTURE-TODO - this method will also need to be tested / examined more closely should requirements for user based roles emerge
        var userRole = req.body;
        if (userRole === null || Object.keys(userRole).length === 0) {
            return res.status(400).send({
                status: 400,
                error: 'Message body cannot be empty and must contain valid JSON'
            });
        }

        dbConnection.collection('userRoles').update({
            userId: userRole.userId
        }, userRole, {
            upsert: true
        }, function(error, result) {
            if (error) {
                return res.status(404).send({
                    status: 404,
                    error: error
                });
            }
            if (!result) {
                return res.status(404).send({
                    status: 404,
                    error: notFoundError
                });
            }
            return res.status(200).send({
                status: 200,
                data: result
            });
        });
    });
};
module.exports.updateUserRoles = updateUserRoles;
module.exports.init = init;
