'use strict';

var getOrwpce4LexLookUp = require('./orwpce4-lex-lookup-fetch-list').getOrwpce4LexLookUp;

var log = sinon.stub(require('bunyan').createLogger({ name: 'orwpce4-lex-look-up-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'orwpce4-lex-look-up-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('orwpce4-lex-look-up resource integration test', function() {
    it('can call the getOrwpce4LexLookUp RPC to retrieve ICD codes', function (done) {
        this.timeout(20000);
        getOrwpce4LexLookUp(log, configuration, 'CAD', 'ICD', function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            result.must.be.an.array();
            expect(result.length).to.be.gt(0);
            done();
        });
    });
    it('can call the getOrwpce4LexLookUp RPC to retrieve CHP codes', function (done) {
        this.timeout(20000);
        getOrwpce4LexLookUp(log, configuration, 'CAD', 'CHP', function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            result.must.be.an.array();
            expect(result.length).to.be.gt(0);
            done();
        });
    });
    it('can call the getOrwpce4LexLookUp RPC to retrieve CPT codes', function (done) {
        this.timeout(20000);
        getOrwpce4LexLookUp(log, configuration, 'CAD', 'CPT', function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            result.must.be.an.array();
            expect(result.length).to.be.gt(0);
            done();
        });
    });
});
