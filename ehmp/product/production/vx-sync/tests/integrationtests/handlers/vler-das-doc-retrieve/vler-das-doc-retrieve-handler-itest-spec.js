'use strict';

require('../../../../env-setup');
const _ = require('lodash');
const handle = require(global.VX_HANDLERS + 'vler-das-doc-retrieve/vler-das-doc-retrieve-handler');
const JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
let log = require(global.VX_DUMMIES + 'dummy-logger');

const wConfig = require(global.VX_ROOT + 'worker-config');
const jobUtil = require(global.VX_UTILS + 'job-utils');
const testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
const testConfig = require(global.VX_INTTESTS + 'test-config');

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'vler-das-doc-retrieve-handler-itest-spec',
// 	level: 'debug'
// });

const host = testConfig.vxsyncIP;
const port = PORT;
const tubename = 'vler-das-doc-retrieve';
const matchingJobTypes = [jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType(), jobUtil.vlerDasXformVprType()];

const mockPatientIdentifier = {
	type: 'pid',
	value: 'VLER;12345678'
};

let job = {
	type: 'vler-das-doc-retrieve',
	patientIdentifier: mockPatientIdentifier,
	jpid: '4f82b9c0-52d0-11e4-9c3c-0002a5d5c51b',
	rootJobId: '1',
	priority: 1,
	record: {
		'resourceType': 'Subscription',
		'criteria': 'DocumentReference?subject.Patient.identifier=10108V420871&_format=application/json+fhir',
		'reason': 'eHMP Subscriber',
		'status': 'Active',
		'text': {
			'div': '<documents><document><PartnerName>PN</PartnerName><PartnerDocumentID>Doc1</PartnerDocumentID><status>Available</status> <timestamp>20161503xxxx</timestamp> </document> <document> <PartnerName>PN2</PartnerName> <PartnerDocumentID>Doc2</PartnerDocumentID> <status>Requested</status> <timestamp>20161503xxxxxx</timestamp> </document> <document> <PartnerName>PN3</PartnerName> <DocID>Doc3</DocID> <status>NotAvailable</status> <timestamp>20161503xxxxxx</timestamp> </document> </documents>'
		},
		'channel': {
			'type': 'rest-hook',
			'endpoint': 'https://JLVReceivingURL/on-result',
			'payload': 'application/json+fhir'
		}
	},
	requestStampTime: '20150422150912',
	jobId: '6'
};

let config = {
	jds: _.defaults(wConfig.jds, {
		'protocol': 'http',
		'host': 'IP        ',
		'port': '9082',
		'timeout': 300000
	}),
	vlerdas: _.defaults(wConfig.vlerdas, {
		'handlerMaxSockets': 10,
		'vlerdas': {
			'domains': [
				'vlerdocument'
			],
			'disabled': false,
			'defaults': {
				'host': 'IP      ',
				'port': 'PORT',
				'protocol': 'http',
				'timeout': 60000
			},
			'vlerdocument': {
				'subscribe': '/HealthData/v1/Subscribe',
				'readDocPath': '/HealthData/v1/readDocument/DocumentReference',
				'ping': '/ping'
			},
			'vlerFormData': {
				'org': 'eHMP',
				'roleCode': '112247003',
				'purposeCode': 'TREATMENT',
				'vaFacilityCode': '459CH',
				'familyName': 'May',
				'givenName': 'John'
			},
			'notificationCallback': {
				'protocol': 'http',
				'host': 'IP      ',
				'port': 'PORT',
				'path': '/vlerdas/notification'
			},
			'queryDurationDays': 180
		}
	})
};

const environment = {
	jds: new JdsClient(log, log, config),
	metrics: log
};

function clearTestPatient(patientIdentifier, environment, callback) {
	let completed = false;
	let actualError;
	let actualResponse;

	runs(function() {
		environment.jds.deletePatientByPid(patientIdentifier.value, function(error, response) {
			actualError = error;
			actualResponse = response;
			completed = true;
		});
	});

	waitsFor(function() {
		return completed;
	}, 'Timed out waiting for jds.deletePatientByPid.', 20000);

	runs(function() {
		expect(actualError).toBeFalsy();
		expect(actualResponse).toBeTruthy();
		callback(null, 'success');
	});
}

function createPatientIdentifiers(patientIdentifier, environment, callback) {
	let jdsPatientIdentificationRequest = {
		patientIdentifiers: [patientIdentifier.value]
	};
	let completed3 = false;
	let actualError;
	let actualResponse;

	runs(function() {
		environment.jds.storePatientIdentifier(jdsPatientIdentificationRequest, function(error, response, result) {
			actualError = error;
			actualResponse = response;
			log.debug('createPatientIdentifiers: finished storing patient identifiers.  error: %s; response: %j; result: %j', error, response, result);
			completed3 = true;
		});
	});

	waitsFor(function() {
		return completed3;
	}, 'Timed out waiting for jds.storePatientIdentifier.', 20000);

	runs(function() {
		expect(actualError).toBeNull();
		expect(actualResponse).toBeTruthy();
		callback(null, 'success');
	});

}

describe('vler-das-doc-retrieve-handler-itest-spec', function() {
	beforeEach(function(done) {
		createPatientIdentifiers(mockPatientIdentifier, environment, done);
	});

	testHandler(handle, log, config, environment, host, port, tubename, job, matchingJobTypes, 20000, function(result) {
		expect(result).toBeTruthy();
	});

	afterEach(function(done) {
		let metastampCheck = false;
		runs(function() {
			environment.jds.getSyncStatus(mockPatientIdentifier, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(_.get(response, 'statusCode')).toEqual(200);
				expect(result).toBeTruthy();
				expect(_.get(result, 'inProgress.sourceMetaStamp.VLER.domainMetaStamp.vlerdocument.eventCount')).toEqual(11);
				metastampCheck = true;
			});
		});

		waitsFor(function() {
			return metastampCheck;
		});

		clearTestPatient(mockPatientIdentifier, environment, done);
	});
});