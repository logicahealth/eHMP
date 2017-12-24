'use strict';

var getCollectTimes = require('./lab-collect-times').getLabCollectTimes;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-collect-time'
}));

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
