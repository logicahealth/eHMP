'use strict';

var _ = require('lodash');
var async = require('async');

var configuration = require('./config/clinical-objects-config');

var pcmm = require('../jbpm/pcmm-subsystem');

var DRAFT_STATE = 'draft';
module.exports.DRAFT_STATE = DRAFT_STATE;

var DELETED_STATE = 'deleted';
module.exports.DELETED_STATE = DELETED_STATE;

function validateRequestModel(errorMessages, model, appConfig, ehmpState, callback) {
    var requiredFields = ['urgency', 'earliestDate', 'latestDate', 'title', 'assignTo', 'submittedByUid', 'submittedTimeStamp', 'visit'];
    var doGeneralValidation = function(ems) {
        if (ehmpState !== DRAFT_STATE && ehmpState !== DELETED_STATE) {
            validateRequiredFields(requiredFields, model, ehmpState, ems);
        }

        if ((ehmpState !== DELETED_STATE) && _.has(model, 'request') && (_.get(model, 'request').length > configuration.requestDetailsMaxLength)) {
            ems.push('request length cannot be longer than ' + configuration.requestDetailsMaxLength);
        }

        if (model.urgency && model.earliestDate && model.latestDate) {
            validateDates(ems, model.urgency, model.earliestDate, model.latestDate, ehmpState);
        }

        setImmediate(callback, ems);
    };

    if (model.route && (ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
        if (model.assignTo === 'Me') {
            validateForMe(errorMessages, model, appConfig, ehmpState, doGeneralValidation);
        } else if (model.assignTo === 'Person') {
            requiredFields.push('route.facility');
            requiredFields.push('route.person');
            validateForPerson(errorMessages, model, appConfig, ehmpState, doGeneralValidation);
        } else if (model.assignTo === 'My Teams' || model.assignTo === 'Patient\'s Teams') {
            requiredFields.push('route.team');
            requiredFields.push('route.assignedRoles');
            requiredFields.push('route.routingCode');
            validateForMyTeams(errorMessages, model, appConfig, ehmpState, doGeneralValidation);
        } else if (model.assignTo === 'Any Team') {
            requiredFields.push('route.facility');
            requiredFields.push('route.team');
            requiredFields.push('route.assignedRoles');
            requiredFields.push('route.routingCode');
            validateForAnyTeam(errorMessages, model, appConfig, ehmpState, doGeneralValidation);
        } else {
            if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
                errorMessages.push('request was not assigned to a category');
            }
            doGeneralValidation(errorMessages);
        }
    } else {
        doGeneralValidation(errorMessages);
    }
}
module.exports._validateRequestModel = validateRequestModel;

function validateModel(errorMessages, model, appConfig, callback) {
    if (!model.data) {
        errorMessages.push('model contains no data');
        return;
    }

    if (!(_.has(model, 'data.requests') && _.isArray(_.get(model, 'data.requests')))) {
        errorMessages.push('no array of requests found');
        callback(errorMessages);
        return;
    }

    validateTitle(errorMessages, model);

    var ehmpState = _.get(model, 'ehmpState');
    var requests = _.get(model, 'data.requests');
    async.eachSeries(requests, function(request, cb) {
        validateRequestModel(errorMessages, request, appConfig, ehmpState, cb);
    }, function (err) {
        callback(errorMessages);
    });
}
module.exports.validateModel = validateModel;

function validateTitle(errorMessages, model) {
    if (model.ehmpState !== DELETED_STATE) {
        if (!_.has(model, 'displayName')) {
            errorMessages.push('model does not contain displayName field');
        } else if (_.isEmpty(_.get(model, 'displayName'))) {
            errorMessages.push('displayName cannot be empty');
        } else if (_.get(model, 'displayName').length > configuration.displayNameMaxLength) {
            errorMessages.push('displayName length cannot be longer than ' + configuration.displayNameMaxLength);
        }
    }
}

function validateRequiredFields(requiredFields, model, ehmpState, errorMessages) {
    _.each(requiredFields, function(fieldName) {
        if (!_.has(model, fieldName)) {
            errorMessages.push('model does not contain ' + fieldName + ' field');
        }
        if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE) && _.isEmpty(_.get(model, fieldName)) && !(_.isBoolean(_.get(model, fieldName)))) {
            errorMessages.push(fieldName + ' cannot be empty');
        }
    });
}

function validateDates(errorMessages, urgency, earliest, latest, ehmpState) {
    if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {

        var earliestDate = parseDate(earliest);
        var latestDate = parseDate(latest);
        if (earliestDate === null) {
            errorMessages.push('Invalid earliest date provided');
            return;
        } else if (latestDate === null) {
            errorMessages.push('Invalid latest date provided');
            return;
        }

        if(earliestDate > latestDate) {
            errorMessages.push('Latest date is before earliest date');
        }
    }
}

function parseDate(dateTime) {

    if ((!_.isEmpty(dateTime)) && typeof(dateTime) === 'string' && dateTime.length === 14) {
        var year = dateTime.substr(0, 4);
        var month = dateTime.substr(4, 2);
        var day = dateTime.substr(6, 2);
        var hour = dateTime.substr(8, 2);
        var minute = dateTime.substr(10, 2);
        var second = dateTime.substr(12, 2);
        if (hour === '24' && minute === '00' && second === '00') {
            // % nvm exec v0.10.40 node -p "new Date('2016-01-04 24:00:00')"
            // Running node v0.10.40 (npm v1.4.28)
            // Invalid Date
            // % nvm exec v6 node -p "new Date('2016-01-04 24:00:00')"
            // Running node v6.9.5 (npm v3.10.10)
            // 2016-01-05T05:00:00.000Z
            return null;
        }
        // Date.parse will give back NaN if we didn't give it a correct format, use this to validate:
        var dateTimeCast = new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
        if (!isNaN(Date.parse(dateTimeCast))) {
            return dateTimeCast;
        }
    }
    return null;

}

function validateForMe(errorMessages, model, appConfig, ehmpState, next) {
    if (model.route) {
        errorMessages.push('request \'route\' field contained unexpected data');
    }

    next(errorMessages);
}

function validateForPerson(errorMessages, model, appConfig, ehmpState, next) {
    var tasks = startValidationTaskList(errorMessages);

    if (_.has(model, 'route')) {

        if (model.route.facility) {
            tasks.push(validateAssignedFacility.bind(null, model.route.facility, ehmpState, appConfig));
        }

        if (model.route.person) {
            tasks.push(validateAssignedPerson.bind(null, model.route.person, ehmpState, appConfig));
        }
    }

    executeValidationTasks(tasks, next);
}

function startValidationTaskList(errorMessages) {
    var primePump = function(ems, next) {
        next(null, ems);
    };

    return [primePump.bind(null, errorMessages)];
}

function executeValidationTasks(tasks, next) {
    async.waterfall(tasks, function(err, errorMessages) {
        if (err) {
            return next(['Unknown error during validation']);
        }

        next(errorMessages);
    });
}

function validateForMyTeams(errorMessages, model, appConfig, ehmpState, next) {
    var tasks = startValidationTaskList(errorMessages);

    if (_.has(model, 'route')) {

        if (_.has(model, 'route.team')) {
            tasks.push(validateAssignedTeam.bind(null, model.route.team, ehmpState, appConfig));
        }

        if (_.has(model, 'route.assignedRoles') && _.isArray(model.route.assignedRoles)) {
            _.each(model.route.assignedRoles, function(role) {
                tasks.push(validateAssignedRole.bind(null, role, ehmpState, appConfig));
            });
        }

        if (_.has(model, 'route.routingCode')) {
            tasks.push(validateRoutingCode.bind(null, model.route.routingCode, ehmpState, appConfig));
        }
    }

    executeValidationTasks(tasks, next);
}

function validateForAnyTeam(errorMessages, model, appConfig, ehmpState, next) {
    var tasks = startValidationTaskList(errorMessages);

    if (_.has(model, 'route')) {

        if (model.route.facility) {
            tasks.push(validateAssignedFacility.bind(null, model.route.facility, ehmpState, appConfig));
        }

        if (_.has(model, 'route.team')) {
            tasks.push(validateAssignedTeam.bind(null, model.route.team, ehmpState, appConfig));
        }

        if (_.has(model, 'route.assignedRoles') && _.isArray(model.route.assignedRoles)) {
            _.each(model.route.assignedRoles, function(role) {
                tasks.push(validateAssignedRole.bind(null, role, ehmpState, appConfig));
            });
        }

        if (_.has(model, 'route.routingCode')) {
            tasks.push(validateRoutingCode.bind(null, model.route.routingCode, ehmpState, appConfig));
        }
    }

    executeValidationTasks(tasks, next);
}

function validateAssignedFacility(assignedFacility, ehmpState, appConfig, errorMessages, next) {
    if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
        if (!isValidFacilityCode(assignedFacility)) {
            errorMessages.push('request.route contained malformed facility field: ' + assignedFacility);
        }
    }

    next(null, errorMessages);
}

function validateAssignedPerson(assignedPerson, ehmpState, appConfig, errorMessages, next) {
    if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
        if (!isValidPerson(assignedPerson)) {
            errorMessages.push('request.route contained malformed person field: ' + assignedPerson);
        }
    }

    next(null, errorMessages);
}

function validateAssignedTeam(assignedTeam, ehmpState, appConfig, errorMessages, next) {
    if (!isValidTeam(assignedTeam)) {
        if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
            errorMessages.push('request.route contained malformed team field: ' + assignedTeam);
            next(null, errorMessages);
        }
    } else if (ehmpState !== DELETED_STATE) {
        //Remove three-letter code, if present.
        var teamNameWithCodePattern = /(.*) - [A-Z]{3}/;
        var matches = teamNameWithCodePattern.exec(assignedTeam.name);
        var processedAssignedTeam = _.clone(assignedTeam);
        if (matches && _.isArray(matches) && (matches[0] === assignedTeam.name)) {
            processedAssignedTeam.name = matches[1];
        }

        pcmm.validate(configuration.types.team, processedAssignedTeam, appConfig, function(aborted, success) {
            if (!aborted && !success) {
                errorMessages.push('request.route contained team that does not pass PCMM validation: ' + JSON.stringify(assignedTeam) + ', which was validated as: ' + JSON.stringify(processedAssignedTeam));
            }
            next(null, errorMessages);
        }, errorMessages);
    } else {
        next(null, errorMessages);
    }
}

function validateAssignedRole(assignedRole, ehmpState, appConfig, errorMessages, next) {
    if (!isValidRole(assignedRole)) {
        if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
            errorMessages.push('request.route contained malformed assignedRole field: ' + assignedRole);
            next(null, errorMessages);
        }
    } else if (ehmpState !== DELETED_STATE) {
        pcmm.validate(configuration.types.role, assignedRole, appConfig, function(aborted, success) {
            if (!aborted && !success) {
                errorMessages.push('request.route contained assignedRole that does not pass PCMM validation: ' + JSON.stringify(assignedRole));
            }
            next(null, errorMessages);
        }, errorMessages);
    } else {
        next(null, errorMessages);
    }
}

function validateRoutingCode(routingCode, ehmpState, appConfig, errorMessages, next) {
    if ((ehmpState !== DRAFT_STATE) && (ehmpState !== DELETED_STATE)) {
        if (!isValidRoutingCode(routingCode)) {
            errorMessages.push('request.route contained malformed routingCode field: ' + routingCode);
        }
    }
    next(null, errorMessages);
}

function hasValidTypeStructure(typeJson, instanceJson) {
    return _.isObject(instanceJson) && _.every(typeJson.fields, function(field) {
        return _.has(instanceJson, field.inJson);
    });
}

var isValidTeam = hasValidTypeStructure.bind(null, configuration.types.team);
module.exports._isValidTeam = isValidTeam;
var isValidRole = hasValidTypeStructure.bind(null, configuration.types.role);
module.exports._isValidRole = isValidRole;

function isValidPerson(personID) {
    var pattern = /(\S{4};\d+)/;
    var match = pattern.exec(personID);
    if (_.isArray(match) && (match.length > 0)) {
        return match[0] === personID;
    } else {
        return false;
    }
}
module.exports._isValidPerson = isValidPerson;

function isValidFacilityCode(fc) {
    if (!fc) {
        return false;
    }

    var pattern = /(\d+)/;
    var match = pattern.exec(fc) || pattern.exec(fc.toString(10));
    if (_.isArray(match) && (match.length > 0)) {
        return (match[0] === fc) || (match[0] === fc.toString(10));
    } else {
        return false;
    }
}
module.exports._isValidFacilityCode = isValidFacilityCode;

function isValidRoutingCode(rc) {
    var pattern = /((\[TM:.+\(\d+\)\/TR:.+\(\d+\)\/PA:\(1\)\],)*\[TM:.+\(\d+\)\/TR:.+\(\d+\)\/PA:\(1\)\]|(\[TM:.+\(\d+\)\/TR:.+\(\d+\)\],)*\[TM:.+\(\d+\)\/TR:.+\(\d+\)\])/;
    var match = pattern.exec(rc);
    if (_.isArray(match) && (match.length > 0)) {
        return match[0] === rc;
    } else {
        return false;
    }
}
module.exports._isValidRoutingCode = isValidRoutingCode;
