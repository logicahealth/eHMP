'use strict';

require('../../env-setup');
var _ = require('underscore');
var inspect = require('util').inspect;
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var objUtil = require(global.VX_UTILS + 'object-utils');

var argv = require('yargs')
	.usage('Usage: $0 [options...]')
	.demand(['host', 'port'])
	.demand(['site'])
	.string('site')
	.describe('site', 'Site hash of the VistA site where the request is being directed.')
	.describe('host', 'IP Address of the VistA host')
	.describe('port', 'Port of the VistA host')
	.describe('accessCode', 'Value to use for accessCode for validation. Defaults to USER  ')
	.describe('verifyCode', 'Value to use for verifyCode for validation. Defaults to PW      ')
	.nargs('accessCode', 1)
	.nargs('verifyCode', 1)
	.describe('context', 'Context to set for running the RPC. Defaults to VPR SYNCHRONIZATION CONTEXT or HMP SYNCHRONIZATION CONTEXT')
	.describe('lastUpdate', 'Value of the lastUpdate received. Defaults to 0')
	.describe('maxBatchSize', 'Maximum Batch Size to return.')
	.describe('hmpServerId', 'Value for the hmpServerId parameter. Defaults to hmp-development-box.')
	.describe('logLevel', 'bunyan log levels, one of: trace, debug, info, warn, error, fatal. Defaults to error.')
	.argv;


var logger = require('bunyan').createLogger({
	name: 'rpc',
	level: argv.logLevel || 'error'
});

var workerConfig = require(global.VX_ROOT + 'worker-config');

var config = {
	host: argv.host,
	port: argv.port,
	accessCode: argv.accessCode || 'USER  ',
	verifyCode: argv.verifyCode || 'PW      ',
	localIP: '127.0.0.1',
	localAddress: 'localhost',
	context: argv.context || 'HMP SYNCHRONIZATION CONTEXT',
	connectTimeout: 3000,
	sendTimeout: 10000
};

var rpc = 'HMPDJFS API';
var params = {
	'"command"': 'getPtUpdates',
	'"lastUpdate"': argv.lastUpdate ? String(argv.lastUpdate) : '0',
	'"getStatus"': true,
	'"max"': argv.maxBatchSize || '1000',
	'"hmpVersion"': '0.7-S65',
	'"extractSchema"': '3.001',
	'"server"': argv.hmpServerId || 'hmp-development-box'
};

// Make sure the site is valid.
//------------------------------
var site;
if ((_.isString(argv.site)) && (_.isObject(workerConfig.vistaSites[argv.site]))) {
    site = argv.site;
} else {
    console.log('Site: %s is not a valid site.  Verify the existence of this site in worker-config.json.', argv.site);
    process.exit();
};

// Make sure the ip and ports match.
//------------------------------
if (config.host != objUtil.getProperty(workerConfig, 'vistaSites', site, 'host')) {
    console.log('requested ip address does not match configuration');
    process.exit();
};
if (config.port != objUtil.getProperty(workerConfig, 'vistaSites', site, 'port')) {
    console.log('requested port does not match configuration');
    process.exit();
};

// Make sure that the site being requested is configured for multiple poller mode.
//---------------------------------------------------------------------------------
var multipleMode = objUtil.getProperty(workerConfig, 'vistaSites', site, 'multipleMode');
if (multipleMode === true) {
    console.log('Site: %s is configured as a multi-poller-mode site.  This utility is only valid for sites running in single-poller-mode.', argv.site);
    process.exit();
};

rpcUtil.standardRPCCall(logger, config, rpc, params, null, function(error, response) {
	logger.debug('Completed calling Fetch RPC for dfn: %s; result: %j', argv.dfn, response);
	if (error) {
		console.log('Error calling Fetch');
		console.log(error);
		if (response) {
			console.log(response);
		}
		process.exit(1);
	}

	console.log('Called Fetch');
	console.log('Response:');
	try {
		console.log(inspect(JSON.parse(response), {
			depth: null
		}));
	} catch (err) {
		console.log(response);
	}
	process.exit(0);
});