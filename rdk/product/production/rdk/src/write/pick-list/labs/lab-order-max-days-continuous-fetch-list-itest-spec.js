'use strict';

var fetchList = require('./lab-order-max-days-continuous-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-order-max-days-continuous-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'lab-order-max-days-continuous-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('lab-order-max-days-continuous resource integration test', function() {
    it('can call the getLabOrderMaxDaysContinuous RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {locationUid: 'urn:va:location:9E7A:11', schedule: 0});
    });

    it('will handle finding zero data with the getLabOrderMaxDaysContinuous RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.value).to.equal(-1);
            done();
        }, {locationUid: 'urn:va:location:9E7A:0', schedule: 0});
    });
      it('will return an error if locationIEN is missing', function (done) {
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, { schedule: 0});
    });
});
