'use strict';
var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var parseString = require('xml2js').parseString;
var async = require('async');
var activityUtils = require('../activity-utils');
var processJsonObject = activityUtils.processJsonObject;
var processValue = activityUtils.processValue;
var wrapValueInCData = activityUtils.wrapValueInCData;
var getGenericJbpmConfig = activityUtils.getGenericJbpmConfig;
var getGenericJbpmConfigByUser = activityUtils.getGenericJbpmConfigByUser;
var nullchecker = rdk.utils.nullchecker;
var xmlTemplates = activityUtils.xmlTemplates;
var activityMockQuery = require('./activity-query-service-mock');
var versionCompare = require('./../../../utils/version-compare').versionCompare;
var RdkError = rdk.utils.RdkError;

JBPMServerError.prototype = Error.prototype;

//wrapper for activity definitions
//decide which function to call based on parameters
function getActivities(req, res) {
    if (req.query.siteCode || req.query.testIen || req.query.type) {
        return getActivityDefinitionsByQuery(req, res);
    } else {
        return getProcessDefinitions(req, res);
    }
}

function doStartProcess(config, deploymentId, processDefId, parameters, processCallback) {

    var uri = uriBuilder.fromUri(config.url)
        .path('/execute')
        .build();

    config.url = uri;
    if (!config.headers) {
        config.headers = {};
    }

    config.headers['Content-Type'] = 'application/xml';
    config.headers.Accept = 'application/xml';
    config.headers['Kie-Deployment-Id'] = deploymentId;

    async.parallel([
            function(callback) {
                var startProcessCommandTemplateXML = xmlTemplates.startProcessCommandTemplate;
                var startProcessCommandXML = startProcessCommandTemplateXML.replace('{DeploymentId}', deploymentId).replace('{ProcessId}', processDefId);
                callback(null, startProcessCommandXML);
            },
            function(callback) {
                var processParametersXML = '';
                var itemsList = '';
                if (parameters) {
                    var primitiveTypeXML = xmlTemplates.parameterTemplate;
                    var complexObjectXML = xmlTemplates.complexObjectTemplate;
                    var complexObjectPropertiesXML = xmlTemplates.complexObjectPropertiesXML;
                    var complexArrayedObjectPropertiesXML = xmlTemplates.complexArrayedObjectPropertiesXML;

                    _.each(parameters, function(value, key) {
                        var type = typeof value;

                        //**** Parent Container Object
                        if (type === 'object') {
                            var objectItems = value;
                            processParametersXML = processParametersXML + complexObjectXML.replace('{Key}', key);
                            _.each(objectItems, function(value, key) {
                                type = typeof value;
                                //the key objectType should match the class name in jbpm starting with a small letter.
                                if (key === 'objectType') {
                                    processParametersXML = processParametersXML.replace('{Type}', value);
                                } else {
                                    if (type === 'object') {
                                        var id = 0;
                                        if (value !== null && value.constructor === Array) {
                                            for (var i = 0; i < value.length; i++) {
                                                id = i + 1;
                                                itemsList = itemsList + complexArrayedObjectPropertiesXML.replace(/{Key}/g, key).replace(/{ID}/, id).replace('{Value}', processValue(value[i]));
                                            }
                                        } else {
                                            itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value));
                                        }
                                    } else {
                                        itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', wrapValueInCData(value));
                                    }
                                }
                            });
                            processParametersXML = processParametersXML.replace('{Value}', itemsList);
                        } else {
                            processParametersXML = processParametersXML + primitiveTypeXML.replace('{Key}', key).replace('{Type}', type).replace('{Value}', wrapValueInCData(value));
                        }
                    });
                }
                callback(null, processParametersXML);
            }
        ],
        function(err, results) {
            if (err) {
                return processCallback(err);
            }

            var startProcessCommandXML = results[0].replace('{Parameters}', results[1]);
            config.body = startProcessCommandXML;
            config.json = false;

            httpUtil.post(config, function(err, response, result) {
                if (err) {
                    return processCallback(err);
                }
                else if (response.statusCode >= 300) {
                    return processCallback('Failed to start JBPM process. Received statusCode ' + response.statusCode);
                }

                parseString(result, function(err, jsonResult) {
                    if (err) {
                        return processCallback('Invalid error XML received(' + err + ')');
                    }

                    if (jsonResult['command-response']) {
                        if (jsonResult['command-response'].exception) {
                            return processCallback(jsonResult['command-response'].exception[0].message[0]);
                        } else {
                            if (jsonResult['command-response']['process-instance']) {
                                return processCallback(null, {
                                    message: 'Success',
                                    data: {
                                        processInstanceId: jsonResult['command-response']['process-instance'][0].id[0]
                                    }
                                });
                            }

                            return processCallback(null, 'Success');
                        }
                    }

                    return processCallback(null, jsonResult);
                });

            });
        });
}

function startProcess(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'START_PROCESS';

    var deploymentId = req.body.deploymentId || null;

    var idError;
    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var processDefId = req.body.processDefId || null;
    if (!processDefId) {
        idError = new Error('Missing processDefId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var parameters = req.body.parameter;

    doStartProcess(getGenericJbpmConfig(req), deploymentId, processDefId, parameters, function(err, response) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.bad_request).rdkSend(err);
        }

        return res.rdkSend(response);
    });
}

function abortProcess(req, res) {
    // JBPM Endpoint:
    // [POST] /runtime/{deploymentId}/process/instance/{procInstanceID}/abort
    //
    // Example Postman URL:
    // http://IP             /business-central/rest/runtime/VistaCore:VistaTasks:1.0.2/process/instance/1/abort

    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'ABORT_PROCESS';

    var deploymentId = req.body.deploymentId || null;

    var idError;
    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var processInstanceId = req.body.processInstanceId || null;
    if (!processInstanceId) {
        idError = new Error('Missing processInstanceId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url)
        .path('/runtime/')
        .path(deploymentId)
        .path('/process/instance/')
        .path(processInstanceId)
        .path('/abort')
        .build();

    config.url = uri;
    config.headers['Content-Type'] = 'application/json';
    config.headers.Accept = 'application/json';

    httpUtil.post(config, function(err, response, returnedData) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        // Example Response:
        // {
        //  "status": "SUCCESS",
        //  "url": "/business-central/rest/runtime/VistaCore:VistaTasks:1.0.2/process/instance/1/abort",
        //  "message": null
        //}

        if (returnedData && returnedData.hasOwnProperty('url')) {
            delete returnedData.url;
        }

        if (returnedData && returnedData.hasOwnProperty('status')) {
            if (returnedData.status.toLowerCase() === 'success') {
                return res.rdkSend(returnedData);
            }
        }

        return res.status(rdk.httpstatus.not_found).rdkSend(returnedData);
    });
}

function getProcessDefinitions(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_PROCESS_DEFINITIONS';

    // JBPM endpoint: /deployment/processes
    // parameters:
    // pagesize

    var pagesize;
    if (req.param('pagesize')) {
        pagesize = req.param('pagesize');
    }

    var config = getDefinitionsFetchConfig(req, pagesize);

    return doProcessDefinitionsFetch(config, function(err, formattedResponse) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        return res.rdkSend(formattedResponse);
    });
}

function getDefinitionsFetchConfig(req, pagesize) {
    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url).path('/deployment/processes');

    // Pagination not working correctly for the above rest api in RedHat BPM 6.1 to get all available process definitions in batches,
    // so as a short term fix, increasing default pagesize to 2000 (from 200).
    // This needs to be revisited once BPM is migrated to a new version.
    pagesize = pagesize || 2000;

    uri.query('pagesize', pagesize);
    config.url = uri.build();

    return config;
}

function getDefinitionsFetchConfigByUser(appConfig, loginSite, loginCredential, logger, pagesize) {
    var config = getGenericJbpmConfigByUser(appConfig, loginSite, loginCredential, logger);

    var uri = uriBuilder.fromUri(config.url).path('/deployment/processes');

    // Pagination not working correctly for the above rest api in RedHat BPM 6.1 to get all available process definitions in batches,
    // so as a short term fix, increasing default pagesize to 2000 (from 200).
    // This needs to be revisited once BPM is migrated to a new version.
    pagesize = pagesize || 2000;

    uri.query('pagesize', pagesize);
    config.url = uri.build();

    return config;
}

// Activity Query Service
function getActivityDefinitionsByQuery(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_ACTIVITY_DEFINITIONS_BY_QUERY';

    // temporary mock implementation
    var lookupObj = activityMockQuery;

    var lookupKey = '';

    if (req.query.siteCode && req.query.testIen) {
        lookupKey = req.query.siteCode + '_' + req.query.testIen;
    } else if (req.query.type && req.query.type.toLowerCase() === 'note') {
        lookupKey = req.query.type;
    }

    var activities = [];
    if (lookupObj[lookupKey]) {
        activities = lookupObj[lookupKey];
    } else {
        activities = lookupObj['default'];
    }

    var config = getDeploymentsFetchConfig(req);

    return doDeploymentsFetch(config, function(err, formattedResponse) {
        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        }

        var updatedActivities = updateActivities(activities, formattedResponse);

        return res.rdkSend(updatedActivities);
    });

}

function getDeploymentsFetchConfig(req) {
    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url)
        .path('/deployment')
        .build();

    config.url = uri;
    if (!config.headers) {
        config.headers = {};
    }

    return config;
}

function updateActivities(activities, formattedResponse) {
    var updatedActivities = [];
    if (activities.length > 0 && (formattedResponse.data && formattedResponse.data.items && formattedResponse.data.items.length > 0)) {
        _.each(activities, function(activity) {
            _.each(formattedResponse.data.items, function(deployment) {
                var deploymentTitle = deployment.groupId + ':' + deployment.artifactId;
                if (deploymentTitle === activity.deployment) {
                    var deploymentId = deployment.groupId + ':' + deployment.artifactId + ':' + deployment.version;
                    activity.deploymentId = deploymentId;
                }
            });
            updatedActivities.push(activity);
        });
    }

    return updatedActivities;
}

function doProcessDefinitionsFetch(config, callback) {

    httpUtil.get(config, function(err, response, returnedData) {
        if (err) {
            return callback(err);
        }

        var processDefinitionsOrganizer = {};
        var processDefinitions = [];

        if (returnedData.hasOwnProperty('processDefinitionList') && Array.isArray(returnedData.processDefinitionList)) {
            _.each(returnedData.processDefinitionList, function(processDefinition) {
                if (processDefinition.hasOwnProperty('process-definition')) {
                    processDefinition = processDefinition['process-definition'];
                }
                //we do not need BPM forms data. Remove the element.
                if (processDefinition.hasOwnProperty('forms')) {
                    delete processDefinition.forms;
                }

                if (processDefinition.hasOwnProperty('deployment-id')) {
                    processDefinition.deploymentId = processDefinition['deployment-id'];
                }

                //validate well-formed process definition before allowing it to be sorted
                if (processDefinition.hasOwnProperty('deploymentId') &&
                    _.size(activityUtils.parseVersionFromDeploymentId(processDefinition.deploymentId)) > 0) {
                    //Group activities by type before sorting versions based on deployment and process IDs
                    var deploymentKey = processDefinition.deploymentId.substring(0, processDefinition.deploymentId.lastIndexOf(':'));
                    if (processDefinition.hasOwnProperty('id')) {
                        deploymentKey += '.' + processDefinition.id;
                    }

                    if (!processDefinitionsOrganizer.hasOwnProperty(deploymentKey)) {
                        processDefinitionsOrganizer[deploymentKey] = [];
                    }
                    processDefinitionsOrganizer[deploymentKey].push(processDefinition);
                }
            });
        }

        _.each(processDefinitionsOrganizer, function(deploymentsArr) {
            deploymentsArr.sort(function(a, b) {
                //intentionally swap version orders to reverse default sort order
                return versionCompare(activityUtils.parseVersionFromDeploymentId(b.deploymentId), activityUtils.parseVersionFromDeploymentId(a.deploymentId));
            });
            processDefinitions = processDefinitions.concat(deploymentsArr);
        });

        var formattedResponse = {
            data: {
                items: processDefinitions
            }
        };

        return callback(null, formattedResponse);
    });
}

function doDeploymentsFetch(config, callback) {
    httpUtil.get(config, function(err, response, returnedData) {
        if (err) {
            return callback(err);
        }

        var formattedResponse = {
            data: {
                items: []
            }
        };

        if (returnedData.hasOwnProperty('deploymentUnitList') && Array.isArray(returnedData.deploymentUnitList)) {
            _.each(returnedData.deploymentUnitList, function(deployment) {
                formattedResponse.data.items.push(deployment);
            });
        }

        return callback(null, formattedResponse);
    });
}

function sendSignal(req, res) {
    req.audit.dataDomain = 'Activities';
    req.audit.logCategory = 'SEND_SIGNAL';

    var deploymentId = req.body.deploymentId || null;

    var idError;
    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var processInstanceId = req.body.processInstanceId || -1;

    var signalName = req.body.signalName || null;

    if (!signalName) {
        idError = new Error('Missing signalName property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var signalContent = req.body.parameter;
    if (signalContent) {
        var parameterCount = _.size(signalContent);
        if (parameterCount > 1) {
            idError = new Error('Invalid number of parameters passed in input JSON. Only one parameter allowed.');
            req.logger.error(idError);
            return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
        }
        // set signal issuer context to the payload
        var user = req.session.user;
        signalContent.signalBody = signalContent.signalBody || {};
        signalContent.signalBody.executionUserId = user.site + ';' + user.duz[user.site]; // user.uid includes the namespace urn:va:user, JBPM wants it without the namespace
        signalContent.signalBody.executionUserName = user.lastname + ',' + user.firstname; // JBPM wants "lastname,firstname"
    }

    var cb = function(err, results) {
        if (err) {
            req.logger.error(err);

            if (err instanceof JBPMServerError) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            return res.status(rdk.httpstatus.bad_request).rdkSend(err);
        }
        return res.rdkSend(results);
    };
    doSignal(getGenericJbpmConfig(req), deploymentId, processInstanceId, signalName, signalContent, cb);
}

function doSignal(config, deploymentId, processInstanceId, signalName, signalContent, cb) {
    var uri = uriBuilder.fromUri(config.url)
        .path('/execute')
        .build();

    config.url = uri;
    if (!config.headers) {
        config.headers = {};
    }

    config.headers['Content-Type'] = 'application/xml';
    config.headers.Accept = 'application/xml';
    config.headers['Kie-Deployment-Id'] = deploymentId;

    async.parallel([
            function(callback) {
                var signalEventCommandTemplateXML = xmlTemplates.signalEventCommandTemplate;
                var signalEventCommandXML = signalEventCommandTemplateXML.replace('{DeploymentId}', deploymentId)
                    .replace('{ProcessInstanceId}', processInstanceId)
                    .replace('{EventType}', signalName);
                callback(null, signalEventCommandXML);
            },
            function(callback) {
                var signalEventValueXML = '';
                var itemsList = '';
                if (signalContent) {
                    signalEventValueXML = xmlTemplates.signalEventValueTemplate;
                    var complexObjectPropertiesXML = xmlTemplates.complexObjectPropertiesXML;
                    var value = _.head(_.values(signalContent));
                    var type = typeof value;

                    //**** Parent Container Object
                    if (type === 'object') {
                        var objectItems = value;
                        _.each(objectItems, function(value, key) {
                            type = typeof value;
                            //the key objectType should match the class name in jbpm starting with a small letter.
                            if (key === 'objectType') {
                                signalEventValueXML = signalEventValueXML.replace('{Type}', value);
                            } else {
                                if (type === 'object') {
                                    if (value !== null && value.constructor === Array) {
                                        for (var i = 0; i < value.length; i++) {
                                            itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processValue(value[i]));
                                        }
                                    } else {
                                        itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value));
                                    }

                                } else {
                                    itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', wrapValueInCData(value));
                                }
                            }
                        });
                        signalEventValueXML = signalEventValueXML.replace('{Value}', itemsList);
                    } else {
                        signalEventValueXML = signalEventValueXML.replace('{Type}', 'xs:' + type).replace('{Value}', wrapValueInCData(value));
                    }
                }
                callback(null, signalEventValueXML);
            }
        ],
        function(err, results) {
            if (err) {
                return cb(err);
            }

            var signalEventCommandXML = results[0].replace('{EventValue}', results[1]);
            config.body = signalEventCommandXML;
            config.json = false;

            httpUtil.post(config, function(err, response, result) {
                if (err) {
                    return cb(err);
                }
                else if (response.statusCode >= 300) {
                    return cb(new JBPMServerError('Failed to post JBPM signal. Received statusCode ' + response.statusCode));
                }

                parseString(result, function(err, jsonResult) {
                    if (err) {
                        return cb(new JBPMServerError('Invalid error XML received(' + err + ')'));
                    }

                    if (jsonResult['command-response']) {
                        if (jsonResult['command-response'].exception) {
                            return cb(new Error(jsonResult['command-response'].exception[0].message[0]));
                        } else {
                            return cb(null, 'Success');
                        }
                    }

                    return cb(null, jsonResult);
                });

            });
        });
}

function JBPMServerError(message, error) {
    this.name = 'JBPMServerError';
    this.error = error;
    this.message = message;
}

function getCdsIntentResults(req, res) {
    req.audit.dataDomain = 'ACTIVITIES';
    req.audit.logCategory = 'CDSINTENTRESULTS';

    var cdsIntentRequest = req.body;
    if (typeof cdsIntentRequest !== 'object') {
        var reqError = new Error('Invalid request body');
        req.logger.error(reqError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(reqError.message);
    }

    var config = {
        timeout: 50000,
        logger: req.logger,
        baseUrl: req.app.subsystems.cds.getInvocationUrl(),
        url: '/cds-results-service/cds/invokeRules',
        body: cdsIntentRequest
    };

    httpUtil.post(config, function(err, response, body) {
        req.logger.debug({body: body}, 'Response from CDS intent POST call');

        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        else if (response.statusCode >= 300) {
            // Log the actual response
            req.logger.error('Failed to post CDS intent. Received statusCode ' + response.statusCode);
            // Return RdkError with HTTP 500 status to the caller
            var postError = new RdkError({
                    code: 'cds.500.1000',
                    logger: req.logger
            });
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(postError);
        }

        // Validate the CDS status code
        var cdsStatus = (body && _.has(body, 'status.code')) ? _.get(body,'status.code') : null;
        if (!cdsStatus) {
            var malformedResponseError = new RdkError({
                    code: 'cds.500.1000',
                    error: 'CDS intent POST returned with malformed response body - status.code missing',
                    logger: req.logger
            });
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(malformedResponseError);
        }
        else if (cdsStatus !== '0') { // 0 == OK
            var invocationError = getInvocationError(body.faultInfo);
            // HTTP request was successful but the CDS Invocation service reported an error.
            req.logger.debug({
                invocationError: invocationError
            }, 'CDS Intent Results: cds invocation server returned error');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(invocationError);
        }

        // Send validated body as response
        return res.status(rdk.httpstatus.ok).rdkSend(body);
    });
}

function getJbpmInstanceByInstanceId(req, res) {
    req.audit.dataDomain = 'ACTIVITIES';
    req.audit.logCategory = 'JBPM_INSTANCE_BY_ID';

    var config = getGenericJbpmConfig(req);

    var deploymentId = req.body.deploymentId;
    var processInstanceId = req.body.processInstanceId;

    var idError;
    var formattedReturnData = {};

    if (!deploymentId) {
        idError = new Error('Missing deploymentId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    if (!processInstanceId) {
        idError = new Error('Missing processInstanceId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    formattedReturnData.processInstanceId = processInstanceId;

    var uri = uriBuilder.fromUri(config.url)
        .path('/runtime/')
        .path(deploymentId)
        .path('/withvars/process/instance/')
        .path(processInstanceId)
        .build();

    config.url = uri;
    config.headers['Content-Type'] = 'application/json';
    config.headers.Accept = 'application/json';

    httpUtil.get(config, function (err, response, returnedData) {
        if (err) {
            if (err instanceof JBPMServerError) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            return res.status(rdk.httpstatus.bad_request).rdkSend(err);
        }

        if(!nullchecker.isNullish(returnedData) && (JSON.stringify(returnedData).indexOf('NOT_FOUND') > -1)) {
            return res.rdkSend('NOT_FOUND');
        }

        var keys = _.keys(_.get(returnedData, 'variables'));

        //Regular expression to match the java package reference returned by JBPM
        //eg. "vistacore.order.consult.ConsultOrder@6029c0b3"
        var objRefRegEx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9]+)/;

        var objectList = [];

       _.each(keys, function(key, i) {
            var variableValue = _.get(returnedData, ['variables', key]);
            if(objRefRegEx.test(variableValue)) {
                objectList.push(key);
            } else {
                formattedReturnData[key] = variableValue;
            }
        });

        if(objectList.length > 0) {
            var count = 0;
            _.each(objectList, function(obj) {
                config = getGenericJbpmConfig(req);

                uri = uriBuilder.fromUri(config.url)
                .path('/runtime/')
                .path(deploymentId)
                .path('/process/instance/')
                .path(processInstanceId)
                .path('/variable/')
                .path(obj)
                .build();

                config.url = uri;

                httpUtil.get(config, function(err, response, returnedVariableData) {
                    if (err) {
                        if (err instanceof JBPMServerError) {
                            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                        }

                        return res.status(rdk.httpstatus.bad_request).rdkSend(err);
                    }

                    var path = _.get(response, 'request.uri.path');

                    var objName = path.substring(path.lastIndexOf('/') + 1);

                    formattedReturnData[objName] = returnedVariableData;

                    count++;

                    if(count === objectList.length) {
                        return res.rdkSend(formattedReturnData);
                    }
                });
            });
        } else {
            return res.rdkSend(formattedReturnData);
        }
    });

}

/*
 * Retrieve the status from the invocation result
 *
 * @param {object} info the returned payload from an invocation call
 */
function getInvocationError(info) {
    return _.map(info, function(o) {
        return o.fault;
    }).join(' ');
}

module.exports.getActivities = getActivities;
module.exports.startProcess = startProcess;
module.exports.doStartProcess = doStartProcess;
module.exports.abortProcess = abortProcess;
module.exports.getDeploymentsFetchConfig = getDeploymentsFetchConfig;
module.exports.doDeploymentsFetch = doDeploymentsFetch;
module.exports.updateActivities = updateActivities;
module.exports.sendSignal = sendSignal;
module.exports.getCdsIntentResults = getCdsIntentResults;
module.exports.doSignal = doSignal;
module.exports.doProcessDefinitionsFetch = doProcessDefinitionsFetch;
module.exports.getDefinitionsFetchConfig = getDefinitionsFetchConfig;
module.exports.getDefinitionsFetchConfigByUser = getDefinitionsFetchConfigByUser;
module.exports.getJbpmInstanceByInstanceId = getJbpmInstanceByInstanceId;
