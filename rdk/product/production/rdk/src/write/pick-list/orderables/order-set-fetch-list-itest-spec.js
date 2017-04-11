/*global sinon, describe, it */
'use strict';

var fetch = require('./order-set-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'order-set-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'order-set-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    generalPurposeJdsServer: {
        baseUrl: 'http://IP_ADDRESS:PORT'
    },
    accessCode: 'PW',
    verifyCode: 'PW',
    localIP: 'IPADDRES',
    localAddress: 'localhost'
};

describe('order set resource integration test', function() {
    it('can call the fetch function', function (done) {
        this.timeout(20000);
        
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {"userId": "userUid"});
    });
});
