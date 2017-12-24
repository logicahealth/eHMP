'use strict';

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var fsUtil = require(global.VX_UTILS + 'fs-utils');
var handler = require(global.VX_HANDLERS + 'jmeadows-document/jmeadows-pdf-request-handler');

describe('jmeadows-pdf-request-handler', function() {

    var config = {
        jmeadows:{
            defaults: {
                host: 'localhost',
                port: 5400,
                method: 'GET'
            },
            document: {
                path: '/dod/document'
            }
        },
        documentStorage: {
            staging: {
                path: '/tmp/vxsync/documents/staged',
                permissions: '700'
            },
            publish: {
                path: '/tmp/vxsync/documents/published',
                permissions: '500'
            }
        }
    };

    describe('create staging file', function() {

        var sampleVPRAllergy = {
            'facilityCode': 'DOD',
            'facilityName': 'DOD',
            'status': 'COMPLETED',
            'statusDisplayName': 'Completed',
            'localTitle': 'Consultation Note (Provider) Document',
            'referenceDateTime': '201103021444432',
            'documentTypeName': 'Consultation Note (Provider) Document',
            'sensitive': true,
            'dodComplexNoteUri': 'http://127.0.0.1:8080/MockDoDAdaptor/async/complex/note/2157584289',
            'uid': null,
            'pid': 'DOD;00000099',
            'text': null
        };

        var job = {
            requestStampTime: '20150103120000',
            dataDomain: 'consult',
            patientIdentifier: {
                type: 'edipi',
                value: '00000099'
            },
            record: sampleVPRAllergy
        };

        it('get http config', function() {
            var httpconfig = handler._getHttpConfig(log, config, job);
            expect(httpconfig).not.toBeNull();
            expect(httpconfig.path).toBeDefined();
            expect(httpconfig.url).toBeDefined();
            expect(httpconfig.qs).toBeDefined();
            expect(httpconfig.qs.uri).toBeDefined();
        });
        it('get http with bad config', function() {
            var httpconfig = handler._getHttpConfig(log, {}, job);
            expect(httpconfig).toBeNull();
        });
        it('write temporary file', function() {
            var finished = false;
            runs(function(){
                handler._createTmpFile(log, config.documentStorage.staging.path, config.documentStorage.staging.permissions, 'test file', function(err, filename) {
                    expect(filename).toMatch(/^[a-zA-Z0-9-]+\.pdf$/);
                    var filepath = config.documentStorage.staging.path+'/'+filename;
                    expect(fsUtil.fileExistsSync(filepath)).toBeTruthy();

                    finished = true;
                });
            });

            waitsFor(function(){
                return finished;
            },'Timeout waiting for writing to FS',1000);
        });
        it('write file that already exists', function(){
            var usedFilename = null;
            runs(function(){
                handler._createTmpFile(log, config.documentStorage.staging.path, config.documentStorage.staging.permissions, 'test file', function(err, filename){
                    usedFilename = filename;
                });
            });
            waitsFor(function(){
                return (usedFilename !== null);
            }, 'Timeout waiting for temp filename', 1000);
        });

    });
    afterEach(function() {
        fsUtil.deleteAllFiles(config.documentStorage.staging.path,false);
    });
});
