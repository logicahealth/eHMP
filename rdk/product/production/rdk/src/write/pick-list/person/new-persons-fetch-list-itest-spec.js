'use strict';

var fetch = require('./new-persons-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'new-persons-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'new-persons-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('new-persons-fetch-list resource', function() {
    it('can call the RPC with no date', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.be.gte(0);
            done();
        });
    });

    it('can call the RPC with a date that returns results', function(done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.be.gte(0);
            done();
        }, {date: '20160101'});
    });

    it('can call the RPC with a date that returns 0 results', function(done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).not.to.be.falsy();
            result.must.be.an.array();
            expect(result.length).to.equal(0);
            done();
        }, {date: '18000101'});
    });

    it('fetch works recursively', function (done) {
        this.timeout(120000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });
});
