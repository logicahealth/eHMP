'use strict';

var rdk = require('../../../../core/rdk');
var activitiesResource = require('../activities-operations-resource');
var _ = require('lodash');
var getGenericJbpmConfigByUser = require('../../activity-utils').getGenericJbpmConfigByUser;
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var activityDb = require('../../../../subsystems/jbpm/jbpm-subsystem');
var handlebars = require('handlebars').create();
var versionCompare = require('./../../../../utils/version-compare').versionCompare;

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

var matchables = ['domain', 'subDomain', 'referenceId', 'data.statusCode', 'data.deceased', 'pid'];

//mock session data values required to authenticate to JBPM
var aepSiteValue = 'site';
var aepUserValue = 'aep_user';

var processDefinitionsCache = {};

module.exports.fillInDefinitions = function fillInDefinitions(formattedResponse, queryResponse, logger, callback) {
    logger.debug({
            JbpmResponseData: _.get(formattedResponse, 'data.items'),
            queryResponse: queryResponse
        },
        'activity-event-process-resource:fillInDefinitions interpolating values');

    _.each(queryResponse, function(activity) {
        activity.validVersions = [];

        if (activity.hasOwnProperty('EVENT_MTCH_DEF_ID') && activity.hasOwnProperty('EVENT_MTCH_VERSION')) {
            _.each(_.get(formattedResponse, 'data.items', []), function(responseItem) {

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
        } else {
            if (!activity.hasOwnProperty('validVersions') || activity.validVersions.length === 0) {
                logger.warn({
                    activity: activity
                }, 'activity-event-process-resource:fillInDefinitions Unable to find valid versions for activity');
            }
        }

    });

    logger.debug({
        returnObject: queryResponse
    }, 'fillInDefinitions returning');
    callback(null, queryResponse);
};

function startActivityEvent(rawEventRequest, logger, config, activityEventCallback) {

    if (rawEventRequest === null || typeof rawEventRequest !== 'object') {
        var reqError = new Error('201 - Invalid request body');
        logger.debug(reqError);
        return activityEventCallback(reqError.message);
    }

    var activityDatabaseConfig = _.get(config, 'oracledb.activityDatabase', null);
    if (!activityDatabaseConfig || typeof activityDatabaseConfig !== 'object' || !activityDatabaseConfig.hasOwnProperty('user') || !activityDatabaseConfig.hasOwnProperty('password') || !activityDatabaseConfig.hasOwnProperty('connectString')) {
        var configError = new Error('210 - Invalid request configuration');
        logger.debug(configError);
        return activityEventCallback(configError.message);
    }

    logger.debug({
        rawEventRequest: rawEventRequest
    }, 'activity-event-process-resource:startActivityEvent Received raw event request');

    var eventRequest = flattenAndFilter(rawEventRequest);

    if (_.size(eventRequest) === 0) {
        logger.debug('activity-event-process-resource:startActivityEvent After filtering, event processor found no fields to match on. Returning No matches');
        return activityEventCallback(null, {}); //No matches
    }

    var simpleMatchFields = [];
    var simpleMatchValues = [];
    _.each(eventRequest, function(value, key) {
        if (nullchecker.isNotNullish(key)) {
            simpleMatchFields.push(key);
            simpleMatchValues.push(value);
        }
    });

    var query;
    var bindVars = [];

    if (simpleMatchFields.length > 0 && simpleMatchFields.length === simpleMatchValues.length) {
        var queryGenerationResult = generateMatchQuery(simpleMatchFields, simpleMatchValues);
        query = queryGenerationResult.query;
        bindVars = queryGenerationResult.bindVars;
    } else {
        var matchError = new Error('202 - Invalid request body');
        logger.error(matchError);
        return activityEventCallback(matchError.message);
    }

    logger.debug({
        query: query,
        bindVars: bindVars
    }, 'activity-event-process-resource:startActivityEvent matchQuery');

    var cb = function(err, rawQueryResponse) {
        if (err) {
            if (err instanceof activityDb.ConnectionError) {
                err.message = '101 - ' + err.message;
            } else {
                err.message = '203 - ' + err.message;
            }
            logger.error(err);
            return activityEventCallback(err.message);
        }

        if (_.size(rawQueryResponse) === 0) {
            logger.debug('activity-event-process-resource:startActivityEvent matchQuery did not find any matching criteria');
            return activityEventCallback(null, {}); //No matches
        } else {
            logger.debug({
                rawQueryResponse: rawQueryResponse
            }, 'activity-event-process-resource:startActivityEvent Query response from matchQuery');
        }

        var getProcessDefinitions;
        if (_.keys(processDefinitionsCache).length === 0) {
            //fill cache of deployments if does not exist
            logger.debug('activity-event-process-resource:startActivityEvent Pulling deployments from JBPM');
            getProcessDefinitions = function(dpCallback) {
                activitiesResource.doProcessDefinitionsFetch(activitiesResource.getDefinitionsFetchConfigByUser(config, aepSiteValue, aepUserValue, logger, null), function(err, formattedResponse) {
                    if (err) {
                        processDefinitionsCache = {};
                        err.message = '102 - ' + err.message;
                        logger.error(err);
                        return dpCallback(err);
                    }
                    processDefinitionsCache = formattedResponse;
                    logger.debug({
                        deployments: _.get(processDefinitionsCache, 'data.items')
                    }, 'activity-event-process-resource:startActivityEvent Retrieved deployments from JBPM');
                    return dpCallback(null, processDefinitionsCache, rawQueryResponse, logger);
                });
            };

        } else {
            //use cached deployments to lookup correct IDs
            logger.debug({
                deployments: _.get(processDefinitionsCache, 'data.items')
            }, 'activity-event-process-resource:startActivityEvent Using cached JBPM deployments');
            getProcessDefinitions = function(dpCallback) {
                return dpCallback(null, processDefinitionsCache, rawQueryResponse, logger);
            };
        }

        async.waterfall([getProcessDefinitions, exports.fillInDefinitions], function(deploymentsErr, fullDeploymentDetails) {
            if (deploymentsErr) {
                logger.error(deploymentsErr);
                return activityEventCallback(deploymentsErr.message);
            }

            var asyncObject = {};

            logger.debug({
                fullDeploymentDetails: fullDeploymentDetails
            }, 'activity-event-process-resource:startActivityEvent fullDeploymentDetails after interpolating JBPM deployment data to matchQuery results');

            _.each(fullDeploymentDetails, function(eventListener) {
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
                                exports.checkIfInstantiated(eventListener.LISTENER_ID, eventRequest, logger, activityDatabaseConfig, function(err, isInstantiated) {
                                    if (err) {
                                        if (err instanceof activityDb.ConnectionError) {
                                            err.message = '103 - ' + err.message;
                                        } else {
                                            err.message = '206 - ' + err.message;
                                        }
                                        return asyncCallback(err);
                                    }

                                    if (isInstantiated) {
                                        return asyncCallback(null, 'Already instantiated');
                                    } else {
                                        var signalCallback = function(err, signalResult) {
                                            if (err) {
                                                err.message = '104 - ' + err.message;
                                                return asyncCallback(err);
                                            }

                                            return asyncCallback(null, signalResult);
                                        };

                                        logger.debug({
                                            signalName: instantiationSignalName,
                                            signalContent: instantiationSignalContent
                                        }, 'activity-event-process-resource:startActivityEvent Instantiation signal details');

                                        //do signal
                                        activitiesResource.doSignal(getGenericJbpmConfigByUser(config, aepSiteValue, aepUserValue, logger), deploymentId, processInstanceId, instantiationSignalName, instantiationSignalContent, signalCallback);
                                    }
                                });

                            };

                            asyncObject[asyncObjectKey] = createAsyncInstantiationSignal;

                        } else if (!dataError) {
                            dataError = new Error('207 - Missing required instantiation signal field(s)');
                        }
                    } else {
                        //Create a process if one not already created - not via a signal

                        if (nullchecker.isNotNullish(eventListener.LISTENER_ID)) {
                            //we must pass a listener ID for instantiated processes so that they can write back to processed_event_state
                            rawEventRequest.listenerId = eventListener.LISTENER_ID + '';

                            //make sure we have other required fields
                            if (nullchecker.isNotNullish(deploymentId) && nullchecker.isNotNullish(processInstanceId) && !dataError) {

                                createAsyncProcess = function(asyncCallback) {

                                    //check processed_event_state to make sure it hasn't already been done
                                    exports.checkIfInstantiated(eventListener.LISTENER_ID, eventRequest, logger, activityDatabaseConfig, function(err, isInsantiated) {
                                        if (err) {
                                            return asyncCallback(err);
                                        }

                                        if (isInsantiated) {
                                            return asyncCallback(null, 'Already instantiated');
                                        } else {
                                            var finalEventRequest = wrapEventForInstantiation(deploymentId, processDefId, rawEventRequest, logger);
                                            activitiesResource.doStartProcess(getGenericJbpmConfigByUser(config, aepSiteValue, aepUserValue, logger), deploymentId, processDefId, finalEventRequest, function(err, response) {
                                                if (err) {
                                                    return asyncCallback(new Error('104 - ' + (err.message ? err.message : err)));
                                                }

                                                return asyncCallback(null, response);
                                            });
                                        }
                                    });
                                };

                                asyncObject[asyncObjectKey] = createAsyncProcess;
                            } else if (!dataError) {
                                dataError = new Error('207 - Missing required process instantiation fields: PROCESSDEFINITIONID or DEPLOYMENTID');
                            }

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
                                activitiesResource.doSignal(getGenericJbpmConfigByUser(config, aepSiteValue, aepUserValue, logger), deploymentId, processInstanceId, signalName, signalContent, signalCallback);
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
                                activitiesResource.doSignal(getGenericJbpmConfigByUser(config, aepSiteValue, aepUserValue, logger), deploymentId, processInstanceId, signalName, rawEventRequest, signalCallback);
                            };

                            asyncObject[asyncObjectKey] = createAsyncRawSignal;
                        }
                    } else if (!dataError) {
                        dataError = new Error('207 - Missing required signal field(s)');
                    }
                } else if (action === 'all') {
                    //Not yet needed or implemented
                    dataError = new Error('208 - Unimplemented EVENT_ACTION_SCOPE value');
                } else {
                    dataError = new Error('209 - Invalid EVENT_ACTION_SCOPE value');
                }

                if (dataError) {
                    logger.error(dataError);
                    return activityEventCallback(dataError.message);
                }
            });

            async.parallelLimit(asyncObject, 5, function(err, asyncResults) {
                if (err) {
                    logger.error(err);
                    return activityEventCallback(err.message);
                }
                return activityEventCallback(null, asyncResults);
            });

        });
    };

    activityDb.doQueryWithParamsLogger(logger, activityDatabaseConfig, query, bindVars, cb);
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

module.exports.checkIfInstantiated = function(listenerId, eventRequest, logger, dbConfig, cb) {
    logger.debug({
        'listenerId': listenerId,
        'eventRequest': eventRequest
    }, 'activity-event-process-resource:checkIfInstantiated start');

    if (nullchecker.isNotNullish(listenerId) && !_.isEmpty(eventRequest)) {
        var dataLocations = [];
        var dataValues = [];
        var isDischargeEvent = false;
        var domainCheckFlag = 0;
        var siteDfn = '';
        _.each(eventRequest, function(value, key) {
            if (nullchecker.isNotNullish(key) && nullchecker.isNotNullish(value)) {
                dataLocations.push(key);
                if (_.isBoolean(value)) {
                    dataValues.push(value.toString());
                } else {
                    dataValues.push(value);
                }
                if ((key === 'domain' && value === 'ehmp-activity') || (key === 'subDomain' && value === 'discharge'))  {
                    domainCheckFlag++;
                } else if (key === 'referenceId') {
                    var refIdArr = value.split(':');
                    siteDfn = refIdArr[3]+';'+refIdArr[4];
                }
            }
        });
        isDischargeEvent = (domainCheckFlag >= 2);

        var instanceQuery;
        var queryParams = [];
        if (isDischargeEvent) {
            //US18848-VistA sends a referenceId for the Discharge event that is formed by concating site,patientIEN, and location.
            //Storing this identifier in the PROCESSED_EVENT_STATE table will prevent any future discharge event
            //from ever being created for this patient from this site and location. Additionally, this will not prevent simultanous discharges from being
            //created for this patient from a different site or location. Checking AM_PROCESSINSTANCE table for Open Discharge activities
            //for this patient will ensure that no duplicate Discharges will be created for this patient.
            queryParams = [siteDfn];
            instanceQuery = 'SELECT DISTINCT 1 FROM ACTIVITYDB.AM_PROCESSINSTANCE AP WHERE AP.PID = :siteDfn AND AP.PROCESSDEFINITIONID=\'Order.DischargeFollowup\' AND AP.STATUSID IN (1,4)';
        } else {
            instanceQuery = 'SELECT 1 FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE" PES WHERE PES.LISTENER_ID = :listenerId AND (';
            queryParams = [listenerId];

            for (var i = 0; i < dataLocations.length; i++) {
                if (i > 0) {
                    instanceQuery += ' OR ';
                }
                instanceQuery += '(PES.DATA_LOCATION = :data_location_' + i + ' AND PES.VALUE = :data_location_value_' + i + ')';
                queryParams.push(dataLocations[i]);
                queryParams.push(dataValues[i]);
            }

            instanceQuery += ')';
        }

        logger.debug({
            instanceQuery: instanceQuery,
            queryParams: queryParams
        }, 'activity-event-process-resource:checkIfInstantiated instanceQuery');
        activityDb.doQueryWithParamsLogger(logger, dbConfig, instanceQuery, queryParams, function(err, results) {
            if (err) {
                logger.error(err);
                return cb(err);
            }

            if (results && results.length > 0) {
                logger.debug('activity-event-process-resource:checkIfInstantiated returning true');
                return cb(null, true);
            }

            logger.debug('activity-event-process-resource:checkIfInstantiated returning false');
            return cb(null, false);
        });
    } else {
        logger.debug('activity-event-process-resource:checkIfInstantiated empty listenerId or event to check - returning error');
        return cb(new Error('Instantiation check was unable to run due to invalid parameters'));
    }
};


/**
 * This function is intended to wrap and alter a clinicalObject-like object with the data elements required to instantiate a process via the /execute JBPM endpoint
 * This is required because of the way deserialization in JBPM occurs: a parameter object must be passed that contains the "complex" nested object, and the complex
 * object that is passed must correspond to a class that is to be used for deserialization
 *
 * @param {String} deploymentId
 * @param {String} processDefId
 * @param {Object} event The clinicalObject-like event object to be wrapped
 * @param {Object} logger
 * @returns {Object} A wrapped version of the object
 */
function wrapEventForInstantiation(deploymentId, processDefId, event, logger) {
    if (!_.isObject(event)) {
        logger.warn({
            event: event
        }, 'activity-event-process-resource:wrapEventForInstantiation Invalid event object  - returning empty object');
        return {};
    }

    var wrappedObject = _.cloneDeep(event);
    delete wrappedObject.listenerId;

    if (!_.isString(deploymentId)) {
        logger.warn({
            deploymentId: deploymentId
        }, 'activity-event-process-resource:wrapEventForInstantiation Invalid deploymentId value set for activity instantiation object');
    }

    if (!_.isString(processDefId)) {
        logger.warn({
            processDefId: processDefId
        }, 'activity-event-process-resource:wrapEventForInstantiation Invalid processDefId value set for activity instantiation object');
    }

    var subDomain = _.get(wrappedObject, 'subDomain');
    var deserializerClass;
    switch (subDomain) {
        case 'discharge':
            deserializerClass = 'dischargeFollowup';
            break;
        default:
            logger.info({
                subDomain: subDomain
            }, 'activity-event-process-resource:wrapEventForInstantiation defaulting objectType to subDomain');
            deserializerClass = subDomain;
    }

    wrappedObject.objectType = deserializerClass;

    var returnObject = {};
    returnObject.deploymentId = deploymentId;
    returnObject.processDefId = processDefId;
    var eventPid = _.get(wrappedObject, 'pid');
    returnObject.pid = eventPid;
    if (!_.isString(eventPid)) {
        logger.warn({
            pid: eventPid
        }, 'activity-event-process-resource:wrapEventForInstantiation Invalid pid value set for activity instantiation object');
    }

    returnObject[deserializerClass] = wrappedObject;

    return returnObject;
}

/**
 * Takes in corresponding arrays of fields and values and returns a query and ordered list of variables to bind to that query
 * that can be used to check whether an activity handler message matches to an event described in the activityDB
 *
 * @param {Array} simpleMatchFields a non-empty ordered array of field names such as ['domain', 'subDomain']
 * @param {Array} simpleMatchValues a non-empty ordered array of corresponding field values such as ['ehmp-order', 'laboratory']
 * @returns {Object} an object with properties query and bindVars
 */
function generateMatchQuery(simpleMatchFields, simpleMatchValues) {
    var bindVars = [];
    var bindVarIndex;
    var query = 'SELECT EMA.SIGNAL_NAME, DBMS_LOB.substr(EMA.SIGNAL_CONTENT, 3000) AS SIGNAL_CONTENT, EMA.EVENT_MTCH_DEF_ID, EMA.EVENT_MTCH_VERSION, EMA.EVENT_MTCH_INST_ID, EVL.EVENT_ACTION_SCOPE, EVL.NAME, EVL.LISTENER_ID, EVL.API_VERSION, PI.DEPLOYMENTID AS INSTANCEDEPLOYMENTID ';
    query += 'FROM "ACTIVITYDB"."EVENT_MATCH_CRITERIA" EMC INNER JOIN "ACTIVITYDB"."AM_EVENTLISTENER" EVL ON EVL.EVENT_MTCH_CRITERIA_ID = EMC.ID INNER JOIN "ACTIVITYDB"."EVENT_MATCH_ACTION" EMA ON EVL.EVENT_MTCH_ACTION_ID = EMA.ID LEFT JOIN "ACTIVITYDB"."AM_PROCESSINSTANCE" PI ON EMA.EVENT_MTCH_INST_ID = PI.PROCESSINSTANCEID ';
    query += 'WHERE EMC.ID IN (SELECT CID FROM (SELECT CID, COUNT(CID) AS ACTUAL_COUNT, (SELECT COUNT(*) FROM activitydb.SIMPLE_MATCH SM0 WHERE SM0.EVENT_MTCH_CRI_ID = CID) AS MAX_COUNT FROM (';

    for (var i = 0; i < simpleMatchFields.length; i++) {
        bindVarIndex = i + 1;
        if (i > 0) {
            query += ' UNION ALL ';
        }

        query += 'SELECT DISTINCT SM.EVENT_MTCH_CRI_ID AS CID FROM activitydb.SIMPLE_MATCH SM JOIN activitydb.SIMPLE_MATCH_VALUE SMV ON SMV.SIMPLE_MATCH_ID = SM.ID WHERE LOWER(SM.MATCHFIELD) = ';

        if (_.isString(simpleMatchFields[i]) && !_.isEmpty(simpleMatchFields[i])) {
            query += ':matchfld' + bindVarIndex;
            bindVars.push(simpleMatchFields[i].toLowerCase());
        } else {
            query += 'null';
        }

        query += ' AND SMV.MATCHVALUE = ';

        if (_.isString(simpleMatchValues[i]) && !_.isEmpty(simpleMatchValues[i])) {
            bindVars.push(simpleMatchValues[i].toLowerCase());
            query += ':matchval' + bindVarIndex;
        } else if (_.isBoolean(simpleMatchValues[i])) {
            bindVars.push(simpleMatchValues[i].toString());
            query += ':matchval' + bindVarIndex;
        } else {
            query += 'null';
        }
    }
    query += ') GROUP BY CID)';
    query += ' WHERE ACTUAL_COUNT = MAX_COUNT';
    query += ')';


    return {
        query: query,
        bindVars: bindVars
    };
}

module.exports.startActivityEvent = startActivityEvent;
module.exports._applyTemplate = applyTemplate;
module.exports._flattenAndFilter = flattenAndFilter;
module.exports._generateMatchQuery = generateMatchQuery;
module.exports.wrapEventForInstantiation = wrapEventForInstantiation;
