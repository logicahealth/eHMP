'use strict';

var vistaWriter = require('./notes-vista-writer');

var writebackContext = {
    pid: 'SITE;8',
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'USER  ',
        verifyCode: 'PW      ',
        localIP: 'IP      ',
        localAddress: 'localhost',
        context: 'HMP UI CONTEXT'
    },
    model: {
        'authorUid': '10000000255',
        'documentDefUid': 'urn:va:doc-def:SITE:40',
        'encounterLocalId': 'H2931013',
        'encounterDateTime': '199310131400',
        'referenceDateTime': '201507101410',
        'locationUid': 'urn:va:location:SITE:32',
        'patientIcn': '10110V004877',
        'pid': 'SITE;8',
        'status': 'UNSIGNED'
    },
    logger: sinon.stub(require('bunyan').createLogger({name: 'notes-vista-writer'}))
};

describe('write-back notes vista writer integration', function() {
    describe('tests unsigned', function() {
        it.skip('returns success with note ien', function(done) {
            this.timeout(5000);
            vistaWriter.unsigned(writebackContext, function(err, result) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.be.undefined();
                expect(writebackContext.model.localId).to.be.truthy();
                done();
            });
        });
    });
});
