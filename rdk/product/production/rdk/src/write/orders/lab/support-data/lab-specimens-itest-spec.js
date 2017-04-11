'use strict';

var getLabSpecimens = require('./lab-specimens').getLabSpecimens;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-specimens'
}));

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

describe('lab-specimens resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        getLabSpecimens(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
