'use strict';
var async = require('async');
var _ = require('lodash');
var addCommunicationRequest = require('./communication-request-add');
var deleteCommunicationRequest = require('./communication-request-delete');
var getCommunicationRequest = require('./communication-request-get');
module.exports.handle = function(queue, message, queueName, resourceId, callback) {

    async.waterfall([
        function(waterCallback) {

            getCommunicationRequest.handle(queue, queueName, resourceId, waterCallback);

        },
        function(result, waterCallback) {
            async.series([

                function(waterCallback) {
                    //strip the recipient (we must preserve the original recipient)
                    message.recipient = undefined;
                    //merge objects into one message, overwritting same properties
                    _.assign(message, result, function(other, value) {
                        return _.isUndefined(other) ? value : other;
                    });
                    //strip the id (not allowed on add)
                    message.id = undefined;
                    addCommunicationRequest.handle(queue, message, waterCallback);

                },
                function(waterCallback) {

                    deleteCommunicationRequest.handle(queue, queueName, resourceId, waterCallback);

                }
            ], function completionCallback(err, result) {

                if (err) {
                    return callback(err);
                }
                return callback(null, result[0]);
            });
        },
    ], function completionCallback(err, result) {

        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};
