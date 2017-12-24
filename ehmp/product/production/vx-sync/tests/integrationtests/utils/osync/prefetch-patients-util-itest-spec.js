'use strict';

require('../../../../env-setup');

var moment = require('moment');
var async = require('async');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require('jds-cache-api').PjdsClient;

var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-util');

describe('prefetch-patients-util', function() {
    var environment = {
        pjds: new PjdsClient(log, log, config.pjds)
    };

    it('delete expired patients', function() {
        var setUp, testDone, tearDown = false;

        runs(function () {
            var patients = [
                {
                    uid: 'urn:va:patientList:SITE:3:3',
                    pid: 'SITE;3',
                    patientIdentifier: '3^PI^501^USVHA^P',
                    source: 'patientList',
                    sourceDate: moment().subtract(3, 'd').format('YYYYMMDDHHmmSS'),
                    isEhmpPatient: true
                },
                {
                    uid: 'urn:va:patientList:SITE:8:8',
                    pid: 'SITE;8',
                    patientIdentifier: '8^PI^501^USVHA^P',
                    source: 'patientList',
                    sourceDate: moment().subtract(4, 'd').format('YYYYMMDDHHmmss'),
                    isEhmpPatient: true
                },
                {
                    uid: 'urn:va:patientList:SITE:33:33',
                    pid: 'SITE;33',
                    patientIdentifier: '33^PI^501^USVHA^P',
                    source: 'patientList',
                    sourceDate: moment().format('YYYYMMDDHHmmss'),
                    isEhmpPatient: true
                }
            ];

            async.each(patients, function(patient, callback) {
               environment.pjds.updatePrefetchPatient(patient.uid, patient, callback);
            }, function(error) {
                expect(error).toBeFalsy();
                setUp = true;
            });
        });

        waitsFor(function () {return setUp;}, 'setUp done', 20000);

        runs(function () {
            prefetch.deleteExpiredPrefetchPatients(log, environment, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe('Delete of expired prefetch patients completed.');

                environment.pjds.getPrefetchPatients('range=patientList', 'ehmp-source', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);
                    expect(result.items.length).toBe(1);
                    testDone = true;
                });
            });
        });

        waitsFor(function () {return testDone;}, 'test done', 20000);

        runs(function () {
            environment.pjds.getPrefetchPatients('range=patientList', 'ehmp-source', function(error, response, result) {
                expect(error).toBeFalsy();
                expect(response.statusCode).toBe(200);

                async.each(result.items, function(item, callback) {
                    environment.pjds.removePrefetchPatient(item.uid, callback);
                }, function(err) {
                    expect(err).toBeFalsy();
                    tearDown = true;
                });
            });
        });

        waitsFor(function () {return tearDown;}, 'tearDown done', 20000);
    });
});
