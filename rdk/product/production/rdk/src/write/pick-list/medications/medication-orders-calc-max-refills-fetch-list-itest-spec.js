/*global sinon, describe, it */
'use strict';

var fetch = require('./medication-orders-calc-max-refills-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-calc-max-refills-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-calc-max-refills-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('medication-orders-calc-max-refills resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {patientDFN: '100615', drug: '213^', days: '90', ordItem: '1348', discharge: false});
    });
});
