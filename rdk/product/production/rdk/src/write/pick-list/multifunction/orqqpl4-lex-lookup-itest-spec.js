/*global sinon, describe, it */
'use strict';

var getOrqqpl4LexLookUp = require('./orqqpl4-lex-lookup-fetch-list').getOrqqpl4LexLookUp;

var log = sinon.stub(require('bunyan').createLogger({ name: 'orqqpl4-lex-look-up-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'orqqpl4-lex-look-up-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('orqqpl4-lex-look-up resource integration test', function() {
    it('can call the getOrqqpl4LexLookUp RPC', function (done) {
        this.timeout(20000);
        var noMinimumLength;
        getOrqqpl4LexLookUp(log, configuration, 'dia', 'PLS', 0, noMinimumLength, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.length).to.be.gt(0);
            done();
        });
    });

    it('can call the getOrqqpl4LexLookUp RPC', function (done) {
        this.timeout(20000);
        var noMinimumLength = true;
        getOrqqpl4LexLookUp(log, configuration, 'a', 'PLS', 0, noMinimumLength, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.length).to.be.gt(0);
            done();
        });
    });
});
