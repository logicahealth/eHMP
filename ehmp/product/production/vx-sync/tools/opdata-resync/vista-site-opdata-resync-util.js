'use strict';
require('../../env-setup');
var _ = require('underscore');
var jobUtil = require(global.VX_UTILS + 'job-utils');
//var config = require(global.VX_ROOT + 'worker-config');
var vxsyncConfig = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var async = require('async');
var uidUtil = require(global.VX_UTILS + 'uid-utils');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var logUtil = require(global.VX_UTILS + 'log');
var log = logUtil.initialize(vxsyncConfig).get('opdata-resync');
var inspect = require('util').inspect;
var moment = require('moment');
var Metrics = require(global.VX_UTILS + 'metrics');
var RpcClient = require('vista-js').RpcClient;


var argv = require('yargs')
  .usage('Usage: $0 --site <site> --{diag|domain|uid|syncAll}')
  .demand(['site'])
  .describe('site', 'VistA Site Hash')
  .describe('diag', 'diagnoze possible operational data sync status and report the result')
  .describe('domain', 'specific operational domains to sync')
  .describe('uid', 'specify a list of uids of operational data to sync')
  .describe('syncAll', 'sync all operational data for a VistA site')
  .argv;

var logger = require('bunyan').createLogger({
	name: 'opdata-resync-util',
	//src: true,
	stream: process.stdout,
	level: 'info'
});

// domains that currently does not support individual id in VistA rpc call
var opDomainNoUid = [
	'immunization',
	'labgroup',
	'labpanel',
	'orderable',
	'qo',
	'route',
	'schedule',
	'sign-symptom',
	'vital-category',
	'vital-qualifier',
	'vital-type'
];

// operational  dataadomains that support individial id in VistA rpc call
var opDataDomainUid = [
	'asu-class',
	'asu-rule',
	'doc-def',
	'location',
	'pt-select',
	'user'
];

var opDataDomain = opDomainNoUid.concat(opDataDomainUid);

var RPC_BATCH_LIMIT = vxsyncConfig['hmp.batch.size'] || '1000';
// first need to check if the
var jdsClient;
var publisherRouter;

main();

function main() {
	var site = argv.site;

	if (!isSiteValid(site)) {
		logger.error('Invalid site id: %s', site);
		return;
	}

	if (!(argv.diag || argv.uid || argv.syncAll || argv.domain)) {
		logger.error('Please supply one of the options <diag|uid|domain|syncAll>');
		return;
	}
	var tasks = [];
	var metricsLog = new Metrics(vxsyncConfig);
	jdsClient = new JdsClient(log, metricsLog, vxsyncConfig);

	var jobStatusUpdater = new JobStatusUpdater(log, vxsyncConfig, jdsClient);
	publisherRouter = new PublisherRouter(log, vxsyncConfig, metricsLog, jobStatusUpdater);

	if (argv.diag) {
		tasks.push(async.apply(isSiteOpDataSynced, site));
		tasks.push(async.apply(getOpDataDomainNotSynced, site));
		tasks.push(async.apply(getOpdataNotStored, site));
		async.waterfall(tasks, function(err, result){
			if (err) {
				if (_.isEmpty(err)){
					logger.info('site: %s, %j', site, result);
				}
				else {
					logger.error('site: %s, %j', site, err);
				}
			}
			else if (result) {
				outputResult(result);
			}
			process.exit(0);
		});
	}
	if (argv.uid){// for all uids, extract the domain
		logger.debug(argv.uid);
		var uids = _.uniq(argv.uid.split(','));
		if (_.isEmpty(uids)) {
			logger.info('No uid found!');
			process.exit(0);
		}
		// valid uids
		validateUids(uids, site, function(err) {
			if (err) {
				logger.error('%s', err);
				process.exit(0);
			}
		});
		async.each(uids, function(uid, callback) {
			async.waterfall([
				async.apply(extractDomainAndLocalId, uid),
				async.apply(getVistAOpData, site),
				async.apply(generateAndSaveMetaStamp, site),
				createAndPublishOpDataStoreJob
			], function(err, result){
				if (err) {
					logger.error('Error syncing uid: %s: error: %j', uid, err);
				}
				else {
					logger.info('Done syncing uid: %s', uid);
				}
				return callback(err, result);
			});
		},
		function(err){
			if (err) {
				logger.error('Syncing uid(s) with error: %j', err);
			}
			else {
				logger.info('All uids are synced!');
			}
			process.exit(0);
		});
	}
	if (argv.domain || argv.syncAll) {
		var domains;
		if (argv.domain) {
			domains = _.filter(_.uniq(argv.domain.split(',')), function(domain) {
				if (!_.contains(opDataDomain, domain)){
					logger.warn('%s is not a valid domain!', domain);
					return false;
				}
				return true;
			});
			if (_.isEmpty(domains)) {
				logger.error('No valid domain found!');
				process.exit(0);
			}
		}
		else {
			domains = opDataDomain;
		}
		// Before syncing any domains, just to make sure there are meta stamp in JDS Op data sync status.
		isSiteOpDataSyncedBefore(site, function(err){
			if (err) {
				logger.error(err);
				process.exit(-1);
			}
			logger.info('Starting syncing operational domain: %s', domains);
			async.each(domains, function(domain, callback) {
				return syncVistAOpDataByDomain(site, domain, callback);
			},
			function(err){
				if (err) {
					logger.error('Syncing domain(s) with error: %s', err);
					process.exit(-1);
				}
				logger.info('All domains are synced!');
				process.exit(0);
			});
		});
	}
}

// just check to make sure site is in the config file
function isSiteValid(site) {
	return !_.isUndefined(vxsyncConfig.vistaSites[site]);
}

// This function will extract domain and localId from uid.
// callback(null, rpcOpts object to pass next call)
function extractDomainAndLocalId(uid, callback) {
	var uidParts = uidUtil.extractPiecesFromUID(uid);
	var rpcOpts = {
		domain: uidParts.domain,
		localId: uidParts.patient,
		limit: 1 // This is the safe guard to make sure returns max one for uid query.
	};
	return callback(null, rpcOpts);
}

// Check to see if a uid is valid
function validateUids(uids, site, callback) {
	var errMsg;
	var invalidUid = _.find(uids, function(uid) {

		var uidParts = uidUtil.extractPiecesFromUID(uid);
		if (!uidParts) {
			errMsg = 'Invalid uid format: %s' + uid;
			return true;
		}
		// checking the site
		var siteHash = uidParts.site;
		logger.debug('site hash is %s', siteHash);
		if (!siteHash) {
			errMsg = 'uid: ' + uid +', does not have a site information';
			return true;
		}
		if (siteHash !== site) {
			errMsg = 'Site hash: ' + siteHash + ' in uid: ' + uid +', does not match site: ' + site;
			return true;
		}
		// checking the domain
		var domain = uidParts.domain;
		if (!domain) {
			errMsg = 'uid: ' + uid + ' does not have domain information';
			return true;
		}
		// make sure the domain is in operational domain.
		logger.debug('domain is %s', domain);
		if (!_.contains(opDataDomain, domain)) {
			errMsg = 'domain: ' + domain + ' in uid: ' + uid + ' is not have a valid operational domain';
			return true;
		}
		// make sure the domain is a domain that support pulling individual data.
		if (!_.contains(opDataDomainUid, domain)) {
			errMsg = 'domain: ' + domain +' in uid: ' + uid + ' does not support pulling individual data, please try syncing with domain instead.';
			return true;
		}
		return false;
	});

	if (invalidUid) {
		return callback(errMsg);
	}
	return callback(null);
}


// this function will sync a domain of VistA Operational data
// It will retreive VistA operational data by domain via RPC call.
// Generate and create meta stamp and save those to JDS.
// Create and Publish Opetational Data to Vx-Sync Tubes.
function syncVistAOpDataByDomain(site, domain, callback) {
	// set up start and limit to avoid overrun VistA instance for huge amount of data.
	var rpcOpts = {
		domain: domain,
		start: '0',
		limit: RPC_BATCH_LIMIT
	};
	async.doWhilst(
		async.apply(_syncVistAOpDataByDomain, site, rpcOpts),
		function() {
			logger.debug('rpcOpts is %j', rpcOpts);
			return rpcOpts.start !== '0'; // if start is reset to 0, that means we are done.
		},
		function(err) {
			return callback(err);
		}
	);
}

function _syncVistAOpDataByDomain(site, rpcOpts, callback) {
	async.waterfall([
		async.apply(getVistAOpData, site, rpcOpts),
		async.apply(generateAndSaveMetaStamp, site),
		createAndPublishOpDataStoreJob
	], function(err){
		if (err) {
			logger.error('Error syncing domain: %s, error: %s', rpcOpts.domain, err);
		}
		return callback(err);
	});
}
// function to call VistA RPC to get the result for either a domain or a specific uid
// It will reset the start position for the next call if any.
function getVistAOpData(site, rpcOpts, callback){
	var siteConfig = _.clone(vxsyncConfig.vistaSites[site]);
	siteConfig.context = 'HMP SYNCHRONIZATION CONTEXT';
	var params = {
		'"domain"' : (rpcOpts.domain === 'qo') ? 'quick' : rpcOpts.domain // this is a hack, as VistA only recognizes quick
	};
	//setting up rpc opts passed in
	if (rpcOpts.localId) {
		params['"id"'] = rpcOpts.localId;
	}
	if (rpcOpts.limit) {
		params['"limit"'] = rpcOpts.limit; // just to be safe to set the limit to 1 for local id only.
	}
	if (rpcOpts.start) {
		params['"start"'] = rpcOpts.start.toString();
	}
	// set up the limit of each rpc call result:

	logger.debug('params" %j', params);
	logger.debug('rpcOpts: %j', rpcOpts);
	RpcClient.callRpc(logger, siteConfig, 'HMP GET OPERATIONAL DATA', params, function(error, response) {
		if (error) {
			logger.error(error);
			return callback(error, response);
		}
		if (!response) {
			logger.error('No response from RPC!');
			return callback('Rpc call return no result!');
		}
		if (_.isEmpty(response)) {
			logger.error('Empty response from RPC!');
			return callback('Rpc call return empty result!');
		}
		try{
			var jsonResult = JSON.parse(response);
			if (jsonResult && jsonResult.data && !_.isEmpty(jsonResult.data.items)) {
				logger.debug('total items: %s', jsonResult.data.items.length);
				// now need to check a few details to see if we have any new data.
				if (!rpcOpts.localId && rpcOpts.limit) { // must be for the domain only
					// must have a currentItemCount field
					var retData = jsonResult.data;
					if (retData.currentItemCount === retData.items.length) {
						if (retData.last && parseInt(retData.currentItemCount) === parseInt(rpcOpts.limit)) {
							// we will have to make next call.
							// Change rpcOpts.start value
							rpcOpts.start = retData.last;
							logger.debug('Change the start value for the next call to be %s', rpcOpts.start);
						}
						else {
							logger.debug('Reset the start value to complete the data pulling %s');
							rpcOpts.start = '0';
						}
					}
				}
				return callback(null, jsonResult.data.items, rpcOpts.domain);
			}
			else {
				logger.error('Reponse format is not invalid!, %j', jsonResult);
				return callback('Rpc call result format is invalid!');
			}
		}
		catch (ex) {
			logger.error('Error parsing response: %s, %s', ex, response);
			return callback('Rpc call return invalid JSON format');
		}
	});
}

// This function will generate a valid MetasStamp time for all records that returned from VistA rpc call
// and also save the metastamp to JDS
// return callback
function generateAndSaveMetaStamp(site, vistaData, domain, callback) {
	var now = moment().format('YYYYMMDDHHmmss');
	var metaStamp = {
		icn: null,
		stampTime: now,
		sourceMetaStamp : {}
	};
	metaStamp.sourceMetaStamp[site] = {
		pid: null,
		stampTime: now,
		domainMetaStamp: {}
	};
	metaStamp.sourceMetaStamp[site].domainMetaStamp[domain] = {
		domain: domain,
		stampTime: now,
		itemMetaStamp: {}
	};
	var itemMetaStamp = metaStamp.sourceMetaStamp[site].domainMetaStamp[domain].itemMetaStamp;
	_.each(vistaData, function(dataItem){
		itemMetaStamp[dataItem.uid] = {
			stampTime: dataItem.stampTime
		};
	});
	logger.debug('Metastamp is: %j', metaStamp);
	logger.info('Generating and Savng metastamp for domain: %s to JDS, total item: %s', domain, vistaData.length);
	jdsClient.saveOperationalSyncStatus(metaStamp, site, function(error) {
		if (error) {
			logger.error('Error saving metastamp');
			return callback('Error saving metastamp');
		}
		else {
			return callback(null, vistaData);
		}
	});
}

// Create operational data store job and push to the beanstalkd.
function createAndPublishOpDataStoreJob(vistaData, callback) {
	var opJobs = [];
	_.each(vistaData, function(itemData) {
		var job = jobUtil.createOperationalDataStore(itemData);
		opJobs.push(job);
	});
	publisherRouter.publish(opJobs, function(error){
		if (error) {
			logger.error('Error publishing jobs, total # of job: %s', opJobs.length);
			return callback(error);
		}
		logger.info('All operational data jobs are published!, total: %s', opJobs.length);
		return callback(null, 'All operational data jobs are published!');
	});
}

// functiojn to store operational data directly to jds
function storeOpdataToJds(vistaData, callback) {
	async.each(vistaData, function(itemData, itemCallback) {
		jdsClient.storeOperationalData(itemData, function(error, result) {
			if (error) {
				return itemCallback('Error storing record to jds: error: %s, result: %s, data: %j', error, result, itemData);
			}
			return itemCallback(null);
		});
	}, function(err){
		if (err) {
			return callback(err);
		}
		return callback(null, 'All data is being stored!');
	});
}


// Check to see if operational data for a site is already synced before.
// This is to make sure that if a site is not ever synced (aka, any metastamp is being stored).
function isSiteOpDataSyncedBefore(site, callback) {
	logger.debug('isSiteOpDataSyncedBefore is called for site: %s', site);
	var genericErrorMsg = 'No metastamp in Site Sync Status, please make sure you at least sync operational data once via Vx-Sync!';
	jdsClient.getOperationalSyncStatus(site, function (error, response, result){
		logger.debug('error: %s, result :%j, response: %j', error, result, response);
		if (error){
			logger.error('getOperationalSyncStatus: error: %s', error);
			return callback(error);
		}
		if (response && response.statusCode && response.statusCode === 404) {
			if (result && result.error) {
				logger.error('getOperationalSyncStatus: error: %j', result.error);
				return callback(result.error);
			}
			else {
				logger.error('getOperationalSyncStatus: 404 error');
				return callback('getOperationalSyncStatus: 404 error');
			}
		}
		if (_.isEmpty(result)) {
			return callback(genericErrorMsg);
		}
		// now check either inProgress or complete to make sure we have some metastamp
		var hasDomainMetastamp = _.some(['inProgress', 'completedStamp'], function(status) {
			if (result[status] && result[status].sourceMetaStamp &&
			    result[status].sourceMetaStamp[site] && result[status].sourceMetaStamp[site].stampTime){
				return true;
			}
			return false;
		});
		if (hasDomainMetastamp) {
			return callback(null);
		}
		return callback(genericErrorMsg);
	});
}

// Check to see if operational data for a site is already synced or not.
// callback to be used in async waterfall pattern.
function isSiteOpDataSynced(site, callback) {
	logger.debug('isSiteOpDataSynced is called for site: %s', site);
	jdsClient.getOperationalSyncStatus(site, function (error, response, result){
		logger.debug('error: %s, result :%j, response: %j', error, result, response);
		if (error){
			logger.error('getOperationalSyncStatus: error: %s', error);
			return callback(error);
		}
		if (response && response.statusCode && response.statusCode === 404) {
			if (result && result.error) {
				logger.error('getOperationalSyncStatus: error: %j', result.error);
				return callback(result.error);
			}
			else {
				logger.error('getOperationalSyncStatus: 404 error');
				return callback('getOperationalSyncStatus: 404 error');
			}
		}
		if (_.isEmpty(result)) {
			return callback(null, result);
		}
		if (result.inProgress) {
			return callback(null, result);
		}
		if (result.completedStamp && result.completedStamp.sourceMetaStamp && result.completedStamp.sourceMetaStamp[site]) {
			var isCompleted = result.completedStamp.sourceMetaStamp[site].syncCompleted;
			if (isCompleted) {
				return callback({}, 'Site: ' + site + ' operational data is synced!');
			}
		}
		return callback(null, result);
	});
}

// Get Domain not synced based on the non-detailed version operation data sync status
function getOpDataDomainNotSynced(site, result, callback) {
	logger.debug('getOpDataDomainNotSynced is called for site: %s', site);
	if (_.isEmpty(result)) {
		return callback('No domain to check yet!');
	}
	var domains = {};
	if (result.inProgress && result.inProgress.sourceMetaStamp &&
		result.inProgress.sourceMetaStamp[site] &&
		result.inProgress.sourceMetaStamp[site].domainMetaStamp) {
		var allDomainInfo = result.inProgress.sourceMetaStamp[site].domainMetaStamp;
		_.each(allDomainInfo, function(value, key) {
			if (!value.syncCompleted) {
				domains[key] = value.itemCount - value.storedCount;
			}
		});
	}
	return callback(null, domains);
}

function getOpdataNotStored(site, domains, callback) {
	logger.debug('getOpdataNotStored is called for site: %s', site);
	if (_.isEmpty(domains)) {
		return callback('No Domains to check');
	}
	var result = {};
	async.each(_.keys(domains), async.apply(getOpdataNotStoredForDomain, site, result), function(err){
		return callback(err, result);
	});
}
// print out the result
function outputResult(result) {
	console.log('Record that are not stored: ');
	console.log(inspect(result, {depth: null}));
}

// Query JDS for not stored record for a specific domain.
function getOpdataNotStoredForDomain(site, output, domain ,callback) {
	logger.debug('getOpdataNotStoredForDomain is called for site: %s, domain: %s', site, domain);
	var opdataFilter = {
		detailed: true,
		filter : 'eq(domain,' + '"' + domain +'"),not(exists(stored))'  // filter to get record not stored for that domain.
	};

	jdsClient.getOperationalSyncStatusWithParams(site, opdataFilter, function(error, response, result){
		if (error) {
			callback(error);
		}
		if (_.isEmpty(result)) {
			return callback(null);
		}
		// now check the record that are not fully synced.
		if (!result.inProgress || !result.inProgress.sourceMetaStamp || !result.inProgress.sourceMetaStamp[site] ||
			!result.inProgress.sourceMetaStamp[site].domainMetaStamp ||
			!result.inProgress.sourceMetaStamp[site].domainMetaStamp[domain]) {
			return callback(null);
		}
		var domainInfo = result.inProgress.sourceMetaStamp[site].domainMetaStamp[domain];
		if (domainInfo.syncCompleted) {
			return callback(null);
		}
		if (domainInfo.itemCount === domainInfo.storedCount) {
			result[domain].error = 'All record has been stored, check vx-sync to make sure domain metastamp is stored correctly';
			return callback(null);
		}
		if (_.isEmpty(domainInfo.itemMetaStamp)) {
			return callback(null);
		}
		// push all the uid to the domains
		output[domain] = _.keys(domainInfo.itemMetaStamp);
		return callback(null);
	});
}
