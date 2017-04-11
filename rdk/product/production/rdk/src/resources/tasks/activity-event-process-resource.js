'use strict';

var rdk = require('../../core/rdk');
var processResource = require('./process-resource');
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var getGenericJbpmConfig = require('./task-utils').getGenericJbpmConfig;
var uriBuilder = rdk.utils.uriBuilder;
var jp = require('jsonpath');
var nullchecker = rdk.utils.nullchecker;
var dd = require('drilldown');
var fs = require('fs');
var matchRules = require('./match-rule.json');
var parseString = require('xml2js').parseString;
var async = require('async');
var processJsonObject = require('./task-utils').processJsonObject;
var moment = require('moment');
var validateClinicalObject = require('./task-utils').validateClinicalObject;

function startActivityEvent(req, res) {
    var update = [];
    update[0] = req.body;
    var matchRuleObj = {};
    var booleanOperation = '';
    var deploymentId = '';
    var processDefId = '';

    _.forEach(matchRules, function(matchRuleObj) {

        booleanOperation = dd(matchRuleObj)('eventMatchCriteria')('complexMatch')('booleanOperator').val;
        deploymentId = dd(matchRuleObj)('eventMatchAction')('startProcessAction')('activityDeploymentId').val;
        processDefId = dd(matchRuleObj)('eventMatchAction')('startProcessAction')('activityDefinitionId').val;
        if (nullchecker.isNotNullish(deploymentId)) {
            var config = processResource.getDeploymentsFetchConfig(req);
            var activities = [];
            activities.push({
                'deployment': deploymentId
            });

            processResource.doDeploymentsFetch(config, function(err, formattedResponse) {
                if (err) {
                    req.logger.error(err);
                    return res.status(404).rdkSend('Unable to find deployment with deploymentId');
                } else {
                    var processes = processResource.updateActivities(activities, formattedResponse);

                    _.each(processes, function(process) {
                        if (process.hasOwnProperty('deployment') && process.deployment === deploymentId) {
                            deploymentId = process.deploymentId;
                        }
                    });

                    var ruleOutputObj = {};

                    var ruleSet = '$..[?(';

                    var matchSet = dd(matchRuleObj)('eventMatchCriteria')('complexMatch')('matchSet').val;

                    _.forEach(matchRuleObj.eventMatchCriteria.complexMatch.matchSet, function(rule) {
                        if (rule.indexOf('visit.dateTime') !== -1) {
                            rule = rule.substring(0, (rule.indexOf('\'') + 1)) + getFormattedPastDate(rule) + '\'';
                        }

                        if (ruleSet.length === 6) {
                            ruleSet += rule;
                        } else {
                            if (booleanOperation === 'AND') {
                                ruleSet += ' && ';
                                ruleSet += rule;
                            } else if (booleanOperation === 'OR') {
                                ruleSet += ' || ';
                                ruleSet += rule;
                            }
                        }
                    });
                    ruleSet += ')]';

                    ruleOutputObj = jp.query(update, ruleSet);

                    if (!_.isEmpty(ruleOutputObj)) {
                        //TODO - Iterate throug the list and call it each time
                        _.forEach(ruleOutputObj, function(obj) {
                            var errorMessages = [];
                            validateClinicalObject(errorMessages, obj);
                            if (errorMessages.length > 0) {
                                return res.status(400).rdkSend('Bad Request - malformed message');
                            }
                            var processStartObj = {};
                            processStartObj.deploymentId = deploymentId;
                            processStartObj.processDefId = processDefId;

                            var parameter = {};
                            parameter.icn = obj.patientUid;
                            parameter.uid = obj.uid;
                            processStartObj.parameter = parameter;

                            req.body = processStartObj;

                            initiateActivity(req, res, processStartObj);
                        });
                    } else {
                        return res.status(200).rdkSend('No matches');
                    }

                }
            });
        } else {
            return res.status(400).rdkSend('Missing deploymentId');
        }


    });
}

function initiateActivity(req, res) {
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

function getFormattedPastDate(rule) {
    var formattedPastDate = '';
    var timeInterval = '';
    var timeIntervalSplit = [];
    var today = '';
    var pastDate = '';
    var a = rule.indexOf('\'');
    var b = rule.indexOf('\'', (a + 1));
    var c = rule.substring((a + 1), b);

    switch(c) {
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

module.exports.startActivityEvent = startActivityEvent;
