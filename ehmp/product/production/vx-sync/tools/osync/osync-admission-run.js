'use strict';

require('../../env-setup');

var OsyncAdmissionUtil = require(global.VX_UTILS + 'osync/osync-admission-util');
var config = require(global.VX_ROOT + 'worker-config');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var uuid = require('node-uuid');

var argv = require('yargs')
	.usage('Usage: $0 --site <site> --log-level <log-level>')
	.demand(['site'])
	.string('site')
	.argv;

var referenceInfo = {
    sessionId: uuid.v4(),
    utilityType: 'osync-admission'
};

var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil._createLogger({
    name: 'osync-admission-run',
    level: argv['log-level'] || 'error'
}).child(referenceInfo);

console.log('osync-admission-run: Utility started. sessionId: %s', referenceInfo.sessionId);

var environment = pollerUtils.buildOsyncEnvironment(log, config);
var sites = argv.site.split(',');
var osyncAdmissionUtil = new OsyncAdmissionUtil(log, config, environment);

osyncAdmissionUtil.createAndPublishAdmissionsJob(sites, referenceInfo, function(error) {
	if (error) {
		console.log('osync-admission-run: Utility stopped due to error: %j', error);
	} else {
		console.log('osync-admission-run: Utility finished successfully.');
	}

	process.exit();
});