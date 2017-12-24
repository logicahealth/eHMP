'use strict';

var port = require('yargs')
	.usage('Usage: $0 --port <port>')
	.demand(['port'])
	.argv.port;

require('../../env-setup');
var bodyParser = require('body-parser');

var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil.initialize(config).get('error-endpoint');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var environment = pollerUtils.buildEnvironment(log, config);

var registerErrorAPI = require(global.VX_ENDPOINTS + 'error-handling/error-endpoint-middleware');

process.on('uncaughtException', function(err) {
	console.log(err);
	console.log(err.stack);
});

var app = require('express')().use(bodyParser.json())
	.use(bodyParser.urlencoded({
		'extended': true
	}));

registerErrorAPI(log, config, environment, app);

app.get('/ping', function(req, res) {
	res.send('ACK');
});

app.listen(port);
log.info('Error endpoint listening on port %s', port);