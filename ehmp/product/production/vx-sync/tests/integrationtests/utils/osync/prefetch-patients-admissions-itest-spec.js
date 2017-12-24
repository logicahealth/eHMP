'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var async = require('async');
var crontab = require('crontab');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var config = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require('jds-cache-api').PjdsClient;
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');

var prefetch = require(global.OSYNC_UTILS + 'prefetch-patients-admissions');

config.osync.vistaSites = config.vistaSites;

describe('prefetch-patients-admissions', function() {
    var testDone, setUpDone, tearDown, job, cronJobAdded, environment;

    beforeEach(function() {
        testDone = false;
        setUpDone = false;
        tearDown = false;

        environment = {
            pjds: new PjdsClient(log, log, config.pjds),
            vistaClient: new VistaClient(log, log, config.osync, null)
        };

        runs(function() {
            crontab.load(function (err, crontab) {
                job = crontab.jobs({command: 'osync-admission-run.js'});

                if (_.isUndefined(job) || _.isEmpty(job)) {
                    job = crontab.create('cd /opt/vxsync_client; /usr/local/bin/node ./tools/osync/osync-admission-run.js --site SITE,SITE >> /var/log/osync/osync-admission-SITE-SITE.log');
                    crontab.save(function (err, crontab) {
                    });
                    cronJobAdded = true;
                }
                setUpDone = true;
            });
        });

        waitsFor(function () {return setUpDone;}, 'set up done', 20000);
    });

    afterEach(function() {
        runs(function() {
            if (cronJobAdded && job) {
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

    it('retrieve patients and store in prefetch store', function() {
        runs(function () {
            prefetch.prefetchPatients(log, config, environment, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBe('Admission processing completed.');

                environment.pjds.getPrefetchPatients('range=admission', 'ehmp-source', 'minimal', function(error, response, result) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);
                    expect(result.items.length).toBeGreaterThan(0);
                    testDone = true;
                });
            });
        });

        waitsFor(function () {return testDone;}, 'test done', 90000);

        runs(function () {
            environment.pjds.getPrefetchPatients('range=admission', 'ehmp-source', function(error, response, result) {
                expect(error).toBeFalsy();
                expect(response.statusCode).toBe(200);

                async.each(result.items, function(item, callback) {
                    environment.pjds.removePrefetchPatient(item.uid, callback);
                }, function(err) {
                    expect(err).toBeFalsy();
                    tearDown = true;
                });
            });
        });

        waitsFor(function () {return tearDown;}, 'tearDown done', 90000);
    });
});
