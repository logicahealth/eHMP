'use strict';

require('../../../../env-setup');

var request = require('request');
var _ = require('underscore');
var vx_sync_ip = require(global.VX_INTTESTS + 'test-config');

var httpConfig = {
    path: '/activity-management-event',
    method: 'POST',
    port: '8080',
    host: vx_sync_ip,
    json: true,
    timeout: 60000
};

httpConfig.url = 'http://' + vx_sync_ip + ':' + httpConfig.port + httpConfig.path;

describe('activity-management-endpoint.js', function() {
    beforeEach(function() {
        // httpConfig.qs = _.clone(query);
    });
    it('Error Path: GET to POST endpoint', function() {
        var testConfig = _.extend({}, httpConfig);
        testConfig.method = 'GET';
        var complete = false;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(404); //should be 405, but express returns 404 for wrong HTTP verb
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST with empty body', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST Body Missing uid', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            pid:  '9E7A;3',
            domain: 'order',
            'encounter-uid': 'urn:va:visit:9E7A:3:2733'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST Body Missing pid', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            domain: 'order',
            'encounter-uid': 'urn:va:visit:9E7A:3:2733'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST Body missing domain', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            pid:  '9E7A;3',
            'encounter-uid': 'urn:va:visit:9E7A:3:2733'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST Body missing encounter-uid', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            pid:  '9E7A;3',
            domain: 'order'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Error Path: POST Body invalid pid format', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            pid:  '9E7A:3',
            domain: 'order',
            'encounter-uid': 'urn:va:visit:9E7A:3:2733'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(400);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });

    it('Happy Path:', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            pid:  '9E7A;3',
            domain: 'order',
            'encounter-uid': 'urn:va:visit:9E7A:3:2733'
        };
        testConfig.body = postBody;
        runs(function() {
            request(testConfig, function(err, response) {
                expect(err).toBeFalsy();
                expect(response).toBeDefined();
                expect(response.statusCode).toBe(200);
                complete = true;
            });
        });
        waitsFor(function() {
            return complete;
        }, 'HTTP request for activity-management-endpoint', 4000);
    });
});