/*global sinon, describe, it */
'use strict';

var fetch = require('./immunization-manufacturer-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-manufacturer-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'immunization-manufacturer-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'HMP UI CONTEXT',
    host: '10.2.2.101',
    port: 9210,
    accessCode: 'pu1234',
    verifyCode: 'pu1234!!',
    localIP: '10.2.2.1',
    localAddress: 'localhost'
};

describe('immunization-manufacturer resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });

    it('can call the fetch RPC with filter and date', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {filter: 'S:B', visitDate: '20131001'});
    });
});
