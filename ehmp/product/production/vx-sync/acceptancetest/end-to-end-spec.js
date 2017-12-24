'use strict';

require('../env-setup');

var _ = require('underscore');
var request = require('request');

var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;
var vx_sync_port = testConfig.vxsyncPort;

describe('end-to-end', function() {
    it('works', function() {
        var synced = false,
            finished = false,
            completedStamp;
        runs(function() {
            request({
                'url': 'http://' + vx_sync_ip + ':'+vx_sync_port+'/sync/doLoad?pid=SITE;3'
            }, function() {
                finished = true;
            });
        });

        waitsFor(function() {
            return finished;
        });

        var checkStatus = function() {
            request({
                'url': 'http://' + vx_sync_ip + ':'+vx_sync_port+'/sync/status?pid=SITE;3'
            }, function(error, response, body) {
                body = JSON.parse(body);

                if (!_.isUndefined(body.syncStatus.completedStamp) && _.isUndefined(body.syncStatus.inProgress)) {
                    synced = true;
                    console.log('===== Sync Completed =====');
                    console.log(body.syncStatus.completedStamp);
                    expect(body.syncStatus.completedStamp).not.toBeUndefined();
                    completedStamp = body;
                    return;
                } else if (!_.isUndefined(body.syncStatus.inProgress)) {
                    console.log('===== Waiting on Metastamp =====');
                    console.log(body.syncStatus.inProgress);
                } else {
                    console.log('===== No Metastamp Received =====');
                    console.log(body);
                }

                console.log('===== Sync Not Complete.  Waiting... =====');
                setTimeout(checkStatus, 10000);
            });
        };

        runs(checkStatus);

        waitsFor(function() {
            return synced;
        }, 120000);

        runs(function() {
            expect(true).toBe(true);
            expect(completedStamp).not.toBeUndefined();

            // Run all the real tests here.

            expect(completedStamp.syncStatus).not.toBeUndefined();
            expect(completedStamp.syncStatus.completedStamp).not.toBeUndefined();

            var completedMetaStamp = completedStamp.syncStatus.completedStamp;

            expect(completedMetaStamp.sourceMetaStamp).not.toBeUndefined();

            expect(completedMetaStamp.sourceMetaStamp['SITE']).not.toBeUndefined();
            expect(completedMetaStamp.sourceMetaStamp.DOD).not.toBeUndefined();
        });
    });
});