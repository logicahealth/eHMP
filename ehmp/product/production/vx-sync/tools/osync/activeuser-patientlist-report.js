'use strict';

var _ = require('underscore');
var async = require('async');
var env = require('../../env-setup');

var argv = require('yargs')
    .usage('Usage: $0 --no-header --log-level <log-level>')
    .alias('n', 'no-header')
    .argv;

var log = require('bunyan').createLogger({
    name: 'activeuser-patientlist-report',
    level: argv['log-level'] || 'error'
});
var config = require(global.VX_ROOT + 'worker-config.json').vxsync;
config.osync.vistaSites = config.vistaSites;
config.osync.rpcContext = 'HMP UI CONTEXT';

var nullUtils = require(global.VX_UTILS + 'null-utils');
var activeUserHandler = require(global.VX_HANDLERS + 'osync/active-users/active-users');
var patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');

var noHeader = _.has(argv, 'no-header');

if (!noHeader) {
    console.log('Getting PatientList for Active Users...');
}

var patientListJob;
var activeUserEvo = {publisherRouter: { publish: function(jobToPublish, handlerCallback) {
    patientListJob = jobToPublish;
    return handlerCallback();
}}};

activeUserHandler(log, config.osync, activeUserEvo, {type: 'active-users'}, function(err) {
    if (err) {
        console.log('Error retrieving active user lists. Error: ' + err);
        process.exit(0);
    } else {
        async.eachSeries(patientListJob.users, function(user, callback) {
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
    }
});
