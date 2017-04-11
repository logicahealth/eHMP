'use strict';

var fetch = require('./problems-lexicon-extended-lookup-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'problems-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'problems-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP_ADDRESS',
    port: 9210,
    accessCode: 'PW',
    verifyCode: 'PW',
    localIP: 'IPADDRES',
    localAddress: 'localhost'
};

describe('problems resource integration test extended', function() {
    it('can call the RPC with a date', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'RADIOL', date: '20150708165256'});
    });

    it('can call the RPC for today', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'latex', date: 0});
    });

    it('can call the RPC with no date, no synonym, no limit', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'latex'});
    });

    it('can call the RPC with today and synonym, no limit', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'latex', date: 0, synonym: 1});
    });

    it('can call the RPC with today, synonym and limit', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'latex', date: 0, synonym: 1, limit: 100});
    });

    it('can call the RPC with no date and limit', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'latex', limit: 100});
    });

    it('can call the RPC with no date and limit with too many records coming back', function(done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {searchString: 'latex', limit: 100});
    });
});

