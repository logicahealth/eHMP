'use strict';

var fetch = require('./wards-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'wards-fetch-list' }));

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

describe('wards-fetch-list resource', function() {
    it('can call the RPC and get results', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.be.gte(0);
            done();
        });
    });
});


