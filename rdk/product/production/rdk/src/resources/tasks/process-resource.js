'use strict';
var rdk = require('../../core/rdk');
var uriBuilder = rdk.utils.uriBuilder;
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var jbpm = require('../../subsystems/jbpm-subsystem');
var parseString = require('xml2js').parseString;
var fs = require('fs');
var async = require('async');
var processJsonObject = require('./task-utils').processJsonObject;
var activityDb = require('./activity-database-utils');
var getGenericJbpmConfig = require('./task-utils').getGenericJbpmConfig;

function getProcessStatusList(req, res) {
    var cb = function(err, rows, fields) {
        if (err) {
            res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        res.rdkSend(rows);
    };
    activityDb.doQuery(req, 'SELECT * FROM activitydb.Am_ProcessStatusLookup', cb);
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
    } else if (deploymentId === 'All') {
        // Map deploymentid to actual value from jbpm config file
        if (!req.app.config.jbpm.deployments[deploymentId]) {
            idError = new Error('Invalid deploymentId property value.');
            req.logger.error(idError);
            return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
        }
        deploymentId = req.app.config.jbpm.deployments[deploymentId];
    }

    var processDefId = req.body.processDefId || null;
    if (!processDefId) {
        idError = new Error('Missing processDefId property/value in input JSON.');
        req.logger.error(idError);
        return res.status(rdk.httpstatus.bad_request).rdkSend(idError.message);
    }

    var config = getGenericJbpmConfig(req);

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
                // var startProcessCommandTemplateXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><command-request><deployment-id>{DeploymentId}</deployment-id><start-process processId="{ProcessId}"><parameter>{Parameters}</parameter></start-process></command-request>';
                var startProcessCommandXML = startProcessCommandTemplateXML.replace('{DeploymentId}', deploymentId).replace('{ProcessId}', processDefId);
                callback(null, startProcessCommandXML);
            },
            function(callback) {
                var processParametersXML = '';
                var itemsList = '';
                var subitemsList = '';
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
                            processParametersXML = processParametersXML + complexObjectXML.replace('{Key}', key);
                            _.each(objectItems, function(value, key) {
                                type = typeof value;
                                //the key objectType should match the class name in jbpm starting with a small letter.
                                if (key === 'objectType') {
                                    processParametersXML = processParametersXML.replace('{Type}', value);
                                } else {
                                    if (type === 'object') {
                                        var objectItemsXML = '';
                                        itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value, objectItemsXML));
                                    } else {
                                        itemsList = itemsList + complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', value);
                                    }
                                }
                            });
                            processParametersXML = processParametersXML.replace('{Value}', itemsList);
                        } else {
                            processParametersXML = processParametersXML + primitiveTypeXML.replace('{Key}', key).replace('{Type}', type).replace('{Value}', value);
                        }
                    });
                }
                callback(null, processParametersXML);
            }
        ],
        function(err, results) {
            if (err) {
                req.logger.error(err);
                return res.status(rdk.httpstatus.bad_request).rdkSend(err);
            }

            var startProcessCommandXML = results[0].replace('{Parameters}', results[1]);
            config.body = startProcessCommandXML;
            config.json = false;

            httpUtil.post(config, function(err, response, result) {
                if (err) {
                    req.logger.error(err);
                    return res.status(rdk.httpstatus.bad_request).rdkSend(err);
                }

                parseString(result, function(err, jsonResult) {
                    if (err) {
                        req.logger.error(result);
                        return res.status(rdk.httpstatus.internal_server_error).rdkSend('Invalid error XML received(' + err + ')');
                    }

                    if (jsonResult['command-response']) {
                        if (jsonResult['command-response'].exception) {
                            return res.status(rdk.httpstatus.bad_request).rdkSend(jsonResult['command-response'].exception[0].message[0]);
                        } else {
                            if (jsonResult['command-response']['process-instance']) {
                                return res.rdkSend({
                                    message: 'Success',
                                    data: {
                                        processInstanceId: jsonResult['command-response']['process-instance'][0].id[0]
                                    }
                                });
                            }

                            return res.rdkSend('Success');
                        }
                    }

                    return res.rdkSend(jsonResult);
                });

            });
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

    var config = getGenericJbpmConfig(req);

    var uri = uriBuilder.fromUri(config.url).path('/deployment/processes');

    var pagesize = 200;
    if (req.param('pagesize')) {
        pagesize = req.param('pagesize');
    }

    uri.query('pagesize', pagesize);
    config.url = uri.build();

    doProcessDefinitionsFetch(req, res, config);
}

// Activity Query Service
function getActivityDefinitionsByQuery(req, res) {
    req.audit.dataDomain = 'Tasks';
    req.audit.logCategory = 'GET_ACTIVITY_DEFINITIONS_BY_QUERY';

    // TODO update this uri to something reasonable
    //var uri = uriBuilder.fromUri(config.url).path('/deployment/processes/query');
    //var filter = 'filter by some parameter here'

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

function doProcessDefinitionsFetch(req, res, config) {

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

        if (returnedData.hasOwnProperty('processDefinitionList') && Array.isArray(returnedData.processDefinitionList)) {
            _.each(returnedData.processDefinitionList, function(processDefinition) {
                //we do not need BPM forms data. Remove the element.
                if (processDefinition.hasOwnProperty('forms')) {
                    //delete processDefinition.forms;
                }

                formattedResponse.data.items.push(processDefinition);
            });
        }

        return res.rdkSend(formattedResponse);
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

module.exports.getProcessDefinitions = getProcessDefinitions;
module.exports.getActivityDefinitionsByQuery = getActivityDefinitionsByQuery;
module.exports.startProcess = startProcess;
module.exports.getProcessStatusList = getProcessStatusList;
module.exports.abortProcess = abortProcess;
module.exports.getDeploymentsFetchConfig = getDeploymentsFetchConfig;
module.exports.doDeploymentsFetch = doDeploymentsFetch;
module.exports.updateActivities = updateActivities;
