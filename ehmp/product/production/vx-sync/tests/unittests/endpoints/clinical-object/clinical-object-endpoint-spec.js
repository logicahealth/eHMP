'use strict';

require('../../../../env-setup');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = require(global.VX_ROOT + 'worker-config');
var ClinicalObjectAPI = require(global.VX_ENDPOINTS + 'clinical-object/clinical-object-endpoint');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var PjdsClient = require(global.VX_DUMMIES + 'pjds-client-dummy');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'clinical-object-endpoint',
//     level: 'debug',
//     child: logUtil._createLogger
// });

// Stolen from solr-record-storage-handler-spec
//----------------------------------------------------------------------------------------
// Create the environment variable needed for the tests.
//
// config: The configuration settings to be used.
// solrErrorResponse: The value to return as the SOLR error response if the method solr.add
//                    method called.
// publishResponse: The error response for the publishRouter.publish function
// returns: The filled out environment variable.
//----------------------------------------------------------------------------------------
function createEnvironment(config, solrErrorResponse, publishErrorResponse) {
    var environment = {
        jds: new JdsClientDummy(log, config),
        pjdsHttp: new PjdsClient(log, config),
        metrics: log,
        publisherRouter: {
            'publish': jasmine.createSpy().andCallFake(function (job, callback) {
                callback(publishErrorResponse || null, [1]);
            })
        },
        solr: {
            'add': function (solrDoc, callback) {
                callback(solrErrorResponse);
            }
        }
    };

    environment.publisherRouter.childInstance = function () {
        return environment.publisherRouter;
    };

    spyOn(environment.solr, 'add').andCallThrough();
    spyOn(environment.publisherRouter, 'childInstance').andCallThrough();
    spyOn(environment.pjdsHttp, 'createClinicalObject').andCallThrough();

    return environment;
}


describe('clinical-object-endpoint.js', function () {
    var rec = require(global.VX_TESTS + 'data/clinical-objects/ehmp-activity.json');

    describe('handleClinicalObjectPost', function () {
        var request = {
            headers: {
                'x-session-id': 'sessionId',
                'x-request-id': 'requestId'
            },
            body: null
        };
        var res = {
            status: jasmine.createSpy().andCallFake(function () {
                return res;
            }),
            json: jasmine.createSpy(),
            setHeader: jasmine.createSpy()
        };

        it('Returns success if all steps required to process a clinical object complete (Happy Path)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            var req = JSON.parse(JSON.stringify(request));
            req.get = jasmine.createSpy().andCallFake(function (property){
                if (property === 'host') {
                    return('IP           ');
                }
            });
            req.body = record;
            runs(function () {
                ClinicalObjectAPI._handleClinicalObjectPost(log, config, environment, req, res, function () {
                    // figure out pjds call as well
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    expect(res.status).toHaveBeenCalledWith(201);
                    expect(res.json).toHaveBeenCalledWith({'status': 'OK'});
                    done = true;
                });
            });
            waitsFor(function () {
                return done;
            });

        });
        it('Returns an error if validation fails', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            delete record.uid;
            var req = JSON.parse(JSON.stringify(request));
            req.get = jasmine.createSpy().andCallFake(function (property){
                if (property === 'host') {
                    return('IP           ');
                }
            });
            req.body = record;
            runs(function () {
                ClinicalObjectAPI._handleClinicalObjectPost(log, config, environment, req, res, function () {
                    // figure out pjds call as well
                    expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    expect(res.status).toHaveBeenCalledWith(400);
                    expect(res.json).toHaveBeenCalled();
                    done = true;
                });
            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns an error if unable to store to pJDS (and does not execute anymore functions)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            environment.pjdsHttp._setResponseData('Error connecting to pJDS');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            var req = JSON.parse(JSON.stringify(request));
            req.get = jasmine.createSpy().andCallFake(function (property){
                if (property === 'host') {
                    return('IP           ');
                }
            });
            req.body = record;
            runs(function () {
                ClinicalObjectAPI._handleClinicalObjectPost(log, config, environment, req, res, function () {
                    expect(environment.pjdsHttp.createClinicalObject).toHaveBeenCalled();
                    expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    expect(res.status).toHaveBeenCalledWith(500);
                    expect(res.json).toHaveBeenCalled();
                    done = true;
                });
            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns an error if unable to publishToActivityManagementAndStoreToSolr', function () {
            var done = false;
            var environment = createEnvironment(config, null, 'activity error');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            var req = JSON.parse(JSON.stringify(request));
            req.get = jasmine.createSpy().andCallFake(function (property){
                if (property === 'host') {
                    return('IP           ');
                }
            });
            req.body = record;
            runs(function () {
                ClinicalObjectAPI._handleClinicalObjectPost(log, config, environment, req, res, function () {
                    // figure out pjds call as well
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    expect(res.status).toHaveBeenCalledWith(500);
                    expect(res.json).toHaveBeenCalled();
                    done = true;
                });
            });
            waitsFor(function () {
                return done;
            });
        });
    });

    describe('validateRequest', function () {
        it('Returns no error if the record is valid (Happy Path)', function () {
            var record = JSON.parse(JSON.stringify(rec));
            var result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toBe(null);
        });
        it('Returns an error if no record is passed', function () {
            var record = null;
            var result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toEqual(['No data provided']);
        });
        it('Returns an error if a root level attribute does not exist', function () {
            var record = JSON.parse(JSON.stringify(rec));
            delete record.uid;
            var result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toEqual(['Required field uid is missing']);

            delete record.domain;
            result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toEqual(['Required field uid is missing', 'Required field domain is missing']);
        });
        it('Returns an error if a visit level attribute does not exist', function () {
            var record = JSON.parse(JSON.stringify(rec));
            delete record.visit.dateTime;
            var result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toEqual(['Required field visit.dateTime is missing']);

            delete record.visit.location;
            result = ClinicalObjectAPI._validateRequest(record);
            expect(result).toEqual(['Required field visit.location is missing', 'Required field visit.dateTime is missing']);
        });
    });

    describe('storeToPJDS', function () {
        it('Stores a record to pJDS if the record is valid (Happy Path)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            runs(function () {
                ClinicalObjectAPI._storeToPJDS(log, environment, config, record, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.pjdsHttp.createClinicalObject).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns an error if it is unable to store to pJDS', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            environment.pjdsHttp._setResponseData('Error connecting to pJDS');
            var record = JSON.parse(JSON.stringify(rec));
            runs(function () {
                ClinicalObjectAPI._storeToPJDS(log, environment, config, record, function (error) {
                    expect(error).toBeTruthy();
                    expect(environment.pjdsHttp.createClinicalObject).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
    });

    describe('publishToActivityManagementAndStoreToSolr', function () {
        it('Publishes to Activity Management and SOLR if the record is valid (Happy Path)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._publishToActivityManagementAndStoreToSolr(log, environment, config, {}, record, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Attempts to store to SOLR if it is unable to publish to activity management', function () {
            var done = false;
            var environment = createEnvironment(config, null, 'activity error');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._publishToActivityManagementAndStoreToSolr(log, environment, config, {}, record, function (error) {
                    log.debug('error received: %j', error);
                    expect(error).toBeTruthy();
                    expect(error.length).toBe(1);
                    expect(error[0]).toBe('activity error');
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns errors from SOLR if SOLR is in error', function () {
            var done = false;
            var environment = createEnvironment(config, 'solr error');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._publishToActivityManagementAndStoreToSolr(log, environment, config, {}, record, function (error) {
                    log.debug('error received: %j', error);
                    expect(error).toBeTruthy();
                    expect(error.length).toBe(1);
                    expect(val(error[0], 'type')).toBe('transient-exception');
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns errors from activity management and SOLR if they are both in error', function () {
            var done = false;
            var environment = createEnvironment(config, 'solr error', 'activity error');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._publishToActivityManagementAndStoreToSolr(log, environment, config, {}, record, function (error) {
                    log.debug('error received: %j', error);
                    expect(error).toBeTruthy();
                    expect(error.length).toBe(2);
                    expect(error[0]).toBe('activity error');
                    expect(val(error[1], 'type')).toBe('transient-exception');
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
    });

    describe('publishActivity', function () {
        it('Correctly puts a job on the activity management tube if the record is valid (Happy Path)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            runs(function () {
                ClinicalObjectAPI._publishActivity(log, environment, {}, record, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns an error if it unable to put a job on the activity management tube', function () {
            var done = false;
            var environment = createEnvironment(config, null, 'error');
            var record = JSON.parse(JSON.stringify(rec));
            runs(function () {
                ClinicalObjectAPI._publishActivity(log, environment, {}, record, function (error) {
                    expect(error).toBeTruthy();
                    expect(environment.publisherRouter.publish).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
    });

    describe('storeToSolr', function () {
        it('Correctly stores to Solr if the record is valid (Happy Path)', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._storeToSolr(log, environment, config, record, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Does not store to SOLR if the storeToSolr flag is not passed', function () {
            var done = false;
            var environment = createEnvironment(config, null);
            var record = JSON.parse(JSON.stringify(rec));
            runs(function () {
                ClinicalObjectAPI._storeToSolr(log, environment, config, record, function (error) {
                    expect(error).toBeFalsy();
                    expect(environment.solr.add).not.toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
        it('Returns an error if it is unable to store to SOLR', function () {
            var done = false;
            var environment = createEnvironment(config, 'Solr is Down');
            var record = JSON.parse(JSON.stringify(rec));
            record.storeToSolr = true;
            runs(function () {
                ClinicalObjectAPI._storeToSolr(log, environment, config, record, function (error) {
                    expect(val(error, 'type')).toBe('transient-exception');
                    expect(environment.solr.add).toHaveBeenCalled();
                    done = true;
                });

            });
            waitsFor(function () {
                return done;
            });
        });
    });
});
