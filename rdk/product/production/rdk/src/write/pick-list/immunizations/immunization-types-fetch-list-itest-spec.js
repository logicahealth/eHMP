'use strict';

var fetchList = require('./immunization-types-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-types-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'immunization-types-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('immunization-types resource integration test', function() {
    it('can call the getImmunizationTypes RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
