'use strict';

require('../../../../env-setup');
const _ = require('lodash');
const handle = require(global.VX_HANDLERS + 'vler-das-doc-retrieve/vler-das-doc-retrieve-handler');
const JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
const PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
let log = require(global.VX_DUMMIES + 'dummy-logger');
const nock = require('nock');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'vler-das-doc-retrieve-handler-spec',
// 	level: 'debug'
// });

let xmlStringC32 = '<ClinicalDocument xmlns="urn:hl7-org:v3"><realmCode code="US" /><typeId extension="POCD_HD000040" root="2.16.840.1.113883.1.3" /><templateId root="1.2.840.114350.1.72.1.51693" /><templateId root="2.16.840.1.113883.10" extension="IMPL_CDAR2_LEVEL1" /><templateId root="2.16.840.1.113883.10.20.3" /><templateId root="2.16.840.1.113883.10.20.1" /><templateId root="2.16.840.1.113883.3.88.11.32.1" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.5" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.2" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.1" /></ClinicalDocument>';
let xmlStringCCDA = '<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="cda.xsl"?> <ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sdtc="urn:hl7-org:sdtc" xsi:schemaLocation="urn:hl7-org:v3../../../CDA%20R2/cda-schemas-and-samples/infrastructure/cda/CDA.xsd" classCode="DOCCLIN" moodCode="EVN"> <realmCode code="US"/> <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/> <templateId root="2.16.840.1.113883.10.20.22.1.1"/> <templateId root="2.16.840.1.113883.10.20.22.1.2"/> </ClinicalDocument>';
let xmlUnsupportedC62 = '<ClinicalDocument xmlns="urn:hl7-org:v3"><realmCode code="US" /><typeId extension="POCD_HD000040" root="2.16.840.1.113883.1.3" /><templateId root="1.2.840.114350.1.72.1.51693" /><templateId root="2.16.840.1.113883.10" extension="IMPL_CDAR2_LEVEL1" /><templateId root="2.16.840.1.113883.10.20.3" /><templateId root="2.16.840.1.113883.10.20.1" /><templateId root="2.16.840.1.113883.3.88.11.62.1" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.5" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.2" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.1" /></ClinicalDocument>';

//------------------------------------------------------------------------------------------------------
// This function returns an instance of worker-config.json with the settings we need for our unit tests.
//
// returns: The worker-config settings.
//------------------------------------------------------------------------------------------------------
function getConfig() {
	let config = {
		'handlerMaxSockets': 10,
		'vlerdas': {
			'domains': [
				'vlerdocument'
			],
			'disabled': false,
			'defaults': {
				'host': '1.2.3.4',
				'port': '5678',
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
	};
	return config;
}

//------------------------------------------------------------------------------------------------------
// This function returns an environment instance to be used by one test.
//
// returns: The worker-config settings.
//------------------------------------------------------------------------------------------------------
function getEnvironment(config) {
	return {
		jds: new JdsClientDummy(log, config),
		publisherRouter: new PublisherRouterDummy(),
		metrics: log
	};
}
let job = {
	type: 'vler-das-doc-retrieve',
	patientIdentifier: {
		type: 'pid',
		value: 'VLER;10108V420871'
	},
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

describe('vler-das-doc-retrieve-handler', function() {
	describe('handle', function() {
		it('Error path: VLER returns error', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(500, {
					error: 'ERROR!'
				});

			let config = getConfig();
			let environment = getEnvironment(config);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: VLER returns no response', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply();

			let config = getConfig();
			let environment = getEnvironment(config);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: VLER returns non-200 response', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(404, 'not found');

			let config = getConfig();
			let environment = getEnvironment(config);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: VLER returns no result', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(200);

			let config = getConfig();
			let environment = getEnvironment(config);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Normal path: VLER returns no documents', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(200, {
					entry: []
				});

			let config = getConfig();
			let environment = getEnvironment(config);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();
				expect(result).toEqual('NoDataReceived');

				done();
			});
		});
		it('Error path: storeMetastamp returns error', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(200, {
					entry: [{
						contents: 'document1'
					}, {
						contents: 'document2'
					}, {
						contents: 'document3'
					}]
				});

			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData(['ERROR!'], [null], [null]);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();
				expect(result).toEqual('FailedJdsError');

				done();
			});
		});
		it('Error path: PublisherRouter returns error', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(200, {
					entry: [{
						contents: 'document1'
					}, {
						contents: 'document2'
					}, {
						contents: 'document3'
					}]
				});

			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [null]);

			spyOn(environment.publisherRouter, 'publish').andCallFake(function(jobs, callback) {
				callback('Publisher error!');
			});

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Normal path', function(done) {
			nock('http://1.2.3.4:5678')
				.get('/HealthData/v1/readDocument/DocumentReference?subject.Patient.identifier=10108V420871&_format=application%2Fjson%2Bfhir')
				.reply(200, {
					entry: [{
						resource: {
							dummyResourceData: 'test'
						},
						content: [{
							attachment: {
								Data: Buffer.from(xmlStringC32).toString('base64')
							}
						}]
					}, {
						resource: {
							dummyResourceData: 'test'
						},
						content: [{
							attachment: {
								Data: Buffer.from(xmlStringCCDA).toString('base64')
							}
						}]
					}, {
						resource: {
							dummyResourceData: 'test'
						},
						content: [{
							attachment: {
								Data: Buffer.from(xmlUnsupportedC62).toString('base64')
							}
						}]
					}, {
						resource: {
							dummyResourceData: 'test'
						},
						content: [{
							attachment: {
								Data: 'corrupted data'
							}
						}]
					}]
				});

			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [null]);

			handle(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();
				expect((result || []).length).toEqual(3);

				done();
			});
		});
	});
	describe('determineKind', function() {
		it('Error path: XML parse error', function(done) {
			let badXml = '<?xml vers';
			handle._steps.determineKind(log, badXml, function(result) {
				expect(result).toEqual('xmlParseError');
				done();
			});
		});
		it('Normal path: recognizes CCDA document', function(done) {
			handle._steps.determineKind(log, xmlStringCCDA, function(result) {
				expect(result).toEqual('CCDA');
				done();
			});
		});
		it('Normal path: recognizes C32 document', function(done) {
			handle._steps.determineKind(log, xmlStringC32, function(result) {
				expect(result).toEqual('C32');
				done();
			});
		});
		it('Normal path: other, unsupported format', function(done) {
			handle._steps.determineKind(log, xmlUnsupportedC62, function(result) {
				expect(result).toEqual('unsupportedFormat');
				done();
			});
		});
	});
	describe('processDocuments', function() {
		it('Normal path: handles empty documents', function(done) {
			let config = getConfig;
			let documentList = [{
				content: []
			}];

			handle._steps.processDocuments(log, config, job, documentList, function(domainMetastamp, jobsToPublish) {
				expect(domainMetastamp).toBeTruthy();
				expect(_.keys(_.get(domainMetastamp, 'sourceMetaStamp.VLER.domainMetaStamp.vlerdocument.eventMetaStamp')).length).toEqual(0);
				expect(jobsToPublish).toBeTruthy();
				expect(_.isEmpty(jobsToPublish)).toBe(true);
				done();
			});
		});
		it('Normal path: ignores unsupported documents', function(done) {
			let config = getConfig;
			let documentList = [{
				content: [{
					attachment: {
						Data: Buffer.from(xmlUnsupportedC62).toString('base64')
					}
				}]
			}];

			handle._steps.processDocuments(log, config, job, documentList, function(domainMetastamp, jobsToPublish) {
				expect(domainMetastamp).toBeTruthy();
				expect(_.keys(_.get(domainMetastamp, 'sourceMetaStamp.VLER.domainMetaStamp.vlerdocument.eventMetaStamp')).length).toEqual(0);
				expect(jobsToPublish).toBeTruthy();
				expect(_.isEmpty(jobsToPublish)).toBe(true);
				done();
			});
		});
		it('Normal path: continues creating job when xml parse errors out', function(done) {
			let config = getConfig;
			let documentList = [{
				content: [{
					attachment: {
						Data: 'corrupted XML string'
					}
				}]
			}];

			handle._steps.processDocuments(log, config, job, documentList, function(domainMetastamp, jobsToPublish) {
				expect(domainMetastamp).toBeTruthy();
				expect(domainMetastamp).toEqual(jasmine.objectContaining({
					'stampTime': jasmine.any(String),
					'sourceMetaStamp': {
						'VLER': {
							'pid': 'VLER;10108V420871',
							'localId': '10108V420871',
							'stampTime': jasmine.any(String),
							'domainMetaStamp': {
								'vlerdocument': {
									'domain': 'vlerdocument',
									'stampTime': jasmine.any(String),
									'eventMetaStamp': jasmine.any(Object)
								}
							}
						}
					},
					'icn': '10108V420871'
				}));
				expect(_.keys(_.get(domainMetastamp, 'sourceMetaStamp.VLER.domainMetaStamp.vlerdocument.eventMetaStamp')).length).toEqual(1);
				expect(jobsToPublish).toBeTruthy();
				expect(jobsToPublish || []).toContain(jasmine.objectContaining({
					'type': 'vler-das-xform-vpr',
					'timestamp': jasmine.any(String),
					'patientIdentifier': {
						'type': 'pid',
						'value': 'VLER;10108V420871'
					},
					'jpid': jasmine.any(String),
					'rootJobId': '1',
					'priority': 1,
					'record': jasmine.objectContaining({
						kind: 'xmlParseError',
						xmlDoc: jasmine.any(String),
						pid: 'VLER;10108V420871',
						uid: jasmine.any(String)
					}),
					'requestStampTime': jasmine.any(String),
					'jobId': jasmine.any(String)
				}));
				done();
			});
		});
		it('Normal path: creates metastamp and jobs', function(done) {
			let config = getConfig;
			let documentList = [{
				resource: {
					dummyResourceData: 'test'
				},
				content: [{
					attachment: {
						Data: Buffer.from(xmlStringC32).toString('base64')
					}
				}]
			}, {
				resource: {
					dummyResourceData: 'test'
				},
				content: [{
					attachment: {
						Data: Buffer.from(xmlStringCCDA).toString('base64')
					}
				}]
			}, {
				resource: {
					dummyResourceData: 'test'
				},
				content: [{
					attachment: {
						Data: Buffer.from(xmlUnsupportedC62).toString('base64')
					}
				}]
			}, {
				resource: {
					dummyResourceData: 'test'
				},
				content: [{
					attachment: {
						Data: 'corrupted data'
					}
				}]
			}];

			handle._steps.processDocuments(log, config, job, documentList, function(domainMetastamp, jobsToPublish) {
				expect(domainMetastamp).toBeTruthy();
				expect(domainMetastamp).toEqual(jasmine.objectContaining({
					'stampTime': jasmine.any(String),
					'sourceMetaStamp': {
						'VLER': {
							'pid': 'VLER;10108V420871',
							'localId': '10108V420871',
							'stampTime': jasmine.any(String),
							'domainMetaStamp': {
								'vlerdocument': {
									'domain': 'vlerdocument',
									'stampTime': jasmine.any(String),
									'eventMetaStamp': jasmine.any(Object)
								}
							}
						}
					},
					'icn': '10108V420871'
				}));
				expect(_.keys(_.get(domainMetastamp, 'sourceMetaStamp.VLER.domainMetaStamp.vlerdocument.eventMetaStamp')).length).toEqual(3);
				expect(jobsToPublish).toBeTruthy();
				expect(jobsToPublish || []).toContain(jasmine.objectContaining({
					'type': 'vler-das-xform-vpr',
					'timestamp': jasmine.any(String),
					'patientIdentifier': {
						'type': 'pid',
						'value': 'VLER;10108V420871'
					},
					'jpid': jasmine.any(String),
					'rootJobId': '1',
					'priority': 1,
					'record': jasmine.objectContaining({
						kind: 'C32',
						xmlDoc: xmlStringC32,
						resource: jasmine.objectContaining({
							dummyResourceData: 'test'
						}),
						pid: 'VLER;10108V420871',
						uid: jasmine.any(String)
					}),
					'requestStampTime': jasmine.any(String),
					'jobId': jasmine.any(String)
				}));
				done();
			});
		});
	});
	describe('storeMetastamp', function() {
		let metastamp = {};

		it('Error path: JDS returns error when storing metastamp', function(done) {
			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData(['ERROR!'], [null], [null]);

			let nextCallback = jasmine.createSpy();

			let handlerCallback = function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(nextCallback).not.toHaveBeenCalled();
				done();
			};

			handle._steps.storeMetastamp(log, config, environment, job, metastamp, handlerCallback, nextCallback);
		});
		it('Error path: JDS returns no response when storing metastamp', function(done) {
			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData([null], [null], [null]);

			let nextCallback = jasmine.createSpy();

			let handlerCallback = function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(nextCallback).not.toHaveBeenCalled();
				done();
			};

			handle._steps.storeMetastamp(log, config, environment, job, metastamp, handlerCallback, nextCallback);
		});
		it('Error path: JDS returns non-200 response when storing metastamp', function(done) {
			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData([null], [{
				statusCode: 404
			}], [null]);

			let nextCallback = jasmine.createSpy();

			let handlerCallback = function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(nextCallback).not.toHaveBeenCalled();
				done();
			};

			handle._steps.storeMetastamp(log, config, environment, job, metastamp, handlerCallback, nextCallback);
		});
		it('Normal path', function(done) {
			let config = getConfig();
			let environment = getEnvironment(config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [null]);

			let handlerCallback = jasmine.createSpy();

			let nextCallback = function() {
				expect(handlerCallback).not.toHaveBeenCalled();
				done();
			};

			handle._steps.storeMetastamp(log, config, environment, job, metastamp, handlerCallback, nextCallback);
		});
	});
	describe('getVlerDasReadConfiguration', function() {
		it('returns das read configuration', function(done) {
			let config = getConfig();
			let vlerDasReadConfig = handle._steps.getVlerDasReadConfiguration(log, config, job);
			expect(vlerDasReadConfig).toEqual(jasmine.objectContaining({
				url: 'http://1.2.3.4:5678/HealthData/v1/readDocument/DocumentReference',
				forever: true,
				agentOptions: {
					maxSockets: 10
				},
				qs: {
					'subject.Patient.identifier': '10108V420871',
					_format: 'application/json+fhir'
				},
				json: true
			}));
			done();
		});
	});
});