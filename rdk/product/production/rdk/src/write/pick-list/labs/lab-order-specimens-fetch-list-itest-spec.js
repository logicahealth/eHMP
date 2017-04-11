/*global sinon, describe, it */
'use strict';

var fetch = require('./lab-order-specimens-fetch-list').fetch;
var fetchDirect = require('./lab-order-specimens-fetch-list').fetchDirectRpcCall;
var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-order-specimens-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'lab-order-specimens-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('lab-order-specimens resource integration test', function() {
    it('can call the fetch RPC function', function (done) {
        this.timeout(200000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });

    it('can call the fetch direct RPC function', function (done) {
        this.timeout(20000);

        fetchDirect(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: ''}); //No params passed to this
    });
});
