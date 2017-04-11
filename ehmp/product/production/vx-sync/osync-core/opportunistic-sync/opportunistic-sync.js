'use strict';

var argv = require('yargs')
    .usage('Usage: $0 --port <port>')
    .demand(['port'])
    .argv;

require('../../env-setup');

var cron = require('node-schedule');

var config = require(global.VX_ROOT + 'worker-config').osync;
var queueConfig = require(global.VX_JOBFRAMEWORK + 'queue-config.js');
config.beanstalk = queueConfig.createFullBeanstalkConfig(config.beanstalk);

var logUtil = require(global.VX_UTILS + 'log');
var pollerUtil = require(global.VX_UTILS + 'poller-utils');
var handler = require(global.OSYNC_HANDLERS + 'opportunistic-sync-request/opportunistic-sync-request');
logUtil.initialize(config.loggers);
var log = logUtil.get('opportunistic-sync');

var environment = pollerUtil.buildOsyncEnvironment(log, config);

if (config.runImmediately === true) {
    log.info('opportunistic-sync-request endpoint running immediately');
    handler.handle(log, config, environment, function(){});
} 

if (config.runOnSchedule === true) {
    var rule = new cron.RecurrenceRule();
    rule.dayOfWeek = [5,6,0,1,2,3,4];
    rule.hour = Number(config.scheduledRunAtHour);
    rule.minute = Number(config.scheduledRunAtMinutes);

    log.info('opportunistic-sync: schedulejob...' + rule.hour);
    cron.scheduleJob(rule, function() {
        log.debug(rule);
        log.debug('starting handlers');
        handler.handle(log, config, environment, function(){});
    });
}
