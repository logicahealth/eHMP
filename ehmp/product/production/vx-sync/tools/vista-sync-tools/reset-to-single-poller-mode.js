'use strict';

require('../../env-setup');

var argv = require('yargs')
	.usage('Usage: $0 [options...]')
	.demand('site')
	.string('site')
	.describe('site', 'Site hash of the VistA site to switch to single-poller mode.')
	.argv;

var _ = require('underscore');
var fs = require('fs');
var RpcClient = require('vista-js').RpcClient;
var VprUpdateOpData = require(global.VX_UTILS + 'VprUpdateOpData');
var objUtil = require(global.VX_UTILS + 'object-utils');
var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

if ((config) && (_.isArray(config.loggers))) {
    _.each(config.loggers, function (logger) {
        if (_.isArray(logger.streams)) {
            _.each(logger.streams, function(stream) {
                if ((stream.path) && (!fs.existsSync(stream.path))) {
                    stream.path = './reset-to-single-poller-mode.log';
                }
            });
        }
    });
}

var logUtil = require(global.VX_UTILS + 'log');

logUtil.initialize(config);
var log = logUtil.get('reset-to-single-poller-mode');

var jdsClient = new JdsClient(log, log, config);
var vprUpdateOpData = new VprUpdateOpData(log, argv.site, jdsClient);

if (!config.vistaSites || !config.vistaSites[argv.site]) {
	console.log('No config for '+argv.site+' exists.');
	process.exit(1);
}

var vistaConfig = _.clone(config.vistaSites[argv.site]);

if (!vistaConfig.multipleMode) {
	console.log('Site '+argv.site+' is already in single poller mode.');
	process.exit(0);
}

vistaConfig.context = 'HMP SYNCHRONIZATION CONTEXT';
var client = new RpcClient(log, vistaConfig);
var cmdParams = {
	'"server"': config['hmp.server.id'],
	'"extractSchema"': config['hmp.extract.schema'],
	'"hmpVersion"': config['hmp.version'],
	'"command"': 'getPtUpdates',
	'"allocationStatus"': 'overrideProtection'
};
client.execute('HMPDJFS API', cmdParams, function(error, response) {
	var jsonResponse;
	try {
		jsonResponse = JSON.parse(response);
	} catch (e) {
		console.log('Error parsing JSON response from VistA');
		process.exit(1);
	}
	var lastUpdate = objUtil.getProperty(jsonResponse, 'data', 'lastUpdate');
	console.log(lastUpdate);
	if (!lastUpdate) {
		console.log('Unable to retrieve lastUpdate value from VistA response.');
		process.exit(1);
	}
	vprUpdateOpData.storeLastUpdateTime(lastUpdate, function(error, response) {
		console.log(response);
		process.exit(0);
	});
});