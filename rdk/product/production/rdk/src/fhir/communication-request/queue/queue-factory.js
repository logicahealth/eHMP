'use strict';

var _ = require('lodash');
var memoryQueue = require('./queue-memory-unbounded');

module.exports.create =  function(app) {
    var config = app.config;

    if (!_.isNull(_.result(config, 'beanstalk.host', null)) && !_.isNull(_.result(config, 'beanstalk.port', null))) {
        var queue = require('./queue-beanstalk');
        queue.init(app.logger, config.beanstalk.host, config.beanstalk.port);

        return queue;
    }

    return memoryQueue;
};
