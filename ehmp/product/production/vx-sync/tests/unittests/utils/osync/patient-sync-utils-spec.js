'use strict';

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var patientSyncUtils = require(global.OSYNC_UTILS + 'patient-sync-utils');

function validateAppointmentsSuccess(response, index, dfn, date, locationName, locationIen) {
    expect(response.length).toBeGreaterThan(index);
    expect(response[index].dfn).toBe(dfn);
    expect(response[index].date).toBe(date);
    expect(response[index].locationName).toBe(locationName);
    expect(response[index].locationIen).toBe(locationIen);
}

function validateAdmissionsSuccess(response, index, dfn, date, locationName, roomBed, locationIen) {
    expect(response.length).toBeGreaterThan(index);
    expect(response[index].dfn).toBe(dfn);
    expect(response[index].date).toBe(date);
    expect(response[index].locationName).toBe(locationName);
    expect(response[index].roomBed).toBe(roomBed);
    expect(response[index].locationIen).toBe(locationIen);
}

function parseAndValidateAppointments(rpcResponse, expectedError, callback) {
    var clinics = [];
    clinics[0] = 'All';

    patientSyncUtils.parseRpcResponseAppointments(log, rpcResponse, clinics, function(error, response) {
        if (expectedError) {
            expect(error).toBeDefined();
            expect(error).toBe(expectedError);
        } else {
            expect(error).toBeFalsy();
        }

        callback(error, response);
    });
}

function parseAndValidateAdmissions(rpcResponse, expectedError, callback) {
    patientSyncUtils.parseRpcResponseAdmissions(log, rpcResponse, function(error, response) {
        if (expectedError) {
            expect(error).toBeDefined();
            expect(error).toBe(expectedError);
        } else {
            expect(error).toBeFalsy();
        }

        callback(error, response);
    });
}

describe('patient-sync-utils', function() {
    var mockLogger = {
        warn: function() {}
    };

    describe('should throw an error when the Appointments RPC\'s response', function() {
        it('is null', function(done) {
            parseAndValidateAppointments(null, 'The RPC didn\'t return any data', function(err, res) {
                done();
            });
        });
                
        it('is empty', function(done) {
            parseAndValidateAppointments('', 'The RPC didn\'t return any data', function(err, res) {
                done();
            });
        });
    });

    describe('should throw an error when the Admissions RPC\'s response', function() {
        it('is null', function(done) {
            parseAndValidateAdmissions(null, 'The RPC didn\'t return any data', function(err, res) {
                done();
            });
        });
                
        it('is empty', function(done) {
            parseAndValidateAdmissions('', 'The RPC didn\'t return any data', function(err, res) {
                done();
            });
        });
    });

    describe('should raise a warning when the Appointments RPC\'s response', function() {
        var clinics = [];
        clinics[0] = 'All';

        beforeEach(function() {
            spyOn(mockLogger, 'warn');
        });

        it('is incomplete', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, 'A^B^C', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing incomplete appointment data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });

        xit('is blank', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, '^^^', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing empty appointment data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });

        it('doesn\'t contain a DFN', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, '^B^C^D', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found appointment data with no DFN in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });
    });

    describe('should raise a warning when the second line of the Appointments RPC\'s response', function() {
        var clinics = [];
        clinics[0] = 'All';

        beforeEach(function() {
            spyOn(mockLogger, 'warn');
        });

        it('is incomplete', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, 'A^B^C^D\r\nA^B^C', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing incomplete appointment data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });

        xit('is blank', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, 'A^B^C^D\r\n^^^', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing empty appointment data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });
        it('doesn\'t contain a DFN', function(done) {
            patientSyncUtils.parseRpcResponseAppointments(mockLogger, 'A^B^C^D\r\n^B^C^D', clinics, function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found appointment data with no DFN in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });
    });

    describe('should raise a warning when the Admissions RPC\'s response', function() {
        beforeEach(function() {
            spyOn(mockLogger, 'warn');
        });

        it('is incomplete', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, 'A^B^C^D', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing incomplete admission data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });

        xit('is blank', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, '^^^^^', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing empty admission data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });

        it('doesn\'t contain a DFN', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, '^B^C^D^E', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found admission data with no DFN in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(0);
                done();
            });
        });
    });

    describe('should raise a warning when the second line of the Admissions RPC\'s response', function() {
        beforeEach(function() {
            spyOn(mockLogger, 'warn');
        });

        it('is incomplete', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, 'A^B^C^D^E\r\nA^B^C^D', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing incomplete admission data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });

        xit('is blank', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, 'A^B^C^D^E\r\n^^^^^', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found a line containing empty admission data in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });

        it('doesn\'t contain a DFN', function(done) {
            patientSyncUtils.parseRpcResponseAdmissions(mockLogger, 'A^B^C^D^E\r\n^B^C^D^E', function(err, res) {
                expect(mockLogger.warn).toHaveBeenCalled();
                expect(mockLogger.warn.calls.length).toEqual(1);
                expect(mockLogger.warn.calls[0].args[0]).toMatch('Found admission data with no DFN in RPC response');
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.length).toEqual(1);
                done();
            });
        });
    });

    it('should parse the Appointments RPC\'s response correctly', function(done) {
        parseAndValidateAppointments('A^B^C^D', false, function(err, res) {
            expect(err).toBeNull();
            expect(res).not.toBeNull();
            expect(res.length).toEqual(1);
            validateAppointmentsSuccess(res, 0, 'A', 'B', 'C', 'D');
            done();
        });
    });

    it('should parse a multiline Appointments RPC response correctly', function(done) {
        parseAndValidateAppointments('A^B^C^D\r\nE^F^G^H\r\nI^J^K^L', false, function(err, res) {
            expect(err).toBeNull();
            expect(res).not.toBeNull();
            expect(res.length).toEqual(3);
            validateAppointmentsSuccess(res, 0, 'A', 'B', 'C', 'D');
            validateAppointmentsSuccess(res, 1, 'E', 'F', 'G', 'H');
            validateAppointmentsSuccess(res, 2, 'I', 'J', 'K', 'L');
            done();
        });
    });

    it('should parse the Admissions RPC\'s response correctly', function(done) {
        parseAndValidateAdmissions('A^B^C^D^E', false, function(err, res) {
            expect(err).toBeNull();
            expect(res).not.toBeNull();
            expect(res.length).toEqual(1);
            validateAdmissionsSuccess(res, 0, 'A', 'B', 'C', 'D', 'E');
            done();
        });
    });

    it('should parse a multiline Admissions RPC response correctly', function(done) {
        parseAndValidateAdmissions('A^B^C^D^E\r\nF^G^H^I^J\r\nK^L^M^N^O', false, function(err, res) {
            expect(err).toBeNull();
            expect(res).not.toBeNull();
            expect(res.length).toEqual(3);
            validateAdmissionsSuccess(res, 0, 'A', 'B', 'C', 'D', 'E');
            validateAdmissionsSuccess(res, 1, 'F', 'G', 'H', 'I', 'J');
            validateAdmissionsSuccess(res, 2, 'K', 'L', 'M', 'N', 'O');
            done();
        });
    });
});

