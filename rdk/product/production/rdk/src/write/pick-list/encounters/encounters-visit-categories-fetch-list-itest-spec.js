'use strict';

var fetchList = require('./encounters-visit-categories-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'encounters-visit-categories-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'encounters-visit-categories-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('encounters-visit-categories resource integration test', function() {
    it('can call the getEncountersVisitCategories RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {locationUid: 'urn:va:location:9E7A:195', visitDate: '20131001'});
    });
    it('will return an error if locationUid is missing', function (done) {
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {visitDate: '20131001'});
    });
    it('will NOT return an error if visitDate is missing', function (done) {
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {locationUid: 'urn:va:location:9E7A:195'});
    });
});
