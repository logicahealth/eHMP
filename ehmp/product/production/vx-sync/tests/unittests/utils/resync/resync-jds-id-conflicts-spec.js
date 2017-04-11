'use strict';

require('../../../../env-setup');

var request = require('request');
var _ = require('underscore');
var jdsConflicts = require(global.VX_UTILS + 'resync/resync-jds-id-conflicts');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var config = {
    jds: {
        protocol: 'http',
        host: 'IP_ADDRESS',
        port: 9080
    },
    'vistaSites': {
        '9E7A': {
            'name': 'panorama',
            'host': 'IP_ADDRESS',
            'port': 9210,
            'accessCode': 'PW',
            'verifyCode': 'PW',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        },
        'C877': {
            'name': 'kodak',
            'host': 'IP_ADDRESS',
            'port': 9210,
            'accessCode': 'PW',
            'verifyCode': 'PW',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        }
    }
};

var environment = { publisherRouter: {
    publish: function(jobsToPublish, handlerCallback) {
        handlerCallback(null, jobsToPublish);
    }
}};

describe('When getting conflicting ids from the JDS error message ', function() {
    it('and there is not any error data then return an empty list.' , function() {
        var conflictsFound = jdsConflicts._getConflictingPatientIds(log, {});
        expect(conflictsFound).toEqual([]);

        conflictsFound = jdsConflicts._getConflictingPatientIds(log, {error:{}});
        expect(conflictsFound).toEqual([]);

        conflictsFound = jdsConflicts._getConflictingPatientIds(log, {error:{errors:[]}});
        expect(conflictsFound).toEqual([]);
    });

    it('and there are not any conflict type errors then return an empty list.', function() {
        var conflictsFound = jdsConflicts._getConflictingPatientIds(log, {error:{errors:[{reason: 123}, {reason: 345}]}});
        expect(conflictsFound).toEqual([]);
    });

    it('and there is a conflict error then the id is returned.', function() {
        var errorMessage = {error:{errors:[
            {"domain": "allergies",
            "message": "missing node",
            reason: 123},
            {"domain": "Identifier C877;3 Associated with ac242adc-b52f-4435-9857-d70104ad799a",
            "message": "JPID Collision Detected",
            reason: 223}]}};

        var conflictsFound = jdsConflicts._getConflictingPatientIds(log, errorMessage);
        expect(conflictsFound).toEqual(['C877;3']);
    });
});

describe('When getting patient identifiers from JDS ', function() {
    var environment, patientId, callback, called, calledError, data;

    beforeEach(function() {
        patientId = '10110V004877';

        environment = {jds: new JdsClientDummy(log, config)};

        callback = function(error, result) {
            called = true;
            calledError = error;
            data = result;
        };
    });

    it('and there is an error then return the error.' , function() {
        environment.jds._setResponseData(["Connection Error"], [null], null);

        jdsConflicts._getPatientIdentifiersFromJds(log, environment, patientId, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });

    it('and there is an error response then return the error.', function() {
        environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

        jdsConflicts._getPatientIdentifiersFromJds(log, environment, patientId, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).not.toBeFalsy();
        });
    });

    it('and there are no patient identifiers returned then return an empty list.', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], {});

        jdsConflicts._getPatientIdentifiersFromJds(log, environment, patientId, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(data).toEqual([]);
        });
    });

    it('and patient identifiers are returned then return the patient identifiers.', function() {
        var jdsIds = ['C3433;4', '234234V323'];
        environment.jds._setResponseData([null], [{statusCode: 200}], {patientIdentifiers: jdsIds});

        jdsConflicts._getPatientIdentifiersFromJds(log, environment, patientId, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(data).toEqual(jdsIds);
        });
    });
});

describe('When trying to find and add a syncable id from jds ', function() {
    var syncIds;

    beforeEach(function() {
        syncIds = [];
    });

    it('and job patient id is in the list of jds ids then do NOT add a syncable id.' , function() {
        var jobIds = '9E7A;5';
        var jdsIds = ['9E7A;3', '9E7A;5'];

        jdsConflicts._addSyncId(config, jobIds, jdsIds, syncIds);

        expect(syncIds).toEqual([]);
    });

    it('and there are not any syncable ids in jds then do NOT add a syncable id.', function() {
        var jobIds = '354A3;5';
        var jdsIds = ['46545;34', '544;1'];

        jdsConflicts._addSyncId(config, jobIds, jdsIds, syncIds);

        expect(syncIds).toEqual([]);
    });

    it('and there is a primary site id in the jds ids then add that id to the syncable list of ids.', function() {
        var jobIds = '354A3;5';
        var jdsIds = ['544;1', '345345V3432', '9E7A;34', 'DOD;34543'];

        jdsConflicts._addSyncId(config, jobIds, jdsIds, syncIds);

        expect(syncIds).toEqual(['9E7A;34']);
    });

    it('and there is an icn id in the jds ids then add that id to the syncable list of ids.', function() {
        var jobIds = '354A3;5';
        var jdsIds = ['544;1', '345345V3432', 'DOD;34543'];

        jdsConflicts._addSyncId(config, jobIds, jdsIds, syncIds);

        expect(syncIds).toEqual(['345345V3432']);
    });

    it('and there is a dod site id in the jds ids then add that id to the syncable list of ids.', function() {
        var jobIds = '354A3;5';
        var jdsIds = ['544;1', 'DOD;34543'];

        jdsConflicts._addSyncId(config, jobIds, jdsIds, syncIds);

        expect(syncIds).toEqual(['DOD;34543']);
    });
});

describe('When trying to resync a job ', function() {
    var environment, job, callback, called, calledError, data;

    beforeEach(function() {
        job = {patientIdentifier: {type: 'icn', value: '10110V004877'}};

        environment = { publisherRouter: {
            publish: function(jobsToPublish, handlerCallback) {
                handlerCallback(null, jobsToPublish);
            }
        }};
        environment.jds = new JdsClientDummy(log, config);

        spyOn(environment.publisherRouter, 'publish').andCallThrough();

        callback = function(error, result) {
            called = true;
            calledError = error;
            data = result;
        };
    });

    it('and there is an error checking sync status then resync the job.' , function() {
        environment.jds._setResponseData(["Connection Error"], [null], null);

        jdsConflicts._resync(job, log, environment, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(environment.publisherRouter.publish).toHaveBeenCalled();
            expect(data).toEqual('RESYNCING');
        });
    });

    it('and there is an error response when checking the sync status then resync the job.', function() {
        environment.jds._setResponseData([null], [{statusCode: 500}], {error: 'error'});

        jdsConflicts._resync(job, log, environment, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(environment.publisherRouter.publish).toHaveBeenCalled();
            expect(data).toEqual('RESYNCING');
        });
    });

    it('and resync is already created then do NOT resync the job.', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], {"jobStatus": [{type: 'resync-request'}]});

        jdsConflicts._resync(job, log, environment, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
            expect(data).toEqual('NA');
        });
    });

    it('and resync has not started then resync the job.', function() {
        environment.jds._setResponseData([null], [{statusCode: 200}], {"jobStatus": []});

        jdsConflicts._resync(job, log, environment, callback);

        waitsFor(function() {return called;}, 'should be called', 100);

        runs(function() {
            expect(calledError).toBeFalsy();
            expect(environment.publisherRouter.publish).toHaveBeenCalled();
            expect(data).toEqual('RESYNCING');
        });
    });
});
