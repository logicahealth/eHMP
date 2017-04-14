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
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body Missing patientUid', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing authorUid', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing subDomain', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing visit info', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject'
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

    it('Error Path: POST Body invalid uid format', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E'
            }
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

    it('Error Path: POST Body invalid patientUid format', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body invalid authorUid format', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:user:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing location under visit', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:user:9E7A:3:3',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing serviceCategory under visit', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                dateTime: '20160118123000'
            }
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

    it('Error Path: POST Body missing dateTime under visit', function() {
        var testConfig = _.extend({}, httpConfig);
        var complete = false;
        var postBody = {
            uid: 'urn:va:ehmp:9E7A:3:751',
            patientUid:  'urn:va:patient:9E7A:3:3',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E'
            }
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
            patientUid:  'urn:va:patient:9E7A:3:3',
            authorUid: 'urn:va:user:9E7A:123:123',
            domain: 'ehmp-order',
            subDomain: 'noteObject',
            visit: {
                location: 'urn:va:location:9E7A:1',
                serviceCategory: 'E',
                dateTime: '20160118123000'
            }
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