'use strict';

var pJdsWriter = require('./notes-unsigned-pjds-writer');

var writebackContext = {
    duz: {
        'SITE': '10000000255'
    },
    siteHash: 'SITE',
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
        'encounterUid': 'H2931013',
        'encounterDateTime': '199310131400',
        'referenceDateTime': '201507101410',
        'locationUid': 'urn:va:location:SITE:32',
        'patientIcn': '10110V004877',
        'pid': 'SITE;8',
        'status': 'UNSIGNED'
    },
    appConfig: {
        'jdsServer': {
            'host': 'IP        ',
            'port': PORT,
            'baseUrl': 'http://IP             '
        }
    }
};

describe('write-back notes pjds writer', function() {
    describe('tests create', function() {
        it.skip('returns success with vprResponse set', function() {
            expect(writebackContext.vprResponse).to.be.undefined();
            pJdsWriter.create(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.be.defined();
            });
        });
    });
    describe('tests update', function() {
        it.skip('returns success with vprResponse set', function() {
            writebackContext.model.text = 'TEST TEXT';
            pJdsWriter.update(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal({
                    success: 'Successfully updated note.'
                });
            });
        });
    });
    describe('tests read', function() {
        it.skip('returns success with vprResponse set', function() {
            pJdsWriter.read(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse.docs[0].text).to.equal('TEST TEXT');
            });
        });
    });
    describe('tests delete', function() {
        it.skip('returns success with vprResponse set', function() {
            pJdsWriter.delete(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(writebackContext.vprResponse).to.equal({
                    'delete': true
                });
            });
        });
    });
});
