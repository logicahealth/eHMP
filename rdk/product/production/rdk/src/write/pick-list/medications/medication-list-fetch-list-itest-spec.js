'use strict';

var fetch = require('./medication-list-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: PORT,
    accessCode: 'REDACTED',
    verifyCode: 'REDACTED',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('medication-orders resource integration test', function() {
    it('can call the RPC', function (done) {
        this.timeout(8000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'O RX'});
    });
});
