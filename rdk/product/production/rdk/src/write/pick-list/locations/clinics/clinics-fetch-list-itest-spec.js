'use strict';

var fetch = require('./clinics-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'clinics-fetch-list' }));

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

describe('services fetch integration test', function() {
    it('can call the RPC, takes no inputs', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {});
    });
});

