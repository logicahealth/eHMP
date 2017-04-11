/*global sinon, describe, it, runs, expect, waitsFor, spyOn, global */
'use strict';

require('../../../../env-setup');

var fetch = require(global.VX_ENDPOINTS + '/patient-select/patient-select-fetch-list').fetch;

var log = require(global.VX_DUMMIES + 'dummy-logger');

var _ = require('underscore');
var configuration = _.defaults(require(global.VX_ROOT + 'worker-config').vistaSites['9E7A'],{
    environment: 'development',
    context: 'HMP UI CONTEXT',
    host: 'IPADDRESS ',
    port: 9210,
    accessCode: 'PW    ',
    verifyCode: 'PW    !!',
    localIP: 'IPADDRESS,
    localAddress: 'localhost'
});

function validateFetchFails(searchType, searchString) {
    var done = false;
    runs(function() {
        fetch(log, configuration, function(error) {
            expect(error).toBeTruthy();
            done = true;
        }, {searchType: searchType, searchString: searchString});
    });
    waitsFor(function() {
        return done;
    });
}

function validateFetchReturnsData(searchType, searchString) {
    var done = false;
    runs(function() {
        fetch(log, configuration, function(error, data) {
            expect(error).toBeFalsy();
            expect(data).toBeTruthy();
            done = true;
        }, {searchType: searchType, searchString: searchString});
    });
    waitsFor(function() {
        return done;
    });
}

function validateFetchReturnsEmpty(searchType, searchString) {
    var mockHandlerCallback = {
        callback: function(error, response) {
        }
    };
    spyOn(mockHandlerCallback, 'callback');

    var done = false;
    var testData = null;
    var testError = null;
    runs(function() {
        fetch(log, configuration, function(error, data) {
            testData = data;
            testError = error;
            done = true;
            mockHandlerCallback.callback();
        }, {searchType: searchType, searchString: searchString});
    });
    waitsFor(function() {
        return done;
    }, 'Callback not called', 50000);

    runs(function() {
        expect(mockHandlerCallback.callback).toHaveBeenCalled();
        expect(testError).toBeFalsy();
        expect(testData).toEqual([]);
    });
}

describe('patient-select resource integration test', function() {
    //---------------------ERRORS IF NO searchType---------------------
    it('returns an error for fetch RPC for LAST5 if no searchType provided', function () {
        validateFetchFails('', 'ABC');
    });
    //---------------------ERRORS IF NO searchString---------------------
    it('returns an error for fetch RPC for LAST5 if no searchString provided', function () {
        validateFetchFails('LAST5', '');
    });
    it('returns an error for fetch RPC for NAME if no searchString provided', function () {
        validateFetchFails('NAME', '');
    });
    it('returns an error for fetch RPC for ICN if no searchString provided', function () {
        validateFetchFails('ICN', '');
    });
    it('returns an error for fetch RPC for PID if no searchString provided', function () {
        validateFetchFails('PID', '');
    });
    ////---------------------ERRORS IF Invalid searchString based on type---------------------
    it('returns an error for fetch RPC for LAST5 if invalid searchString provided', function () {
        validateFetchReturnsEmpty('LAST5', 'ABC');
    });
    it('returns an error for fetch RPC for NAME if invalid searchString provided', function () {
        validateFetchReturnsEmpty('NAME', '123');
    });
    it('returns an error for fetch RPC for ICN if invalid searchString provided', function () {
        validateFetchReturnsEmpty('ICN', 'X');
    });


    //The logic in the RPC code is that, if we are searching by PID, it will check the first ; piece of the PID
    //(two values separated by a semicolon) and compare that to the site hash of the local system.
    //If they are different, then it thinks that you sent a site hash for a different system and returns an error "Can only resolve pid for local site."
    //If the site hash matches, but the second ; piece does not resolve to a dfn on "this" machine, then it should return empty
    it('returns an error for fetch RPC for PID if invalid searchString provided', function () {
        validateFetchFails('PID', '123456789');
    });
    it('returns an error for fetch RPC for PID if invalid searchString provided', function () {
        validateFetchFails('PID', 'X');
    });
    //---------------------Successful Calls that return empty patients---------------------
    it('can call the fetch RPC for LAST5 returning empty patients', function () {
        validateFetchReturnsEmpty('LAST5', '4444K');
    });

    it('can call the fetch RPC for NAME returning empty patients', function () {
        validateFetchReturnsEmpty('NAME', 'GOMER PYLE');
    });

    it('can call the fetch RPC for ICN returning empty patients', function () {
        validateFetchReturnsEmpty('ICN', '123456789');
    });

    it('can call the fetch RPC for PID returning empty patients', function () {
        validateFetchReturnsEmpty('PID', '9E7A;123456789');
    });
    //---------------------Successful Calls---------------------
    it('can call the fetch RPC for LAST5', function () {
        validateFetchReturnsData('LAST5', '0008B');
    });

    it('can call the fetch RPC for NAME', function () {
        validateFetchReturnsData('NAME', 'BCMA');
    });

    it('can call the fetch RPC for ICN', function () {
        validateFetchReturnsData('ICN', '10107V395912');
    });

    it('can call the fetch RPC for PID', function () {
        validateFetchReturnsData('PID', '9E7A;123456789');
    });
});
