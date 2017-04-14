'use strict';

require('../../../env-setup');

var moment = require('moment');
var async = require('async');
var logger = require(global.VX_DUMMIES + 'dummy-logger');

// logger = require('bunyan').createLogger({
//     name: 'pjds-client',
//     level: 'debug'
// });

var config = require(global.VX_ROOT + 'worker-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var pjdsClient = new PjdsClient(logger, logger, config);

describe('pjds-client.js', function() {
    it('Is properly defined', function() {
        expect(pjdsClient).not.toBeUndefined();

        // Add new pjds-client methods here to make sure pjds client is defined correctly

        //osync active user methods
        expect(pjdsClient.addActiveUser).toBeDefined();
        expect(pjdsClient.removeActiveUser).toBeDefined();
        expect(pjdsClient.getActiveUsers).toBeDefined();

        // osynclinic methods
        expect(pjdsClient.getOSyncClinicsBySite).toBeDefined();
        expect(pjdsClient.getOSyncClinicsByUid).toBeDefined();
        expect(pjdsClient.createOSyncClinic).toBeDefined();
        expect(pjdsClient.deleteOSyncClinic).toBeDefined();

        //osyncblist methods
        expect(pjdsClient.addToOsyncBlist).toBeDefined();
        expect(pjdsClient.removeFromOsyncBlist).toBeDefined();
        expect(pjdsClient.getOsyncBlist).toBeDefined();
        expect(pjdsClient.getOsyncBlistByUid).toBeDefined();
    });

    describe('OSync clinic store', function() {
        var testClinic1 = {
            'uid': 'urn:va:location:23AC:10',
            'site': '23AC'
        };
        var testClinic2 = {
            'uid': 'urn:va:location:1234:5',
            'site': '1234'
        };

        var resetOSyncClincData = function() {
            var finished;
            runs(function() {

                var tasks = [
                    pjdsClient.createOSyncClinic.bind(pjdsClient, testClinic1.site, testClinic1.uid),
                    pjdsClient.createOSyncClinic.bind(pjdsClient, testClinic2.site, testClinic2.uid)
                ];

                // Process all the jobs that we have received
                //--------------------------------------------
                async.series(tasks, function(error) {
                    expect(error).toBeFalsy();
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        };

        var deleteOSyncClinicData = function() {
            var finished;
            runs(function() {

                var tasks = [
                    pjdsClient.deleteOSyncClinic.bind(pjdsClient, testClinic1.uid),
                    pjdsClient.deleteOSyncClinic.bind(pjdsClient, testClinic2.uid)
                ];

                // Process all the jobs that we have received
                //--------------------------------------------
                async.series(tasks, function(error) {
                    expect(error).toBeFalsy();
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 10000);
        };

        beforeEach(resetOSyncClincData);
        afterEach(deleteOSyncClinicData);

        describe('Create OSync Clinic (createOSyncClinic())', function() {
            it('Successfully creates a single clinic', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.createOSyncClinic(testClinic1.site, testClinic1.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(201);
                        expect(result).toBeUndefined();
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
            it('Successfully creates a second clinic', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.createOSyncClinic(testClinic2.site, testClinic2.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(201);
                        expect(result).toBeUndefined();
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
        });

        describe('Get OSync Clinic by site (getOSyncClinicsBySite())', function() {
            it('Successfully returns clinics for site 23AC', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.getOSyncClinicsBySite(testClinic1.site, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic1.uid
                        }));
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
            it('Successfully returns clinics for site 1234', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.getOSyncClinicsBySite(testClinic2.site, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic2.uid
                        }));
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
        });

        describe('Get OSync Clinic by Uid (getOSyncClinicsByUid())', function() {
            it('Successfully returns clinic 23AC:10', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.getOSyncClinicsByUid(testClinic1.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(result).toEqual(testClinic1);
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
            it('Successfully returns clinics 1234:5', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.getOSyncClinicsByUid(testClinic2.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(result).toEqual(testClinic2);
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
        });

        describe('Delete OSync Clinic (deleteOSyncClinic())', function() {
            it('Successfully deletes a single clinic', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.deleteOSyncClinic(testClinic1.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
            it('Successfully deletes a second clinic', function() {
                var finished = false;
                runs(function() {
                    pjdsClient.deleteOSyncClinic(testClinic2.uid, function(error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        finished = true;
                    });
                });

                waitsFor(function() {
                    return finished;
                }, 10000);
            });
        });
    });

    describe('OSync blist store', function() {
        it('handles required operations correctly', function() {
        	// Create initial test conditions
            var finished = 0;

            runs(function() {
                pjdsClient.addToOsyncBlist('ABCD;3', 'ABCD', 'patient', function() {
	                pjdsClient.addToOsyncBlist('10001', 'ABCD', 'user', function() {
		                pjdsClient.getOsyncBlist('user', function(error, response, result) {
		                    expect(result).toBeDefined();
		                    expect(result.items).toBeDefined();
		                    expect(result.items).toContain(jasmine.objectContaining({
		                    	'uid': 'urn:va:user:ABCD:10001'
		                    }));
			                pjdsClient.getOsyncBlist('patient', function(error, response, result) {
			                    expect(result).toBeDefined();
			                    expect(result.items).toBeDefined();
			                    expect(result.items).toContain(jasmine.objectContaining({
			                    	'uid': 'urn:va:patient:ABCD:3:3'
			                    }));
                                pjdsClient.getOsyncBlistByUid('urn:va:user:ABCD:10001', function(error, response, result) {
                                    expect(result).toBeDefined();
                                    expect(result.uid).toBe('urn:va:user:ABCD:10001');
                                    pjdsClient.removeFromOsyncBlist('ABCD;3', 'ABCD', 'patient', function() {
                                        pjdsClient.getOsyncBlist('patient', function(error, response, result) {
                                            expect(result).toBeDefined();
                                            expect(result.items).toBeDefined();
                                            expect(result.items).not.toContain(jasmine.objectContaining({
                                                'uid': 'urn:va:patient:ABCD:3:3'
                                            }));
                                            pjdsClient.removeFromOsyncBlist('10001', 'ABCD', 'user', function() {
                                                pjdsClient.getOsyncBlist('user', function(error, response, result) {
                                                    expect(result).toBeDefined();
                                                    expect(result.items).toBeDefined();
                                                    expect(result.items).not.toContain(jasmine.objectContaining({
                                                        'uid': 'urn:va:user:ABCD:10001'
                                                    }));
                                                    finished = true;
                                                });
                                            });
                                        });
                                    });
                                });
			                });
		                });
		            });
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
    });

    describe('OSync active user store', function() {
        var user6655 = {
            uid: 'urn:va:user:9E7A:6655',
            site: '9E7A',
            id: '6655',
            lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
        };

        var user7788 = {
            uid: 'urn:va:user:9E7A:7788',
            site: '9E7A',
            id: '7788',
            lastSuccessfulLogin: '20000101100000'
        };

        beforeEach(function() {
            var setUpDone = false;

            runs(function () {
                pjdsClient.addActiveUser(user6655, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(201);

                    pjdsClient.addActiveUser(user7788, function (error, response) {
                        expect(error).toBeFalsy();
                        expect(response.statusCode).toBe(201);

                        setUpDone = true;
                    });
                });
            });

            waitsFor(function () {return setUpDone;}, 'set up', 20000);
        });

        afterEach(function() {
            var tearDown = false;

            runs(function () {
                pjdsClient.removeActiveUser(user6655.uid, function() {
                    pjdsClient.removeActiveUser(user7788.uid, function() {
                        pjdsClient.getActiveUsers(function(error, response, result) {
                            expect(result).toBeDefined();
                            expect(val(result,'items') || []).not.toContain(jasmine.objectContaining({uid: user6655.uid}));
                            expect(val(result,'items') || []).not.toContain(jasmine.objectContaining({uid: user7788.uid}));
                            tearDown = true;
                        });
                    });
                });
            });

            waitsFor(function () {return tearDown;}, 'tear down', 20000);
        });

        it('gets active users by filter', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getActiveUsers({filter: '?filter=gt(lastSuccessfulLogin, 20160101100000)'}, function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': user6655.uid
                    }));
                    expect(result.items).not.toContain(jasmine.objectContaining({
                        'uid': user7788.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('gets all active users', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getActiveUsers(function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': user6655.uid
                    }));
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': user7788.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });
    });
});