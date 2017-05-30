'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var request = require('request');
var loadPatient = require(global.VX_HANDLERS + 'resync-request/demographics-sync');
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
        'patientSyncDemoPath': '/sync/demographicSync',
        'method': 'POST'
    },
    'retrySync': {
        'maxRetries': 3
    }
};

var icnJob = {
    'patientIdentifier': {
        'type': 'icn',
        'value': '10110V004877'
    },
    'demographics': {
        'birthDate': '19350407',
        'displayName': 'Ten,Patient'
    }
};
var dodJob = {
    'patientIdentifier': {
        'type': 'pid',
        'value': 'DOD;12345'
    },
    'demographics': {
        'birthDate': '19350407',
        'displayName': 'Ten,Patient'
    }
};

var referenceInfo = {
    sessionId: 'd8d908f7-35e8-41dd-bf6b-9e539bcbb0cd',
    requestId: 'aaa908f7-35e8-41dd-bf6b-aaaa9e539bcb',
    rootJobId: '1',
    jobId: '2',
    priority: '30'
};

describe('The demographic sync ', function() {
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

    it('for an icn is posted successfully', function(done) {
        nock('http://127.0.0.1:8080').post('/sync/demographicSync').reply(200, function(uri, requestBody){
            expect(requestBody.icn).toBe('10110V004877');
            expect(requestBody.demographics).toBeDefined();
            var headers = val(this, ['req','headers']);
            expect(headers['x-request-id']).toBeFalsy();
            expect(headers['x-session-id']).toBeFalsy();
        });

        loadPatient(log, config.syncRequestApi, icnJob, function(error){
            expect(error).toBeFalsy();
            done();
        });
    });

    it('for an edipi is posted successfully', function(done) {
        nock('http://127.0.0.1:8080').post('/sync/demographicSync').reply(200, function(uri, requestBody){
            expect(requestBody.edipi).toBe('12345');
            expect(requestBody.demographics).toBeDefined();
            var headers = val(this, ['req','headers']);
            expect(headers['x-request-id']).toBeFalsy();
            expect(headers['x-session-id']).toBeFalsy();
        });

        loadPatient(log, config.syncRequestApi, dodJob, function(error){
            expect(error).toBeFalsy();
            done();
        });
    });

    it('post returns an error', function(done) {
        nock('http://127.0.0.1:8080').post('/sync/demographicSync').replyWithError('Error');

        loadPatient(log, config.syncRequestApi, dodJob, function(error){
            expect(error).toBeTruthy();
            done();
        });
    });

    it('post returns a 500 status response', function(done) {
        nock('http://127.0.0.1:8080').post('/sync/demographicSync').reply(500);

        loadPatient(log, config.syncRequestApi, dodJob, function(error){
            expect(error).toBeTruthy();
            done();
        });
    });

    it('post with referenceInfo in header', function(done) {
        var icnJobWithRequestInfo = _.clone(icnJob);
        icnJobWithRequestInfo.referenceInfo = referenceInfo;

        nock('http://127.0.0.1:8080').post('/sync/demographicSync').reply(200, function(uri, requestBody){
            expect(requestBody.icn).toBe('10110V004877');
            expect(requestBody.demographics).toBeDefined();
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

        loadPatient(log, config.syncRequestApi, icnJobWithRequestInfo, function(error){
            expect(error).toBeFalsy();
            done();
        });
    });
});