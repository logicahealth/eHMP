'use strict';

require('../../env-setup');
var activeUserCleanup = require('./active-user-cleanup');

var cron = require('node-schedule');

var config = require(global.VX_ROOT + 'worker-config');
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
config.beanstalk = queueConfig.createFullBeanstalkConfig(config.osync.beanstalk);

var logUtil = require(global.VX_UTILS + 'log');
var pollerUtil = require(global.VX_UTILS + 'poller-utils');
var handler = require(global.OSYNC_HANDLERS + 'opportunistic-sync-request/opportunistic-sync-request');
logUtil.initialize(config, 'osync');
var log = logUtil.get('opportunistic-sync');

var environment = pollerUtil.buildOsyncEnvironment(log, config);
var oSyncConfig = config.osync;

if (oSyncConfig.runImmediately === true) {
    log.info('opportunistic-sync-request endpoint running immediately');
    handler.handle(log, oSyncConfig, environment, function(){});
} 

if (oSyncConfig.runOnSchedule === true) {
    var rule = new cron.RecurrenceRule();
    rule.dayOfWeek = [5,6,0,1,2,3,4];
    rule.hour = Number(oSyncConfig.scheduledRunAtHour);
    rule.minute = Number(oSyncConfig.scheduledRunAtMinutes);

    log.info('opportunistic-sync: schedulejob...' + rule.hour);
    cron.scheduleJob(rule, function() {
        log.debug(rule);
        log.debug('starting handlers');
        handler.handle(log, oSyncConfig, environment, function(){});
    });
}

//Setup Delete ActiveUsers cron job
var rule = new cron.RecurrenceRule();
rule.dayOfWeek = [5,6,0,1,2,3,4];
rule.hour = Number(oSyncConfig.scheduledRunAtHour + 2);
rule.minute = Number(oSyncConfig.scheduledRunAtMinutes);

log.info('opportunistic-sync: active cleanup schedule job...' + rule.hour);
cron.scheduleJob(rule, function() {
    log.debug(rule);
    log.debug('opportunistic-sync: Starting active user cleanup.');
    activeUserCleanup.removeInactiveUsers(log, oSyncConfig);
});
