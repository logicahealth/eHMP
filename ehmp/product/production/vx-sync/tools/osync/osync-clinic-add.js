'use strict';

require('../../env-setup');
var _ = require('underscore');
var clc = require('cli-color');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var yargs = require('yargs');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require('jds-cache-api').PjdsClient;
var OsyncClinicUtils = require(global.VX_UTILS + 'osync/osync-clinic-utils');

var argv = yargs
    .usage('Usage: $0 --site <site> --clinic <clinic> --uid <uid> --type <type> --log-level <log-level> --override')
    .help()
    .string('site')
    .string('clinic')
    .string('uid')
    .string('type')
    .string('log-level')
    .boolean('override')
    .implies('clinic', 'site')
    .implies('site', 'clinic')
    .default('l', 'error')
    .alias('h', 'help')
    .alias('s', 'site')
    .alias('c', 'clinic')
    .alias('u', 'uid')
    .alias('t', 'type')
    .alias('l', 'log-level')
    .alias('o', 'override')
    .describe('s', 'VistA site hash')
    .describe('c', 'VistA clinic')
    .describe('u', 'VistA clinic unique identifier')
    .describe('t', 'VistA clinic type')
    .describe('l', 'Log level')
    .describe('o', 'Skip JDS operational validation [normally use with --type W]')
    .choices('type', ['C', 'M', 'W', 'Z', 'N', 'F', 'I', 'OR'])
    .choices('log-level', ['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .wrap(yargs.terminalWidth())
    .strict()
    .argv;

var log = logUtil._createLogger({
    name: 'osync-clinic-add',
    level: argv['log-level']
});

// The yargs config creates an implication dependency between site and clinic; so if we get to the else if clause, uid is defined
if ((_.isEmpty(argv.uid)) && (_.isEmpty(argv.site))) {
    console.error('You must define either --uid or --clinic and --site');
    process.exit(1);
} else if (_.isEmpty(argv.site)) {
    argv.site = argv.uid.split(':')[3];
}

var environment = {
    jds: new JdsClient(log, log, config),
    pjds: new PjdsClient(log, log, config.pjds)
};

var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

osyncClinicUtils.osyncClinicAdd(argv.site, argv.clinic, argv.uid, argv.type, argv.override, function(error, result, clinicList) {
    if (error) {
        console.error(clc.red('osync-clinic-add.osyncClinicAdd: Utility finished with error:'));
        console.error(error);
        process.exit(1);
    }

    console.log(clc.green('osync-clinic-add.osyncClinicAdd: Utility finished successfully:'));

    if (_.isArray(clinicList)) {
        _.each(clinicList, function(clinic) {
            console.log('\tUID: %s', clinic);
        });
    }

    console.log(result);
    process.exit(0);
});
