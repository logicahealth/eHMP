/*global sinon, describe, it */
'use strict';

var fetch = require('./medication-orders-dispense-drug-message-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-dispense-drug-message-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-dispense-drug-message-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('medication-orders-dispense-drug-message resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {ien: 280}); //280 ==> dispenseMsg = 'INTEN', 3 ==> dispenseMsg ='RESTRICTED TO ONCOLOGY'
    });
});
