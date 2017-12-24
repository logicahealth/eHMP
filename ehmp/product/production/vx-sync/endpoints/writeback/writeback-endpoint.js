'use strict';

var argv = require('yargs')
    .usage('Usage: $0 --port <port>')
    .demand(['port'])
    .argv;

require('../../env-setup');
var express = require('express');
var bodyParser = require('body-parser');
var config = require(global.VX_ROOT + 'worker-config');
require('http').globalAgent.maxSockets = config.endpointMaxSockets || 5;
var logUtil = require(global.VX_UTILS + 'log');

logUtil.initialize(config);
var log = logUtil.get('writeback-endpoint', 'host');
if (config.appDynamicsProfile) {
    log.debug('appDynamicsProfile object detected on configuration - requiring appdynamics');
    var appDynamicsProfile = JSON.parse(JSON.stringify(config.appDynamicsProfile));
    require('appdynamics').profile(appDynamicsProfile); // tier and node names are read from environment variables
}
var pollerUtils = require(global.VX_UTILS + 'poller-utils');

var processWriteback = require('./writeback-endpoint-middleware');
var environment = pollerUtils.buildEnvironment(log, config);
var port = argv.port;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});

app.get('/ping', function(req, res) {
    res.send('ACK');
});

app.post('/writeback', function(req, res, next){
    processWriteback(log, config, environment, req, res, next);
});

app.listen(port);
log.warn('writeback endpoint listening on port %s', port);
