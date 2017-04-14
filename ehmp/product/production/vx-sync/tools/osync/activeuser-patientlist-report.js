'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var OsyncActiveUserListUtil = require(global.VX_UTILS + 'osync/osync-active-user-list-util');

var argv = require('yargs')
    .usage('Usage: $0 --no-header --log-level <log-level>')
    .alias('n', 'no-header')
    .help()
    .argv;

var log = require('bunyan').createLogger({
    name: 'activeuser-patientlist-report',
    level: argv['log-level'] || 'error'
});
var config = require(global.VX_ROOT + 'worker-config');

var nullUtils = require(global.VX_UTILS + 'null-utils');
var patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');

var noHeader = _.has(argv, 'no-header');

if (!noHeader) {
    console.log('Getting PatientList for Active Users...');
}

var pjds = new PjdsClient(log, log, config);
var jds = new JdsClient(log, log, config);

var environment = {
    pjds: pjds,
    jds: jds
};

var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
osyncActiveUserListUtil.getActiveUsers(function (error, users) {
    if (error) {
        console.log('Error retrieving active user lists. Error: ' + error);
        process.exit(0);
    }

    async.eachSeries(users, function(user, callback) {
        if (nullUtils.isNullish(user)) {
            return callback();
        }

        console.log('User: ' + JSON.stringify(user));

        patientListVistaRetriever.getPatientListForOneUser(log, config.osync, user, function(error, patientList) {
            if (error) {
                console.log('Error retrieving patient list for user ' + JSON.stringify(user) + '. Error: ' + error);
                return callback();
            }

            if (_.isArray(patientList) && patientList.length > 0) {
                console.log(' |');

                async.eachSeries(patientList, function(patient, cb) {
                    console.log(' -- Patient: ' + JSON.stringify(patient));
                    cb();
                }, function() {
                    setTimeout(callback, 0);
                });
            } else {
                console.log('** No patients. **');
                return callback();
            }
        });
    }, function() {
        console.log('\nProcessing complete.');
        process.exit(0);
    });

});
