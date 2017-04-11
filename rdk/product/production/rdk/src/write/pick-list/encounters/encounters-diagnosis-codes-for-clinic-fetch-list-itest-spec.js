'use strict';

var fetchList = require('./encounters-diagnosis-codes-for-clinic-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'diagnostic-codes-clinic-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'diagnostic-codes-clinic-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('diagnostic-codes-clinic resource integration test', function() {
    it('can call the getEncountersDiagnosisCodesForClinic RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {locationUid: 'urn:va:location:9E7A:195'});
    });
        it('will return an error if locationUid is missing', function (done) {
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {});
    });
});
