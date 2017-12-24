'use strict';

var nullChecker = require('../../../utils/nullchecker');
var _ = require('lodash');

function validateAddModel(model) {
    var error = null;

    if (nullChecker.isNullish(model)) {
        error = 'Missing message body';
    } else if (nullChecker.isNullish(model.label)) {
        error = 'label is a required parameter';
    } else if (nullChecker.isNullish(model.status)) {
        error = 'status is a required parameter';
    } else if (nullChecker.isNullish(model.version)) {
        error = 'version is a required parameter';
    } else if (nullChecker.isNullish(model.description)) {
        error = 'description is a required parameter';
    } else if (nullChecker.isNullish(model.permissions) || !_.isArray(model.permissions)) {
        error = 'permissions is a required parameter and must be an array';
    } else if (nullChecker.isNullish(model['sub-sets']) || !_.isArray(model['sub-sets'])) {
        error = 'sub-sets is a required parameter and must be an array';
    }

    return error;
}

function validateUpdateModel(model) {
    var error = null;

    if (nullChecker.isNullish(model)) {
        error = 'Missing message body';
    } else if (nullChecker.isNullish(model.uid)) {
        error = 'uid is a required parameter';
    }

    if (!error) {
        if (model.deprecate) {
            if (nullChecker.isNullish(model.deprecatedVersion)) {
                error = 'deprecatedVersion is a required parameter';
            }
        } else {
            if (nullChecker.isNullish(model.label)) {
                error = 'label is a required parameter';
            } else if (nullChecker.isNullish(model.status)) {
                error = 'status is a required parameter';
            } else if (nullChecker.isNullish(model.version)) {
                error = 'version is a required parameter';
            } else if (nullChecker.isNullish(model['sub-sets']) || !_.isArray(model['sub-sets'])) {
                error = 'sub-sets is a required parameter and must be an array';
            } else if (nullChecker.isNullish(model.description)) {
                error = 'description is a required parameter';
            } else if (!nullChecker.isNullish(model.addPermissions) && !_.isArray(model.addPermissions)) {
                error = 'addPermissions must be an array';
            } else if (!nullChecker.isNullish(model.removePermissions) && !_.isArray(model.removePermissions)) {
                error = 'removePermissions must be an array';
            }
        }
    }

    return error;
}

function validateEditPermissionsOnSets(model) {
    var error = null;

    if (nullChecker.isNullish(model)) {
        error = 'Missing message body';
    } else if (nullChecker.isNullish(model.permission)) {
        error = 'permission is a required parameter';
    } else if (!nullChecker.isNullish(model.addSets) && !_.isArray(model.addSets)) {
        error = 'addSets must be an array';
    } else if (!nullChecker.isNullish(model.removeSets) && !_.isArray(model.removeSets)) {
        error = 'removeSets must be an array';
    }

    return error;
}

module.exports.validateAddModel = validateAddModel;
module.exports.validateUpdateModel = validateUpdateModel;
module.exports.validateEditPermissionsOnSets = validateEditPermissionsOnSets;
