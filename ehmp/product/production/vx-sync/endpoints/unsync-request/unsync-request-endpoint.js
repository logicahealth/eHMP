'use strict';

var port = require('yargs')
    .usage('Usage: $0 --port <port>')
    .demand(['port'])
    .argv.port;

require('../../env-setup');
var bodyParser = require('body-parser');
var multer = require('multer');
var cron = require('node-schedule');
var logUtil = require(global.VX_UTILS + 'log');
var config = require(global.VX_ROOT + 'worker-config');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var log = logUtil.initialize(config).get('unsync');
var environment = pollerUtils.buildEnvironment(log, config);

var handler = require(global.VX_HANDLERS + 'unsync-request/unsync-handler');

process.on('uncaughtException', function(err){
    console.log(err);
    console.log(err.stack);
});

var app = require('express')().use(bodyParser.json())
    .use(multer())
    .use(bodyParser.urlencoded({
        'extended': true
    }));

app.get('/ping', function(req, res) {
    res.send('ACK');
});

app.listen(port);

if(config.unsync.scheduledRunAtHour < 0 || config.unsync.scheduledRunAtHour>23 ){
    log.warn('Invalid value for scheduledRunAtHour in the config file. The value cannot be less than zero or greater than 23');
}

if(config.unsync.scheduledRunAtMinutes < 0 || config.unsync.scheduledRunAtMinutes>59 ){
    log.warn('Invalid value for scheduledRunAtMinutes in the config file. The value cannot be less than zero or greater than 59');
}
if (config.unsync.runImmediately === true) {
    log.info('unsync-endpoint running immediately');
    handler.handle(log, config, environment, function(){});
} else {
    var rule = new cron.RecurrenceRule();
    rule.dayOfWeek = [5,6,0,1,2,3,4];
    rule.hour = Number(config.unsync.scheduledRunAtHour);
    rule.minute = Number(config.unsync.scheduledRunAtMinutes);

    log.info('unsync-endpoint: schedulejob...rule.hour %j rule.minute %j', rule.hour, rule.minute);

    cron.scheduleJob(rule, function(){
           handler.handle(log, config, environment, function(){});
    });
}
