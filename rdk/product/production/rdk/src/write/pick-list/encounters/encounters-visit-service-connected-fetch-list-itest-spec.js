'use strict';

var getServiceConnected = require('./encounters-visit-service-connected-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'encounters-visit-service-connected-fetch-list'
}));

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: 9210,
    accessCode: 'PW    ',
    verifyCode: 'PW    !!',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('encounters-visit-service-connected resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        getServiceConnected(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            done();
        }, {dfn: '230', visitDate: '20131001', locationUid: 'urn:va:location:9E7A:195'});
    });
    it('will return an error if locationUid is missing', function (done) {
        this.timeout(20000);
        getServiceConnected(log, configuration, function(err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {dfn: '230', visitDate: '20131001'});
    });
});
