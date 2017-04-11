'use strict';

require('../../../env-setup');
var _ = require('underscore');
var moment = require('moment');
var errorCoolDownRule = require(global.VX_SYNCRULES + 'error-cooldown-rule');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'operational-sync-endpoint-handler-spec',
//     level: 'debug'
// });


describe('error-cooldown-rule.js', function() {
    describe('siteUnderCoolDown function', function() {
        it('returns true if site is under cool down', function() {

            //2	5	1	remove
            var currentTime = moment().subtract(30, 's').valueOf();
            var latestJobTimeStamp = moment().subtract(35, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'VLER', 100000)).toBeTruthy();

            //5	1	2	remove - update end
            currentTime = moment().add(30, 's').valueOf();
            latestJobTimeStamp = moment().add(25, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'HDR', 100000)).toBeTruthy();

            //2	1	5	remove - update end
            currentTime = moment().add(30, 's').valueOf();
            latestJobTimeStamp = moment().add(100, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'DOD', 100000)).toBeTruthy();
        });

        it('returns false if site is Not under a cool down', function() {
            //siteCoolDownDuration === 0
            var currentTime = moment().subtract(30, 's').valueOf();
            var latestJobTimeStamp = moment().subtract(15, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'VXSYNC', 0)).toBeFalsy();

            //site unknown
            currentTime = moment().subtract(30, 's').valueOf();
            latestJobTimeStamp = moment().subtract(15, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'unknown', 0)).toBeFalsy();

            //5	2	1	keep
            currentTime = moment().add(30, 's').valueOf();
            latestJobTimeStamp = moment().subtract(30, 's').valueOf();
            expect(errorCoolDownRule._siteUnderCoolDown(currentTime, latestJobTimeStamp, 'VLER', 0)).toBeFalsy();
        });
    });

    describe('getSiteCooldown function', function() {
        it('returns zero cool down', function() {
            expect(errorCoolDownRule._getSiteCooldown(log, undefined, 'VXSYNC')).toBe(0);
            expect(errorCoolDownRule._getSiteCooldown(log, {}, undefined)).toBe(0);
            expect(errorCoolDownRule._getSiteCooldown(log, {}, 'VXSYNC')).toBe(0);
        });

        it('returns default cool down', function() {
            expect(errorCoolDownRule._getSiteCooldown(log, {default: 5}, 'VXSYNC')).toBe(5);
        });

        it('returns site cool down', function() {
            expect(errorCoolDownRule._getSiteCooldown(log, {default: 5, 'DOD': 10}, 'DOD')).toBe(10);
        });
    });

    describe('processJobStatus function', function() {
        var patientIdentifiers = [
            {type: 'icn', value: '233422V343'},
            {type: 'pid', value:'VLER;23423423'},
            {type:'pid', value: 'DOD;23423423'}
        ];

        function getValues(patientIdentifiers) {
            return _.pluck(patientIdentifiers, 'value');
        }

        it('returns all patientIdentifiers', function() {
            var allValues = getValues(patientIdentifiers);
            var config = {rules: {}};
            var currentTime = moment().valueOf();
            var statusResult = {};

            errorCoolDownRule._processJobStatus(log, config, currentTime, patientIdentifiers, statusResult, [], function(err, patients) {
                expect(patients.length).toBe(3);
                expect(allValues).toContain(patients[0].value);
                expect(allValues).toContain(patients[1].value);
                expect(allValues).toContain(patients[2].value);
            });

            config.rules = {'error-cooldown': {VXSYNC: 0}};
            statusResult = [ {
                'type': 'enterprise-sync-request',
                'status': 'error',
                'timestamp': moment().valueOf(),
                'patientIdentifier': {
                    'type': 'pid',
                    'value': 'DOD;23423423'
                }
            }];

            errorCoolDownRule._processJobStatus(log, config, currentTime, patientIdentifiers, statusResult, [], function(err, patients) {
                expect(patientIdentifiers.length).toBe(3);
                expect(allValues).toContain(patients[0].value);
                expect(allValues).toContain(patients[1].value);
                expect(allValues).toContain(patients[2].value);
            });

        });

        it('returns two patientIdentifiers', function() {
            var allValues = getValues(patientIdentifiers);

            var config = {rules: {'error-cooldown': {default: 6000000}}};
            var currentTime = moment().subtract(30, 's').valueOf();
            var statusResult = [{
                'type': 'enterprise-sync-request',
                'status': 'completed',
                'timestamp': moment().valueOf(),
                'patientIdentifier': {
                    'type': 'icn',
                    'value': '233422V343'
                }
            }, {
                'type': 'jmeadows-sync-request',
                'patientIdentifier': {
                    'type': 'pid',
                    'value': 'DOD;23423423'
                },
                'status': 'error',
                'timestamp': moment().add(30, 's').valueOf()
            }, {
                'type': 'vler-sync-request',
                'patientIdentifier': {
                    'type': 'pid',
                    'value': 'VLER;23423423'
                },
                'status': 'error',
                'timestamp': moment().add(30, 's').valueOf()
            }];

            errorCoolDownRule._processJobStatus(log, config, currentTime, patientIdentifiers, statusResult, ['dod'], function(err, patients) {
                expect(patients.length).toBe(2);
                expect(allValues).toContain(patients[0].value);
                expect(allValues).toContain(patients[1].value);
                expect(getValues(patients)).not.toContain('VLER;23423423');
            });

        });
    });
});
