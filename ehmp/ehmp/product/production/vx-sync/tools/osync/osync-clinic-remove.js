'use strict';

require('../../env-setup');
var _ = require('underscore');
var clc = require('cli-color');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var yargs = require('yargs');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var OsyncClinicUtils = require(global.VX_UTILS + 'osync/osync-clinic-utils');

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
    name: 'osync-clinic-remove',
    level: argv['log-level']
});

if ((_.isEmpty(argv.uid)) && (_.isEmpty(argv.site))) {
    console.error('You must define either --uid or --site');
    process.exit(1);
}

var environment = {
    jds: new JdsClient(log, log, config),
    pjds: new PjdsClient(log, log, config)
};

var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

osyncClinicUtils.osyncClinicRemove(argv.site, argv.uid, function(error, result, clinicList) {
    if (error) {
        console.error(clc.red('osync-clinic-remove.osyncClinicRemove: Utility finished with error:'));
        console.error(error);

        if (_.isArray(clinicList)) {
            _.each(clinicList, function(clinic) {
                console.log('\tUID: %s', clinic);
            });

            console.log(result);
        }

        process.exit(1);
    }

    console.log(clc.green('osync-clinic-remove.osyncClinicRemove: Utility finished successfully:'));

    if (_.isArray(clinicList)) {
        _.each(clinicList, function(clinic) {
            console.log('\tUID: %s', clinic);
        });
    }

    console.log(result);
    process.exit(0);
});
