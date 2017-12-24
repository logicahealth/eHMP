'use strict';

require('../../../../env-setup');

var moment = require('moment');
var _ = require('underscore');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-appointments');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var filemanDateUtil = require(global.VX_UTILS + 'filemanDateUtil');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

var config = {
    vistaSites: {'SITE': {stationNumber: '501'}},
    osync: {rpcContext: 'HMP SYNCHRONIZATION CONTEXT'}
};

var patient = {
    dfn: '8',
    siteId: 'SITE',
    locationIen: '33',
    locationName: 'Cancer clinic',
    date: filemanDateUtil.getFilemanDate(moment().toDate())
};

describe('prefetch-patients-appointments', function() {
    describe('createAppointmentPatient', function() {
        it('create prefetch patient', function() {
            var prefetchPatient = prefetch._createAppointmentPatient(patient, '501', false);

            expect(prefetchPatient.uid).toBe('urn:va:appointment:SITE:8:8');
            expect(prefetchPatient.pid).toBe('SITE;8');
            expect(prefetchPatient.patientIdentifier).toBe('8^PI^501^USVHA^P');
            expect(prefetchPatient.isEhmpPatient).toBe(false);
            expect(prefetchPatient.source).toBe('appointment');
            expect(prefetchPatient.sourceDate).toBeTruthy();
            expect(prefetchPatient.clinic).toBe('Cancer clinic');
            expect(prefetchPatient.facility).toBe('501');
        });
    });

    describe('isOnClinicList', function() {
        var clinicList = ['urn:va:location:SITE:10', 'urn:va:location:SITE:33'];

        it('patient is on osync clinic list', function() {
            expect(prefetch._isOnClinicList(patient, clinicList)).toBe(true);
        });

        it('patient is NOT on osync clinic list', function() {
            var apptPatient = {
                dfn: '8',
                siteId: 'SITE',
                locationIen: '5555'
            };

            expect(prefetch._isOnClinicList(apptPatient, clinicList)).toBe(false);
        });
    });

    describe('processAppointmentsForSites', function() {
        var testDone, prefetchUtilSpy;
        var environment = {};

        beforeEach(function() {
            testDone = false;

            environment.pjds = new PjdsClient(log, log, config);

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });
        });

        it('error retrieving appointments from vista', function() {
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                setTimeout(callback, 0, 'Connection Error');
            });

            runs(function () {
                prefetch._processAppointmentsForSites(log, config, environment, null, undefined, [], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('no appointments at vista', function() {
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                setTimeout(callback, 0);
            });

            runs(function () {
                prefetch._processAppointmentsForSites(log, config, environment, null, undefined, [], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('appointment parse error', function() {
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                setTimeout(callback, 0, null, '\r\n\r\n');
            });

            runs(function () {
                prefetch._processAppointmentsForSites(log, config, environment, null, undefined, [], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('savePrefetchPatient called', function() {
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                setTimeout(callback, 0, null, 'A^B^C^D\r\nB^C^D^E');
            });

            runs(function () {
                prefetch._processAppointmentsForSites(log, config, environment, null, undefined, [], function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
                expect(prefetchUtilSpy.callCount).toBe(2);
            });
        });
    });

    describe('getAllAppointmentClients', function() {
        var testDone;
        var environment = {};

        beforeEach(function() {
            environment.pjds = new PjdsClient(log, log, config);
        });

        it('no appointment clinic found', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, null, {statusCode: 200}, {items:[]});
            });

            runs(function () {
                prefetch._getAllAppointmentClients(log, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(_.isEmpty(result.items)).toBe(true);
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });

        it('error returned', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, 'connection refused');
            });

            runs(function () {
                prefetch._getAllAppointmentClients(log, environment, function(error, result) {
                    expect(error).toBeTruthy();
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });

        it('appointment clinics returned', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, null, {statusCode: 200}, {items:[{uid: 'a'}, {uid: 'b'}]});
            });

            runs(function () {
                prefetch._getAllAppointmentClients(log, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result.length).toBe(2);
                    expect(result).toContain(jasmine.objectContaining('a'));
                    expect(result).toContain(jasmine.objectContaining('b'));
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });
    });

    describe('prefetchPatients', function() {
        var testDone, prefetchUtilSpy;
        var environment = {};

        beforeEach(function() {
            testDone = false;

            environment.pjds = new PjdsClient(log, log, config);

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });

        });

        it('error returned from retrieval of appointments', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, 'Connection Error');
            });
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                setTimeout(callback, 0);
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, undefined, null, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed with errors.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.pjds.getAllOSyncClinics).toHaveBeenCalled();
                expect(rpcUtil.standardRPCCall).not.toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('no appointments to process', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, null, {statusCode: 200}, {items:[]});
            });
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                return setTimeout(callback, 0);
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, undefined, null, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.pjds.getAllOSyncClinics).toHaveBeenCalled();
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('appointments processed', function() {
            spyOn(PjdsClient.prototype, 'getAllOSyncClinics').andCallFake(function(callback) {
                return setTimeout(callback, 0, null, {statusCode: 200}, {items:[]});
            });
            spyOn(rpcUtil, 'standardRPCCall').andCallFake(function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                return setTimeout(callback, 0, null, 'A^B^C^D\r\nB^C^D^E');
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, undefined, null, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Appointment processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.pjds.getAllOSyncClinics).toHaveBeenCalled();
                expect(rpcUtil.standardRPCCall).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
                expect(prefetchUtilSpy.callCount).toBe(2);
            });
        });
    });
});
