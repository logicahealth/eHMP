'use strict';

var fetchDirectRpcCall = require('./new-persons-fetch-list').fetchDirectRpcCall;
var fetch = require('./new-persons-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'new-persons-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'new-persons-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: 9210,
    accessCode: 'PW    ',
    verifyCode: 'PW    !!',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('new-persons-fetch-list resource integration test', function() {
    it('can call the RPC with searchString, no type, and a date', function(done) {
        this.timeout(20000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.equal(44);
            done();
        }, {searchString: 'PROGRAMMER,OND~', newPersonsType: '', dateTime: '3150710'});
    });

    it('can call the RPC with no searchString, no type, and a date', function(done) {
        this.timeout(20000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.equal(44);
            done();
        }, {searchString: '', newPersonsType: '', dateTime: '3150710'});
    });

    it('can call the RPC with searchString, no type, and no date', function(done) {
        this.timeout(20000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.equal(44);
            done();
        }, {searchString: 'KHAN,VIHAAM~'});
    });

    it('can call the RPC with no searchString, no type, and no date', function(done) {
        this.timeout(20000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.be.gte(44); //Was 115 at the time this test was written.
            done();
        });
    });

    it('fetch works recursively', function (done) {
        this.timeout(120000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });
});
