'use strict';

require('../../env-setup');
var _ = require('underscore');
var clc = require('cli-color');
var config = require(global.VX_ROOT + 'worker-config');
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var logUtil = require(global.VX_UTILS + 'log');
var pollerUtil = require(global.VX_UTILS + 'poller-utils');
var yargs = require('yargs');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var OsyncClinicUtils = require(global.VX_UTILS + 'osync/osync-clinic-utils');
config.beanstalk = queueConfig.createFullBeanstalkConfig(config.osync.beanstalk);
logUtil.initialize(config, 'osync');

var argv = yargs
    .usage('Usage: $0 --site <site> --uid <uid> --log-level <log-level>')
    .help()
    .string('site')
    .string('uid')
    .string('log-level')
    .default('l', 'error')
    .alias('h', 'help')
    .alias('s', 'site')
    .alias('u', 'uid')
    .alias('l', 'log-level')
    .describe('s', 'VistA site hash')
    .describe('u', 'VistA clinic unique identifier')
    .describe('l', 'Log level')
    .choices('log-level', ['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .wrap(yargs.terminalWidth())
    .strict()
    .argv;

var log = logUtil._createLogger({
    name: 'osync-clinic-run',
    level: argv['log-level'],
    child: logUtil._createLogger
});

if ((_.isEmpty(argv.uid)) && (_.isEmpty(argv.site))) {
    console.error('You must define either --uid or --site');
    process.exit(1);
}

var environment = pollerUtil.buildOsyncEnvironment(log, config);
var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

osyncClinicUtils.osyncClinicRun(argv.site, argv.uid, function(error, result, clinicList) {
    environment.publisherRouter.close();

    if (error) {
        console.error(clc.red('osync-clinic-run.osyncClinicRun: Utility finished with error:'));
        console.error(error);
        process.exit(1);
    }

    console.log(clc.green('osync-clinic-run.osyncClinicRun: Utility finished successfully:'));

    if (_.isArray(clinicList)) {
        _.each(clinicList, function(clinic) {
            console.log('\tUID: %s', clinic);
        });
    }

    console.log(result);
    process.exit(0);
});
