'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var request = require('request');
var loadPatient = require(global.VX_HANDLERS + 'resync-request/load-patient');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var nock = require('nock');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//  name: 'patient-record-retirement-util-spec',
//  level: 'debug'
// });

var config = {
    'configRefresh': 0,
    'syncRequestApi': {
        'protocol': 'http',
        'host': '127.0.0.1',
        'port': 8080,
        'patientSyncPath': '/sync/doLoad',
        'patientUnsyncPath': '/sync/clearPatient',
        'patientStatusPath': '/sync/status',
        'patientDemoSyncPath': '/sync/demographicSync',
        'method': 'POST'
    },
    'retrySync': {
        'maxRetries': 3
    }
};

var job = {
    'patientIdentifier': {
        'type': 'pid',
        'value': 'SITE;3'
    }
};

var referenceInfo = {
    sessionId: 'd8d908f7-35e8-41dd-bf6b-9e539bcbb0cd',
    requestId: 'aaa908f7-35e8-41dd-bf6b-aaaa9e539bcb',
    rootJobId: '1',
    jobId: '2',
    priority: '30'
};

describe('load-patient', function(){
	var libPost, callback, called, calledError;

    beforeEach(function() {
        libPost = request.post;

        callback = function(error) {
            called = true;
            calledError = error;
        };
    });

    afterEach(function() {
        request.post = libPost;
    });

	it('successfully calls the doLoad endpoint', function(done){
		nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').reply(200, function(){
			var headers = val(this, ['req','headers']);
			expect(headers['x-request-id']).toBeFalsy();
			expect(headers['x-session-id']).toBeFalsy();
		});

        loadPatient(log, config.syncRequestApi, job, function(error){
        	expect(error).toBeFalsy();
        	done();
        });
	});
	it('adds referenceInfo to header when present (nock)', function(done){
		var jobWithRequestInfo = _.clone(job);
        jobWithRequestInfo.referenceInfo = referenceInfo;

		nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').reply(200, function(){
			var headers = val(this, ['req','headers']);
			expect(headers).toEqual(jasmine.objectContaining({
				host: jasmine.any(String),
            	'x-session-id': referenceInfo.sessionId,
            	'x-request-id': referenceInfo.requestId,
            	reference_rootjobid: referenceInfo.rootJobId,
            	reference_jobid: referenceInfo.jobId,
            	reference_priority: referenceInfo.priority
            }));
		});

		loadPatient(log, config.syncRequestApi, jobWithRequestInfo, function(error){
			expect(error).toBeFalsy();
			done();
		});
	});
	it('Error path: request.get returns error', function(done){
  		nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').replyWithError('Error');

        loadPatient(log, config.syncRequestApi, job, function(error){
        	expect(error).toBeTruthy();
        	done();
        });
	});
	it('Error path: request.get returns 500 response', function(done){
		nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').reply(500);

        loadPatient(log, config.syncRequestApi, job, function(error){
        	expect(error).toBeTruthy();
        	done();
        });
	});
});