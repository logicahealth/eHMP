'use strict';

var getCollectTimes = require('./lab-collect-times').getLabCollectTimes;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-collect-time'
}));

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

describe('lab-collect-times resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        var dateSelected = '20160219101112';
        var location = '64';
        getCollectTimes(log, configuration, dateSelected, location, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
