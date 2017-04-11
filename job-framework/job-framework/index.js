'use strict';

module.exports.BeanstalkClient = require('./src/beanstalk-client');
module.exports.Publisher = require('./src/publisher');
module.exports.PublisherRouter = require('./src/publisher-router');
module.exports.Worker = require('./src/worker');
module.exports.ErrorPublisher = require('./src/error-publisher');
module.exports.HandlerRegistry = require('./src/handler-registry');
module.exports.QueueConfig = {
	createDefaultBeanstalkConfig: require('./src/queue-config').createDefaultBeanstalkConfig,
	createFullBeanstalkConfig: require('./src/queue-config').createFullBeanstalkConfig,
	repoDefaults: require('./src/queue-config').repoDefaults,
	repoUniversal: require('./src/queue-config').repoUniversal
};