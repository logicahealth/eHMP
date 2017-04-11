'use strict';
var _ = require('lodash');
var async = require('async');
var pjdsHandler = require('./persistence/pjds-handler.js');





module.exports.handle = function(queue, queueName, id, finalCallback, req, res) {

    async.series([

        function(seriesCallback) {
            pjdsHandler.remove(id, req, res, seriesCallback);
        },
        function(seriesCallback) {
            queue.delete(queueName, id, seriesCallback);
        }
    ], function(err, results) {
        return finalCallback(err);
    });
};
