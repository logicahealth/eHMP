'use strict';

require('../../../env-setup');

var _ = require('underscore');

var recordUpdateUtils = require(global.VX_ROOT + 'record-update/utils/record-update-utils.js');
var getPatientIdentifierFromRecordPid = recordUpdateUtils.getPatientIdentifierFromRecordPid;
var createErrorStatus = recordUpdateUtils.createErrorStatus;
var addDistinct = recordUpdateUtils.addDistinct;
var addIncompleteDomain = recordUpdateUtils.addIncompleteDomain;
var buildPidStats = recordUpdateUtils.buildPidStats;
var buildPidToDomainComboList = recordUpdateUtils.buildPidToDomainComboList;
var buildJobTaskList = recordUpdateUtils.buildJobTaskList;


describe('record-update-utils.js', function() {
    var pidsToResyncDomains = {
        '9E7A;1': ['med', 'consult'],
        'C877;8': ['allergy'],
    };

    describe('getPatientIdentifierFromRecordPid()', function() {
        it('tests that correct result is produced', function() {
            expect(getPatientIdentifierFromRecordPid('9E7A;3')).toEqual({
                value: '9E7A;3',
                type: 'pid'
            });

            expect(getPatientIdentifierFromRecordPid('10108V420871')).toEqual({
                value: '10108V420871',
                type: 'icn'
            });
        });
    });

    describe('createErrorStatus()', function() {
        var operation = 'an action';
        var pid = '9E7A;3';
        var domain = 'allergy';
        var detail = 'Error occurred while trying to do something';

        it('tests that correct result is produced with detail.', function() {
            expect(createErrorStatus(operation, pid, domain, detail)).toEqual({
                'record-update-error': {
                    operation: operation,
                    pid: pid,
                    domain: domain,
                    detail: detail
                }
            });
        });

        it('tests that correct result is produced without detail.', function() {
            expect(createErrorStatus(operation, pid, domain)).toEqual({
                'record-update-error': {
                    operation: operation,
                    pid: pid,
                    domain: domain
                }
            });
        });
    });

    describe('addDistinct()', function() {
        it('tests that non list returns value passed as \'list\'', function() {
            expect(addDistinct('value', 'test')).toEqual('value');
        });

        it('tests that duplicate item is not added', function() {
            expect(addDistinct(['foo', 'bar'], 'foo')).toEqual(['foo', 'bar']);
        });

        it('tests that new item is added', function() {
            expect(addDistinct(['foo', 'bar'], 'quux')).toEqual(['foo', 'bar', 'quux']);
        });
    });

    describe('addIncompleteDomain()', function() {
        var pid = '9E7A;3';
        var domain = 'allergy';

        it('tests null or undefined incomplete object works', function() {
            expect(addIncompleteDomain(undefined, pid, domain)).toEqual({
                '9E7A;3': ['allergy']
            });

            expect(addIncompleteDomain(null, pid, domain)).toEqual({
                '9E7A;3': ['allergy']
            });
        });

        it('tests adds to new pid', function() {
            expect(addIncompleteDomain({
                '9E7A;1': ['allergy']
            }, pid, domain)).toEqual({
                '9E7A;1': ['allergy'],
                '9E7A;3': ['allergy']
            });
        });

        it('tests adds to existing pid', function() {
            expect(addIncompleteDomain({
                '9E7A;3': ['consult']
            }, pid, domain)).toEqual({
                '9E7A;3': ['consult', 'allergy']
            });
        });
    });

    describe('buildPidStats()', function() {
        it('tests that correct result is produced', function() {
            // expect(buildPidStats(pidsToResyncDomains)).toEqual(jasmine.objectContaining({
            //     '9E7A;1': {
            //         domainsComplete: [],
            //         jobsPublished: 0,
            //         referenceInfo: {
            //             sessionId: jasmine.any(String),
            //             utilityType: jasmine.any(String),
            //             requestId: jasmine.any(String)
            //         }
            //     },
            //     'C877;8': {
            //         domainsComplete: [],
            //         jobsPublished: 0,
            //         referenceInfo: {
            //             sessionId: jasmine.any(String),
            //             utilityType: 'record-update-enrichment',
            //             requestId: jasmine.any(String)
            //         }
            //     }
            // }));
            expect(buildPidStats(pidsToResyncDomains)).toEqual(jasmine.objectContaining({
                '9E7A;1': {
                    domainsComplete: [],
                    jobsPublished: 0,
                    referenceInfo: {
                        requestId: jasmine.any(String)
                    }
                },
                'C877;8': {
                    domainsComplete: [],
                    jobsPublished: 0,
                    referenceInfo: {
                        requestId: jasmine.any(String)
                    }
                }
            }));
        });
    });

    describe('buildPidToDomainComboList()', function() {
        it('tests that correct result is produced', function() {
            expect(buildPidToDomainComboList(pidsToResyncDomains)).toEqual(
                [{
                    pid: '9E7A;1',
                    domain: 'med'
                }, {
                    pid: '9E7A;1',
                    domain: 'consult'
                }, {
                    pid: 'C877;8',
                    domain: 'allergy'
                }]
            );
        });
    });

    describe('buildJobTaskList()', function() {
        it('tests that correct result is produced', function() {
            var beanstalkClient = {
                put: function() {}
            };

            var jobsToPublish = [{
                uuid: 'job1'
            }, {
                uuid: 'job2'
            }, {
                uuid: 'job3'
            }];

            var taskList = buildJobTaskList(beanstalkClient, jobsToPublish);

            expect(_.size(taskList)).toEqual(_.size(jobsToPublish));
        });
    });
});