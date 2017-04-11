'use strict';

var _ = require('lodash');
var communicationRequestFilter = require('./communication-request-filter');
var pjdsHandler = require('./persistence/pjds-handler.js');

function buildFilter(queueName, id, status) {
    var filter;
    filter = 'eq("recipient[].reference",' + queueName + ')';
    if (!_.isUndefined(id) && !_.isNull(id)) {
        filter += ',' + 'eq(id,' + id + ')';
    }
    if (!_.isUndefined(status) && !_.isNull(status)) {
        filter += ',' + 'eq(status,' + status + ')';
    }
    return filter;
}

module.exports.handle = function(queue, queueName, params, callback) {
    var jdsQuery = {};
    var req = arguments[4];
    if (_.isString(params)) {
        //params = resourceId
        var id = params;
        return queue.dequeue(queueName, id, function(err, message) {
            if (err && err.code === 404) {
                jdsQuery.filter = buildFilter(queueName, id);
                return pjdsHandler.getAll(req.logger, req.app.config, jdsQuery, function(error, items) {
                    if (error) {
                        return callback(error);
                    }
                    if (items.length === 0) {
                        return callback(err, message);
                    }
                    return callback(null, items[0]);
                });
            }
            return callback(err, message);
        });
    }

    //params = req.params (possible filter keys)
    queue.dequeueAll(queueName, function(err, results) {
        if (err) {
            return callback(err);
        }
        jdsQuery.filter = buildFilter(queueName, null, 'completed');
        pjdsHandler.getAll(req.logger, req.app.config, jdsQuery, function(err, pjdsResults) {
            if (err) {
                return callback(err);
            }
            var resultsArray = _.union(results,pjdsResults);
            return callback(err, communicationRequestFilter.filter(params, resultsArray));
        });

    });
};
