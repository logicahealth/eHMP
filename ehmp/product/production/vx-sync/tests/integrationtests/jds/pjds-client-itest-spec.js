'use strict';

require('../../../env-setup');

var moment = require('moment');
var async = require('async');
var logger = require(global.VX_DUMMIES + 'dummy-logger');
var format = require('util').format;
var request = require('request');

// logger = require('bunyan').createLogger({
//     name: 'pjds-client',
//     level: 'debug'
// });

var config = require(global.VX_ROOT + 'worker-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var pjdsClient = new PjdsClient(logger, logger, config);

describe('pjds-client.js', function () {
    it('Is properly defined', function () {
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

        //clinical object methods
        expect(pjdsClient.createClinicalObject).toBeDefined();
        expect(pjdsClient.updateClinicalObject).toBeDefined();
        expect(pjdsClient.deleteClinicalObject).toBeDefined();
    });

    describe('OSync clinic store', function () {
        var testClinic1 = {
            'uid': 'urn:va:location:23AC:10',
            'site': '23AC'
        };
        var testClinic2 = {
            'uid': 'urn:va:location:1234:5',
            'site': '1234'
        };

        var resetOSyncClincData = function () {
            var finished;
            runs(function () {

                var tasks = [
                    pjdsClient.createOSyncClinic.bind(pjdsClient, testClinic1.site, testClinic1.uid),
                    pjdsClient.createOSyncClinic.bind(pjdsClient, testClinic2.site, testClinic2.uid)
                ];

                // Process all the jobs that we have received
                //--------------------------------------------
                async.series(tasks, function (error) {
                    expect(error).toBeFalsy();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            });
        };

        var deleteOSyncClinicData = function () {
            var finished;
            runs(function () {

                var tasks = [
                    pjdsClient.deleteOSyncClinic.bind(pjdsClient, testClinic1.uid),
                    pjdsClient.deleteOSyncClinic.bind(pjdsClient, testClinic2.uid)
                ];

                // Process all the jobs that we have received
                //--------------------------------------------
                async.series(tasks, function (error) {
                    expect(error).toBeFalsy();
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 10000);
        };

        beforeEach(resetOSyncClincData);
        afterEach(deleteOSyncClinicData);

        describe('Create OSync Clinic (createOSyncClinic())', function () {
            it('Successfully creates a single clinic', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.createOSyncClinic(testClinic1.site, testClinic1.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(201);
                        expect(result).toBeUndefined();
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
            it('Successfully creates a second clinic', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.createOSyncClinic(testClinic2.site, testClinic2.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(201);
                        expect(result).toBeUndefined();
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
        });

        describe('Get OSync Clinic by site (getOSyncClinicsBySite())', function () {
            it('Successfully returns clinics for site 23AC', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.getOSyncClinicsBySite(testClinic1.site, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic1.uid
                        }));
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });

            it('Successfully returns clinics for site 1234', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.getOSyncClinicsBySite(testClinic2.site, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic2.uid
                        }));
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
        });

        describe('Get OSync Clinic by Uid (getOSyncClinicsByUid())', function () {
            it('Successfully returns clinic 23AC:10', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.getOSyncClinicsByUid(testClinic1.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(result).toEqual(testClinic1);
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
            it('Successfully returns clinics 1234:5', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.getOSyncClinicsByUid(testClinic2.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(result).toEqual(testClinic2);
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
        });

        describe('Get All OSync Clinics (getAllOSyncClinics())', function () {
            it('Successfully returns all clinics', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.getAllOSyncClinics(function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        expect(response).toBeTruthy();
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic1.uid
                        }));
                        expect(val(result, 'items')).toContain(jasmine.objectContaining({
                            uid: testClinic2.uid
                        }));
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
        });

        describe('Delete OSync Clinic (deleteOSyncClinic())', function () {
            it('Successfully deletes a single clinic', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.deleteOSyncClinic(testClinic1.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
            it('Successfully deletes a second clinic', function () {
                var finished = false;
                runs(function () {
                    pjdsClient.deleteOSyncClinic(testClinic2.uid, function (error, response, result) {
                        expect(error).toBeNull();
                        expect(val(response, 'statusCode')).toBe(200);
                        finished = true;
                    });
                });

                waitsFor(function () {
                    return finished;
                }, 10000);
            });
        });
    });

    describe('OSync blist store', function () {
        it('handles required operations correctly', function () {
            // Create initial test conditions
            var finished = 0;

            runs(function () {
                pjdsClient.addToOsyncBlist('ABCD;3', 'ABCD', 'patient', function () {
                    pjdsClient.addToOsyncBlist('10001', 'ABCD', 'user', function () {
                        pjdsClient.getOsyncBlist('user', function (error, response, result) {
                            expect(result).toBeDefined();
                            expect(result.items).toBeDefined();
                            expect(result.items).toContain(jasmine.objectContaining({
                                'uid': 'urn:va:user:ABCD:10001'
                            }));
                            pjdsClient.getOsyncBlist('patient', function (error, response, result) {
                                expect(result).toBeDefined();
                                expect(result.items).toBeDefined();
                                expect(result.items).toContain(jasmine.objectContaining({
                                    'uid': 'urn:va:patient:ABCD:3:3'
                                }));
                                pjdsClient.getOsyncBlistByUid('urn:va:user:ABCD:10001', function (error, response, result) {
                                    expect(result).toBeDefined();
                                    expect(result.uid).toBe('urn:va:user:ABCD:10001');
                                    pjdsClient.removeFromOsyncBlist('ABCD;3', 'ABCD', 'patient', function () {
                                        pjdsClient.getOsyncBlist('patient', function (error, response, result) {
                                            expect(result).toBeDefined();
                                            expect(result.items).toBeDefined();
                                            expect(result.items).not.toContain(jasmine.objectContaining({
                                                'uid': 'urn:va:patient:ABCD:3:3'
                                            }));
                                            pjdsClient.removeFromOsyncBlist('10001', 'ABCD', 'user', function () {
                                                pjdsClient.getOsyncBlist('user', function (error, response, result) {
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

            waitsFor(function () {
                return finished;
            });
        });
    });

    describe('OSync active user store', function () {
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

        beforeEach(function () {
            var setUpDone = false;

            runs(function () {
                pjdsClient.addActiveUser(user6655, function (error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(201);

                    pjdsClient.addActiveUser(user7788, function (error, response) {
                        expect(error).toBeFalsy();
                        expect(response.statusCode).toBe(201);

                        setUpDone = true;
                    });
                });
            });

            waitsFor(function () {
                return setUpDone;
            }, 'set up', 20000);
        });

        afterEach(function () {
            var tearDown = false;

            runs(function () {
                pjdsClient.removeActiveUser(user6655.uid, function () {
                    pjdsClient.removeActiveUser(user7788.uid, function () {
                        pjdsClient.getActiveUsers(function (error, response, result) {
                            expect(result).toBeDefined();
                            expect(val(result, 'items') || []).not.toContain(jasmine.objectContaining({uid: user6655.uid}));
                            expect(val(result, 'items') || []).not.toContain(jasmine.objectContaining({uid: user7788.uid}));
                            tearDown = true;
                        });
                    });
                });
            });

            waitsFor(function () {
                return tearDown;
            }, 'tear down', 20000);
        });

        it('gets active users by filter', function () {
            var finished = false;

            runs(function () {
                pjdsClient.getActiveUsers({filter: '?filter=gt(lastSuccessfulLogin, 20160101100000)'}, function (error, response, result) {
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

            waitsFor(function () {
                return finished;
            }, 'finished', 20000);
        });

        it('gets all active users', function () {
            var finished = false;

            runs(function () {
                pjdsClient.getActiveUsers(function (error, response, result) {
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

            waitsFor(function () {
                return finished;
            }, 'finished', 20000);
        });
    });

    describe('Clinical Object store', function() {
        var consultActivity = {
            authorUid: 'urn:va:user:9E7A:10000000271',
            displayName: 'Rheumatology',
            domain: 'ehmp-activity',
            ehmpState: 'active',
            patientUid: 'urn:va:patient:9E7A:239:239',
            referenceId: '',
            subDomain: 'consult',
            uid: 'urn:va:ehmp-activity:9E7A:239:29fe0301-14ac-4d8d-95a9-9f538866beba'
        };

        var requestActivity = {
            authorUid: 'urn:va:user:9E7A:10000000271',
            displayName: 'Post procedure follow-up',
            domain: 'ehmp-activity',
            ehmpState: 'active',
            patientUid: 'urn:va:patient:9E7A:239:239',
            referenceId: '',
            subDomain: 'request',
            uid: 'urn:va:ehmp-activity:9E7A:239:29fe0301-9999-4d8d-95a9-9f538866beba'
        };

        var requestActivityUpdate = {
            authorUid: 'urn:va:user:9E7A:10000000271',
            displayName: 'Post procedure follow-up',
            domain: 'ehmp-activity',
            ehmpState: 'active',
            patientUid: 'urn:va:patient:9E7A:239:239',
            referenceId: '',
            subDomain: 'request',
            newData: 'test',
            uid: 'urn:va:ehmp-activity:9E7A:239:29fe0301-9999-4d8d-95a9-9f538866beba'
        };

        beforeEach(function() {
            var setUpDone = false;

            runs(function () {
                var url = format('%s://%s:%s%s', config.pjds.protocol, config.pjds.host, config.pjds.port, '/clinicobj/' + consultActivity.uid);

                var options = {
                    url: url,
                    json: consultActivity};

                request.put(options, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(201);

                    url = format('%s://%s:%s%s', config.pjds.protocol, config.pjds.host, config.pjds.port, '/clinicobj/' + requestActivity.uid);
                    options.url = url;
                    options.json = requestActivity;

                    request.put(options, function(error, response) {
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
                var url = format('%s://%s:%s%s', config.pjds.protocol, config.pjds.host, config.pjds.port, '/clinicobj/urn:va:ehmp-activity:9E7A:239:29fe0301-14ac-4d8d-95a9-9f538866beba');

                request.del(url, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);

                    url = format('%s://%s:%s%s', config.pjds.protocol, config.pjds.host, config.pjds.port, '/clinicobj/urn:va:ehmp-activity:9E7A:239:29fe0301-9999-4d8d-95a9-9f538866beba');

                    request.del(url, function(error, response) {
                        expect(error).toBeFalsy();
                        expect(response.statusCode).toBe(200);
                        tearDown = true;
                    });
                });
             });

            waitsFor(function () {return tearDown;}, 'tear down', 20000);
        });

        it('gets all clinical objects by filter', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getClinicalObject('filter=eq(patientUid, "urn:va:patient:9E7A:239:239"),in(subDomain, ["consult", "request"]),eq(domain, "ehmp-activity")', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': consultActivity.uid
                    }));
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': requestActivity.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('gets consult clinical objects by filter', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getClinicalObject('?filter=eq(patientUid, "urn:va:patient:9E7A:239:239"),eq(subDomain, "consult"),eq(domain, "ehmp-activity")', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': consultActivity.uid
                    }));
                    expect(result.items).not.toContain(jasmine.objectContaining({
                        'uid': requestActivity.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('gets clinical object by index and filter', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getClinicalObject('range=urn:va:ehmp-activity:9E7A:239:29fe0301-9999-4d8d-95a9-9f538866beba', 'clinicobj_uid', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).not.toContain(jasmine.objectContaining({
                        'uid': consultActivity.uid
                    }));
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': requestActivity.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('stores a clinical object document', function() {
            var finished = false;

            runs(function() {
                pjdsClient.createClinicalObject(requestActivity, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(val(response, 'statusCode')).toBe(201);
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'finished', 20000);
        });

        it('updates a clinical object document', function() {
            var finished = false;

            runs(function() {
                pjdsClient.createClinicalObject(requestActivityUpdate, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(val(response, 'statusCode')).toBe(201);
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'finished', 20000);
        });
    });

    describe('Prefetch Patient store', function() {
        var patientListPatient = {
            uid: 'urn:va:patientList:9E7A:3:3',
            pid: '9E7A;3',
            patientIdentifier: '3^PI^501^USVHA^P',
            isEhmpPatient: true,
            source: 'patientList',
            sourceDate: '20170111120000',
            facility: '501',
            clinic: 'Cancer Clinic'
        };

        var appointmentPatient = {
            uid: 'urn:va:appointment:9E7A:8:8',
            pid: '9E7A;8',
            patientIdentifier: '8^PI^501^USVHA^P',
            isEhmpPatient: false,
            source: 'appointment',
            sourceDate: '20170111120000',
            facility: '501',
            clinic: 'Cancer Clinic'
        };

        beforeEach(function() {
            var setUpDone = false;

            runs(function () {
                pjdsClient.updatePrefetchPatient(patientListPatient.uid, patientListPatient, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(201);

                    pjdsClient.updatePrefetchPatient(appointmentPatient.uid, appointmentPatient, function(error, response) {
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
                pjdsClient.removePrefetchPatient(patientListPatient.uid, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);

                    pjdsClient.removePrefetchPatient(appointmentPatient.uid, function(error, response) {
                        expect(error).toBeFalsy();
                        expect(response.statusCode).toBe(200);

                        tearDown = true;
                    });
                });
            });

            waitsFor(function () {return tearDown;}, 'tear down', 20000);
        });

        it('gets all prefetch patients by date range', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getPrefetchPatients('range=[20160514092500..20180513092500]', 'ehmp-patients', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': patientListPatient.uid
                    }));
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': appointmentPatient.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('gets ehmp patients only by a date range', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getPrefetchPatients('range=[20160514092500..20180513092500]>true', 'ehmp-patients', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': patientListPatient.uid
                    }));
                    expect(result.items).not.toContain(jasmine.objectContaining({
                        'uid': appointmentPatient.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });

        it('gets appointments only by date range and facility site code', function() {
            var finished = false;

            runs(function() {
                pjdsClient.getPrefetchPatients('range=appointment>[201601011200..201801011200]>501', 'ehmp-source', function(error, response, result) {
                    expect(result).toBeDefined();
                    expect(result.items).toBeDefined();
                    expect(result.items).not.toContain(jasmine.objectContaining({
                        'uid': patientListPatient.uid
                    }));
                    expect(result.items).toContain(jasmine.objectContaining({
                        'uid': appointmentPatient.uid
                    }));

                    finished = true;
                });
            });

            waitsFor(function() { return finished; }, 'finished', 20000);
        });
    });
});
