'use strict';

require('../../env-setup');

var _ = require('underscore');
var inspect = require('util').inspect;
var moment = require('moment');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var healthcheckUtils = require(global.VX_UTILS + 'healthcheck-utils');

var argv = require('yargs')
    .usage('Usage: $0 --jdsHost <jdsHost> --jdsPort <jdsPort> --jdsProtocol <jdsProtocol> --jdsTimeout <jdsTimeout> --heartbeatStaleAgeMillis <heartbeatStaleAgeMillis> --staleOnly --no-header --javascript --log-level <log-level>')
    .demand(['jdsHost', 'jdsPort'])
    .alias('h', 'jdsHost')
    .alias('p', 'jdsPort')
    .alias('n', 'no-header')
    .argv;

var logger = require('bunyan').createLogger({
    name: 'hc-heart-beat',
    level: argv['log-level'] || 'error'
});

var config = {healthcheck: {heartbeatStaleAgeMillis: argv.heartbeatStaleAgeMillis || 600000},
    jds: {protocol: argv.jdsProtocol || 'http',
        host: argv.jdsHost,
        port: argv.jdsPort,
        timeout: argv.jdsTimeout || 300000}};

var includeHeader = !_.has(argv, 'no-header');
var staleOnly = _.has(argv, 'staleOnly');
var javascript = argv.javascript;
var currentMoment = moment();

var metricsLog = {  fatal: function(message, object) {},
    error: function(message, object) {},
    warn: function(message, object) {},
    info: function(message, object) {},
    debug: function(message, object) {},
    trace: function(message, object) {},
    log: function(level, attributes) {}};

var environment = {jds: new JdsClient(logger, metricsLog, config)};

function formatHeartBeatTime(response) {
    return _.each(response, function(heartbeat) {
        var heartbeatTime = heartbeat.heartbeatTime;

        heartbeat.heartbeatTime = heartbeatTime.slice(0,4) + '/' + heartbeatTime.slice(4,6) +
        '/' + heartbeatTime.slice(6,8) + " " + heartbeatTime.slice(8,10) +
        ":" + heartbeatTime.slice(10,12) + ":" + heartbeatTime.slice(12);

        var processStartTime = heartbeat.processStartTime;

        heartbeat.processStartTime = processStartTime.slice(0,4) + '/' + processStartTime.slice(4,6) +
        '/' + processStartTime.slice(6,8) + " " + processStartTime.slice(8,10) +
        ":" + processStartTime.slice(10,12) + ":" + processStartTime.slice(12);
    });
}

function formatResult(result, javascript) {
    if (javascript) {
        return inspect(result, {depth: null});
    }

    return JSON.stringify(result, null, 4);
}

function logResults(error, result) {
    if (error) {
        error = formatResult(error, javascript);

        if (includeHeader) {
            error = 'Error checking vxsync heart beats: ' + error;
        }

        console.log(error);
        process.exit(1);                    //JDSClient is using vxsync-forever-agent which will not allow shutdown at end of script
    }

    if (_.has(result, 'items')) {
        result = result.items;
    }

    formatHeartBeatTime(result);
    console.log(formatResult(result));
    process.exit();                         //JDSClient is using vxsync-forever-agent which will not allow shutdown at end of script
}

if (includeHeader) {
    console.log('checking vxsync heart beats at %s.', currentMoment);
}

if (staleOnly) {
    healthcheckUtils.retrieveStaleHeartbeats(logger, config, environment, currentMoment, logResults);
} else {
    healthcheckUtils.retrieveHeartbeats(logger, config, environment, logResults);
}
