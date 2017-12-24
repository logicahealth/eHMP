'use strict';

require('../../../../env-setup');
const handle = require(global.VX_HANDLERS + 'vler-das-xform-vpr/vler-das-xform-vpr-handler');

let log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//  name: 'vler-das-doc-retrieve-handler-itest-spec',
//  level: 'debug'
// });

const jobUtil = require(global.VX_UTILS + 'job-utils');
const testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
const testConfig = require(global.VX_INTTESTS + 'test-config');

const host = testConfig.vxsyncIP;
const port = PORT;
const tubename = 'vler-das-xform-vpr-itest';
const matchingJobTypes = [jobUtil.eventPrioritizationRequestType()];

let xmlStringC32 = '<ClinicalDocument xmlns="urn:hl7-org:v3"><realmCode code="US" /><typeId extension="POCD_HD000040" root="2.16.840.1.113883.1.3" /><templateId root="1.2.840.114350.1.72.1.51693" /><templateId root="2.16.840.1.113883.10" extension="IMPL_CDAR2_LEVEL1" /><templateId root="2.16.840.1.113883.10.20.3" /><templateId root="2.16.840.1.113883.10.20.1" /><templateId root="2.16.840.1.113883.3.88.11.32.1" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.5" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.2" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.1" /></ClinicalDocument>';

let job = {
        type: 'vler-das-xform-vpr',
        timestamp: '1499890226634',
        patientIdentifier: {
            type: 'pid',
            value: 'VLER;10108V420871'
        },
        jpid: '4f82b9c0-52d0-11e4-9c3c-0002a5d5c51b',
        rootJobId: '1',
        priority: 1,
        record: {
            resource: {
                resourceType: 'DocumentReference'
            },
            xmlDoc: xmlStringC32,
            kind: 'C32',
            pid: 'VLER;10108V420871',
            uid: 'urn:va:vlerdocument:VLER:10108V420871:ec15a2b7-57ae-4094-8376-549c10ebc0f5'
        },
        referenceInfo: {
            'requestId': 'unit test',
            'sessionId': 'unit test'
        },
        requestStampTime: '20150422150912',
        jobId: '74902dcd-d6cd-4275-a9bc-01ff7816ae28'
    };

let environment = {};
let config = {};

describe('vler-das-xform-vpr-itest-spec', function(){
    testHandler(handle, log, config, environment, host, port, tubename, job, matchingJobTypes, 20000, function(result) {
        expect(result).toBeTruthy();
    });
});