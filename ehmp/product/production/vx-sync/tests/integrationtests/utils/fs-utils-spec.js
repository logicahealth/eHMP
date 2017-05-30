'use strict';

require('../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var fsUtil = require(global.VX_UTILS + 'fs-utils');
var handler = require(global.VX_HANDLERS + 'jmeadows-document/jmeadows-pdf-request-handler');

describe('fs-utils utility', function () {
    var config = {
        jmeadows: {
            defaults: {
                host: 'localhost',
                port: 5400,
                method: 'GET'
            },
            document: {
                path: '/dod/document'
            },
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
        },
    };

    it('write file that already exists', function () {
        var usedFilename = null;
        var errorSpy = jasmine.createSpy('fileExists');
        var completeSpy = jasmine.createSpy('success');
        runs(function(){
            handler._createTmpFile(log, config.documentStorage.staging.path, config.documentStorage.staging.permissions, 'test file', function(err, filename){
                usedFilename = filename;
            });
        });
        waitsFor(function(){
            return (usedFilename !== null);
        }, 'Timeout waiting for temp filename', 1000);
        runs(function(){
            var file = new Buffer('test file 2', 'binary');
            fsUtil.writeFile(log, config.documentStorage.staging.path, usedFilename, config.documentStorage.staging.permissions, file, errorSpy, completeSpy);
        });
        waitsFor(function(){
            return (errorSpy.calls.length > 0);
        },'Spy function never invoked', 2000);
        runs(function(){
            expect(errorSpy.calls.length).toEqual(1);
            expect(completeSpy.calls.length).toEqual(0);
        });
    });

    afterEach(function () {
        fsUtil.deleteAllFiles(config.documentStorage.staging.path, false);
    });
});
