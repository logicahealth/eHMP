/*global sinon, describe, it */
'use strict';
var filemanDateUtil = require('../../../utils/fileman-date-converter');

var fetch = require('./lab-time-valid-immediate-collect-time-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-time-valid-immediate-collect-time-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'lab-time-valid-immediate-collect-time-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console



describe('lab-time-valid-immediate-collect-time resource integration test', function() {
    it('can call the fetch RPC on PANORAMA', function (done) {
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

        this.timeout(20000);
        var dateObject = new Date('September 3, 2015 9:24:00');
        var time = filemanDateUtil.getFilemanDateTime(dateObject);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {time: time});
    });
    it('can call the fetch RPC on KODAK', function (done) {
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

        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {time: '3151127.151'});
    });
});
