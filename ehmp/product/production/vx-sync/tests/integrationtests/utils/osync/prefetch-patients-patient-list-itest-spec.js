'use strict';

require('../../../../env-setup');

var moment = require('moment');
var async = require('async');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require('jds-cache-api').PjdsClient;

var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-patient-list');

config.osync.vistaSites = config.vistaSites;

describe('prefetch-patients-patient-list', function() {
    var environment = {
        jds: new JdsClient(log, log, config),
        pjds: new PjdsClient(log, log, config.pjds)
    };

    it('retrieve patients and store in prefetch store', function() {
        var setUp, testDone, tearDown = false;
        var activeUser;

        runs(function () {
            //This user should have patients on its patient list.
            activeUser = {
                uid: 'urn:va:user:SITE:10000000016',
                site: 'SITE',
                id: '10000000016',
                lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
            };
            environment.pjds.addActiveUser(activeUser, function(error, response) {
                expect(error).toBeFalsy();
                expect(response.statusCode).toBe(201);
                setUp = true;
            });
        });

        waitsFor(function () {return setUp;}, 'setUp done', 20000);

        runs(function () {
            prefetch.prefetchPatients(log, config, environment, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe('Active user processing completed.');

                environment.pjds.getPrefetchPatients('range=patientList', 'ehmp-source', 'minimal', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);
                    expect(result.items.length).toBeGreaterThan(0);
                    testDone = true;
                });
            });
        });

        waitsFor(function () {return testDone;}, 'test done', 20000);

        runs(function () {
            environment.pjds.removeActiveUser(activeUser, function(error) {
                expect(error).toBeFalsy();

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
        });

        waitsFor(function () {return tearDown;}, 'tearDown done', 20000);
    });
});
