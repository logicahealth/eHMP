'use strict';
var rdk = require('../../core/rdk');
var _ = require('lodash');
var jbpm = require('../../subsystems/jbpm/jbpm-subsystem');
var nullchecker = rdk.utils.nullchecker;
var xmlTemplates = require('./xml-templates');
var complexObjectPropertiesXML = xmlTemplates.complexObjectPropertiesXML;
var complexArrayedObjectPropertiesXML = xmlTemplates.complexArrayedObjectPropertiesXML;

function getJbpmUser(req) {
    var loginSite = _.get(req, 'session.user.site', '');
    var loginCredential = _.get(req, 'session.user.duz[' + loginSite + ']', '');
    if (loginSite.length > 0 && loginCredential.length > 0) {
        loginCredential = loginSite + ';' + loginCredential;
    } else {
        loginCredential = '';
    }
    return loginCredential;
}

function getGenericJbpmConfig(req) {
    var loginSite = _.get(req, 'session.user.site', '');
    var loginCredential = _.get(req, 'session.user.duz[' + loginSite + ']', '');
    return getGenericJbpmConfigByUser(_.get(req, 'app.config'), loginSite, loginCredential,_.get(req, 'logger'));
}

//combination of getGenericJbpmConfig and getJbpmUser that to remove reliance on the request object and user session values
function getGenericJbpmConfigByUser(appConfig, loginSite, loginCredential, logger) {
    var config = jbpm.getJBPMHttpConfig(appConfig, logger);

    if (loginSite.length > 0 && loginCredential.length > 0) {
        loginCredential = loginSite + ';' + loginCredential;
    } else {
        loginCredential = '';
    }

    config = jbpm.addAuthToConfig(loginCredential, 'jbpm', config);
    config.json = true;
    return config;
}

function filterVariablesForRecency(variableList) {
    if (variableList instanceof Array) {
        var retList = [];
        var historicalObjs = {
            history: []
        };
        _.each(variableList, function(el) {
            var location = _.findIndex(retList, function(retItem) {
                //make sure we are dealing with 2 objects and both have names that match
                return (retItem && retItem.name && el && el.name && (retItem.name === el.name));
            });
            if (location !== -1) {
                var existingModDate = retList[location].modificationDate;
                var newModDate = el.modificationDate;
                if (existingModDate) {
                    if (newModDate && (newModDate > existingModDate)) { //the current element is newer, put the old in history and replace
                        historicalObjs.history.push(retList[location]);
                        retList[location] = el;
                    } else { //the object in retlist is already newer, put the current element in history
                        historicalObjs.history.push(el);
                    }
                } else if (newModDate) {
                    historicalObjs.history.push(retList[location]);
                    retList[location] = el;
                } else { //else neither of them have a modified date and no decision can be made
                    historicalObjs.history.push(el);
                }
            } else {
                retList.push(el);
            }
        });
        retList.push(historicalObjs);
        return retList;
    } else {
        return variableList;
    }

}

function handleTaskStatuses(statusParam) {
    var queryStatuses = [];
    var defaultStatuses = ['created', 'ready', 'reserved', 'inprogress'];
    var allPossibleStatuses = ['created', 'ready', 'reserved', 'inprogress', 'completed', 'failed', 'error', 'exited', 'obsolete'];

    if (statusParam) {
        statusParam = statusParam.toLowerCase();
    }
    if (statusParam === 'all') {
        queryStatuses = allPossibleStatuses;
    } else if (statusParam !== null && statusParam !== undefined && statusParam !== '') {
        var submittedStatuses = statusParam.split(',');

        _.each(submittedStatuses, function(status) {
            if (_.contains(allPossibleStatuses, status)) {
                queryStatuses.push(status);
            }
        });
    }

    if (queryStatuses.length === 0) {
        return defaultStatuses;
    }

    return queryStatuses;
}

function processJsonObject(jsonObj) {
    var subitemsList = '';
    _.each(jsonObj, function(value, key) {
        if (_.isObject(value)) {
            var id = 0;
            if (value !== null && value.constructor === Array) {
                for (var i = 0; i < value.length; i++) {
                    id = i + 1;
                    subitemsList += complexArrayedObjectPropertiesXML.replace(/{Key}/g, key).replace(/{ID}/, id).replace('{Value}', processValue(value[i]));
                }
            } else {
                subitemsList += complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', processJsonObject(value));
            }

        } else {
            subitemsList += complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', wrapValueInCData(value));
        }
    });

    return subitemsList;
}

function processValue(value) {
    if (_.isObject(value)) {
        return processJsonObject(value);
    }

    return wrapValueInCData(value);
}

function wrapValueInCData(value) {
    if (nullchecker.isNullish(value) || typeof value !== 'string') {
        return value;
    }
    value = value.replace(']]>', ']]]]><![CDATA[>');
    return '<![CDATA[' + value + ']]>';
}

function validateClinicalObject(errorMessages, model) {
    // Run checks that every clinical object needs
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if (!model.patientUid) {
        errorMessages.push('model does not contain patientUid');
    }
    if (!model.uid) {
        errorMessages.push('model does not contain uid');
    }
}

function endRoute(formattedRoutesString) {
    if (!_.isEmpty(formattedRoutesString)) {
        formattedRoutesString = _.trimRight(formattedRoutesString, ' -');
        if (!_.endsWith(formattedRoutesString, ';')) {
            formattedRoutesString += ';';
        }
    }
    return formattedRoutesString;
}

function getFormattedRoutesString(parsedRoutes, users, isTaskRoute) {
    if (_.isNull(parsedRoutes) || _.isUndefined(parsedRoutes)) {
        return null;
    }

    if (_.isNull(users) || _.isUndefined(users)) {
        users = {};
    }

    var sortedParsedRoutes = _.sortByOrder(parsedRoutes, ['FC', 'TF', 'TR'], ['asc', 'desc', 'asc']);
    var facility, teamFocus, teamRole, formattedRoutesString = '';
    _.each(sortedParsedRoutes, function(sortedParsedRoute) {
        if (!_.isUndefined(sortedParsedRoute.FC) && !_.isUndefined(sortedParsedRoute.TF)) {
            if (sortedParsedRoute.FC !== facility || sortedParsedRoute.TF !== teamFocus) {
                formattedRoutesString = endRoute(formattedRoutesString);
                if (isTaskRoute) {
                    formattedRoutesString += sortedParsedRoute.FC + ' - ';
                }

                formattedRoutesString += sortedParsedRoute.TF + ' - ';
                teamRole = sortedParsedRoute.TR;
                if (!_.isUndefined(sortedParsedRoute.TR)) {
                    formattedRoutesString += sortedParsedRoute.TR;
                }
                facility = sortedParsedRoute.FC;
                teamFocus = sortedParsedRoute.TF;
            } else {
                if (!_.isUndefined(sortedParsedRoute.TR)) {
                    if (!_.isUndefined(teamRole)) {
                        formattedRoutesString += ', ';
                    }
                    formattedRoutesString += sortedParsedRoute.TR;
                } else {
                    formattedRoutesString = endRoute(formattedRoutesString);
                    if (isTaskRoute) {
                        formattedRoutesString += sortedParsedRoute.FC + ' - ';
                    }
                    formattedRoutesString += sortedParsedRoute.TF;
                }
                teamRole = sortedParsedRoute.TR;
            }
        } else {
            // Here we parse Request team assignment
            if (!_.isUndefined(sortedParsedRoute.TM && !_.isUndefined(sortedParsedRoute.TR))) {
                if(!_.startsWith(formattedRoutesString, sortedParsedRoute.TM)) {
                    formattedRoutesString = sortedParsedRoute.TM + ' - ';
                }
                if(!_.isUndefined(sortedParsedRoute.TR)) {
                    formattedRoutesString += sortedParsedRoute.TR + ', ';
                }
            } else if (!_.isUndefined(sortedParsedRoute.FC)) {
                if (facility === sortedParsedRoute.FC) {
                    if (!_.isUndefined(sortedParsedRoute.TR)) {
                        if (!_.isUndefined(teamRole)) {
                            formattedRoutesString += ', ';
                        }
                        formattedRoutesString += sortedParsedRoute.TR;
                    }
                } else {
                    formattedRoutesString = endRoute(formattedRoutesString);
                    if (isTaskRoute) {
                        formattedRoutesString += sortedParsedRoute.FC + ' - ';
                    }

                    if (!_.isUndefined(sortedParsedRoute.TR)) {
                        formattedRoutesString += sortedParsedRoute.TR;
                    }
                    facility = sortedParsedRoute.FC;
                }

                teamRole = sortedParsedRoute.TR;
                teamFocus = undefined;
            } else if (!_.isUndefined(sortedParsedRoute.TF)) {
                if (teamFocus === sortedParsedRoute.TF) {
                    if (!_.isUndefined(sortedParsedRoute.TR)) {
                        if (!_.isUndefined(teamRole) && _.isUndefined(facility)) {
                            formattedRoutesString += ', ';
                        } else {
                            formattedRoutesString = endRoute(formattedRoutesString);
                            formattedRoutesString += sortedParsedRoute.TF + ' - ';
                            facility = sortedParsedRoute.FC;
                        }
                        formattedRoutesString += sortedParsedRoute.TR;
                    }
                    teamRole = sortedParsedRoute.TR;
                } else {
                    formattedRoutesString = endRoute(formattedRoutesString);
                    formattedRoutesString += sortedParsedRoute.TF + ' - ';
                    teamFocus = sortedParsedRoute.TF;
                    if (!_.isUndefined(sortedParsedRoute.TR)) {
                        formattedRoutesString += sortedParsedRoute.TR;
                    }
                    teamRole = sortedParsedRoute.TR;
                }
                facility = undefined;
            } else if (!_.isUndefined(sortedParsedRoute.user)) {
                formattedRoutesString = endRoute(formattedRoutesString);
                if (_.has(users, sortedParsedRoute.user)) {
                    formattedRoutesString += users[sortedParsedRoute.user];
                } else {
                    formattedRoutesString += sortedParsedRoute.user;
                }
            }
        }
    });

    if (!_.isEmpty(formattedRoutesString)) {
        formattedRoutesString = _.trimRight(formattedRoutesString, ' -;,');
    }

    return formattedRoutesString;
}

function parseAssignedTo(assignedTo) {
    if (_.isNull(assignedTo) || _.isUndefined(assignedTo)) {
        return null;
    }

    var parsedRoutes = [];
    var parsedRoute;
    var routesArray = assignedTo.split(',');
    _.each(routesArray, function(route) {
        parsedRoute = parseRoute(route);
        if (parsedRoute && !_.isEmpty(parsedRoute)) {
            parsedRoutes.push(parsedRoute);
        }
    });

    return parsedRoutes;
}

function parseRoute(route) {
    var parsedRoute = {};
    if (_.startsWith(route, '[') && _.endsWith(route, ']')) {
        route = route.substring(1, route.length - 2);
        var subRoutes = route.split('/');
        _.each(subRoutes, function(subRoute) {
            var routeParts = subRoute.split(':');
            if (routeParts.length === 2) {
                routeParts[0] = _.trim(routeParts[0]);
                if (routeParts[0].length > 0 && routeParts[1].indexOf('(') !== -1) {
                    var routePartText = _.trim(routeParts[1].substring(0, routeParts[1].indexOf('(')));
                    if (routePartText.length > 0) {
                        parsedRoute[routeParts[0]] = routePartText;
                    }
                }
            }
        });

    } else {
        if (!nullchecker.isNullish(route)) {
            parsedRoute.user = route;
        }
    }

    return parsedRoute;
}

function filterIdentifiers(identifiersList) {
    if (!identifiersList || !Array.isArray(identifiersList) || !identifiersList.length) {
        return [];
    }

    var validIdentifiers = [];
    _.each(identifiersList, function(identifier) {
        //validate each individual identifier
        if (nullchecker.isNotNullish(identifier)) {
            identifier = identifier.replace(/(\s|\')/g, '');
            validIdentifiers.push(identifier);
        }
    });

    return validIdentifiers;
}

function parseVersionFromDeploymentId(deploymentId) {
    if (!_.isString(deploymentId) || _.size(deploymentId) < 1) {
        return '';
    }
    var version = deploymentId.substring(deploymentId.lastIndexOf(':') + 1);
    if (_.size(version) === _.size(deploymentId)) {
        return '';
    }
    return version;
}

/**
 * Retrieves a activity database configuration object from a request object
 *
 * @param {any} req The request object
 * @returns config object or null
 */
function getDatabaseConfigFromRequest(req) {
    return _.get(req, 'app.config.oracledb.activityDatabase', null);
}

module.exports.getGenericJbpmConfig = getGenericJbpmConfig;
module.exports.getGenericJbpmConfigByUser = getGenericJbpmConfigByUser;
module.exports.filterVariablesForRecency = filterVariablesForRecency;
module.exports.handleTaskStatuses = handleTaskStatuses;
module.exports.processJsonObject = processJsonObject;
module.exports.processValue = processValue;
module.exports.wrapValueInCData = wrapValueInCData;
module.exports.complexObjectPropertiesXML = complexObjectPropertiesXML;
module.exports.getJbpmUser = getJbpmUser;
module.exports.validateClinicalObject = validateClinicalObject;
module.exports.getFormattedRoutesString = getFormattedRoutesString;
module.exports.parseAssignedTo = parseAssignedTo;
module.exports.filterIdentifiers = filterIdentifiers;
module.exports.xmlTemplates = xmlTemplates;
module.exports.parseVersionFromDeploymentId = parseVersionFromDeploymentId;
module.exports.getDatabaseConfigFromRequest = getDatabaseConfigFromRequest;
