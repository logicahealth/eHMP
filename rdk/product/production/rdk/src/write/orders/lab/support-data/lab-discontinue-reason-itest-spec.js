'use strict';

var getDiscontinueReason = require('./lab-discontinue-reason').getDiscontinueReason;
var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-future-lab-collects'
}));

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

describe('write back order discontinue after sign tests', function() {
    it('tests that reasons for discontinue are returned', function(done) {
        this.timeout(5000);
        getDiscontinueReason(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.undefined();
            done();
        });
    });
});
