'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var communicationRequestFilter = require('./communication-request-filter');

module.exports.handle = function(queue, queueName, params, callback) {

    if (_.isString(params)) {
        //params = resourceId
        return queue.dequeue(queueName, params, callback);
    }

    //params = req.params (possible filter keys)
    queue.dequeueAll(queueName, function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(err, communicationRequestFilter.filter(params, results));
    });
};

module.exports.handleNew = function(queue, queueName, startTime, params, callback) {
    var response = [];
    queue.dequeueAll(queueName, function(err, results) {
        if (err) {
            return callback(err);
        }
        var res = communicationRequestFilter.filter(params, results);
        for (var i = 0; i < res.length; i++) {
            if (new Date(startTime).getTime() < new Date(res[i].requestedOn).getTime()) {
                response.push(res[i]);
            }
        }
        if (response.length > 0) {
            return callback(err, response);
        }
    });
    if (response.length === 0) {
        var queryTimer = setInterval(function(queue, queueName, startTime, params, callback) {
            queue.dequeueAll(queueName, function(err, results) {
                if (err) {
                    return callback(err);
                }
                var res = communicationRequestFilter.filter(params, results);
                for (var i = 0; i < res.length; i++) {
                    if (new Date(startTime).getTime() < new Date(res[i].requestedOn).getTime()) {
                        response.push(res[i]);
                    }
                }
                if (response.length > 0) {
                    clearInterval(queryTimer);
                    return callback(err, response);
                }
            });
        }, 3000, queue, queueName, startTime, params, callback);
    }
};
