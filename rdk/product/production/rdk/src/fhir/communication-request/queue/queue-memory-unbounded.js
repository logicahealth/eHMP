'use strict';
var _ = require('lodash');
var uuid = require('node-uuid');
var EvtArray = require('../utils/utils-evented-array');

var queues = {};

module.exports = {
    addListenerOnce: function(event, queueName, callback, options) {
        if (_.isUndefined(queues[queueName])) {
            queues[queueName] = new EvtArray();
        }
        queues[queueName].addListenerOnce(event, callback, options);
    },
    enqueue: function(queueNames, message, callback) {
        _.each(queueNames, function(queueName) {
            if (_.isUndefined(queues[queueName])) {
                queues[queueName] = new EvtArray();
            }

            message.id = uuid.v1();
            queues[queueName].push(message);
            var fired = queues[queueName].fire({
                type: 'added',
                target: queueName
            });
            if (_.isError(fired)) {
                return callback({
                    code: 500,
                    message: fired.message
                });
            }
        });

        return callback(null, message);
    },

    dequeue: function(queueName, id, callback) {
        var queue = _.result(queues, queueName, new EvtArray());

        var message = _.find(queue, function(queuedMessage) {
            return queuedMessage.id === id;
        });

        if (_.isUndefined(message)) {
            return callback({
                code: 404,
                message: 'Message not found for message id ' + id + ' for recipient ' + queueName
            });
        }

        return callback(null, message);
    },

    dequeueAll: function(queueName, callback) {
        var results = _.result(queues, queueName, new EvtArray());
        return callback(null, results);
    },

    delete: function(queueName, id, callback) {
        var messages = queues[queueName];

        if (_.isUndefined(messages) || messages.length === 0) {
            return callback();
        }

        _.remove(messages, function(message) {
            return message.id === id;
        });
        messages.fire('deleted');
        return callback();
    },

    removeQueue: function(queueName, callback) {
        queues = _.omit(queues, queueName);
        return callback();
    }
};
