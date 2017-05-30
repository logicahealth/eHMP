'use strict';

require('../../env-setup');
var HttpHeaderUtility = require(global.VX_UTILS + 'http-header-utils');
var inspect = require(global.VX_UTILS + 'inspect');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var metastampUtil = require(global.VX_UTILS + 'metastamp-utils');
var uuid = require('node-uuid');
var enrichment = require(global.VX_HANDLERS + 'record-enrichment-request/record-enrichment-request-handler');
var storage = require(global.VX_HANDLERS + 'store-record-request/store-record-request-handler');
var solr = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var _ = require('underscore');
var moment = require('moment');

function processWriteback(log, config, environment, req, res, next) {
	var httpHeaderUtility = new HttpHeaderUtility(log);
	var referenceInfo = httpHeaderUtility.extractReferenceInfo(req);
	var childLog = log.child(referenceInfo);

	childLog.info('-------- Writeback --------');
	childLog.debug('handling writeback event post request');
	childLog.debug(inspect(req.body));

	var childEnv = {};
	for (var key in environment) {
		if (key !== 'jds' && key !== 'solr') {
			childEnv[key] = environment[key];
		}
	}

	childEnv.jds = environment.jds.childInstance(childLog);
    childEnv.solr = environment.solr.childInstance(childLog);

	var data = req.body;
	//validate payload
	if (!validateRequest(childLog, data)) {
		res.status(400).send('Invalid record format. A uid and lastUpdateTime are required.');
		return next();
	}
	_constructPidFromRecord(childLog, config, data);
	var domain = uidUtils.extractDomainFromUID(data.uid);
	var patientIdentifier = pidUtils.create('pid', data.pid);
	data.stampTime = data.lastUpdateTime - 1; //overwrite whatever was there before. Unsolicited update should be 1 second newer.
	var metricsObj = {
		'domain': domain,
		'pid': data.pid,
		'uid': data.uid,
		'timer': 'start',
		'process': uuid.v4()
	};
	childEnv.metrics.debug('Writeback record', metricsObj);
	metricsObj.timer = 'stop';

	//generate and store metastamp
	var domainMetastamp = metastampUtil.metastampDomain({
		'data': {
			'items': [data]
		}
	}, data.stampTime, null);
	childEnv.jds.saveSyncStatus(domainMetastamp, patientIdentifier, function(error, response) {
		if (!error) {
			if (response.statusCode >= 300) {
				childLog.error('Could not store metastamp in JDS %j', domainMetastamp);
				childEnv.metrics.debug('Writeback record in Error', metricsObj);
				res.status(500).send('Could not store record metastamp');
				return next();
			}
			//run record enrichment
			enrichment.transform(childLog, config, childEnv, domain, data, function(error, record) {
				if (error) {
					childLog.error('Could not transform record %j because of %j', record, error);
					childEnv.metrics.debug('Writeback record in Error', metricsObj);
					res.status(500).send('Error enriching VPR record');
					return next();
				}
				//store record in JDS
				storage.store(childLog, childEnv, domain, patientIdentifier, record, function(error, jdsrecord) {
					if (error) {
						childLog.error('Could not complete record storage of %j because of %j', jdsrecord, error);
						childEnv.metrics.debug('Writeback record in Error', metricsObj);
						res.status(500).send('Record storage error');
						return next();
					}
					solr.writebackWrapper(childLog, config, childEnv, domain, record, function(error) {
						if (error) {
							childLog.error('Could not complete SOLR storage of %j (%j)', record, error);
							childEnv.metrics.debug('Writeback record in Error', metricsObj);
							res.status(500).send('SOLR storage error');
							return next();
						}
						res.status(200).json(record);
						childEnv.metrics.debug('Writeback record', metricsObj);
						return next();
					});
				});
			});
		} else {
			childLog.error('Could not generate metastamp for record %j because of %j', data, error);
			res.status(500).send('Could not store record');
			childEnv.metrics.debug('Writeback record in Error', metricsObj);
			return next();
		}
	});
}

function validateRequest(log, record) {
	if (_.isUndefined(record)) {
		log.error('Record is undefined');
		return false;
	}
	if (_.isUndefined(record.uid)) {
		log.error('Record does not contain a uid %j', record);
		return false;
	} else {
		var uidParts = uidUtils.extractPiecesFromUID(record.uid);
		if (_.isUndefined(uidParts.localId)) {
			log.error('UID is malformed %j', record.uid);
			return false;
		}
		if (_.isUndefined(uidParts.patient)) {
			log.error('UID is malformed %j', record.uid);
			return false;
		}
		if (_.isUndefined(uidParts.site)) {
			log.error('UID is malformed %j', record.uid);
			return false;
		}
		if (_.isUndefined(uidParts.domain)) {
			log.error('UID is malformed %j', record.uid);
			return false;
		}
	}
	if (_.isUndefined(record.lastUpdateTime)) {
		log.error('Record does not have an update time %j', record);
		return false;
	} else {
		if (!moment(record.lastUpdateTime, 'YYYYMMDDHHmmss').isValid()) {
			log.error('lastUpdateTime is malformed %j', record.lastUpdateTime);
			return false;
		}
	}
	return true;
}

// internal utility function
// assumption: record is already validated
function _constructPidFromRecord(log, config, record) {
	if (_.isUndefined(record.pid)) {
		log.debug('Record does not contain a pid %j', record);
	} else {
		if (!pidUtils.isIdFormatValid(['pid'], record.pid, config)) {
			log.debug('%s is not a valid pid', record.pid);
		} else {
			return; // we already had an valid pid in the request, just return
		}
	}
	var uidParts = uidUtils.extractPiecesFromUID(record.uid);
	record.pid = uidParts.site + ';' + uidParts.patient;
	return;
}

module.exports = processWriteback;
module.exports._steps = {
	validateRequest: validateRequest,
	_constructPidFromRecord: _constructPidFromRecord
};
