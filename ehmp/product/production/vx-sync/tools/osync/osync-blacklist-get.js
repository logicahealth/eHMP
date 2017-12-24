'use strict';

require('../../env-setup');

var PjdsClient = require('jds-cache-api').PjdsClient;

var log = require('bunyan').createLogger({
	'name': 'add-osync-blacklist',
	'level': 'error'
});
var metrics = log;
var config = require(global.VX_ROOT+'worker-config');
var argv = require('yargs')
	.usage('Usage: $0 --list <list>')
	.demand(['list'])
	.argv;

var list = argv.list;

var pjdsClient = new PjdsClient(log, metrics, config.pjds);

pjdsClient.getOsyncBlist(list, function(error, response, result) {
	console.log(result);
	process.exit(0);
});
