'use strict';

var disabilities = require('./encounters-visit-disabilities-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'encounters-visit-disabilities-fetch-list'
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

describe('encounters-visit-disabilities resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        disabilities(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            done();
        });
    });
});