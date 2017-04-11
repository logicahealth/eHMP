'use strict';
var async = require('async');
var pjdsHandler = require('./persistence/pjds-handler.js');


module.exports.handle = function(queue, message, queueName, resourceId, callback, req, res) {

    async.waterfall([

        function(waterCallback) {

            queue.update(queueName, resourceId, message, waterCallback, req, res);

        },
        function(result, waterCallback) {
            pjdsHandler.update(queueName, result, req, res, function(err, results) {
                if (err) {
                    return callback(err);
                }
                return callback(err, results.data);
            });

        },
    ], function completionCallback(err, results) {

        if (err) {
            return callback(err);
        }
        return callback(null, results.data);
    });
};
