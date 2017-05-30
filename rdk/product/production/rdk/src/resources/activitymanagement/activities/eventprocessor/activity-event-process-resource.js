'use strict';

var rdk = require('../../../../core/rdk');
var activitiesResource = require('../activities-operations-resource');
var _ = require('lodash');
var getGenericJbpmConfig = require('../../activity-utils').getGenericJbpmConfig;
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var moment = require('moment');
var activityDb = require('../../../../subsystems/jbpm/jbpm-subsystem');
var handlebars = require('handlebars').create();

handlebars.registerHelper('obj', function(context) {
    return JSON.stringify(context);
});

function escape(key, val) {
    if (typeof(val) !== 'string') {
        return val;
    }
    return doEscape(val);
}

function doEscape(val) {
    return val.replace(/[\"]/g, '\\"');
}

handlebars.registerHelper('objAsStr', function(context) {
    return doEscape(JSON.stringify(context, escape));
});

var matchables = ['domain', 'subDomain', 'uid', 'ehmpState', 'referenceId', 'patientUid', 'icn', 'clinicalObjectUid', 'data.statusCode'];

var processDefinitionsCache = {};

// Compare two versions numbers and return the highest one
// This code was borrowed from the UI, same function -
// updates/fixes made to this function should also be included there
function versionCompare(v1, v2) {
    // Split version numbers to its parts
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

    // Push 0 to the end of the version number that might be shorter
    //      ie. 1.2.3 and 1.2.3.4 => 1.2.3.0 and 1.2.3.4
    while (v1parts.length < v2parts.length) {
        v1parts.push('0');
    }

    while (v2parts.length < v1parts.length) {
        v2parts.push('0');
    }

    // Convert all values to numbers
    var convert = function(val) {
        val = val.replace(/\D/g, '');
        if (val.length === 0) {
            return Number.MAX_VALUE;
        }
        return Number(val);
    };
    v1parts = v1parts.map(convert);
    v2parts = v2parts.map(convert);

    for (var i = 0; i < v1parts.length; i++) {
        if (v1parts[i] === v2parts[i]) {
            continue;
        } else if (v1parts[i] > v2parts[i]) {
            return -1;
        } else if (v1parts[i] < v2parts[i]) {
            return 1;
        }
    }

    return 0;
}

function fillInDefinitions(formattedResponse, queryResponse, logger, callback) {
    logger.trace('formattedResponse.data.items', formattedResponse.data.items);

    _.each(queryResponse, function(activity) {
        activity.validVersions = [];

        if (activity.hasOwnProperty('EVENT_MTCH_DEF_ID') && activity.hasOwnProperty('EVENT_MTCH_VERSION')) {
            _.each(formattedResponse.data.items, function(responseItem) {

                if (responseItem.hasOwnProperty('id') && responseItem.id === activity.EVENT_MTCH_DEF_ID &&
                    responseItem.hasOwnProperty('version') && responseItem.version === activity.EVENT_MTCH_VERSION &&
                    responseItem.hasOwnProperty('deploymentId')) {

                    activity.DEPLOYMENTID = responseItem.deploymentId;
                    activity.PROCESSDEFINITIONID = responseItem.id;
                    activity.validVersions.push('' + (responseItem.deploymentId.substring(responseItem.deploymentId.lastIndexOf(':') + 1)));
                }
            });
        }
    });

    _.each(queryResponse, function(activity) {
        if (activity.hasOwnProperty('validVersions') && activity.validVersions.length > 1) {
            //default to latest version
            var deploymentId = activity.DEPLOYMENTID;
            activity.DEPLOYMENTID = deploymentId.substring(0, deploymentId.lastIndexOf(':')) + ':' + activity.validVersions.sort(versionCompare)[0];
        }

    });

    logger.trace('queryResponse after fillInDefinitions', queryResponse);
    callback(null, queryResponse);
}

function startActivityEvent(req, res) {

    req.audit.dataDomain = 'ActivityEvent';
    req.audit.logCategory = 'START_ACTIVITY_EVENT';
    var rawEventRequest = _.get(req, 'body' , null);
    if (rawEventRequest === null || typeof rawEventRequest !== 'object') {
        var reqError = new Error('201 - Invalid request body');
        req.logger.debug(reqError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(reqError.message);
    }

    var activityDatabaseConfig = _.get(req, 'app.config.jbpm.activityDatabase' , null);
    if (!activityDatabaseConfig || typeof activityDatabaseConfig !== 'object' || !activityDatabaseConfig.hasOwnProperty('user') || !activityDatabaseConfig.hasOwnProperty('password') || !activityDatabaseConfig.hasOwnProperty('connectString')) {
        var configError = new Error('210 - Invalid request configuration');
        req.logger.debug(configError); //will be logged out by caller - put stacktrace in debug
        return res.status(rdk.httpstatus.bad_request).rdkSend(configError.message);
    }

    req.logger.trace('Raw Event Request - Received in AEP', rawEventRequest);

    var eventRequest = flattenAndFilter(rawEventRequest);

    if (_.size(eventRequest) === 0) {
        return res.status(rdk.httpstatus.ok).rdkSend('No matches');
    }

    var bindVars = [];
    var simpleMatchFields = [];
    var simpleMatchValues = [];
    _.each(eventRequest, function(value, key) {
        if (nullchecker.isNotNullish(key)) {
            simpleMatchFields.push(key);
            simpleMatchValues.push(value);
        }
    });

    var query;


    if (simpleMatchFields.length > 0 && simpleMatchFields.length === simpleMatchValues.length) {
        query = 'SELECT EMA.SIGNAL_NAME, DBMS_LOB.substr(EMA.SIGNAL_CONTENT, 3000) AS SIGNAL_CONTENT, EMA.EVENT_MTCH_DEF_ID, EMA.EVENT_MTCH_VERSION, EMA.EVENT_MTCH_INST_ID, EVL.EVENT_ACTION_SCOPE, EVL.NAME, EVL.LISTENER_ID, EVL.API_VERSION, PI.DEPLOYMENTID AS INSTANCEDEPLOYMENTID ';
        query += 'FROM "ACTIVITYDB"."EVENT_MATCH_CRITERIA" EMC INNER JOIN "ACTIVITYDB"."AM_EVENTLISTENER" EVL ON EVL.EVENT_MTCH_CRITERIA_ID = EMC.ID INNER JOIN "ACTIVITYDB"."EVENT_MATCH_ACTION" EMA ON EVL.EVENT_MTCH_ACTION_ID = EMA.ID LEFT JOIN "ACTIVITYDB"."AM_PROCESSINSTANCE" PI ON EMA.EVENT_MTCH_INST_ID = PI.PROCESSINSTANCEID ';
        query += 'WHERE EMC.ID IN (SELECT CID FROM (SELECT CID, COUNT(CID) AS ACTUAL_COUNT, (SELECT COUNT(*) FROM activitydb.SIMPLE_MATCH SM0 WHERE SM0.EVENT_MTCH_CRI_ID = CID) AS MAX_COUNT FROM (';

        for (var i = 0; i < simpleMatchFields.length; i++) {
            if (i > 0) {
                query += ' UNION ALL ';
            }

            query += 'SELECT DISTINCT SM.EVENT_MTCH_CRI_ID AS CID FROM activitydb.SIMPLE_MATCH SM WHERE LOWER(SM.MATCHFIELD) = ';

            if(simpleMatchFields[i]) {
                query += ':matchfld' + (i+1);
                bindVars.push(simpleMatchFields[i].toLowerCase());
            } else {
                query += 'null';
            }

            query += ' AND (\',\' || RTRIM(LOWER(SM.MATCHVALUE)) || \',\') LIKE ';

            if(simpleMatchValues[i]) {
                bindVars.push(simpleMatchValues[i].toLowerCase());
                query += '\'%,\'||:matchval' + (i+1) + '||\',%\'';
            } else {
                query += 'null';
            }
        }
        query += ') GROUP BY CID)';
        query += ' WHERE ACTUAL_COUNT = MAX_COUNT';
        query += ')';
    } else {
        var matchError = new Error('202 - Invalid request body');
        req.logger.error(matchError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(matchError.message);
    }

    req.logger.debug('activity-event-process-resource:startActivityEvent matchQuery %s', query);

    var cb = function(err, rawQueryResponse) {
        if (err) {
            req.logger.error(err);
            var status;
            if (err instanceof activityDb.ConnectionError) {
                status = rdk.httpstatus.service_unavailable;
                err.message = '101 - ' + err.message;
            } else {
                status = rdk.httpstatus.internal_server_error;
                err.message = '203 - ' + err.message;
            }
            return res.status(status).rdkSend(err);
        }

        if (_.size(rawQueryResponse) === 0) {
            return res.status(rdk.httpstatus.ok).rdkSend('No matches');
        } else {
            req.logger.trace('rawQueryResponse', rawQueryResponse);
        }

        var getProcessDefinitions;
        if (_.keys(processDefinitionsCache).length === 0) {
            //fill cache of deployments if does not exist
            req.logger.trace('Pulling deployments from JBPM');
            getProcessDefinitions = function(dpCallback) {
                activitiesResource.doProcessDefinitionsFetch(activitiesResource.getDefinitionsFetchConfig(req), function(err, formattedResponse) {
                    if (err) {
                        err.message = '102 - ' + err.message;
                        req.logger.error(err);
                        processDefinitionsCache = {};
                        return dpCallback(err);
                    }
                    processDefinitionsCache = formattedResponse;
                    req.logger.trace('Got deployments from JBPM', processDefinitionsCache.data.items);
                    return dpCallback(null, processDefinitionsCache, rawQueryResponse, req.logger);
                });
            };

        } else {
            //use cached deployments to lookup correct IDs
            req.logger.trace('Using cached deployments', processDefinitionsCache.data.items);
            getProcessDefinitions = function(dpCallback) {
                return dpCallback(null, processDefinitionsCache, rawQueryResponse, req.logger);
            };
        }

        async.waterfall([getProcessDefinitions, fillInDefinitions], function(deploymentsErr, queryResponse) {
            if (deploymentsErr) {
                return req.logger.error(deploymentsErr);
            }

            var asyncObject = {};

            req.logger.trace('queryResponse after applying JBPM deployment data:', queryResponse);

            _.each(queryResponse, function(eventListener) {
                var dataError;
                var asyncObjectKey = eventListener.LISTENER_ID + ':' + eventListener.NAME;
                var action = eventListener.EVENT_ACTION_SCOPE.toLowerCase();
                var deploymentId = eventListener.INSTANCEDEPLOYMENTID || eventListener.DEPLOYMENTID; //prioritize the deployment ID from the specific process instance if available
                var processDefId = eventListener.PROCESSDEFINITIONID;
                var processInstanceId = eventListener.EVENT_MTCH_INST_ID || -1; //when no instance ID is specified, it will signal the entire process
                if (action === 'instantiation') {
                    var createAsyncProcess;
                    //Check if this is an instantiation signal (eg:labs)
                    if (nullchecker.isNotNullish(eventListener.SIGNAL_CONTENT) && nullchecker.isNotNullish(eventListener.SIGNAL_NAME)) {

                        var instantiationSignalContent;
                        var instantiationSignalName = eventListener.SIGNAL_NAME;

                        if (nullchecker.isNotNullish(eventListener.LISTENER_ID)) {
                            instantiationSignalContent = applyTemplate(eventListener.SIGNAL_CONTENT, rawEventRequest);

                            try {
                                instantiationSignalContent = JSON.parse(instantiationSignalContent);
                            } catch (e) {
                                dataError = e;
                                dataError.message = '204 - ' + e.message;
                            }

                        } else if (!dataError) {
                            dataError = new Error('205 - Unable to find required instantiation signal field: LISTENER_ID');
                        }

                        if (nullchecker.isNotNullish(instantiationSignalContent) && nullchecker.isNotNullish(deploymentId) && nullchecker.isNotNullish(processInstanceId) && !dataError) {
                            //we must pass a listener ID for instantiation signals so that they can write back to processed_event_state
                            if (instantiationSignalContent.hasOwnProperty('param') && typeof instantiationSignalContent.param === 'object') { //'param' key is required for all activity signals
                                instantiationSignalContent.param.listenerId = eventListener.LISTENER_ID + '';
                            }

                            var createAsyncInstantiationSignal = function(asyncCallback) {

                                //check processed_event_state to make sure it hasn't already been done
                                checkIfInstantiated(eventListener.LISTENER_ID, eventRequest, req.logger, activityDatabaseConfig, function(err, isInsantiated) {
                                    if (err) {
                                        if (err instanceof activityDb.ConnectionError) {
                                            err.message = '103 - ' + err.message;
                                        } else {
                                            err.message = '206 - ' + err.message;
                                        }
                                        return asyncCallback(err);
                                    }

                                    if (isInsantiated) {
                                        return asyncCallback(null, 'Already instantiated');
                                    } else {
                                        var signalCallback = function(err, signalResult) {
                                            if (err) {
                                                err.message = '104 - ' + err.message;
                                                return asyncCallback(err);
                                            }

                                            return asyncCallback(null, signalResult);
                                        };

                                        req.logger.trace('instantiationSignalContent', instantiationSignalContent);
                                        req.logger.trace('instantiationSignalName', instantiationSignalName);

                                        //do signal
                                        activitiesResource.doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, instantiationSignalName, instantiationSignalContent, signalCallback);
                                    }
                                });

                            };

                            asyncObject[asyncObjectKey] = createAsyncInstantiationSignal;

                        } else if (!dataError) {
                            dataError = new Error('207 - Missing required instantiation signal field(s)');
                        }
                    } else {
                        //Create a process if one not already created

                        if (!eventRequest.hasOwnProperty('listenerId') && nullchecker.isNotNullish(eventListener.LISTENER_ID)) {
                            //we must pass a listener ID for instantiated processes so that they can write back to processed_event_state
                            eventRequest.listenerId = eventListener.LISTENER_ID + '';

                            createAsyncProcess = function(asyncCallback) {

                                //check processed_event_state to make sure it hasn't already been done
                                checkIfInstantiated(eventListener.LISTENER_ID, _.get(eventRequest, 'uid') || null, req.logger, activityDatabaseConfig, function(err, isInsantiated) {
                                    if (err) {
                                        return asyncCallback(err);
                                    }

                                    if (isInsantiated) {
                                        return asyncCallback(null, 'Already instantiated');
                                    } else {
                                        activitiesResource.doStartProcess(getGenericJbpmConfig(req), deploymentId, processDefId, eventRequest, function(err, response) {
                                            if (err) {
                                                err.message = '104 - ' + err.message;
                                                return asyncCallback(err);
                                            }

                                            return asyncCallback(null, response);
                                        });
                                    }
                                });
                            };

                            asyncObject[asyncObjectKey] = createAsyncProcess;

                        } else if (!dataError) {
                            dataError = new Error('207 - Missing required process instantiation field: LISTENER_ID');
                        }
                    }

                } else if (action === 'signaling') {
                    //Signal a process
                    var signalContent = applyTemplate(eventListener.SIGNAL_CONTENT, rawEventRequest);
                    try {
                        signalContent = JSON.parse(signalContent);
                    } catch (e) {
                        dataError = e;
                    }

                    var signalName = eventListener.SIGNAL_NAME;

                    if (nullchecker.isNotNullish(signalName) && nullchecker.isNotNullish(deploymentId) && nullchecker.isNotNullish(processInstanceId) && !dataError) {
                        if (nullchecker.isNotNullish(signalContent)) {
                            //use signalContent from database
                            var createAsyncSignal = function(asyncCallback) {

                                var signalCallback = function(err, signalResult) {
                                    if (err) {
                                        return asyncCallback(err);
                                    }

                                    return asyncCallback(null, signalResult);
                                };

                                //do signal
                                activitiesResource.doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, signalName, signalContent, signalCallback);
                            };

                            asyncObject[asyncObjectKey] = createAsyncSignal;
                        } else {
                            //signal with raw passed in JSON
                            var createAsyncRawSignal = function(asyncCallback) {

                                var signalCallback = function(err, signalResult) {
                                    if (err) {
                                        err.message = '104 - ' + err.message;
                                        return asyncCallback(err);
                                    }
                                    return asyncCallback(null, signalResult);
                                };

                                //do signal
                                activitiesResource.doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, signalName, rawEventRequest, signalCallback);
                            };

                            asyncObject[asyncObjectKey] = createAsyncRawSignal;
                        }
                    } else if (!dataError) {
                        dataError = new Error('207 - Missing required signal field(s)');
                    }
                } else if (action === 'all') {
                    //No idea what this is supposed to do...
                    dataError = new Error('208 - Unimplemented EVENT_ACTION_SCOPE value');
                } else {
                    dataError = new Error('209 - Invalid EVENT_ACTION_SCOPE value');
                }

                if (dataError) {
                    req.logger.error(dataError);
                    return res.status(rdk.httpstatus.bad_request).rdkSend(dataError);
                }
            });

            async.parallelLimit(asyncObject, 5, function(err, asyncResults) {
                if (err) {
                    req.logger.error(err);
                    return res.status(rdk.httpstatus.bad_request).rdkSend(err);
                }
                return res.status(rdk.httpstatus.ok).rdkSend(asyncResults);
            });

        });
    };

    activityDb.doQueryWithParams(req, activityDatabaseConfig, query, bindVars, cb);
}

function flattenAndFilter(eventRequest) {
    //flatten : http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
    //
    //This method will flatten the key values in an eventRequest for matching against the simple_match table
    //such that an object like {foo:{bar:false}} in eventRequest would be transformed to {"foo.bar":false}
    //
    //The flattened values would then be matched against the allowable fields of an eventRequest in the
    //global matchables array and return a filtered list for inclusion in the subsequent database query

    var result = {};

    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++) {
                recurse(cur[i], prop + '[' + i + ']');
            }
            if (l === 0) {
                result[prop] = [];
            }
        } else {
            var isEmpty = true;
            for (var p in cur) {
                if (cur.hasOwnProperty(p)) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop + '.' + p : p);
                }
            }
            if (isEmpty && prop) {
                result[prop] = {};
            }
        }
    }
    recurse(eventRequest, '');

    return _.pick(result, matchables);
}

function getFormattedPastDate(rule) {
    var formattedPastDate = '';
    var timeInterval = '';
    var timeIntervalSplit = [];
    var today = '';
    var pastDate = '';
    var firstSlashIndex = rule.indexOf('\'');
    var dateString = rule.substring((firstSlashIndex + 1), rule.indexOf('\'', (firstSlashIndex + 1)));

    switch (dateString) {
        case 'ONE_DAY_AGO':
            timeInterval = '1_days';
            break;
        case 'TWO_DAYS_AGO':
            timeInterval = '2_days';
            break;
        case 'THREE_DAYS_AGO':
            timeInterval = '3_days';
            break;
        case 'FOUR_DAYS_AGO':
            timeInterval = '4_days';
            break;
        case 'FIVE_DAYS_AGO':
            timeInterval = '5_days';
            break;
        case 'SIX_DAYS_AGO':
            timeInterval = '6_days';
            break;
        case 'ONE_WEEK_AGO':
            timeInterval = '1_weeks';
            break;
        case 'TWO_WEEKS_AGO':
            timeInterval = '2_weeks';
            break;
        case 'THREE_WEEKS_AGO':
            timeInterval = '3_weeks';
            break;
        case 'FOUR_WEEKS_AGO':
            timeInterval = '4_weeks';
            break;
        case 'ONE_MONTH_AGO':
            timeInterval = '1_months';
            break;
        case 'TWO_MONTHS_AGO':
            timeInterval = '2_months';
            break;
        case 'THREE_MONTHS_AGO':
            timeInterval = '3_months';
            break;
    }

    timeIntervalSplit = timeInterval.split('_');

    today = moment();
    pastDate = today.add(('-' + timeIntervalSplit[0]), timeIntervalSplit[1]);
    formattedPastDate = moment(pastDate).format('YYYYMMDDHHmmss');

    return formattedPastDate;
}

function applyTemplate(signalContent, source) {
    var result;
    if (!source.hasOwnProperty('RAW_REQUEST')) {
        source.RAW_REQUEST = _.cloneDeep(source);
    }

    try {
        var template = handlebars.compile(signalContent);
        result = template(source);
    } catch (e) {
        result = signalContent;
    }

    return result;
}

function checkIfInstantiated(listenerId, eventRequest, logger, dbConfig, cb) {
    logger.trace({
        'listenerId': listenerId,
        'eventRequest': eventRequest
    }, 'activity-event-process-resource:checkIfInstantiated');

    if (nullchecker.isNotNullish(listenerId) && !_.isEmpty(eventRequest)) {
        var dataLocations = [];
        var dataValues = [];
        _.each(eventRequest, function(value, key) {
            if (nullchecker.isNotNullish(key) && nullchecker.isNotNullish(value)) {
                dataLocations.push(key);
                dataValues.push(value);
            }
        });

        var instanceQuery = 'SELECT 1 FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE" PES WHERE PES.LISTENER_ID = :listenerId AND (';
        var queryParams = [listenerId];

        for (var i = 0; i < dataLocations.length; i++) {
            if (i > 0) {
                instanceQuery += ' OR ';
            }
            instanceQuery += '(PES.DATA_LOCATION = :data_location_' + i + ' AND PES.VALUE = :data_location_value_' + i + ')';
            queryParams.push(dataLocations[i]);
            queryParams.push(dataValues[i]);
        }

        instanceQuery += ')';

        logger.debug('activity-event-process-resource:checkIfInstantiated taskQuery %s', instanceQuery);
        activityDb.doQueryWithParamsLogger(logger, dbConfig, instanceQuery, queryParams, function(err, results) {
            if (err) {
                logger.error(err);
                return cb(err);
            }

            if (results && results.length > 0) {
                return cb(null, true);
            }

            return cb(null, false);
        });
    } else {
        return cb(null, false); //if does not exist
    }
}

module.exports.startActivityEvent = startActivityEvent;
module.exports._applyTemplate = applyTemplate;
module.exports.versionCompare = versionCompare;
module.exports.getFormattedPastDate = getFormattedPastDate;
