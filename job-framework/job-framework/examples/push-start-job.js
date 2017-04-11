'use strict';

var JobUtils = require('./job-utils');
var BeanstalkClient = require('../src/beanstalk-client');

var _ = require('underscore');

var argv = require('yargs')
	.usage('Usage: $0 --host <host> --port <port> --tube --error --log-level <log-level>')
	.demand(['host', 'port', 'tube'])
	.alias('h', 'host')
	.alias('p', 'port')
	.alias('t', 'tube')
	.alias('e', 'error')
	.argv;

var logger = require('bunyan').createLogger({
	name: 'beanstalk-admin',
	level: argv['log-level'] || 'error'
});

var logger = require('bunyan').createLogger({
	name: 'beanstalk-admin',
	level: argv['log-level'] || 'error'
});

var host = argv.host;
var port = argv.port;
var tube = argv.tube;
var error = false;

if (_.has(argv, 'error')) {
	error = !_.isEmpty(argv.error) ? argv.error : 'Default Error';
}

var job = JobUtils.create(JobUtils.startRequestType, error);

var client = new BeanstalkClient(logger, host, port);

client.connect(function(error) {
	if (error) {
		logger.error('Error connecting: %s', error);
		return process.exit(1);
	}

	client.use(tube, function(error) {
		if (error) {
			logger.error('Error using tube "%s": ', tube, error);
			return process.exit(1);
		}

		client.put(1, 0, 60, JSON.stringify(job), function(error) {
			if (error) {
				logger.error('Error using tube "%s": ', tube, error);
				return process.exit(1);
			}

			logger.info('Job sent to tube: "%s"', tube);
			return process.exit(0);
		});
	});
});