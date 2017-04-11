'use strict';

module.exports.handle = function(queue, queueName, callback) {
    if (arguments.length === 4) {
        return queue.delete(queueName, arguments[2], arguments[3]);
    } else {
        return queue.removeQueue(queueName, callback);
    }
};

