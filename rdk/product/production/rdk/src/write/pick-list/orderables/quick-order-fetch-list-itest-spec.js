/*global sinon, describe, it */
'use strict';

var fetch = require('./quick-order-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'quick-order-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'quick-order-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    generalPurposeJdsServer: {
        baseUrl: 'http://10.2.2.110:9080'
    },
    accessCode: 'pu1234',
    verifyCode: 'pu1234!!',
    localIP: '10.2.2.1',
    localAddress: 'localhost'
};

describe('quick order resource integration test', function() {
    it('can call the fetch function', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {'userId': 'userUid'});
    });
});
