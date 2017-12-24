'use strict';

require('../../env-setup');

// This utility is used to get a list of all patients that might be used in the VA in the near future.  The list is
// similar to the list used by osync with the addition of pulling all appointments from all configured VistAs.
//
// Patients are stored in pJDS in the prefetch data store.  Patients expire and are removed if the sourceDate is later
// than 48 hours from the current run time.
//
// This utility is executed every 6 hours by a cron job.

var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var yargs = require('yargs');
var clc = require('cli-color');

var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var pollerUtil = require(global.VX_UTILS + 'poller-utils');

var prefetchAdmissionsUtil = require(global.OSYNC_UTILS + 'prefetch-patients-admissions');
var prefetchAppointmentsUtil = require(global.OSYNC_UTILS + 'prefetch-patients-appointments');
var prefetchPatientListUtil = require(global.OSYNC_UTILS + 'prefetch-patients-patient-list');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

logUtil.initialize(config, 'osync');

var argv = yargs
    .usage('Usage: $0 --sources <sources> --appt-start-date <start-date> --appt-end-date <end-data> --log-level <log-level>')
    .help()
    .string('log-level')
    .array('sources')
    .alias('h', 'help')
    .alias('s', 'sources')
    .alias('start', 'appt-start-date')
    .alias('end', 'appt-end-date')
    .alias('l', 'log-level')
    .describe('s', 'sources to prefetch - appointment, admission, patientList')
    .describe('start', 'appointment query start date in YYYYMMDDHHmmss format')
    .describe('end', 'appointment query end date in YYYYMMDDHHmmss format')
    .describe('l', 'Log level')
    .default('l', 'error')
    .default('s', ['appointment', 'admission', 'patientList'])
    .choices('log-level', ['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .choices('sources', ['appointment', 'admission', 'patientList'])
    .implies('start', 'end')
    .implies('end', 'start')
    .wrap(yargs.terminalWidth())
    .strict()
    .argv;

var log = logUtil._createLogger({
    name: 'osync-prefetch-run',
    level: argv['log-level']
});

if (argv.start && !moment(argv.start, 'YYYYMMDDHHmmss').isValid()) {
    console.error(clc.red('osync-prefetch-run: appt-start-date is not a valid date. Utility aborted.'));
    process.exit(1);
}

if (argv.end && !moment(argv.end, 'YYYYMMDDHHmmss').isValid()) {
    console.error(clc.red('osync-prefetch-run: appt-end-date is not a valid date. Utility aborted.'));
    process.exit(1);
}

console.log('osync-prefetch-run: Utility started.');

config.osync.vistaSites = config.vistaSites;
var environment = pollerUtil.buildOsyncEnvironment(log, config);

var tasks = [];

if (_.contains(argv.sources, 'admission')) {
    tasks.push(prefetchAdmissionsUtil.prefetchPatients.bind(null, log, config, environment));
}

if (_.contains(argv.sources, 'appointment')) {
    tasks.push(prefetchAppointmentsUtil.prefetchPatients.bind(null, log, config, environment, argv.start, argv.end));
}

if (_.contains(argv.sources, 'patientList')) {
    tasks.push(prefetchPatientListUtil.prefetchPatients.bind(null, log, config, environment));
}

async.parallel(tasks, function(error, results) {
    if (error) {
        console.error(clc.red('osync-prefetch-run: Utility finished with an unexpected error while updating the prefetch list:'));
        console.error(error);
        process.exit(1);
    }

    console.log(clc.green('osync-prefetch-run: Utility finished adding and updating prefetch patients successfully:'));
    console.log(results);

    prefetchUtil.deleteExpiredPrefetchPatients(log, environment, function(err) {
        if (error) {
            console.error(clc.red('osync-prefetch-run: Utility finished adding and updating the prefetch list but encountered an error removing expired prefetch patients:'));
            console.error(err);
            process.exit(1);
        }

        console.log(clc.green('osync-prefetch-run: Utility finished successfully:'));
        process.exit(0);
    });
});
