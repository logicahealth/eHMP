'use strict';
var rdk = require('../../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var jbpm = require('../../../subsystems/jbpm/jbpm-subsystem');
var parseString = require('xml2js').parseString;
var fs = require('fs');
var async = require('async');
var processJsonObject = require('../activity-utils').processJsonObject;
var processValue = require('../activity-utils').processValue;
var wrapValueInCData = require('../activity-utils').wrapValueInCData;
var getGenericJbpmConfig = require('../activity-utils').getGenericJbpmConfig;
var activityDb = rdk.utils.pooledJbpmDatabase;
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var nullchecker = rdk.utils.nullchecker;

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
                var startProcessCommandTemplateXML = fs.readFileSync(__dirname + '/start-process-command-template.xml', {
                    encoding: 'utf8',
                    flag: 'r'
                });
                var startProcessCommandXML = startProcessCommandTemplateXML.replace('{DeploymentId}', deploymentId).replace('{ProcessId}', processDefId);
                callback(null, startProcessCommandXML);
            },
            function(callback) {
                var processParametersXML = '';
                var itemsList = '';
                var subitemsList = '';
                if (parameters) {
                    var primitiveTypeXML = fs.readFileSync(__dirname + '/../tasks/parameter-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });
                    var complexObjectXML = fs.readFileSync(__dirname + '/../tasks/complex-object-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });
                    var complexObjectPropertiesXML = fs.readFileSync(__dirname + '/../tasks/complex-object-properties-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });
                    var complexArrayedObjectPropertiesXML = fs.readFileSync(__dirname + '/../tasks/complex-arrayed-object-properties-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });

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

// Activity Query Service
function getActivityDefinitionsByQuery(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_ACTIVITY_DEFINITIONS_BY_QUERY';

    // temporary mock implementation
    var lookupStr = fs.readFileSync(__dirname + '/activity-query-service-mock.json', {
        encoding: 'utf8',
        flag: 'r'
    });
    var lookupObj = JSON.parse(lookupStr);

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

        var formattedResponse = {
            data: {
                items: []
            }
        };

        if (returnedData.hasOwnProperty('processDefinitionList') && Array.isArray(returnedData.processDefinitionList)) {
            _.each(returnedData.processDefinitionList, function(processDefinition) {
                //we do not need BPM forms data. Remove the element.
                if (processDefinition.hasOwnProperty('forms')) {
                    delete processDefinition.forms;
                }

                formattedResponse.data.items.push(processDefinition);
            });
        }

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
                var signalEventCommandTemplateXML = fs.readFileSync(__dirname + '/signal-event-command-template.xml', {
                    encoding: 'utf8',
                    flag: 'r'
                });
                var signalEventCommandXML = signalEventCommandTemplateXML.replace('{DeploymentId}', deploymentId)
                    .replace('{ProcessInstanceId}', processInstanceId)
                    .replace('{EventType}', signalName);
                callback(null, signalEventCommandXML);
            },
            function(callback) {
                var signalEventValueXML = '';
                var itemsList = '';
                var subitemsList = '';
                if (signalContent) {

                    signalEventValueXML = fs.readFileSync(__dirname + '/signal-event-value-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });
                    var complexObjectPropertiesXML = fs.readFileSync(__dirname + '/../tasks/complex-object-properties-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });
                    var complexArrayedObjectPropertiesXML = fs.readFileSync(__dirname + '/../tasks/complex-arrayed-object-properties-template.xml', {
                        encoding: 'utf8',
                        flag: 'r'
                    });

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
        req.logger.debug('callback from fetch()');

        if (err) {
            req.logger.error(err);
            return res.status(rdk.httpstatus.bad_request).rdkSend(err);
        }

        if (body.status && body.status.code !== '0') { // 0 == OK
            var invocationError = getInvocationError(body.faultInfo);
            // HTTP request was successful but the CDS Invocation service reported an error.
            req.logger.debug({
                invocationError: invocationError
            }, 'CDS Intent Results: cds invocation server returned error');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(invocationError);
        }
        return res.rdkSend(body);
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
module.exports.getJbpmInstanceByInstanceId = getJbpmInstanceByInstanceId;
