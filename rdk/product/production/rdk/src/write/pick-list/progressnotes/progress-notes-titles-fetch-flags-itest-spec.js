'use strict';

var fetch = require('../progressnotes/progress-notes-titles-fetch-flags').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'progress-notes-titles-fetch-flags' }));

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: PORT,
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('progress-note-flags resource integration test', function() {
    it('can call the RPCs to fetch the flags', function(done) {
        this.timeout(20000);
        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();

            expect(result.isSurgeryNote).to.exist();
            expect(result.isSurgeryNote).to.eql(false);

            expect(result.isOneVisitNote).to.exist();
            expect(result.isOneVisitNote).to.eql(false);

            expect(result.isPrfNote).to.exist();
            expect(result.isPrfNote).to.eql(true);

            expect(result.isConsultNote).to.exist();
            expect(result.isConsultNote).to.eql(false);

            done();
        }, {ien: '1354'});
    });
});
