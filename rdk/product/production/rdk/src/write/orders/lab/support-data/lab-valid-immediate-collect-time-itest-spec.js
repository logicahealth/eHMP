'use strict';

var isValidTime = require('./lab-valid-immediate-collect-time').isValidImmediateCollectTime;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-valid-immediate-collect-time'
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

describe('lab-valid-immediate-collect-time resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        var timestamp = '20140902091000';
        isValidTime(log, configuration, timestamp, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
