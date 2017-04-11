'use strict';

var fetchList = require('./lab-order-dialog-def-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-order-dialog-def-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'lab-order-dialog-def-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

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

describe('lab-order-dialog-def resource integration test', function() {
    it('can call the getLabOrderDialogDef RPC', function (done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
