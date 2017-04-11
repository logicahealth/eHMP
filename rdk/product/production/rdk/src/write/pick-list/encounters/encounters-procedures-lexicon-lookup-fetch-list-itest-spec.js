'use strict';

var fetch = require('./encounters-procedures-lexicon-lookup-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'encounters-procedures-lexicon-lookup-fetch-list'
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

describe('encounters-procedures-lexicon-lookup-fetch-list resource integration test', function() {
    it('can call the RPC', function(done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            expect(result.length).to.be.gt(0);
            done();
        }, {searchString: 'KNE'});
    });
});
