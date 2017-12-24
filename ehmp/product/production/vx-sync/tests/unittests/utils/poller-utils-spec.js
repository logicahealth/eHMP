'use strict';

require('../../../env-setup');

var _ = require('underscore');

var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'poller-utils-spec',
//     level: 'debug'
// });



var config = {
    vistaSites: {
        'SITE': {
            name: 'panorama',
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            localIP: '127.0.0.1',
            stationNumber: 500,
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 20000
        },
        SITE: {
            name: 'kodak',
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            localIP: '127.0.0.1',
            stationNumber: 500,
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 20000
        }
    },
    handlerProfiles: {
        profileCollection: {
            'default': 'all',
            primary: [
                'enterprise-sync-request',
                'vista-operational-subscribe-request',

                'vista-SITE-subscribe-request',
                'vista-SITE-subscribe-request'
            ],
        }
    },
    beanstalk: {
        repoUniversal: {
            priority: 10,
            delay: 0,
            ttr: 120,
            timeout: 10,
            initMillis: 1000,
            maxMillis: 15000,
            incMillis: 1000
        },
        repoDefaults: {
            host: '127.0.0.1',
            port: 5000,
            tubename: 'vx-sync',
            tubePrefix: 'vxs-',
            jobTypeForTube: true
        },
        jobTypes: {
            'enterprise-sync-request': {},
            'vista-operational-subscribe-request': {},


            'vista-SITE-subscribe-request': {},
            'vista-SITE-subscribe-request': {}
        }
    }
};

describe('poller-utils.js', function() {
    describe('buildEnvironment()', function() {
        it('No test because of side effects', function() {});
    });

    describe('parsePollerOptions()', function() {
        it('No test because command-line parsing required', function() {});
    });

    describe('parseSubscriberOptions()', function() {
        it('No test because command-line parsing required', function() {});
    });

    describe('parseParamList()', function() {
        it('Verify Empty parameter', function() {
            expect(pollerUtils.parseParamList()).toEqual({});
            expect(pollerUtils.parseParamList(null)).toEqual({});
            expect(pollerUtils.parseParamList([])).toEqual({});
            expect(pollerUtils.parseParamList({})).toEqual({});
        });

        it('Verify single value', function() {
            expect(pollerUtils.parseParamList('test')).toEqual({
                test: 1
            });
        });

        it('Verify Simple Values', function() {
            expect(pollerUtils.parseParamList(['one', 'two'])).toEqual({
                one: 1,
                two: 1
            });
        });

        it('Verify Multiple Values', function() {
            expect(pollerUtils.parseParamList(['one', 'one', 'two'])).toEqual({
                one: 2,
                two: 1
            });
        });

        it('Verify Comma-separated Values', function() {
            expect(pollerUtils.parseParamList(['one,two', 'one'])).toEqual({
                one: 2,
                two: 1
            });
        });

        it('Verify colon and number values', function() {
            expect(pollerUtils.parseParamList(['primary', 'primary', 'jmeadows,vler', 'storage:2,enrichment'])).toEqual({
                primary: 2,
                jmeadows: 1,
                vler: 1,
                storage: 2,
                enrichment: 1
            });
        });
    });

    describe('parseAllJobTypes()', function() {
        it('Verify empty value is false', function() {
            expect(pollerUtils.parseAllJobTypes()).toBe(false);
            expect(pollerUtils.parseAllJobTypes(null)).toBe(false);
            expect(pollerUtils.parseAllJobTypes('test')).toBe(false);
        });

        it('Verify correct parse of values', function() {
            expect(pollerUtils.parseAllJobTypes({ 'all-job-types': false })).toBe(false);
            expect(pollerUtils.parseAllJobTypes({ 'all-job-types': true })).toBe(true);
            expect(pollerUtils.parseAllJobTypes({ 'all-job-types': 'true' })).toBe(true);
            expect(pollerUtils.parseAllJobTypes({ 'all-job-types': 'TRUE' })).toBe(true);
        });
    });

    describe('parseIgnoreInvalid()', function() {
        it('Verify empty value is false', function() {
            expect(pollerUtils.parseIgnoreInvalid()).toBe(false);
            expect(pollerUtils.parseIgnoreInvalid(null)).toBe(false);
            expect(pollerUtils.parseIgnoreInvalid('test')).toBe(false);
        });

        it('Verify correct parse of values', function() {
            expect(pollerUtils.parseIgnoreInvalid({ 'ignore-invalid': false })).toBe(false);
            expect(pollerUtils.parseIgnoreInvalid({ 'ignore-invalid': true })).toBe(true);
            expect(pollerUtils.parseIgnoreInvalid({ 'ignore-invalid': 'true' })).toBe(true);
            expect(pollerUtils.parseIgnoreInvalid({ 'ignore-invalid': 'TRUE' })).toBe(true);
        });
    });

    describe('parseAutostart()', function() {
        it('Verify empty value is true', function() {
            expect(pollerUtils.parseAutostart(log)).toBe(true);
            expect(pollerUtils.parseAutostart(log, null)).toBe(true);
            expect(pollerUtils.parseAutostart(log, 'test')).toBe(true);
        });

        it('Verify correct parse of values', function() {
            expect(pollerUtils.parseAutostart(log, { autostart: false })).toBe(false);
            expect(pollerUtils.parseAutostart(log, { autostart: 'false' })).toBe(false);
            expect(pollerUtils.parseAutostart(log, { autostart: 'FALSE' })).toBe(false);
            expect(pollerUtils.parseAutostart(log, { autostart: true })).toBe(true);
            expect(pollerUtils.parseAutostart(log, { autostart: 'true' })).toBe(true);
            expect(pollerUtils.parseAutostart(log, { autostart: 'TRUE' })).toBe(true);
        });
    });

    describe('parseMultipleMode()', function() {
        it('Verify empty value is false', function() {
            expect(pollerUtils.parseMultipleMode(log)).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, null)).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, 'test')).toBe(false);
        });

        it('Verify correct parse of values', function() {
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: undefined })).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: false })).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: 'false' })).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: 'FALSE' })).toBe(false);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: true })).toBe(true);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: 'true' })).toBe(true);
            expect(pollerUtils.parseMultipleMode(log, { multiplemode: 'TRUE' })).toBe(true);
        });
    });

    describe('parseSites()', function() {
        it('Verify Empty', function() {
            expect(pollerUtils.parseSites()).toEqual([]);
            expect(pollerUtils.parseSites(null)).toEqual([]);
            expect(pollerUtils.parseSites({})).toEqual([]);
            expect(pollerUtils.parseSites({ site: '' })).toEqual([]);
        });

        it('Verify Single Site', function() {
            expect(pollerUtils.parseSites({ site: 'SITE' })).toEqual(['SITE']);
        });

        it('Verify Multiple Sites and Numeric Site', function() {
            expect(pollerUtils.parseSites({ site: ['SITE', 'SITE', 9016, '1234']})).toEqual(['SITE', 'SITE', '9016', '1234']);
        });
    });

    // describe('findInvalidOptions()', function() {
    //     it('', function() {});
    // });

    // describe('stripRedundantJobTypesFromProfiles()', function() {
    //     it('', function() {});
    // });
});