'use strict';

require('../../../../env-setup');

var moment = require('moment');
var _ = require('underscore');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-admissions');
var crontab = require('crontab');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');
var filemanDateUtil = require(global.VX_UTILS + 'filemanDateUtil');
var prefetchUtil = require(global.OSYNC_UTILS + 'prefetch-patients-util');

var config = {vistaSites: {'SITE': {stationNumber: '501'}}};

var patient = {
    dfn: '8',
    siteId: 'SITE',
    locationName: 'Cancer clinic',
    date: filemanDateUtil.getFilemanDate(moment().toDate())
};

describe('prefetch-patients-admissions', function() {
    describe('createAdmissionPatient', function() {
        it('create prefetch patient', function() {
            var prefetchPatient = prefetch._createAdmissionPatient(patient, '501');

            expect(prefetchPatient.uid).toBe('urn:va:admission:SITE:8:8');
            expect(prefetchPatient.pid).toBe('SITE;8');
            expect(prefetchPatient.patientIdentifier).toBe('8^PI^501^USVHA^P');
            expect(prefetchPatient.isEhmpPatient).toBe(true);
            expect(prefetchPatient.source).toBe('admission');
            expect(prefetchPatient.sourceDate).toBeTruthy();
            expect(prefetchPatient.facility).toBe('501');
            expect(prefetchPatient.clinic).toBe('Cancer clinic');
        });
    });

    describe('processAdmissionsForSites', function() {
        var testDone, prefetchUtilSpy, environment;

        beforeEach(function() {
            testDone = false;
            environment = {vistaClient: new VistaClientDummy(log, config, null)};

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });
        });

        it('error retrieving admissions from vista', function() {
            spyOn(VistaClientDummy.prototype, 'fetchAdmissionsForSite').andCallFake(function(site, callback) {
                setTimeout(callback, 0, 'Connection Error');
            });

            runs(function () {
                prefetch._processAdmissionsForSites(log, config, environment, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Admission processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.vistaClient.fetchAdmissionsForSite).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('no admissions for site', function() {
            spyOn(VistaClientDummy.prototype, 'fetchAdmissionsForSite').andCallFake(function(site, callback) {
                setTimeout(callback, 0);
            });

            runs(function () {
                prefetch._processAdmissionsForSites(log, config, environment, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Admission processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.vistaClient.fetchAdmissionsForSite).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('admission parse error', function() {
            spyOn(VistaClientDummy.prototype, 'fetchAdmissionsForSite').andCallFake(function(site, callback) {
                setTimeout(callback, 0, null, '\r\n\r\n');
            });

            runs(function () {
                prefetch._processAdmissionsForSites(log, config, environment, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Admission processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.vistaClient.fetchAdmissionsForSite).toHaveBeenCalled();
                expect(prefetchUtilSpy).not.toHaveBeenCalled();
            });
        });

        it('savePrefetchPatient called', function() {
            spyOn(VistaClientDummy.prototype, 'fetchAdmissionsForSite').andCallFake(function(site, callback) {
                setTimeout(callback, 0, null, 'A^B^C^D^E\r\nB^C^D^E^F');
            });

            runs(function () {
                prefetch._processAdmissionsForSites(log, config, environment, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Admission processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.vistaClient.fetchAdmissionsForSite).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
                expect(prefetchUtilSpy.callCount).toBe(2);
            });
        });
    });

    describe('getAdmissionSites', function() {
        var testDone, setUpDone, tearDown, job;

        beforeEach(function() {
            testDone = false;
            setUpDone = false;
            tearDown = false;
        });

        afterEach(function() {
            runs(function() {
                if (job) {
                    crontab.load(function (err, crontab) {
                        crontab.remove({command: job.command()});
                        crontab.save(function (err, crontab) {
                            tearDown = true;
                        });
                    });
                } else {
                    tearDown = true;
                }

            });

            waitsFor(function () {return tearDown;}, 'tear down done', 20000);
        });


        it('no admission job found', function() {
            runs(function () {
                prefetch._getAdmissionSites(log, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(_.isEmpty(result)).toBe(true);
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });

        it('admission job found and sites not found', function() {
            runs(function() {
                crontab.load(function (err, crontab) {
                    job = crontab.create('ls -l');
                    crontab.save(function (err, crontab) {
                        setUpDone = true;
                    });
                });
            });

            waitsFor(function () {return setUpDone;}, 'set up done', 20000);

            runs(function () {
                prefetch._getAdmissionSites(log, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(_.isEmpty(result)).toBe(true);
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });

        it('admission job found and sites returned', function() {
            runs(function() {
                crontab.load(function (err, crontab) {
                    job = crontab.create('cd /opt/vxsync_client; /usr/local/bin/node ./tools/osync/osync-admission-run.js --site SITE,SITE >> /var/log/osync/osync-admission-SITE-SITE.log');
                    crontab.save(function (err, crontab) {
                        setUpDone = true;
                    });
                });
            });

            waitsFor(function () {return setUpDone;}, 'set up done', 20000);

            runs(function () {
                prefetch._getAdmissionSites(log, config.vistaSites, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(_.keys(result).length).toBe(1);
                    expect(_.keys(result)[0]).toBe('SITE');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);
        });
    });

    describe('prefetchPatients', function() {
        var testDone, setUpDone, tearDown, job, prefetchUtilSpy, environment;

        beforeEach(function() {
            testDone = false;
            setUpDone = false;
            tearDown = false;

            environment = {vistaClient: new VistaClientDummy(log, config, null)};

            prefetchUtilSpy = spyOn(prefetchUtil, 'savePrefetchPatient').andCallFake(function(log, environment, patient, callback) {
                setTimeout(callback, 0);
            });

            runs(function() {
                crontab.load(function (err, crontab) {
                    job = crontab.create('cd /opt/vxsync_client; /usr/local/bin/node ./tools/osync/osync-admission-run.js --site SITE,SITE >> /var/log/osync/osync-admission-SITE-SITE.log');
                    crontab.save(function (err, crontab) {
                        setUpDone = true;
                    });
                });
            });

            waitsFor(function () {return setUpDone;}, 'set up done', 20000);
        });

        afterEach(function() {
            runs(function() {
                if (job) {
                    crontab.load(function (err, crontab) {
                        crontab.remove({command: job.command()});
                        crontab.save(function (err, crontab) {
                            tearDown = true;
                        });
                    });
                } else {
                    tearDown = true;
                }

            });

            waitsFor(function () {return tearDown;}, 'tear down done', 20000);
        });

        it('admissions processed', function() {
            spyOn(VistaClientDummy.prototype, 'fetchAdmissionsForSite').andCallFake(function(site, callback) {
                setTimeout(callback, 0, null, 'A^B^C^D^E\r\nA^B^C^D^E');
            });

            runs(function () {
                prefetch.prefetchPatients(log, config, environment, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toBe('Admission processing completed.');
                    testDone = true;
                });
            });

            waitsFor(function () {return testDone;}, 'test done', 20000);

            runs(function () {
                expect(environment.vistaClient.fetchAdmissionsForSite).toHaveBeenCalled();
                expect(prefetchUtilSpy).toHaveBeenCalled();
                expect(prefetchUtilSpy.callCount).toBe(2);
            });
        });
    });
});
