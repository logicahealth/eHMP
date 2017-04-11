/*global sinon, describe, it */
'use strict';

var fetch = require('./radiology-orderables-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'radiology-orderables-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'radiology-orderables-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP_ADDRESS',
    port: 9210,
    accessCode: 'PW',
    verifyCode: 'PW',
    localIP: 'IPADDRES',
    localAddress: 'localhost'
};

describe('radiology-orderables resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);
        
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {"imgType": "9"});
    });
});
