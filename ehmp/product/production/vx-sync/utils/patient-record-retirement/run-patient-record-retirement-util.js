'use strict';

require('../../env-setup');

var _ = require('underscore');
var logUtil = require(global.VX_UTILS + 'log');
var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var inspect = require('util').inspect;
var RecordRetirementUtil = require(global.VX_UTILS + 'patient-record-retirement/patient-record-retirement-util');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var uuid = require('node-uuid');

var argv;
argv = require('yargs')
    .usage('\r\nThis utility will reqeust a sync for the patients of each active user.  \r\n\r\nUsage: $0')
    .number('lastAccessed')
    .describe('lastAccessed', 'This option overrides the value of "lastAccessed" in worker-config.json with the value passed into the parameter. Records that have not been accessed in the past X days will be considered eligible for retirement, where X is the value passed in via lastAccessed.')
   	.describe('log-level', 'Set a bunyan log level. If excluded, the value of utilityLogLevel in worker-config.json will be used. Possible values from most to least verbose: trace, debug, info, warn, error, fatal')
    .describe('help', 'Show this screen')
    .help('h')
    .alias('h', 'help')
    .argv;

var referenceInfo = {
    sessionId: uuid.v4(),
    utilityType: 'record-retirement'
};

console.log('patient-record-retirement-util: Utility started. sessionId: %s', referenceInfo.sessionId);

var log = logUtil._createLogger({
    name: 'patient-record-retirement-util',
    level: argv['log-level'] || config.recordRetirement.utilityLogLevel || 'debug'
}).child(referenceInfo);

var host = config.beanstalk.repoDefaults.host;
var port = config.beanstalk.repoDefaults.port;

var jds = new JdsClient(log, log, config);
var jobStatusUpdater = new JobStatusUpdater(log, config, jds);
var publisherRouter = new PublisherRouter(log, config, log, jobStatusUpdater);

var environment = {
	jds: jds,
	beanstalk: new BeanstalkClient(log, host, port),
	jobStatusUpdater: jobStatusUpdater,
    publisherRouter: publisherRouter
};

var lastAccessed = argv.lastAccessed;

var recordRetirementUtil = new RecordRetirementUtil(log, config, environment, lastAccessed);

log.info('run-patient-record-retirement-util: ****** Started ******');

if(!_.isUndefined(lastAccessed)) {
	log.info('run-patient-record-retirement-util: Overriding config lastAccesed value. Retiring records that have not been accessed in the past %s days... (rules will still apply)', lastAccessed);
}

recordRetirementUtil.runUtility(referenceInfo, function(error){
	if(error){
		log.error('run-patient-record-retirement-util: ****** Utility finished with error ******\nerror: %s', inspect(error));
	} else {
		log.info('run-patient-record-retirement-util: ****** Utility finished successfully ******');
	}
	process.exit();
});