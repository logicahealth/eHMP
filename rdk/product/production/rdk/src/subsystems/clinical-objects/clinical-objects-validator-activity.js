'use strict';
var _ = require('lodash');

var configuration = require('./config/clinical-objects-config');

var ACTIVITY_DOMAIN = 'ehmp-activity';

// validate clinical activity objects

module.exports.validateCreateModel = validateCreateModel;
module.exports.validateUpdateModel = validateUpdateModel;

function validateCreateModel(errorMessages, model, appConfig, callback) {
    validateActivityModel(errorMessages, model, appConfig, callback);
}

function validateUpdateModel(errorMessages, model, appConfig, callback) {
    validateActivityModel(errorMessages, model, appConfig, callback);
}

function validateActivityModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if (model.domain !== ACTIVITY_DOMAIN) {
        errorMessages.push('Activity Clinical Object has the wrong domain');
    }

    var requiredFields = ['data.activity.deploymentId', 'data.activity.processDefinitionId', 'data.activity.processInstanceId'];
    _.each(requiredFields, function(fieldName) {
        if (!_.has(model, fieldName)) {
            errorMessages.push('model does not contain ' + fieldName + ' field');
        } else if (_.isEmpty(_.get(model, fieldName))) {
            errorMessages.push(fieldName + ' cannot be empty');
        }
    });

    var subDomain = model.subDomain || 'invalid';
    var subDomainConfig = _.get(_.get(configuration.domains, ACTIVITY_DOMAIN).subdomains, subDomain.toLowerCase());
    if (subDomainConfig) {
        if (subDomainConfig.deploymentId) {
            var foundDeploymentId = _.get(model, 'data.activity.deploymentId');
            if (foundDeploymentId && !deploymentIdMatches(subDomainConfig.deploymentId, foundDeploymentId)) {
                errorMessages.push('Unexpected value for deploymentId: expected ' + subDomainConfig.deploymentId + '; found ' + foundDeploymentId);
            }
        }
        if (subDomainConfig.processDefinitionId) {
            var foundProcessDefinitionId = _.get(model, 'data.activity.processDefinitionId');
            if (foundProcessDefinitionId && (foundProcessDefinitionId !== subDomainConfig.processDefinitionId)) {
                errorMessages.push('Unexpected value for processDefinitionId: expected ' + subDomainConfig.processDefinitionId + '; found ' + foundProcessDefinitionId);
            }
        }
        if (subDomainConfig.modulePath) {
            require('./' + subDomainConfig.modulePath).validateModel(errorMessages, model, appConfig, callback);
        }
    }
}
module.exports._validateActivityModel = validateActivityModel;

function deploymentIdMatches(expected, actual) {
    return _.startsWith(actual, expected);
}

module.exports._setConfiguration = function(newConfig) {
    if (newConfig) {
        configuration = newConfig;
    } else {
        configuration = require('./config/clinical-objects-config');
    }
};
