'use strict';

require('../../env-setup');

var PjdsClient = require('jds-cache-api').PjdsClient;

var log = require('bunyan').createLogger({
	'name': 'remove-osync-blacklist',
	'level': 'error'
});
var metrics = log;
var config = require(global.VX_ROOT+'worker-config');
var argv = require('yargs')
	.usage('Usage: $0 --site <site> --id <id> --list <patient/user>')
	.demand(['site', 'id', 'list'])
    .string('site')
    .string('id')
    .string('list')
	.argv;

var site = argv.site;
var id = argv.id;
var list = argv.list;

var pjdsClient = new PjdsClient(log, metrics, config.pjds);

pjdsClient.removeFromOsyncBlist(id, site, list, function(error) {
	console.log(error?error:'Ok');
	process.exit(0);
});
