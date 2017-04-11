/*jslint node: true */
'use strict';
var fs = require('fs');
var _ = require('lodash');
var jbpm = require('../../subsystems/jbpm-subsystem');
var complexObjectPropertiesXML = fs.readFileSync(__dirname + '/complex-object-properties-template.xml', {
    encoding: 'utf8',
    flag: 'r'
});

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
    var config = jbpm.getJBPMHttpConfig(req.app.config, req.logger);

    config = jbpm.addAuthToConfig(getJbpmUser(req), 'jbpm', config);
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
            var location = _.findIndex(retList, function(retItem) { //requires lodash since the current underscore version doesn't support this
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

function processJsonObject(jsonObj, itemsList) {
    var subitemsList = '';
    _.each(jsonObj, function(value, key) {
        if (typeof value === 'object') {
            itemsList += subitemsList;
            processJsonObject(value, itemsList);
        } else {
            subitemsList += complexObjectPropertiesXML.replace(/{Key}/g, key).replace('{Value}', value);
        }
    });
    itemsList += subitemsList;
    return itemsList;
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

module.exports.getGenericJbpmConfig = getGenericJbpmConfig;
module.exports.filterVariablesForRecency = filterVariablesForRecency;
module.exports.handleTaskStatuses = handleTaskStatuses;
module.exports.processJsonObject = processJsonObject;
module.exports.complexObjectPropertiesXML = complexObjectPropertiesXML;
module.exports.getJbpmUser = getJbpmUser;
module.exports.validateClinicalObject = validateClinicalObject;
