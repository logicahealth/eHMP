'use strict';

require('../../../env-setup');

var uuid = require('node-uuid');

var jobUtil = require(global.VX_UTILS + 'job-utils');
var DummyRequest = require(global.VX_ROOT + 'tests/frames/dummy-request');

// TODO: add specific job types for protection
describe('job.js', function() {
    var uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    describe('create()', function() {
        var testType = 'test-event';
        var testId = {
            type: 'icn',
            value: '10110V004877'
        };
        var testDomain = 'allergy';
        var testRecord = {
            data: {
                items: [{
                    name: 'value'
                }, {
                    name: 'value'
                }]
            }
        };
        var testEventUid = 'urn:va:allerfy:SITE:123:11';

        var dummyRequest = new DummyRequest();
        dummyRequest.jpid = 'jpid';
        dummyRequest.referenceInfo = {
            requestId: 'job-utils-requestId',
            sessionId: 'job-utils-sessionId'
        };

        it('verify unforced enterprise-type job is correct', function() {
            var job = jobUtil.create(testType, testId, null, null, null, null, dummyRequest);
            expect(job.type).toEqual(testType);
            expect(job.patientIdentifier).toEqual(testId);
            expect(job.jpid).toEqual('jpid');
            expect(job.jobId).toBeDefined();
            expect(job.priority).toBeUndefined();
            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo.requestId).toEqual('job-utils-requestId');
            expect(job.referenceInfo.sessionId).toEqual('job-utils-sessionId');

        });

        it('verify job without domain is correct', function() {
            var job = jobUtil.create(testType, testId);
            expect(job.type).toEqual(testType);
            expect(job.patientIdentifier).toEqual(testId);
            expect(job.referenceInfo).toBeUndefined();
        });

        it('verify job with domain is correct', function() {
            var job = jobUtil.create(testType, testId, testDomain);
            expect(job.type).toEqual(testType);
            expect(job.patientIdentifier).toEqual(testId);
            expect(job.dataDomain).toEqual(testDomain);
            expect(job.referenceInfo).toBeUndefined();
        });

        it('verify job with record is correct', function() {
            var job = jobUtil.create(testType, testId, testDomain, testRecord);
            expect(job.type).toEqual(testType);
            expect(job.patientIdentifier).toEqual(testId);
            expect(job.dataDomain).toEqual(testDomain);
            expect(job.record).toEqual(testRecord);
            expect(job.referenceInfo).toBeUndefined();
        });

        it('verify job with event-uid is correct', function() {
            var meta = {
                priority: 5
            };
            var job = jobUtil.create(testType, testId, null, null, null, testEventUid, meta);
            expect(job.type).toEqual(testType);
            expect(job.patientIdentifier).toEqual(testId);
            expect(job['event-uid']).toEqual(testEventUid);
            expect(job.priority).toEqual(5);
            expect(job.referenceInfo).toBeUndefined();
        });
    });

    describe('missingOrBlank()', function() {
        it('verify catches undefined arguments', function() {
            expect(jobUtil._missingOrBlank()).toBe(true);
            expect(jobUtil._missingOrBlank(null, null)).toBe(true);
        });

        it('verify empty and missing field values', function() {
            var obj1 = {
                blank: undefined,
                ok: 'ok'
            };

            var obj2 = {
                blank: null,
                ok: 'ok'
            };

            var obj3 = {
                blank: '',
                ok: 'ok'
            };

            var obj4 = {
                ok: 'ok'
            };

            expect(jobUtil._missingOrBlank(obj1, 'blank')).toBe(true);
            expect(jobUtil._missingOrBlank(obj2, 'blank')).toBe(true);
            expect(jobUtil._missingOrBlank(obj3, 'blank')).toBe(true);
            expect(jobUtil._missingOrBlank(obj4, 'blank')).toBe(true);
        });

        it('verify valid field values', function() {
            var obj1 = {
                notblank: 0,
                ok: 'ok'
            };

            var obj2 = {
                notblank: 'test',
                ok: 'ok'
            };

            var obj3 = {
                notblank: false,
                ok: 'ok'
            };

            expect(jobUtil._missingOrBlank(obj1, 'notblank')).toBe(false);
            expect(jobUtil._missingOrBlank(obj2, 'notblank')).toBe(false);
            expect(jobUtil._missingOrBlank(obj3, 'notblank')).toBe(false);
        });
    });

    describe('allFieldsValid()', function() {
        it('verify missing and invalid fields caught', function() {
            var required = ['ok', 'notblank'];

            var obj1 = {
                ok: 'ok'
            };

            var obj2 = {
                ok: 'ok',
                notblank: null
            };

            var obj3 = {
                ok: 'ok',
                notblank: ''
            };

            expect(jobUtil._allFieldsValid(obj1, required)).toBe(false);
            expect(jobUtil._allFieldsValid(obj2, required)).toBe(false);
            expect(jobUtil._allFieldsValid(obj3, required)).toBe(false);
        });

        it('verify valid fields passed', function() {
            var required = ['ok', 'notblank'];

            var obj4 = {
                ok: 'ok',
                notblank: 0
            };

            var obj5 = {
                ok: 'ok',
                notblank: false
            };

            var obj6 = {
                ok: 'ok',
                notblank: 'test'
            };

            var obj7 = {
                ok: 'ok',
                notblank: 'test',
                extra: 'extra'
            };

            expect(jobUtil._allFieldsValid(obj4, required)).toBe(true);
            expect(jobUtil._allFieldsValid(obj5, required)).toBe(true);
            expect(jobUtil._allFieldsValid(obj6, required)).toBe(true);
            expect(jobUtil._allFieldsValid(obj7, required)).toBe(true);
        });
    });

    describe('isValid()', function() {
        it('verify undefined or null parameters fails', function() {
            expect(jobUtil.isValid()).toBe(false);
            expect(jobUtil.isValid(null)).toBe(false);
            expect(jobUtil.isValid(null, null)).toBe(false);
            expect(jobUtil.isValid('', {})).toBe(false);
            expect(jobUtil.isValid('test', '')).toBe(false);
        });

        it('verify missing type of patientIdentifier fails', function() {
            var type = jobUtil.enterpriseSyncRequestType();

            expect(jobUtil.isValid(type, {
                type: 'test-type'
            })).toBe(false);

            expect(jobUtil.isValid(type, {
                patientIdentifier: {
                    type: 'icn',
                    value: '10110V004877'
                }
            })).toBe(false);

            expect(jobUtil.isValid(type, {
                patientIdentifier: {
                    type: 'icn'
                }
            })).toBe(false);

            expect(jobUtil.isValid(type, {
                patientIdentifier: {
                    value: '10110V004877'
                }
            })).toBe(false);
        });

        it('verify missing field tests', function() {
            var type = jobUtil.eventPrioritizationRequestType();
            var type2 = jobUtil.eventPrioritizationRequestType();
            var wrongType = jobUtil.hdrDomainXformVprType();

            expect(jobUtil.isValid(type, {
                type: type,
                patientIdentifier: {
                    type: 'icn',
                    value: '10110V004877'
                }
            })).toBe(false);

            expect(jobUtil.isValid(type2, {
                type: type2,
                patientIdentifier: {
                    type: 'icn',
                    value: '10110V004877'
                },
                jpid: '1234'
            })).toBe(false);

            expect(jobUtil.isValid(wrongType, {
                type: type2,
                patientIdentifier: {
                    type: 'icn',
                    value: '10110V004877'
                },
                record: 'long record goes here',
                jpid: '1234'
            })).toBe(false);

            expect(jobUtil.isValid(type2, {
                type: type2,
                patientIdentifier: {
                    type: 'icn',
                    value: '10110V004877'
                },
                record: 'long record goes here',
                jpid: '1234'
            })).toBe(true);
        });

        it('verify vistaPatientSubscribeRequest', function() {
            var site = 'SITE';
            var patientIdentifier = {
                type: 'pid',
                value: 'SITE;8'
            };
            var rootJob = {
                jpid: uuid.v4(),
                priority: 38
            };
            var type = jobUtil.vistaSubscribeRequestType(site);
            var job_gen = jobUtil.createVistaSubscribeRequest(site, patientIdentifier, rootJob);
            expect(job_gen.priority).toBe(38);
            expect(jobUtil.isValid(type, job_gen, 'SITE')).toBe(false);
            expect(jobUtil.isValid(type, job_gen, site)).toBe(true);
            expect(job_gen.referenceInfo).toBeUndefined();
        });

        it('verify vistaPatientSubscribeRequest with referenceInfo', function() {
            var site = 'SITE';
            var patientIdentifier = {
                type: 'pid',
                value: 'SITE;8'
            };
            var rootJob = {
                jpid: uuid.v4(),
                priority: 38,
                referenceInfo: {
                    requestId: 'vista-patient-subscribe-request-requestId',
                    sessionId: 'vista-patient-subscribe-request-sessionId'
                }
            };
            var type = jobUtil.vistaSubscribeRequestType(site);
            var job_gen = jobUtil.createVistaSubscribeRequest(site, patientIdentifier, rootJob);
            expect(job_gen.priority).toBe(38);
            expect(jobUtil.isValid(type, job_gen, 'SITE')).toBe(false);
            expect(jobUtil.isValid(type, job_gen, site)).toBe(true);
            expect(job_gen.referenceInfo).toBeDefined();
            expect(job_gen.referenceInfo.requestId).toEqual('vista-patient-subscribe-request-requestId');
            expect(job_gen.referenceInfo.sessionId).toEqual('vista-patient-subscribe-request-sessionId');
        });
    });

    describe('createEnterpriseSyncRequest()', function() {
        it('create job with demographic record', function() {
            var job = jobUtil.createEnterpriseSyncRequest({
                value: 'SITE;3',
                type: 'pid'
            }, '34812353-3292-3491-5728-184920572381', [], {
                'givenName': 'test'
            });
            expect(job.demographics).toBeDefined();
            expect(job.referenceInfo).toBeUndefined();
        });

        it('create job with referenceInfo', function() {
            var referenceInfo = {
                requestId: 'test-requestId',
                sessionId: 'test-sessionId'
            };
            var job = jobUtil.createEnterpriseSyncRequest({type: 'pid', value:'AAAA;1'}, 'aaaa-bbbb-cccc', false, null, null, referenceInfo);

            expect(job.demographics).not.toBeDefined();
            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo).toEqual(jasmine.objectContaining(referenceInfo));
        });
    });

    describe('isVistAHdrSubscribeRequestType()', function() {
        it('Check to see if a job is a valid HDR Subscribe Type', function() {
            var job = jobUtil.createVistaHdrSubscribeRequest('84F0', {
                value: '84F0;3',
                type: 'pid'
            }, '34812353-3292-3491-5728-184920572381');
            expect(jobUtil.isVistAHdrSubscribeRequestType(job.type)).toBe(true);
            job = jobUtil.createEnterpriseSyncRequest({
                value: 'SITE;3',
                type: 'pid'
            }, '34812353-3292-3491-5728-184920572381', [], {
                'givenName': 'test'
            });
            expect(jobUtil.isVistAHdrSubscribeRequestType(job.type)).toBe(false);
            job = {};
            expect(jobUtil.isVistAHdrSubscribeRequestType(job.type)).toBe(false);
            job = {
                type: 346
            };
            expect(jobUtil.isVistAHdrSubscribeRequestType(job.type)).toBe(false);
            job = {
                type: '0vistahdr-'
            };
            expect(jobUtil.isVistAHdrSubscribeRequestType(job.type)).toBe(false);
        });
    });

    describe('createSyncNotification()', function() {
        it('create job', function() {
            var pid = {
                value: 'SITE;3',
                type: 'pid'
            };
            var meta = {priority: 1, referenceInfo: { 'initialSyncId': 'SITE;3' }};

            var job = jobUtil.createSyncNotification(pid, 'discharge', {kind: 'discharge'}, meta);

            expect(job.type).toBe('sync-notification');
            expect(job.patientIdentifier.value).toBe('SITE;3');
            expect(job.priority).toBe(1);
            expect(job.dataDomain).toBe('discharge');
            expect(job.referenceInfo).toEqual(jasmine.objectContaining(meta.referenceInfo));
        });
    });

});
