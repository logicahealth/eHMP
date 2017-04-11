'use strict';

var fetch = require('./allergies-symptoms-fetch-list').fetch;
var fetchDirectRpcCall = require('./allergies-symptoms-fetch-list').fetchDirectRpcCall;

var log = sinon.stub(require('bunyan').createLogger({ name: 'allergies-symptoms-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'allergies-symptoms-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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


describe('allergies-symptoms resource integration test', function() {
    it('can call the RPC recursively', function (done) {
        this.timeout(120000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });

    it('can call the RPC directly', function (done) {
        this.timeout(20000);

        fetchDirectRpcCall(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'ABC'});
    });
});
