'use strict';

var fetch = require('../progressnotes/progress-notes-titles-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'progress-notes-titles-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'progress-notes-titles-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'HMP UI CONTEXT',
    host: 'IP        ',
    port: PORT,
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost',
    vxSyncServer: {
        baseUrl: 'http://IP           '
    }
};

describe('progress-notes-titles resource integration test', function() {
    it('fetch RPC and filter with ASU works', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).to.be.truthy();
            done();
        }, {class: '3', userClassUid: 'urn:va:asu-class:SITE:561', roleNames: 'AUTHOR/DICTATOR,EXPECTED SIGNER,EXPECTED COSIGNER,ATTENDING PHYSICIAN', docStatus: 'COMPLETED', actionNames: 'VIEW,EDIT RECORD,PRINT RECORD', site: 'SITE'});
    });

    it('fetch RPC works', function(done) {
        this.timeout(120000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.null();
            expect(result).to.be.truthy();
            done();
        });
    });
});
