'use strict';

var _ = require('lodash');
var constants = require('./communication-request-constants');

var REQUEST_NOT_PROCESSED = 'Request not processed. ';
var NOT_VALID_MESSAGE = REQUEST_NOT_PROCESSED + ' Not a valid ';

function notValidateCode(messageValue, validCodes) {
    return (messageValue !== '' && !_.includes(validCodes, messageValue));
}

function notValidateCodes(messageValues, validCodes) {
    return _.find(messageValues, function(value) {
        return notValidateCode(value, validCodes);
    });
}

function notCodesStartWith(messageValues, prefix) {
    return !_.find(messageValues, function(value) {
        return _.startsWith(value, prefix);
    });
}

module.exports.validate = function(message, callback) {
    if (!_.isUndefined(message.id)) {
        return callback({code: 400, message: REQUEST_NOT_PROCESSED + 'Resource id (id) should not be provided.'});
    }

    if (!_.isUndefined(message.resourceType)  && message.resourceType !== constants.RESOURCE_TYPE) {
        return callback({code: 400, message: REQUEST_NOT_PROCESSED + 'Invalid resourceType provided. Should be CommunicationResource.'});
    }

    if (_.result(message, 'recipient', []).length === 0) {
        return callback({code: 400, message: REQUEST_NOT_PROCESSED + 'At least one recipient is required.'});
    }

    var categoryCodes = _.pluck(_.result(message, 'category.coding'), 'code');
    var mediumCodes = _.pluck(_.flatten(_.pluck(message.medium, 'coding')), 'code');
    var priorityCodes =  _.pluck(_.result(message, 'priority.coding'), 'code');
    var reasonCodes = _.pluck(_.flatten(_.pluck(message.reason, 'coding')), 'code');

    if (notValidateCodes(categoryCodes, constants.CATEGORIES)) {
        return callback({code: 400, message: NOT_VALID_MESSAGE + 'category.'});
    }

    if (notValidateCodes(mediumCodes, constants.MEDIUMS)) {
        return callback({code: 400, message: NOT_VALID_MESSAGE + 'medium.'});
    }

    if (notValidateCodes(priorityCodes, constants.PRIORITIES)) {
        return callback({code: 400, message: NOT_VALID_MESSAGE + 'priority.'});
    }

    if (notValidateCodes(reasonCodes, constants.REASONS) &&
        notCodesStartWith(reasonCodes, 'ehmp/msg/reason/update/')) {
            return callback({code: 400, message: NOT_VALID_MESSAGE + 'reason.'});
    }

    if (notValidateCode(_.result(message, 'status', ''), constants.STATUSES)) {
        return callback({code: 400, message: NOT_VALID_MESSAGE + 'status.'});
    }

    //validate subject reference (should be "patient/pid or icn")
    if (_.has(message,'subject.reference') && !/([A-Z,a-z]+)\/([A-Z,a-z,0-9]+\;[0-9]+|[A-Z,a-z,0-9]+)/.test(message.subject.reference)) {
        return callback({code: 400, message: NOT_VALID_MESSAGE + 'subject.reference.'});
    }
    // This logic may be needed in the future so please do not remove commented code below


    // var i;
    // for (i = 0; i < priorityCodes.length; i++) {
    //     if (priorityCodes[i] === constants.PRIORITIES_ALERT && !_.contains(categoryCodes, 'ehmp/msg/category/clinical')) {
    //         return callback({code: 422, message: REQUEST_NOT_PROCESSED + 'Alert priority is only valid for the clinical category.'});
    //     }
    // }

    // for (i = 0; i < priorityCodes.length; i++) {
    //     var medium = mediumCodes[i];

    //     if (medium === 'ehmp/msg/medium/ui/todo' && notValidateCodes(priorityCodes, constants.PRIORITIES_COMMON)) {
    //         return callback({code: 422, message: NOT_VALID_MESSAGE + 'priority.'});
    //     }

    //     if ((medium === 'ehmp/msg/medium/ui/inline' || medium === 'ehmp/msg/medium/ui/overlay') &&
    //         notValidateCodes(priorityCodes, constants.PRIORITIES_COMMON_WARN)) {
    //             return callback({code: 422, message: NOT_VALID_MESSAGE + 'priority.'});
    //     }

    //     if (medium === 'ehmp/msg/medium/ui/dialog' && notValidateCodes(priorityCodes, constants.PRIORITIES_ALERT_ALARM)) {
    //         return callback({code: 422, message: NOT_VALID_MESSAGE + 'priority.'});
    //     }
    // }

    return callback();
};
