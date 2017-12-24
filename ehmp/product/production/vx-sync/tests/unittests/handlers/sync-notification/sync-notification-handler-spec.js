'use strict';

require('../../../../env-setup');

const _ = require('lodash');

var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
// 	name: 'test',
// 	level: 'debug',
// 	child: logUtil._createLogger
// });

var nock = require('nock');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var handler = require(global.VX_HANDLERS + 'sync-notification/sync-notification-handler');


//---------------------------------------------------------------------------------
// Return an instance of config.
//
// returns: An instance of config for the test.
//---------------------------------------------------------------------------------
function getConfig() {
    return {
        syncRequestApi: {
            host: '127.0.0.1',
            port: '8080',
            protocol: 'http',
            patientSyncPath: '/sync/doLoad'
        }
    };
}

//----------------------------------------------------------------------------------
// Mock getDemographics routine that returns an error on the callback.
//
// vistaId: The site hash for the vista site.
// dfn: The dfn for the vista site.
// callback: The callback handler to be called when this is done.
//----------------------------------------------------------------------------------
function getDemographicsErrorResponse(vistaId, dfn, callback) {
    return setTimeout(callback, 0, 'An error has occurred.', null);
}

//----------------------------------------------------------------------------------
// Mock getDemographics routine that returns a valid demographics response.
//
// vistaId: The site hash for the vista site.
// dfn: The dfn for the vista site.
// callback: The callback handler to be called when this is done.
//----------------------------------------------------------------------------------
function getDemographicsValidResponse(vistaId, dfn, callback) {
    const demographics = {
        'icn': '10108V420871',
        'birthDate': '19350407',
        'familyName': 'EIGHT',
        'fullName': 'EIGHT,PATIENT',
        'genderCode': 'urn:va:pat-gender:M',
        'genderName': 'Male',
        'givenNames': 'PATIENT',
        'localId': '3',
        'pid': 'SITE;3',
        'sensitive': false,
        'ssn': '666000008',
        'stampTime': '20170802160230',
        'uid': 'urn:va:pt-select:SITE:3:3',
        'displayName': 'Eight,Patient',
        'summary': 'Eight,Patient',
        'last4': '0008',
        'last5': 'E0008'
    };

    return setTimeout(callback, 0, null, demographics);
}

//----------------------------------------------------------------------------------
// Mock getDemographics routine that returns a valid demographics response but
// the response has no ICN.
//
// vistaId: The site hash for the vista site.
// dfn: The dfn for the vista site.
// callback: The callback handler to be called when this is done.
//----------------------------------------------------------------------------------
function getDemographicsNoIcnResponse(vistaId, dfn, callback) {
    const demographics = {
        'birthDate': '19350407',
        'familyName': 'EIGHT',
        'fullName': 'EIGHT,PATIENT',
        'genderCode': 'urn:va:pat-gender:M',
        'genderName': 'Male',
        'givenNames': 'PATIENT',
        'localId': '3',
        'pid': 'SITE;3',
        'sensitive': false,
        'ssn': '666000008',
        'stampTime': '20170802160230',
        'uid': 'urn:va:pt-select:SITE:3:3',
        'displayName': 'Eight,Patient',
        'summary': 'Eight,Patient',
        'last4': '0008',
        'last5': 'E0008'
    };

    return setTimeout(callback, 0, null, demographics);
}

//----------------------------------------------------------------------------------
// This function mocks jds.getPatientIdentifier and returns an error response.
//
// job: The job which contains the patientIdentifier.
// callback: The callback handler that is called when it is done.
//----------------------------------------------------------------------------------
function getPatientIdentifierErrorResponse(job, callback) {
    return setTimeout(callback, 0, 'An error occurred.');
}

//----------------------------------------------------------------------------------
// This function mocks jds.getPatientIdentifier and returns a valid response
// containing an ICN.
//
// job: The job which contains the patientIdentifier.
// callback: The callback handler that is called when it is done.
//----------------------------------------------------------------------------------
function getPatientIdentifierValidResponseWithIcn(job, callback) {
    const response = { statusCode: 200};
    const result = {
        'jpid': 'b8fbb4cb-a4eb-433e-b7f3-25862a55c0a1',
        'patientIdentifiers': [
            '10108V420871',
            'SITE;3',
            'SITE;3',
            'DOD;0000000003',
            'HDR;10108V420871',
            'JPID;b8fbb4cb-a4eb-433e-b7f3-25862a55c0a1',
            'VLER;10108V420871'
        ]
    };
    return setTimeout(callback, 0, null, response, result);
}

//----------------------------------------------------------------------------------
// This function mocks jds.getPatientIdentifier and returns a valid response
// NOT containing an ICN.
//
// job: The job which contains the patientIdentifier.
// callback: The callback handler that is called when it is done.
//----------------------------------------------------------------------------------
function getPatientIdentifierValidResponseWithNoIcn(job, callback) {
    const response = { statusCode: 200};
    const result = {
        'jpid': 'b8fbb4cb-a4eb-433e-b7f3-25862a55c0a1',
        'patientIdentifiers': [
            'SITE;3',
            'JPID;b8fbb4cb-a4eb-433e-b7f3-25862a55c0a1',
        ]
    };
    return setTimeout(callback, 0, null, response, result);
}

//----------------------------------------------------------------------------------
// This function mocks jds.getPatientIdentifier and returns a response with a status
// of 404
//
// job: The job which contains the patientIdentifier.
// callback: The callback handler that is called when it is done.
//----------------------------------------------------------------------------------
function getPatientIdentifierStatus404Response(job, callback) {
    const response = { statusCode: 404};
    return setTimeout(callback, 0, null, response, null);
}

//---------------------------------------------------------------------------------
// Return an instance of the environment variable.
//
// config: The config object to be used.
// getDemographicsFunction: The function to be used to mock the Vista getDemographics
//                          function.
// getPatientIdentifierFunction: The function to be used to mock the jds
//                                getPatientIdentifiers function.
// returns: An instance of environment for the test.
//---------------------------------------------------------------------------------
function getEnvironment(config, getDemographicsFunction, getPatientIdentifierFunction) {
    const environment =  {
        publisherRouter: new PublisherRouterDummy(log, config),
        vistaClient: {
            getDemographics: getDemographicsFunction
        },
        jds: {
            getPatientIdentifier: getPatientIdentifierFunction
        }
    };

    spyOn(environment.publisherRouter, 'publish').andCallThrough();

    if (_.isFunction(environment.vistaClient.getDemographics)) {
        spyOn(environment.vistaClient, 'getDemographics').andCallThrough();
    }

    if (_.isFunction(environment.jds.getPatientIdentifier)) {
        spyOn(environment.jds, 'getPatientIdentifier').andCallThrough();
    }

    return environment;
}

//---------------------------------------------------------------------------------
// Return an instance of the sync-notification job.
//
// returns: The sync-notification job.
//---------------------------------------------------------------------------------
function getJob() {
    return {
        type: 'sync-notification',
        timestamp: '20170517094313',
        patientIdentifier: {
            type: 'pid',
            value: 'SITE;3'
        },
        dataDomain: 'discharge',
        record: {},
        jobId: '234ae-45a7c-293da-acd2a-4dab5',
        priority: 1,
        referenceInfo: {
            requestId: 'aaaa-bbbb-cccc'
        }
    };
}

describe('sync-notification-handler', function() {
    describe('handle', function () {
        it('error path: invalid job', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config);
            const job = null;

            handler(log, config, environment, job, function (error, response) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('Invalid job: missing patientIdentifier');
                expect(response).toBeFalsy();
                done();
            });
        });
        it('error path: sync request api call returns error', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config);
            const job = getJob();

            nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').reply(500);
            handler(log, config, environment, job, function (error, response) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('loadPatient returned error');
                expect(response).toBeFalsy();
                done();
            });
        });
        it('retrieveIcn returns an error.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config);
            const job = getJob();
            job.patientIdentifier.type = 'edipi';
            job.patientIdentifier.value = '1234567';

            nock('http://127.0.0.1:8080').get('/sync/doLoad?edipi=1234567').reply(200);

            handler(log, config, environment, job, function (error, response) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('The job did not contain a patientIdentifier with a valid pid.');
                expect(response).toBeFalsy();
                done();
            });
        });

        it('Normal path', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierValidResponseWithIcn);
            const job = getJob();
            const icn = '10108V420871';
            let recordWithIcn = JSON.parse(JSON.stringify(job.record));
            recordWithIcn.icn = icn;

            nock('http://127.0.0.1:8080').get('/sync/doLoad?pid=SITE%3B3').reply(200);

            handler(log, config, environment, job, function (error, response) {
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(environment.jds.getPatientIdentifier).toHaveBeenCalledWith(jasmine.objectContaining(job), jasmine.any(Function));
                expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(recordWithIcn),
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(response).toBeTruthy();
                expect(response).toEqual(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(recordWithIcn),
                    jobId: jasmine.any(String)
                }));
                done();
            });
        });
    });
    describe('publishVxDataChangeJob', function () {
        it('Publish without icn', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config);
            const job = getJob();
            const icn = null;

            handler._publishVxDataChangeJob(log, environment, job, icn, function (error, response) {
                expect(error).toBeFalsy();
                expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(job.record),
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(response).toBeTruthy();
                expect(response).toEqual(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(job.record),
                    jobId: jasmine.any(String)
                }));
                done();
            });
        });
        it('Publish with icn', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config);
            const job = getJob();
            const icn = '100V100';
            let recordWithIcn = JSON.parse(JSON.stringify(job.record));
            recordWithIcn.icn = icn;

            handler._publishVxDataChangeJob(log, environment, job, icn, function (error, response) {
                expect(error).toBeFalsy();
                expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(recordWithIcn),
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                expect(response).toBeTruthy();
                expect(response).toEqual(jasmine.objectContaining({
                    type: 'publish-data-change-event',
                    timestamp: jasmine.any(String),
                    patientIdentifier: jasmine.objectContaining(job.patientIdentifier),
                    priority: job.priority,
                    referenceInfo: jasmine.objectContaining(job.referenceInfo),
                    dataDomain: job.dataDomain,
                    record: jasmine.objectContaining(recordWithIcn),
                    jobId: jasmine.any(String)
                }));
                done();
            });
        });
    });
    describe('retrieveIcnFromVista', function () {
        it('Error - invalid patientIdentifier type.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse);
            const job = getJob();
            job.patientIdentifier.type = 'icn';
            job.patientIdentifier.value = '100V100';

            handler._retrieveIcnFromVista(log, environment, job, function (error, icn) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('The job did not contain a patientIdentifier with a valid pid.');
                expect(environment.vistaClient.getDemographics).not.toHaveBeenCalled();
                expect(icn).toBeFalsy();
                done();
            });
        });

        it('Error - vistaClient.getDemographics returns an error.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsErrorResponse);
            const job = getJob();

            handler._retrieveIcnFromVista(log, environment, job, function (error, icn) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('Error occurred retrieving identifiers from Vista.');
                expect(environment.vistaClient.getDemographics.calls.length).toEqual(1);
                expect(environment.vistaClient.getDemographics).toHaveBeenCalledWith('SITE', '3', jasmine.any(Function));
                expect(icn).toBeFalsy();
                done();
            });
        });
        it('Valid ICN is returned.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse);
            const job = getJob();

            handler._retrieveIcnFromVista(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(environment.vistaClient.getDemographics.calls.length).toEqual(1);
                expect(environment.vistaClient.getDemographics).toHaveBeenCalledWith('SITE', '3', jasmine.any(Function));
                expect(icn).toBe('10108V420871');
                done();
            });
        });
        it('No ICN is returned from Vista.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsNoIcnResponse);
            const job = getJob();

            handler._retrieveIcnFromVista(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(environment.vistaClient.getDemographics.calls.length).toEqual(1);
                expect(environment.vistaClient.getDemographics).toHaveBeenCalledWith('SITE', '3', jasmine.any(Function));
                expect(icn).toBeFalsy();
                done();
            });
        });
    });
    describe('retrieveIcn', function () {
        it('patientIdentifier is already ICN.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierErrorResponse);
            const job = getJob();
            job.patientIdentifier.type = 'icn';
            job.patientIdentifier.value = '100V100';

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(icn).toBe(job.patientIdentifier.value);
                expect(environment.jds.getPatientIdentifier).not.toHaveBeenCalled();
                expect(environment.vistaClient.getDemographics).not.toHaveBeenCalled();
                done();
            });
        });
        it('patientIdentifier is not ICN or PID.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierErrorResponse);
            const job = getJob();
            job.patientIdentifier.type = 'edipi';
            job.patientIdentifier.value = '1234567';

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('The job did not contain a patientIdentifier with a valid pid.');
                expect(icn).toBeFalsy();
                expect(environment.jds.getPatientIdentifier).not.toHaveBeenCalled();
                expect(environment.vistaClient.getDemographics).not.toHaveBeenCalled();
                done();
            });
        });
        it('JDS returns an error.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierErrorResponse);
            const job = getJob();

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeTruthy();
                expect(_.get(error, 'message', '')).toContain('Error occurred retrieving identifiers from JDS.');
                expect(icn).toBeFalsy();
                expect(environment.jds.getPatientIdentifier).toHaveBeenCalled();
                expect(environment.vistaClient.getDemographics).not.toHaveBeenCalled();
                done();
            });
        });
        it('JDS returns results with an ICN.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierValidResponseWithIcn);
            const job = getJob();

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(icn).toBe('10108V420871');
                expect(environment.jds.getPatientIdentifier).toHaveBeenCalledWith(jasmine.objectContaining(job), jasmine.any(Function));
                expect(environment.vistaClient.getDemographics).not.toHaveBeenCalled();
                done();
            });
        });
        it('JDS returns statusCode of 404.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierStatus404Response);
            const job = getJob();

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(icn).toBe('10108V420871');
                expect(environment.jds.getPatientIdentifier).toHaveBeenCalledWith(jasmine.objectContaining(job), jasmine.any(Function));
                expect(environment.vistaClient.getDemographics).toHaveBeenCalledWith('SITE', '3', jasmine.any(Function));
                done();
            });
        });
        it('JDS returns patientIdentifier with no icn.', function (done) {
            const config = getConfig();
            const environment = getEnvironment(config, getDemographicsValidResponse, getPatientIdentifierValidResponseWithNoIcn);
            const job = getJob();

            handler._retrieveIcn(log, environment, job, function (error, icn) {
                expect(error).toBeFalsy();
                expect(icn).toBe('10108V420871');
                expect(environment.jds.getPatientIdentifier).toHaveBeenCalledWith(jasmine.objectContaining(job), jasmine.any(Function));
                expect(environment.vistaClient.getDemographics).toHaveBeenCalledWith('SITE', '3', jasmine.any(Function));
                done();
            });
        });
    });
});