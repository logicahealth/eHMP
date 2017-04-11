/*global sinon, describe, it */
'use strict';
var filemanDateUtil = require('../../../utils/fileman-date-converter');

var fetch = require('./lab-times-available-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-times-available-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'lab-times-available-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('lab-times-available resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {date: '20150903092400',locationUid: 'urn:va:location:9E7A:11'}); //3150828
    });
    it('will return an error if locationIEN is missing', function (done) {
        this.timeout(8000);
        fetch(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {date: '20150903092400'});
    });
});
