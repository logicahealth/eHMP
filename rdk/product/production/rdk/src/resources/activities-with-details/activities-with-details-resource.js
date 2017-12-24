'use strict';

var _ = require('lodash');
var async = require('async');
var oracleConnectionPool = require('../../utils/oracle-connection-pool');
var oracledb = require('oracledb');

var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var httpUtil = rdk.utils.http;
var MAX_NUMBER_ASYNC_OPS = 15;

function getResourceConfig() {
    return [{
        name: 'activities-with-details',
        path: 'instances',
        get: getActivitiesDetails,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'get activities with details instances',
        subsystems: ['oracle']
    }];
}

var procedureMap = {
    mode: 'i_mode',
    processInstanceId: 'i_processinstanceid',
    initiatedBy: 'i_initiated_by',
    facilityRoute: 'i_facility_route',
    teamRoutes: 'i_team_routes',
    pid: 'i_pid',
    start: 'i_start',
    limit: 'i_limit',
    primarySort: 'i_primary_sort_by',
    secondarySort: 'i_secondary_sort_by',
    primarySortDir: 'i_primary_sort_dir',
    secondarySortDir: 'i_secondary_sort_dir',
    filter: 'i_filter_text',
    processDefinitionId: 'i_process_definition_id',
    flagged: 'i_flagged',
    returnActivityJSON: 'i_return_activity_json'
};
Object.freeze(procedureMap);

var bindingsTypeMap = {
    mode: 2001,
    processInstanceId: 2002,
    initiatedBy: 2001,
    facilityRoute: 2001,
    teamRoutes: 2001,
    pid: 2001,
    start: 2002,
    limit: 2002,
    primarySort: 2001,
    secondarySort: 2001,
    primarySortDir: 2001,
    secondarySortDir: 2001,
    filter: 2001,
    processDefinitionId: 2001,
    flagged: 2001,
    returnActivityJSON: 2001
};
Object.freeze(bindingsTypeMap);

function getActivitiesDetails(req, res) {
    var oracleConfig = _.get(req, 'app.config.oracledb.activityDatabase');
    if (!oracleConfig) {
        var missingConfig = new RdkError({
            logger: req.logger,
            code: 'oracledb.503.1000'
        });
        return res.status(missingConfig.status).rdkSend(missingConfig.error);
    }

    var queryParams = {
        mode: _.get(req, ['query', 'mode']),
        processInstanceId: _.get(req, ['query', 'processInstanceId']),
        start: _.get(req, ['query', 'start'], 0),
        limit: _.get(req, ['query', 'limit'], 100),
        processDefinitionId: _.get(req, ['query', 'processDefinitionId']),
        flagged: _.get(req, ['query', 'flagged']),
        returnActivityJSON: _.get(req, ['query', 'returnActivityJSONData'])
    };

    var routes = _.get(req, ['query', 'routes']);
    if (routes && !Array.isArray(routes)) {
        routes = routes.split(',');
    }

    var initiatedBy = _.get(req, ['query', 'initiatedBy']);
    if (initiatedBy && !Array.isArray(initiatedBy)) {
        queryParams.initiatedBy = initiatedBy.split(',');
    } else if (initiatedBy) {
        queryParams.initiatedBy = initiatedBy;
    }

    var filter = _.get(req, ['query', 'filterText']);
    if (filter && !Array.isArray(filter)) {
        queryParams.filter = filter.split(',');
    } else if (filter) {
        queryParams.filter = filter;
    }

    var facility = _.find(routes, function(route) {
        return route.indexOf('facility:') !== -1;
    });
    if (routes && facility) {
        queryParams.facilityRoute = getFacilityRoutes(facility);
    }

    var teams = _.filter(routes, function(team) {
        return team.indexOf('team:') !== -1;
    });
    if (routes && teams.length !== 0) {
        queryParams.teamRoutes = getTeamRoutes(teams);
    }

    // Convert flagged true/false to Y/N
    if (queryParams.flagged && _.isBoolean(queryParams.flagged)) {
        queryParams.flagged = queryParams.flagged ? 'Y' : 'N';
    } else if (_.isString(queryParams.flagged)) {
        queryParams.flagged = queryParams.flagged.toLowerCase() === 'true' ? 'Y' : 'N';
    }
    // Convert returnActivityJSON to Y/N
    if (_.isBoolean(queryParams.returnActivityJSON)) {
        queryParams.returnActivityJSON = queryParams.returnActivityJSON ? 'Y' : 'N';
    } else if (_.isString(queryParams.returnActivityJSON)) {
        queryParams.returnActivityJSON = queryParams.returnActivityJSON.toLowerCase() === 'true' ? 'Y' : 'N';
    }

    var querySortParams = ['primarySort', 'secondarySort'];
    for (var i = 0; i < querySortParams.length; i++) {
        var param = _.get(req, ['query', querySortParams[i] + 'By']);
        if (param) {
            var cleanURI = decodeURI(param);
            var splitBySpace = cleanURI.split(' ');
            queryParams[querySortParams[i]] = splitBySpace[0];
            if (splitBySpace.length > 1 && ('asc' === splitBySpace[1].toLowerCase() || 'desc' === splitBySpace[1].toLowerCase())) {
                queryParams[querySortParams[i] + 'Dir'] = splitBySpace[1];
            }
        }
    }

    async.waterfall([
            verifyAndGetPidsIfNeeded.bind(null, req, oracleConfig, queryParams),
            oracleFetchProcedure,
            getDemographics.bind(null, req),
            buildResponse
        ],
        function(err, result) {
            if (err) {
                return res.status(err.status).rdkSend(err);
            }

            var limit = _.get(queryParams, 'limit');
            var start = _.get(queryParams, 'start');
            var paging = paginate(result, start, limit);

            var finalResponse = {};
            _.set(finalResponse, 'items', result);
            _.merge(finalResponse, paging);

            return res.status(200).rdkSend(finalResponse);
        });
}

/**
 * Calls oracle procedure
 * @param  {object}   req
 * @param  {object}   oracleConfig
 * @param  {object}   queryParams
 * @param  {Function} callback
 */
function oracleFetchProcedure(req, oracleConfig, queryParams, callback) {
    oracleConnectionPool.getPool(req, oracleConfig, function getPool(err, pool) {
        if (err) {
            var error = new RdkError({
                code: 'oracledb.500.1000',
                logger: req.logger,
                error: _.get(err, 'message', 'Failed to get Oracle Connection Pool')
            });
            return callback(error);
        }
        pool.getConnection(function getConnection(err, connection) {
            if (err) {
                var error = new RdkError({
                    code: 'oracledb.500.1000',
                    logger: req.logger,
                    error: _.get(err, 'message', 'Failed to open a oracle connection')
                });
                return callback(error);
            }
            // Increment start +1 to account for Oracle 1 Based  Index
            queryParams.start = _.parseInt(queryParams.start) + 1;

            var bindings = createFetchOracleBindings(queryParams);
            var query = createFetchProcedureString(bindings);
            oracledb.outFormat = oracledb.OBJECT;
            oracledb.fetchAsString = [oracledb.CLOB];

            connection.execute(query, bindings, {}, function execute(err, result) {
                if (err) {
                    oracleConnectionPool.doClose(req, connection);
                    var connectionError = new RdkError({
                        code: 'oracledb.500.1000',
                        logger: req.logger,
                        error: _.get(err, 'message', 'Failed to execute fetch_data_model procedure')
                    });
                    return callback(connectionError);
                }

                var exception = _.get(result, 'outBinds.exception');
                var exceptionCode = 'oracledb.500.100';
                if (exception) {
                    switch (exception) {
                        case 'INVALID_PRIMARY_SORT_KEY':
                            exceptionCode += '1';
                            break;
                        case 'INVALID_SECONDARY_SORT_KEY':
                            exceptionCode += '2';
                            break;
                        default:
                            exceptionCode += '0';
                    }
                    var exceptionError = new RdkError({
                        code: exceptionCode,
                        logger: req.logger,
                        error: exception
                    });
                    oracleConnectionPool.doClose(req, connection);
                    return callback(exceptionError);
                }

                var recordset = _.get(result, ['outBinds', 'recordset']);
                var results = [];

                function getResultRows() {
                    recordset.getRows(100, function(err, rows) {
                        if (err) {
                            oracleConnectionPool._doCloseCursor(req, connection, recordset);
                            var resultError = new RdkError({
                                code: 'oracledb.500.1000',
                                logger: req.logger,
                                error: _.get(err, 'message', 'An error was encountered while getting result rows')
                            });
                            return callback(resultError);
                        }
                        if (rows.length) {
                            _.each(rows, function(val) {
                                results.push(val);
                            });
                            return getResultRows();
                        }
                        // Closes recordset and connection
                        oracleConnectionPool._doCloseCursor(req, connection, recordset);
                        return callback(null, results);
                    });
                }
                getResultRows();
            });
        });
    });
}

function paginate(result, start, limit) {
    var paging = {};
    // Subtracting 1 to account for Oracle index shift
    // Resource defaults to 0 index, Oracle 1
    var startParsed = _.parseInt(start) - 1;
    var limitParsed = _.parseInt(limit);
    _.set(paging, 'currentItemCount', result.length);
    _.set(paging, 'itemsPerPage', limitParsed);
    _.set(paging, 'nextStartIndex', startParsed + result.length);
    _.set(paging, 'pageIndex', Math.floor(startParsed / limitParsed));
    _.set(paging, 'startIndex', startParsed);
    _.set(paging, 'totalItems', paging.itemsPerPage * paging.pageIndex + paging.currentItemCount);

    var totalItems = paging.totalItems;
    if (paging.currentItemCount === paging.itemsPerPage) {
        totalItems += 1;
    }
    _.set(paging, 'totalPages', Math.ceil(totalItems / limit));

    return paging;
}

/**
 * Maps result row fields to expected response columns
 * @param  {object}   input
 * @param  {Function} callback
 */
function buildResponse(activityRows, demographics, callback) {
    var response = _.map(activityRows, function(row) {
        return {
            'ACTIVITYHEALTHDESCRIPTION': _.get(row, 'activityhealthdescription'),
            'ASSIGNEDTOFACILITYID': _.get(row, 'assignedtofacilityid'),
            'ASSIGNEDTOID': _.get(row, 'assignedtoid'),
            'CREATEDATID': _.get(row, 'createdatid'),
            'CREATEDBYID': _.get(row, 'createdbyid'),
            'CREATEDON': _.get(row, 'createdon'),
            'CREATEDONFORMATTED': _.get(row, 'createdonformatted'),
            'DEPLOYMENTID': _.get(row, 'deploymentid'),
            'DOMAIN': _.get(row, 'domain'),
            'INSTANCENAME': _.get(row, 'instancename'),
            'INTENDEDFOR': _.get(row, 'intendedfor'),
            'ISACTIVITYHEALTHY': _.get(row, 'isactivityhealthy'),
            'MODE': _.get(row, 'mode'),
            'NAME': _.get(row, 'name'),
            'PID': _.get(row, 'pid'),
            'PROCESSID': _.get(row, 'processid'),
            'STATUS': _.get(row, 'status'),
            'TASKSTATE': _.get(row, 'activitystate'),
            'ROUTINGCODE': _.get(row, 'routingcode'),
            'URGENCY': _.get(row, 'urgency'),
            'RN': _.get(row, 'RN'),
            'PCPID': _.get(row, 'pcpid'),
            'PCPNAME': buildPcpName(_.get(row, 'staff_last_name', null), _.get(row, 'staff_first_name', null), _.get(row, 'staff_middle_name', null)),
            'PCTEAM': _.get(row, 'pcteam'),
            'CREATEDBYNAME': _.get(demographics, ['users', _.get(row, 'createdbyid')], null),
            'ISSENSITIVEPATIENT': _.get(demographics, ['patients', _.get(row, 'pid'), 'sensitive'], null),
            'PATIENTSSNLASTFOUR': _.get(demographics, ['patients', _.get(row, 'pid'), 'last4'], null),
            'PATIENTNAME': _.get(demographics, ['patients', _.get(row, 'pid'), 'fullName'], null),
            'ACTIVITYJSON': (_.get(row, 'activityjson')) ? parse(_.get(row, 'activityjson')) : null
        };
    });
    return callback(null, response);
}

/**
 * builds pcpname field
 * @param  {string} last
 * @param  {string} first
 * @param  {string} middle
 * @return {string}
 */
function buildPcpName(last, first, middle) {
    if (_.isNull(last) && _.isNull(last) && _.isNull(last)) {
        return null;
    }

    if (null === last) {
        last = '';
    }
    if (null === first) {
        first = '';
    }
    var pcpname = '';
    pcpname += last;
    pcpname += ', ' + first;

    if (null !== middle) {
        pcpname += ' ' + middle;
    }
    return pcpname;
}

/**
 * Calls buildDemographicsResponse
 * @param  {object}   req
 * @param  {object}   resultRows
 * @param  {Function} callback
 * @return {Function}
 */
function getDemographics(req, resultRows, callback) {
    buildDemographicsResponse(req, resultRows, true, function(err, demographics) {
        if (err) {
            return callback(err);
        }
        return callback(null, resultRows, demographics);
    });
}

/**
 * Constructs object containing
 * user and patient info
 * @param  {object}   req
 * @param  {object}   response
 * @param  {boolean}   staffRequest
 * @param  {Function} callback
 * @return {Function}
 */
function buildDemographicsResponse(req, response, staffRequest, callback) {
    var pidList = [];
    var users = {};
    var JDSQueries = [];

    if (staffRequest) {
        pidList = _.map(response, 'pid');
        var JDSQueriesForPatient = buildJDSQueryFromPids('patient', pidList);
        _.each(JDSQueriesForPatient, function(query) {
            JDSQueries.push(function(callback) {
                runJDSQuery(req, query, callback);
            });
        });
    }

    _.each(response, function(activity) {
        if (!_.isNull(activity.createdbyid)) {
            users[activity.createdbyid] = {};
        }
    });

    var userList = _.keys(users);
    userList = adjustUserIds(req.logger, userList);

    var JDSQueriesForUsers = buildJDSQueryFromPids('user', userList);
    _.each(JDSQueriesForUsers, function(query) {
        JDSQueries.push(function(callback) {
            runJDSQuery(req, query, callback);
        });
    });

    async.parallelLimit(JDSQueries, MAX_NUMBER_ASYNC_OPS, function(err, results) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }
        var resultObj = {
            users: {},
            patients: {}
        };

        _.each(results, function(result) {
            _.each(result, function(item) {
                if (_.includes(item.uid, 'user')) {
                    var uidSplit = item.uid.split(':');
                    var pid = uidSplit[uidSplit.length - 2] + ';' + uidSplit[uidSplit.length - 1];
                    resultObj.users[pid] = item.name;
                } else if ( _.includes(item.uid, 'pt-select')) {
                    resultObj.patients[item.pid] = {
                        fullName: item.fullName,
                        last4: item.last4,
                        sensitive: item.sensitive
                    };
                }
            });
        });
        return callback(null, resultObj);
    });
}

/**
 * Runs queries against JDS and returns results
 * @param  {object}   req
 * @param  {string}   query
 * @param  {Function} callback
 * @return {Function}
 */
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

/**
 * Builds an array of jdsQueryPaths from IDs
 * @param  {string} type
 * @param  {object} ids
 * @return {object}
 */
function buildJDSQueryFromPids(type, ids) {
    var batchedIds = _.chunk(ids, 10);
    var result = [];

    _.each(batchedIds, function(ids) {
        if (type === 'user') {
            result.push('/data/index/user-uid?range=' + ids);
        } else if (type === 'patient') {
            result.push('/data/index/pt-select-pid?range=' + ids);
        }
    });
    return result;
}

function adjustUserIds(logger, ids) {
    var retVal = [];
    if (_.isEmpty(ids)) {
        return retVal;
    }

    var parts = [];
    _.each(ids, function(id) {
        parts = id.split(';');
        if (!_.isEmpty(parts) && parts.length === 2) {
            id = 'urn:va:user:' + parts[0] + ':' + parts[1];
            retVal.push(id);
        } else {
            logger.error({
                'bad user id': id
            });
        }
    });
    return retVal;
}

/**
 * JSON.parse wrapper
 */
function parse(input) {
    var output;
    try {
        output = JSON.parse(input);
    } catch (err) {
        return input;
    }
    return output;
}

/**
 * Gets PIDs if pid is used in the query
 * @param  {object}   req
 * @param  {object}   oracleConfig
 * @param  {object}   queryParams
 * @param  {Function} callback
 */
function verifyAndGetPidsIfNeeded(req, oracleConfig, queryParams, callback) {
    if (!_.get(req, ['query', 'pid'])) {
        return callback(null, req, oracleConfig, queryParams);
    }

    fetchPidsFromJDS(req, function(err, patientIdentifiers) {
        if (err) {
            return callback(err);
        }
        queryParams.pid = patientIdentifiers;
        return callback(null, req, oracleConfig, queryParams);
    });
}
/**
 * Fetches patient identifiers from JDS
 * @param  {object}   req
 * @param  {Function} callback
 */
function fetchPidsFromJDS(req, callback) {
    var pid = _.get(req, ['query', 'pid']);
    var jdsPath = '/vpr/jpid/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            var jdsError = new RdkError({
                code: 'jds.500.1000',
                logger: req.logger,
                error: error
            });
            return callback(jdsError);
        }
        if (response.statusCode === 404) {
            var notFoundError = new RdkError({
                code: 'jds.404.1000',
                logger: req.logger,
                error: response.statusMessage
            });
            return callback(notFoundError);
        }
        return callback(null, _.get(result, 'patientIdentifiers'));
    });
}
/**
 * Sorts through routes returning just facility codes
 * in an array
 * @param  {object} teams
 * @return {object}
 */
function getTeamRoutes(teams) {
    var teamRoutes = [];
    _.each(teams, function(val, key) {
        if (_.includes(val, 'team')) {
            var teamCode = val.split(':');
            teamRoutes.push(teamCode[1]);
        }
    });
    return teamRoutes;
}
/**
 * Returns facility code
 * @param  {string} facility
 * @return {string}
 */
function getFacilityRoutes(facility) {
    var facilitySplit = facility.split(':');
    return facilitySplit[1];
}

/**
 * Creates query string based off queryParams
 * @param {*} oracleBindings The data bindings used to make the request
 * @returns {string}
 */
function createFetchProcedureString(oracleBindings) {
    var params = '';
    _.each(oracleBindings, function(val, key) {
        var paramValue = _.get(procedureMap, key);
        if (paramValue) {
            params += paramValue + ' => :' + key + ', ';
        }
    });
    params += 'o_exception => :exception, o_recordset => :recordset';
    return 'BEGIN ACTIVITYDB.DATA_MODEL_API.FETCH_DATA_MODEL(' + params + '); END;';
}

/**
 * Creates the oracle bindings based on the values received from the the request.
 * @param {*} inputData Flattened data from the request
 * @returns {{}}
 */
function createFetchOracleBindings(inputData) {
    var oracleBindings = {};
    _.each(inputData, function(val, key) {
        if (!_.isUndefined(val)) {
            var bindingType = _.get(bindingsTypeMap, key, 2001);
            if (bindingType === 2002 && _.isString(val)) {
                oracleBindings[key] = {
                    val: _.parseInt(val),
                    dir: oracledb.BIND_IN,
                    type: bindingType
                };
            } else {
                oracleBindings[key] = {
                    val: val,
                    dir: oracledb.BIND_IN,
                    type: bindingType
                };
            }
        }
    });
    oracleBindings.recordset = {
        dir: oracledb.BIND_OUT,
        type: oracledb.CURSOR
    };
    oracleBindings.exception = {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING
    };
    return oracleBindings;
}

module.exports.getActivitiesDetails = getActivitiesDetails;
module.exports.getResourceConfig = getResourceConfig;
module.exports.getFacilityRoutes = getFacilityRoutes;
module.exports.getTeamRoutes = getTeamRoutes;
module.exports.fetchPidsFromJDS = fetchPidsFromJDS;
module.exports.createFetchOracleBindings = createFetchOracleBindings;
module.exports.createFetchProcedureString = createFetchProcedureString;
module.exports.verifyAndGetPidsIfNeeded = verifyAndGetPidsIfNeeded;
module.exports.parse = parse;
module.exports.adjustUserIds = adjustUserIds;
module.exports.buildJDSQueryFromPids = buildJDSQueryFromPids;
module.exports.runJDSQuery = runJDSQuery;
module.exports.buildDemographicsResponse = buildDemographicsResponse;
module.exports.getDemographics = getDemographics;
module.exports.buildResponse = buildResponse;
module.exports.paginate = paginate;
module.exports.oracleFetchProcedure = oracleFetchProcedure;
module.exports.buildPcpName = buildPcpName;
