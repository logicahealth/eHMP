'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var moment = require('moment');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// logger = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var getBeanstalkConfig = require(global.VX_INTTESTS + 'framework/handler-test-framework').getBeanstalkConfig;
var updateTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').updateTubenames;
var getTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').getTubenames;
var clearTubes = require(global.VX_INTTESTS + 'framework/handler-test-framework').clearTubes;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');
var PjdsClient = require('jds-cache-api').PjdsClient;
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var OSyncActiveUserListUtil = require(global.OSYNC_UTILS + 'osync-active-user-list-util');

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;

var tubePrefix = 'osync-active-user-list-util-itest';
var jobType = 'patientlist';
var tubenames;
var publisherRouter;

describe('osync-active-user-list-util-itest-spec.js', function() {

    function setUpActiveUsers(environment, pjdsUser, userScreenUser) {
        var pjdsDone = !pjdsUser;
        var jdsDone = !userScreenUser;

        runs(function() {
            if (!pjdsDone) {
                environment.pjds.addActiveUser(pjdsUser, function(error, response) {
                    if (error) {
                        expect(error).toBeFalsy();
                    }

                    expect(response.statusCode).toBe(201);
                    pjdsDone = true;
                });
            }

            if (!jdsDone) {
                environment.jds.getActiveUsers(function(error, response, result) {
                    if (error) {
                        expect(error).toBeFalsy();
                    }

                    expect(response.statusCode).toBe(200);
                    expect(_.isEmpty(result)).toBeFalsy();

                    var users = val(result, 'users') || [];
                    users.push(userScreenUser);

                    environment.jds.saveActiveUsers(users, function(error, response) {
                        if (error) {
                            expect(error).toBeFalsy();
                        }

                        expect(response.statusCode).toBe(200);
                        jdsDone++;
                    });
                });
            }
        });

        waitsFor(function() {
            return pjdsDone && jdsDone;
        }, 'set up', 20000);
    }

    function cleanUpActiveUsers(environment, pjdsUser, userScreenUser) {
        var pjdsDone = !pjdsUser;
        var jdsDone = !userScreenUser;

        runs(function() {
            if (!pjdsDone) {
                environment.pjds.removeActiveUser(pjdsUser.uid, function(error, response) {
                    expect(error).toBeFalsy();
                    expect(response.statusCode).toBe(200);
                    pjdsDone = true;
                });
            }
            if (!jdsDone) {
                environment.jds.getActiveUsers(function(error, response, result) {
                    if (error) {
                        expect(error).toBeFalsy();
                    }

                    expect(response.statusCode).toBe(200);
                    expect(_.isEmpty(result)).toBeFalsy();

                    result.users = _.reject(result.users, function(user) {
                        return user.uid === userScreenUser.uid;
                    });

                    environment.jds.saveActiveUsers(result.users, function(error, response) {
                        if (error) {
                            expect(error).toBeFalsy();
                        }

                        expect(response.statusCode).toBe(200);
                        jdsDone = true;
                    });
                });
            }
        });

        waitsFor(function() {
            return pjdsDone && jdsDone;
        }, 'clean up', 20000);
    }

    function cleanUpTubes(){
        logger.debug('osync-active-user-list-util-itest-spec: Cleaning up...');
        if (publisherRouter) {
            publisherRouter.close();
        }

        var cleared = 0;

        grabJobs(logger, host, port, tubenames, 0, function() {
            cleared++;
            logger.debug('osync-active-user-list-util-itest-spec: **** grabJobs callback was called.');
        });

        clearTubes(logger, host, port, tubenames, function() {
            cleared++;
            logger.debug('osync-active-user-list-util-itest-spec: **** clearTube callback was called.');
        });

        waitsFor(function() {
            return cleared === 2;
        }, 'clear jobs timed out', 10000);

        runs(function() {
            logger.debug('osync-active-user-list-util-itest-spec: **** test complete.');
        });
    }

    it('getActiveUsers', function() {
        var config = {
            pjds: _.defaults(wConfig.pjds, {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            }),
            jds: _.defaults(wConfig.jds, {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            }),
            osync: {
                mixedEnvironmentMode: true
            }
        };

        var pjds = new PjdsClient(logger, logger, config.pjds);
        var jds = new JdsClient(logger, logger, config);

        var environment = {
            jds: jds,
            pjds: pjds
        };

        var pjdsUser = {
            uid: 'urn:va:user:SITE:33',
            site: 'SITE',
            id: '33',
            lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
        };

        var userScreenUser = {
            duz: {
                'SITE': '34'
            },
            uid: 'urn:va:user:SITE:34',
            site: 'SITE',
            id: '34',
            lastlogin: moment().format()
        };

        setUpActiveUsers(environment, pjdsUser, userScreenUser);

        var testDone;

        runs(function() {
            var osyncActiveUserListUtil = new OSyncActiveUserListUtil(logger, config, environment);
            osyncActiveUserListUtil.getActiveUsers(function(error, users) {
                expect(error).toBeFalsy();
                expect(users.length >= 2).toBe(true);
                expect(users).toContain(jasmine.objectContaining({
                    'uid': 'urn:va:user:SITE:33'
                }));
                expect(users).toContain(jasmine.objectContaining({
                    'uid': 'urn:va:user:SITE:34'
                }));
                testDone = true;
            });
        });

        waitsFor(function() {
            return testDone;
        }, 'test complete', 20000);

        cleanUpActiveUsers(environment, pjdsUser, userScreenUser);
    });

    it('retrieveAndProcessActiveUserList', function() {
        var config = {
            pjds: _.defaults(wConfig.pjds, {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            }),
            jds: _.defaults(wConfig.jds, {
                protocol: 'http',
                host: 'IP        ',
                port: PORT
            }),
            osync: {
                mixedEnvironmentMode: true
            }
        };


        var pjds = new PjdsClient(logger, logger, config.pjds);
        var jds = new JdsClient(logger, logger, config);

        var environment = {
            jds: jds,
            pjds: pjds
        };

        var pjdsUser = {
            uid: 'urn:va:user:WXYZ:43',
            site: 'WXYZ',
            id: '43',
            lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
        };

        var userScreenUser = {
            duz: {
                'WXYZ': '44'
            },
            uid: 'urn:va:user:WXYZ:44',
            site: 'WXYZ',
            id: '44',
            lastlogin: moment().format()
        };

        var referenceInfo = {
            sessionId: 'TEST',
            utilityType: 'osync-active-user-list'
        };

        setUpActiveUsers(environment, pjdsUser, userScreenUser);

        var beanstalkConfig = getBeanstalkConfig(config, host, port, tubePrefix + '-' + jobType);
        updateTubenames(beanstalkConfig);

        tubenames = getTubenames(beanstalkConfig, [jobType]);

        config.beanstalk = beanstalkConfig;

        environment.jobStatusUpdater = {
            createJobStatus: function(job, callback) {
                callback();
            },
            errorJobStatus: function(job, error, callback) {
                callback();
            }
        };

        environment.publisherRouter = new PublisherRouter(logger, config, logger, environment.jobStatusUpdater);
        publisherRouter = environment.publisherRouter;

        var testDone;
        runs(function() {
            var osyncActiveUserListUtil = new OSyncActiveUserListUtil(logger, config, environment);

            osyncActiveUserListUtil.retrieveAndProcessActiveUserList(referenceInfo, function(error, userCount) {
                expect(error).toBeFalsy();
                expect(userCount).toBeTruthy();
                expect(userCount).toBeGreaterThan(1);

                if (error) {
                    testDone = true;
                    return;
                }

                grabJobs(logger, host, port, tubenames, 1, function(error, jobs) {
                    expect(error).toBeFalsy();

                    var resultJobTypes = _.chain(jobs).map(function(result) {
                        return result.jobs;
                    }).flatten().pluck('type').value();

                    expect(val(resultJobTypes, 'length')).toBeGreaterThan(1);
                    expect(resultJobTypes).toContain(jobType);

                    var resultJobReferenceInfo = _.map(val(jobs, ['0','jobs']), function(job){
                        return job.referenceInfo;
                    });

                    expect(resultJobReferenceInfo.length).toBeGreaterThan(1);
                    _.each(resultJobReferenceInfo, function(item){
                        expect(item).toEqual(jasmine.objectContaining(referenceInfo));
                    });

                    testDone = true;
                });
            });
        });

        waitsFor(function() {
            return testDone;
        });

        cleanUpActiveUsers(environment, pjdsUser, userScreenUser);
        cleanUpTubes();
    });
});
