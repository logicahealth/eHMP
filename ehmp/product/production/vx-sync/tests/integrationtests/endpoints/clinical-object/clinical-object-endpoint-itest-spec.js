'use strict';

require('../../../../env-setup');

var request = require('request');
var _ = require('underscore');
var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;
var vx_sync_port = testConfig.vxsyncPort;


var httpConfig = {
    path: '/clinicalObject',
    method: 'POST',
    port: vx_sync_port,
    host: vx_sync_ip,
    json: true,
    timeout: 60000,
    headers: {
        'x-request-id': 'clinical-object-itest',
        'x-session-id': 'itest'
    }
};

httpConfig.url = 'http://' + vx_sync_ip + ':' + httpConfig.port + httpConfig.path;

describe('clinical-object-endpoint.js', function () {
    var rec = require(global.VX_TESTS + 'data/clinical-objects/ehmp-activity.json');

    it('Happy Path:', function () {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = JSON.parse(JSON.stringify(rec));
        postBody.storeToSolr = true;
        testConfig.body = postBody;
        runs(function () {
            request(testConfig, function (err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(201);
                complete = true;
            });
        });
        waitsFor(function () {
            return complete;
        });
    });

    it('Error Path:', function () {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = JSON.parse(JSON.stringify(rec));
        delete postBody.uid;
        testConfig.body = postBody;
        runs(function () {
            request(testConfig, function (err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function () {
            return complete;
        });
    });

    it('Cleans up', function () {
        var deleteConfig = _.extend({}, httpConfig);
        var complete = false;
        deleteConfig.method = 'DELETE';
        httpConfig.url = httpConfig.url + '/' + rec.uid;
        runs(function () {
            request(deleteConfig, function (err) {
                expect(err).toBeFalsy();
                complete = true;
            });
        });
        waitsFor(function () {
            return complete;
        });
    });
});
