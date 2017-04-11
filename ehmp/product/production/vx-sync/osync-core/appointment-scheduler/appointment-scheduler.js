'use strict';

var argv = require('yargs')
    .usage('Usage: $0 --port <port>')
    .demand(['port'])
    .argv;

require('../../env-setup');

var _ = require('lodash');
var cron = require('node-schedule');

var config = require(global.VX_ROOT + 'worker-config').osync;
var queueConfig = require(global.VX_JOBFRAMEWORK + 'queue-config.js');
config.beanstalk = queueConfig.createFullBeanstalkConfig(config.beanstalk);

var logUtil = require(global.VX_UTILS + 'log');
var pollerUtil = require(global.VX_UTILS + 'poller-utils');
logUtil.initialize(config.loggers);
var log = logUtil.get('appointment-scheduler');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var environment = pollerUtil.buildOsyncEnvironment(log, config);

var clinicSchedule = config.appointmentsOptions.clinicsList;
if (config.runOnSchedule && !_.isEmpty(clinicSchedule)) {
    var sites = _.keys(clinicSchedule);
    _.each(sites, function(site) {
        var clinics = clinicSchedule[site];
        _.each(clinics, function(clinic) {
            var rule = new cron.RecurrenceRule();
            rule.dayOfWeek = [5, 6, 0, 1, 2, 3, 4];
            rule.hour = Number(clinic.hour);
            rule.minute = Number(clinic.minutes);

            var job = jobUtil.createAppointmentsJob(log, config, environment);
            job.siteId = site;
            job.clinic = clinic.clinic;

            cron.scheduleJob(rule, function() {
                log.debug(rule);
                log.debug('starting job ' + JSON.stringify(job));

                environment.publisherRouter.publish(job, function (error) {
                    if (error) {
                        log.debug('appointment-scheduler.publishing job: publisher error: %s', error);
                    }

                    log.debug('appointment-scheduler.publishing job: job published, complete status. jobId: %s, jobs: %j', job.jobId);
                });
            });
        });
    });
}
