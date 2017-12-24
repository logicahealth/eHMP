'use strict';

var getFutureLabCollects = require('./lab-future-lab-collects').getFutureLabCollects;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-future-lab-collects'
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

describe('lab-future-lab-collects resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        var location = '129';
        getFutureLabCollects(log, configuration, location, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
