/*global sinon, describe, it */
'use strict';

var fetch = require('./progress-notes-titles-icd-10-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'progress-notes-titles-icd-10-fetch-list' }));

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: PORT,
    accessCode: 'REDACTED',
    verifyCode: 'REDACTED',
    localIP: 'IP      ',
    localAddress: 'localhost',
    site: '9E7A',
    rootPath: '/resource/write-pick-list'
};

describe('progress-notes-titles-icd-10 resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {searchString: 'knee'});
    });
});
