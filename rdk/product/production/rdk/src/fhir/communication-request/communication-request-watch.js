'use strict';

module.exports.handle = function(evt, queue, queueName, callback) {
    var listenerOptions = {};
    return queue.addListenerOnce(evt, queueName, callback, listenerOptions);
};
