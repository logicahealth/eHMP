'use strict';

var _ = require('lodash');

function findMessageByIdentifier(identifierValue, messages) {
    return _.find(messages, function(message) {
        return message.identifier.value === identifierValue;
    });
}

function getFilteredMessages(params, messages) {
    return _.chain(messages)
            .filter(function(message) {
                return _.isUndefined(params.category) || containsCode(message.category, params.category);
            })
            .filter(function(message) {
                return _.isUndefined(params.status) || message.status === params.status;
            })
            .filter(function(message) {
                return _.isUndefined(params.priority) || containsCode(message.priority, params.priority);
            })
            .filter(function(message) {
                return _.isUndefined(params.subject) || (_.has(message,'subject.reference') && message.subject.reference === params.subject);
            })
            .value();
}

function containsCode(concept, code) {
    return _.find(_.result(concept, 'coding', []), function(coding) {
        return coding.code === code;
    });
}

module.exports.filter = function(params, messages) {
    if (_.isUndefined(params.identifier) && _.isUndefined(params.category) &&
        _.isUndefined(params.status) && _.isUndefined(params.priority) && _.isUndefined(params.count) &&
        _.isUndefined(params.subject)) {
            return messages;
    }

    if (!_.isUndefined(params.identifier)) {
        return findMessageByIdentifier(params.identifier, messages);
    } else {
        var results = getFilteredMessages(params, messages);
        if (!_.isUndefined(params.count) && params.count === 'true') {
            return '{"count": ' + results.length + '}';
        } else {
            return results;
        }
    }
};
