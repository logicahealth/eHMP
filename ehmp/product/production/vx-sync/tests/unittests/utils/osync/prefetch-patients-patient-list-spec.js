'use strict';

require('../../../../env-setup');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-patient-list');
var patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');
var OsyncActiveUserListUtil = require(global.OSYNC_UTILS + 'osync-active-user-list-util');

var config = {vistaSites: {'SITE': {stationNumber: '501'}}};
var environment = {};
var patient = {dfn: '8', siteId: 'SITE'};
var user = {id: '234', site: 'SITE'};

describe('prefetch-patients-patient-list', function() {
    describe('createPatientListPatient', function() {
        it('create prefetch patient', function() {
            var prefetchPatient = prefetch._createPatientListPatient(patient, '501');

            expect(prefetchPatient.uid).toBe('urn:va:patientList:SITE:8:8');
            expect(prefetchPatient.pid).toBe('SITE;8');
            expect(prefetchPatient.patientIdentifier).toBe('8^PI^501^USVHA^P');
            expect(prefetchPatient.isEhmpPatient).toBe(true);
            expect(prefetchPatient.source).toBe('patientList');
            expect(prefetchPatient.sourceDate).toBeTruthy();
            expect(prefetchPatient.facility).toBe('501');
        });
    });

    describe('processPatientListForUsers', function() {
        var testDone, prefetchUtilSpy;

        beforeEach(function() {
            testDone = false;

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });
        });

        it('error retrieving patient list from vista', function() {
            spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0, 'Connection Error');
            });

            runs(function () {
                prefetch._processPatientListForUsers(log, config, environment, [user], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('no patients for user', function() {
            spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0);
            });

            runs(function () {
                prefetch._processPatientListForUsers(log, config, environment, [user], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('config does not have site', function() {
            spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0, null, [{dfn: '8', siteId: 'C887'}]);
            });

            runs(function () {
                prefetch._processPatientListForUsers(log, config, environment, [user], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('savePrefetchPatient called', function() {
            spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0, null, [patient]);
            });

            runs(function () {
                prefetch._processPatientListForUsers(log, config, environment, [user], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
            });
        });

        it('savePrefetchPatient called once with valid, null and undefined users', function() {
            spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0, null, [patient]);
            });

            runs(function () {
                prefetch._processPatientListForUsers(log, config, environment, [null, user, undefined, ''], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
            });
        });
    });

    describe('prefetchPatients', function() {
        var testDone, osyncActiveUserListUtil, patientListVistaRetrieverSpy, prefetchUtilSpy;

        beforeEach(function() {
            testDone = false;

            patientListVistaRetrieverSpy = spyOn(patientListVistaRetriever, 'getPatientListForOneUser').andCallFake(function(log, config, user, callback) {
                setTimeout(callback, 0, null, [patient]);
            });

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });

        });

        it('error returned from retrieval of active users', function() {
            osyncActiveUserListUtil = spyOn(OsyncActiveUserListUtil.prototype, 'getActiveUsers').andCallFake(function(callback) {
                return setTimeout(callback, 0, 'connection refused');
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed with errors.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetrieverSpy).not.toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('no active users to process', function() {
            osyncActiveUserListUtil = spyOn(OsyncActiveUserListUtil.prototype, 'getActiveUsers').andCallFake(function(callback) {
                return setTimeout(callback, 0, null, []);
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetrieverSpy).not.toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('active users processed', function() {
            osyncActiveUserListUtil = spyOn(OsyncActiveUserListUtil.prototype, 'getActiveUsers').andCallFake(function(callback) {
                setTimeout(callback, 0, null, 'A^B^C^D\r\nB^C^D^E');
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Active user processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(patientListVistaRetrieverSpy).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
            });
        });
    });
});
