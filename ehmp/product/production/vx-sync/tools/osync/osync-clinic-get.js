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
    .usage('Usage: $0 --site <site> --log-level <log-level>')
    .help()
    .string('site')
    .string('log-level')
    .default('l', 'error')
    .alias('h', 'help')
    .alias('s', 'site')
    .alias('l', 'log-level')
    .describe('s', 'VistA site hash')
    .describe('l', 'Log level')
    .choices('log-level', ['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .wrap(yargs.terminalWidth())
    .strict()
    .argv;

var log = logUtil._createLogger({
    name: 'osync-clinic-get',
    level: argv['log-level']
});

if (_.isEmpty(argv.site)) {
    console.error('You must define --site');
    process.exit(1);
}

var environment = {
    jds: new JdsClient(log, log, config),
    pjds: new PjdsClient(log, log, config.pjds)
};

var osyncClinicUtils = new OsyncClinicUtils(log, config, environment);

osyncClinicUtils.osyncClinicGet(argv.site, function(error, result, clinicList) {
    if (error) {
        console.error(clc.red('osync-clinic-add.osyncClinicGet: Utility finished with error:'));
        console.error(error);
        process.exit(1);
    }

    console.log(clc.green('osync-clinic-add.osyncClinicGet: Utility finished successfully:'));

    if (_.isArray(clinicList)) {
        _.each(clinicList, function(clinic) {
            console.log('\tUID: %s', clinic);
        });
    }

    console.log(result);
    process.exit(0);
});
