'use strict';

var fetch = require('./clinics-newloc-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'clinics-newloc-fetch-list' }));

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

describe('clinics-newloc-fetch-list resource', function() {
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


