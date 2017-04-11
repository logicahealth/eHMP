'use strict';

var fetchDirectRpcCall = require('./lab-order-orderable-items-fetch-list').fetchDirectRpcCall;
var fetch = require('./lab-order-orderable-items-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-order-orderable-items-itest'
}));

// log = require('bunyan').createLogger({
//     name: 'lab-order-orderable-items-itest',
//     level: 'debug'
// });

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: '10.2.2.101',
    port: 9210,
    accessCode: 'pu1234',
    verifyCode: 'pu1234!!',
    localIP: '10.2.2.1',
    localAddress: 'localhost'
};

describe('lab-order-orderable-items resource integration test', function() {
    it('fetchDirectRpcCall RPC works', function(done) {
        this.timeout(120000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'ABC', labType: 'S.LAB'});
    });
    it('fetchDirectRpcCall will return an error when labType parameter is missing', function(done) {
        this.timeout(20000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {searchString: 'ABC', labType: ''});
    });
    it('fetchDirectRpcCall will have no data returned on invalid labType', function(done) {
        this.timeout(120000);
        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.eql([]);
            done();
        }, {searchString: 'ABC', labType: 'A'});
    });


    it('fetch RPC works', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'ABC', labType: 'S.LAB'});
    });
    it('fetch will return an error when labType parameter is missing', function(done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {searchString: 'ABC', labType: ''});
    });
    it('fetch will have no data returned on invalid labType', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.eql([]);
            done();
        }, {searchString: 'ABC', labType: 'A'});
    });
});
