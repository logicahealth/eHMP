/*global sinon, describe, it */
'use strict';

var fetch = require('./immunization-vaccine-info-statement-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-vaccine-info-statement-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'immunization-vaccine-info-statement-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'HMP UI CONTEXT',
    host: 'IP        ',
    port: PORT,
    accessCode: 'REDACTED',
    verifyCode: 'REDACTED',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('immunization-vaccine-info-statement resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });

    it('can call the fetch RPC with filter and date', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {filter: 'S:B', visitDate: '20131001'});
    });
});
