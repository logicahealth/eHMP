/*global sinon, describe, it */
'use strict';

var fetch = require('./favorite-orderable-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'favorite-orderable-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'favorite-orderable-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    generalPurposeJdsServer: {
        baseUrl: 'http://IP             '
    },
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('favorite orderable resource integration test', function() {
    it('can call the fetch function', function (done) {
        this.timeout(20000);
        
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {userId: 'urn:va:user:SITE:10000000270'});
    });
});
