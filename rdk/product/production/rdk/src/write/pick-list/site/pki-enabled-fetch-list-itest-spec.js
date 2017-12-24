'use strict';

var fetchList = require('./pki-enabled-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'pki-enabled-fetch-list'
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

describe('pki-enabled resource integration test', function() {
    it('can call the PkiEnabled RPC', function(done) {
        this.timeout(5000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
