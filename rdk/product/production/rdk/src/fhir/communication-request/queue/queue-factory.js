'use strict';

var memoryQueue = require('./queue-memory-unbounded');


module.exports.create = function(app, callback) {
    memoryQueue.init(app, function() {
        return callback(memoryQueue);
    });
};
