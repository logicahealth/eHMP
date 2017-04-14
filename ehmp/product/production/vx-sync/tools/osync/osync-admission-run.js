'use strict';

require('../../env-setup');

var _ = require('underscore');

var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var config = require(global.VX_ROOT + 'worker-config');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');

var argv = require('yargs')
	.usage('Usage: $0 --site <site> --log-level <log-level>')
	.demand(['site'])
	.string('site')
	.argv;

var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil._createLogger({
    name: 'osync-active-user-list-run',
    level: argv['log-level'] || 'error',
    child: logUtil._createLogger
});

var environment = pollerUtils.buildOsyncEnvironment(log, config);
var sites = argv.site.split(',');
var jobsToPublish = _.map(sites, function(site) {
	return jobUtil.createAdmissionsJob(log, config, environment, { 'siteId': site });
});

environment.publisherRouter.publish(jobsToPublish, function(error) {
	if (error) {
		log.error(error);
	}
	process.exit();
});