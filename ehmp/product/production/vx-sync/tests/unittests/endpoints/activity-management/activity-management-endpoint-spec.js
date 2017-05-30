'use strict';

require('../../../../env-setup');

var log = require(global.VX_DUMMIES + 'dummy-logger');

var config = {};
var env = {
	publisherRouter: {
		publish: jasmine.createSpy().andCallFake(function(job, callback) {
			callback();
		})
	}
};
var req = {
	headers: {
		'x-session-id': 'sessionId',
		'x-request-id': 'requestId'
	},
	body: {
		'uid': 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
		'patientUid':'urn:va:patient:9E7A:3:3',
		'authorUid': 'urn:va:user:9E7A:123:123',
		'domain': 'ehmp-order',
		'subDomain': 'noteObject',
		'visit': {
			'location':'urn:va:location:9E7A:1',
			'serviceCategory': 'E',
			'dateTime': '20160118123000'
		},
		'referenceId': '',
		'data' : {
			'availableLabTests': '5106',
			'collectionDate': '01/05/2016',
			'collectionDateTime': 'TODAY',
			'collectionSample': '81',
			'collectionSampleText': 'ARTERIAL CORD BLOOD',
			'collectionType': 'SP',
			'defaultCollSamp': '3',
			'doseTime': '00:00',
			'drawTime': '00:00',
			'howLongIsComplete': true,
			'howOften': '28',
			'immediateCollectionIsComplete': true,
			'labCollSamp': '999',
			'labTestText': 'GAS PANEL - ARTERIAL CORD',
			'location': '32',
			'orderComment': 'testing',
			'reqCom': 'ORDER COMMENT',
			'specimen': '8759',
			'specimenText': 'ARTERIAL CORD BLOOD',
			'urgency': '9',
			'annotation': 'annotation data',
			'problemRelationship': 'cough',
			'activity': 'Follow up'
		}
	}
};
var res = {
	status: jasmine.createSpy().andCallFake(function() { return res; }),
	send: jasmine.createSpy()
};
env.publisherRouter.childInstance = function() { return env.publisherRouter; };

var activityManagementAPI = require(global.VX_ENDPOINTS + 'activity-management/activity-management-endpoint');

describe('activity-management-endpoint.js', function() {
	describe('handleActivityManagementPost', function() {
		it('creates an appropriate job', function() {
			activityManagementAPI._handleActivityManagementPost(log, config, env, req, res);
			expect(env.publisherRouter.publish).toHaveBeenCalled();
			var publishParam = jasmine.objectContaining({
				type: 'publish-data-change-event',
				patientIdentifier: { type: 'pid', value: '9E7A;3' },
				referenceInfo: { sessionId: 'sessionId', requestId: 'requestId' },
				dataDomain: 'ehmp-order',
				record: jasmine.objectContaining({
					subDomain: 'noteObject',
					visit: {
						location: 'urn:va:location:9E7A:1',
						serviceCategory: 'E',
						dateTime: '20160118123000'
					},
					referenceId: '',
					data: {
						availableLabTests: '5106',
						collectionDate: '01/05/2016',
						collectionDateTime: 'TODAY',
						collectionSample: '81',
						collectionSampleText: 'ARTERIAL CORD BLOOD',
						collectionType: 'SP',
						defaultCollSamp: '3',
						doseTime: '00:00',
						drawTime: '00:00',
						howLongIsComplete: true,
						howOften: '28',
						immediateCollectionIsComplete: true,
						labCollSamp: '999',
						labTestText: 'GAS PANEL - ARTERIAL CORD',
						location: '32',
						orderComment: 'testing',
						reqCom: 'ORDER COMMENT',
						specimen: '8759',
						specimenText: 'ARTERIAL CORD BLOOD',
						urgency: '9',
						annotation: 'annotation data',
						problemRelationship: 'cough',
						activity: 'Follow up'
					}
				})
			});
			expect(env.publisherRouter.publish).toHaveBeenCalledWith(publishParam, jasmine.any(Function));
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith('OK');
		});
	});
});