'use strict';

var fetch = require('./medication-order-defaults-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-order-defaults-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'medication-order-defaults-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: PORT,
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('medication-order-defaults resource integration test', function() {
    it('can call the RPC', function (done) {
        this.timeout(5000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, { site: 'SITE', ien: 1348, pharmacyType: 'X', pid: 'SITE;100695', needPatientInstructions: true, pkiEnabled: false });
    });
});
