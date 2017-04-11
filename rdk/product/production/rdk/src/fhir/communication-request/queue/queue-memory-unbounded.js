'use strict';
var _ = require('lodash');
var async = require('async');
var EvtArray = require('../utils/utils-evented-array');
var pjdsHandler = require('../persistence/pjds-handler.js');

var queues = {};


function extractRecipientsFromRequest(message) {
    return _.chain(message.recipient)
        .transform(function(result, recipent) {
            result.push(recipent.reference);
        })
        .unique().value();
}
module.exports = {
    init: function(app, callback) {
        pjdsHandler.getAll(app.logger, app.config, null, function(err, items) {
            if (err) {
                return;
            }
            _.each(items, function(message) {
                //get the queuenames from each of the messages
                var queueNames = extractRecipientsFromRequest(message);
                _.each(queueNames, function(queueName) {
                    if (_.isUndefined(queues[queueName])) {
                        queues[queueName] = new EvtArray();
                    }
                    if (message.status !== 'completed') {
                        queues[queueName].push(message);
                    }
                });
            });
            return callback(null, null);
        });
    },
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

            async.series([

                function(seriesCallback) {
                    queues[queueName].push(message);
                    var fired = queues[queueName].fire({
                        type: 'added',
                        target: queueName
                    });
                    if (_.isError(fired)) {
                        seriesCallback({
                            code: 500,
                            message: fired.message
                        });
                    }
                    seriesCallback(null, null);
                }
            ], function(err, result) {
                if (err) {
                    return callback(err);
                }
                return callback(null, message);
            });

        });
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
        var queue = _.result(queues, queueName, new EvtArray());
        return callback(null, queue);
    },

    update: function(queueName, id, message, callback) {
        var queue = _.result(queues, queueName, new EvtArray());
        var updatedMessage = _.assign(_.findWhere(queue, {
            id: id
        }), message, function(value, other) {
            return _.isUndefined(other) ? value : other;
        });

        if (_.isUndefined(updatedMessage)) {
            return callback({
                code: 404,
                message: 'Message not found for message id ' + id + ' for recipient ' + queueName
            });
        }

        var fired = queue.fire({
            type: 'updated',
            target: queueName
        });
        if (_.isError(fired)) {
            return callback({
                code: 500,
                message: fired.message
            });
        }

        if (!_.isUndefined(message) && !_.isUndefined(message.status) && message.status === 'completed') {
            return this.delete(queueName, id, function(err, result) {
                return callback(null, updatedMessage);
            });
        }

        return callback(null, updatedMessage);
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
