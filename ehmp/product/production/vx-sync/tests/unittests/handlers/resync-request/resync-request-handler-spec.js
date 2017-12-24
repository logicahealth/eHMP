'use strict';

require('../../../../env-setup');

var request = require('request');
var _ = require('underscore');
var handle = require(global.VX_HANDLERS + 'resync-request/resync-request-handler');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var errorUtil = require(global.VX_UTILS + 'error');

//var bunyan = require('bunyan');
//var log = bunyan.createLogger({name: "resync-request"});

var config = { "configRefresh": 0,
    "syncRequestApi": {
        "protocol": "http",
        "host": "127.0.0.1",
        "port": 8080,
        "patientSyncPath": "/sync/doLoad",
        "patientUnsyncPath": "/sync/clearPatient",
        "patientStatusPath": "/sync/status",
        "method": "POST"},
    "retrySync" : {"maxRetries": 3}};

var environment = { publisherRouter: {
    publish: function(jobsToPublish, handlerCallback) {
        expect(!_.isUndefined(jobsToPublish.retryCount));
        handlerCallback(null, jobsToPublish);
    }
}
};

describe('The syncInProcess check returns', function() {
    it('true when there are in progress domains', function() {
        var syncStatus = {
            "jpid": "34e2297f-220a-4f07-8f61-a292938bc93c",
            "syncStatus": {
                "completedStamp": {},
                "inProgress": {
                    "icn": "5000000126V406128",
                    "lastAccessTime": 20151202192920,
                    "sourceMetaStamp": {
                        "VLER": {
                            "domainMetaStamp": {
                                "patient": {
                                    "domain": "patient",
                                    "eventCount": 1,
                                    "stampTime": 20151202192917,
                                    "storedCount": 1,
                                    "syncCompleted": true
                                },
                                "vlerdocument": {
                                    "domain": "vlerdocument",
                                    "eventCount": 11,
                                    "stampTime": 20151202192917,
                                    "storedCount": 0
                                }
                            },
                            "localId": "5000000126V406128",
                            "pid": "VLER;5000000126V406128",
                            "stampTime": 20151202192917
                        }
                    }
                }
            },
            "jobStatus": []
        }

        expect(handle._syncInProgress(syncStatus)).toBe(true);
    });

    it('true when there are in progress jobs that are not in error', function() {
        var syncStatus = {
            "jpid": "21EC2020-3AEA-4069-A2DD-08002B30309D",
            "syncStatus": {
                "completedStamp": {}
            },
            "jobStatus": [{
                "jobId": "47e960a9-a443-4737-a739-3d62a7fb82f3",
                "jpid": "0ae2a607-4836-44f2-9392-54c7828a498b",
                "patientIdentifier": {
                    "type": "pid",
                    "value": "SITE;8"
                },
                "rootJobId": "b94fb03d-36f0-4d05-84ef-58050aace1f2",
                "status": "created",
                "timestamp": "1448120794619",
                "type": "vista-SITE-data-poller"
            }]
        };

        expect(handle._syncInProgress(syncStatus)).toBe(true);
    });

    it('false when there are no in progress domains or no in progress jobs', function() {
        var syncStatus = {
            "jpid": "21EC2020-3AEA-4069-A2DD-08002B30309D",
            "syncStatus": {},
            "jobStatus": []
        };

        expect(handle._syncInProgress(syncStatus)).toBe(false);
    });

    it('false when there are no in progress domains and has only jobs with an error status', function() {
        var syncStatus = {
            "jpid": "21EC2020-3AEA-4069-A2DD-08002B30309D",
            "syncStatus": {
                "completedStamp": {}
            },
            "jobStatus": [{
                "error": {
                    "data": "vler-sync-request",
                    "message": "unable to sync",
                    "type": "transient-exception"
                },
                "jobId": "dee8b612-57bd-4d59-8b5c-c7ba52db46b9",
                "jpid": "5f723031-3ee7-4128-8396-2517528b08bd",
                "patientIdentifier": {
                    "type": "pid",
                    "value": "VLER;10110V004877"
                },
                "rootJobId": "7a3a6185-36a4-4ed9-97e3-4e8f510b931c",
                "status": "error",
                "timestamp": "1448306538603",
                "type": "vler-sync-request"
            }]
        };

        expect(handle._syncInProgress(syncStatus)).toBe(false);
    });
});

describe('The resync request handler that fail before load request', function() {
    var libGet, libPost, job, handlerCallback, called, calledError;

    beforeEach(function() {
        libGet = request.get;
        libPost = request.post;

        spyOn(environment.publisherRouter, 'publish').andCallThrough();
        handlerCallback = function(error, result) {
            called = true;
            calledError = error;
        };

        job = {
            type: 'resync-request',
            patientIdentifier: {
                type: 'pid',
                value: 'SITE;3' },
            rootJobId: '1',
            jobId: '1'
        };

    });

    afterEach(function() {
        request.get = libGet;
        request.post = libPost;

        environment.publisherRouter.publish.reset();
    });

    it('puts job back on the queue if the sync request has an error', function() {
        request.get = function(options, callback) {
            return callback('Unable to connect to resource.');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('puts job back on the queue if the sync request returns a 500 error', function() {
        request.get = function(options, callback) {
            return callback(null, {statusCode: 500}, 'error');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('puts job back on the queue if the sync process is still running', function() {
        request.get = function(options, callback) {
            return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": [{status: 'started'}]});
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('puts job back on the queue if the clear patient request returns an error', function() {
        request.get = function(options, callback) {
            return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
        };

        request.post = function(options, callback) {
            return callback('unable to connect');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('returns an error only if sync check fails and the maximum number of retries has been reached', function() {
        job.retryCount = 3;

        request.get = function(options, callback) {
            return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": [{status: 'started'}]});
        };

        handle(log, config, environment, job, handlerCallback);

        expect(errorUtil.isFatal(calledError)).toBe(true);
        expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
    });

    it('puts job back on the queue if the clear patient request returns a 500 error', function() {
        request.get = function(options, callback) {
            return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 500}, 'error');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });
});

describe('The resync request handler that execute all resource calls', function() {
    var libGet, libPost, job, handlerCallback, called, calledError, getCallCount;

    beforeEach(function() {
        libGet = request.get;
        libPost = request.post;

        spyOn(environment.publisherRouter, 'publish').andCallThrough();
        handlerCallback = function(error, result) {
            called = true;
            calledError = error;
        };

        job = {
            type: 'resync-request',
            patientIdentifier: {
                type: 'pid',
                value: 'SITE;3' },
            rootJobId: '1',
            jobId: '1'
        };
        getCallCount = 0;
    });

    afterEach(function() {
        request.get = libGet;
        request.post = libPost;

        environment.publisherRouter.publish.reset();
    });

    it('puts job back on the queue if the load patient request returns an error', function() {
        request.get = function(options, callback) {
            getCallCount++;

            if (getCallCount === 1) {
                //status
                return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
            } else {
                //load
                return callback('Unable to make connection.');
            }
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 200}, 'success');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('puts job back on the queue if the load patient request returns a 500 error', function() {
        request.get = function(options, callback) {
            getCallCount++;

            if (getCallCount === 1) {
                //status
                return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
            } else {
                //load
                return callback(null, {status: 500}, 'error');
            }
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 202}, 'success');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).toHaveBeenCalled();
    });

    it('returns success without requeuing message when patient not found checking sync status and clear patient and load patient are successful', function() {
        request.get = function(options, callback) {
            getCallCount++;

            if (getCallCount === 1) {
                //status
                return callback(null, {statusCode: 404}, 'Patient identifier not found');
            } else {
                //load
                return callback(null, {statusCode: 202}, 'success');
            }
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 202}, 'success');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
    });

    it('returns success without requeuing message when patient has been synced and clear patient and load patient are successful', function() {
        request.get = function(options, callback) {
            getCallCount++;

            if (getCallCount === 1) {
                //status
                return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
            } else {
                //load
                return callback(null, {statusCode: 202}, 'success');
            }
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 202}, 'success');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
    });

    it('returns success without requeuing message when patient has been synced and clear patient returns not found and load patient are successful', function() {
        request.get = function(options, callback) {
            getCallCount++;

            if (getCallCount === 1) {
                //status
                return callback(null, {statusCode: 200}, {"syncStatus": {}, "jobStatus": []});
            } else {
                //load
                return callback(null, {statusCode: 202}, 'success');
            }
        };

        request.post = function(options, callback) {
            return callback(null, {statusCode: 404}, 'Patient not found');
        };

        handle(log, config, environment, job, handlerCallback);

        expect(calledError).toBeNull();
        expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
    });
});
