'use strict';

var fetch = require('./allergies-symptoms-all-with-top-ten-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'allergies-symptoms-all-with-top-ten' }));
//var log = require('bunyan').createLogger({ name: 'allergies-symptoms-all-with-top-ten' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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


describe('allergies-symptoms-all-with-top-ten resource integration test', function() {
    it('can combine the 2 endpoints', function (done) {
        this.timeout(200000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            expect(result.allSymptoms).to.be.truthy();
            expect(result.topTen).to.be.truthy();
            done();
        });
    });
});
