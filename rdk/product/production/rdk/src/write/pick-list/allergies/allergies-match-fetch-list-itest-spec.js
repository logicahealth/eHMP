'use strict';

var fetchList = require('./allergies-match-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'allergies-match-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'allergies-match-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('allergies-match resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);

        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            done();
        }, {searchString: 'DIA'});
    });
});
