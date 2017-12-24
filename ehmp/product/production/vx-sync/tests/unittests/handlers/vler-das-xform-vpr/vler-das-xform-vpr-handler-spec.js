'use strict';

require('../../../../env-setup');
const _ = require('lodash');
const handle = require(global.VX_HANDLERS + 'vler-das-xform-vpr/vler-das-xform-vpr-handler');
const PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');

let log = require(global.VX_DUMMIES + 'dummy-logger');
// Be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//  name: 'vler-das-doc-retrieve-handler-spec',
//  level: 'debug'
// });

let xmlStringC32 = '<ClinicalDocument xmlns="urn:hl7-org:v3"><realmCode code="US" /><typeId extension="POCD_HD000040" root="2.16.840.1.113883.1.3" /><templateId root="1.2.840.114350.1.72.1.51693" /><templateId root="2.16.840.1.113883.10" extension="IMPL_CDAR2_LEVEL1" /><templateId root="2.16.840.1.113883.10.20.3" /><templateId root="2.16.840.1.113883.10.20.1" /><templateId root="2.16.840.1.113883.3.88.11.32.1" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.5" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.2" /><templateId root="1.3.6.1.4.1.19376.1.5.3.1.1.1" /></ClinicalDocument>';
let xmlStringCCDA = '<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="cda.xsl"?> <ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sdtc="urn:hl7-org:sdtc" xsi:schemaLocation="urn:hl7-org:v3../../../CDA%20R2/cda-schemas-and-samples/infrastructure/cda/CDA.xsd" classCode="DOCCLIN" moodCode="EVN"> <realmCode code="US"/> <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/> <templateId root="2.16.840.1.113883.10.20.22.1.1"/> <templateId root="2.16.840.1.113883.10.20.22.1.2"/> </ClinicalDocument>';

let htmlStringCCDA = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n<html xmlns:n1="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n<head>\n<META http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">\n<meta charset="utf-8">\n<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<title>Veterans Affairs</title>\n<meta name="description" content="">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,300,400,600,700">\n<link rel="stylesheet" href="app/applets/ccd_grid/assets/vler_resource/ccdaStyles/cda_plain.css">\n</head>\n<body>\n<div id="top" class="episode-note-container">\n<div id="titlebar-container" class="titlebar-container">\n<header id="titlebar" class="titlebar">\n<div class="columns">\n<div class="col-2">\n<h1></h1>\n<p>\n<br>\n                                        created on\n                                        <strong>,  </strong>\n</p>\n</div>\n<div class="col-2" style="text-align: right;word-wrap: break-word;">\n<br>\n<b>Prepared</b>\n                                    for\n                                    <strong style="font-size:15px; word-wrap: break-word;"></strong>\n<p>\n                                        DOB:\n                                        <span class="cell">,  </span>\n<br>\n                                        Birth Sex:\n                                        <span class="cell"></span>\n</p>\n</div>\n<nav class="toc infobar">\n<p>\n<strong>Table of Contents</strong>\n</p>\n</nav>\n</div>\n<button id="backtotop" class="backtotop">&uarr; Back To Top</button>\n</header>\n</div>\n<div class="sections">\n<section id="patient-information">\n<div class="columns">\n<div class="col-1">\n<table>\n<thead>\n<tr>\n<th colspan="2">Patient Information</th>\n</tr>\n</thead>\n<tbody>\n<tr valign="top">\n<th>Address</th><td></td>\n</tr>\n<tr valign="top">\n<th>Marital status</th><td>Information not available</td>\n</tr>\n<tr valign="top">\n<th>Race</th><td></td>\n</tr>\n<tr valign="top">\n<th>Ethnicity</th><td></td>\n</tr>\n<tr valign="top">\n<th>Language(s)</th><td></td>\n</tr>\n<tr valign="top">\n<th>Preferred Language</th><td></td>\n</tr>\n</tbody>\n</table>\n</div>\n</div>\n</section>\n<section id="healthcare-providers">\n<header>\n<h2>Healthcare Providers</h2>\n</header>No data provided for this section.</section>\n<section id="contact-info">\n<header>\n<h2>Contact Information</h2>\n</header>\n<div class="col-2"></div>\n</section>\n</div>\n</div>\n</body>\n</html>\n';
let htmlStringC32 = '<head><META http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">\n<link href="app/applets/ccd_grid/assets/vler_resource/c32Styles/c32.css" type="text/css" rel="stylesheet" xmlns:voc="urn:hl7-org:v3/voc" xmlns:n3="http://www.w3.org/1999/xhtml" xmlns:n2="urn:hl7-org:v3/meta/voc" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:n1="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:section="urn:gov.va.med">\n<script type="text/javascript" src="app/applets/ccd_grid/assets/vler_resource/c32Styles/c32.js"></script>\n<h2 align="center"></h2>\n</head><div style="text-align:center;">\n<span style="font-size:larger;font-weight:bold"></span>\n</div><b>Created On: </b><span title="Not Available">--</span><table width="100%" class="first">\n<tr>\n<td width="15%" valign="top"><b>Patient: </b></td><td width="35%" valign="top">\n<br>\n<b>tel: PATIENT PHONE MISSING</b></td><td width="15%" align="right" valign="top"><b>Patient ID: </b></td><td width="35%" valign="top"></td>\n</tr>\n<tr>\n<td width="15%" valign="top"><b>Birthdate: </b></td><td width="35%" valign="top"></td><td width="15%" align="right" valign="top"><b>Sex: </b></td><td width="35%" valign="top"></td>\n</tr>\n</table><div style="margin-bottom:35px">\n<h3>\n<a name="toc">Table of Contents</a>\n</h3>\n<ul></ul>\n</div><br>&nbsp;<span style="font-weight:bold; border:2px solid;"> EMERGENCY CONTACT INFO MISSING! </span><p>\n<b>Electronically generated on:&nbsp; </b><span title="Not Available">--</span>\n</p><div id="TipBox" style="display:none;position:absolute;font-size:12px;font-weight:bold;font-family:verdana;border:#72B0E6 solid 1px;padding:15px;color:black;background-color:#FFFFFF;">&nbsp;</div>\n';

//------------------------------------------------------------------------------------------------------
// This function returns a job instance to be used by one test.
//
// returns: A vler-das-xform-vpr job.
//------------------------------------------------------------------------------------------------------
function getJob() {
    return {
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
                created: '20140517022219+0100',
                resourceType: 'DocumentReference',
                contained: [{
                    id: 'Organization',
                    resourceType: 'Organization',
                    name: 'Department of Veterans Affairs'
                }],
                author: [{
                    reference: '#Organization'
                }]
            },
            pid: 'VLER;10108V420871',
            uid: 'urn:va:vlerdocument:VLER:10108V420871:ec15a2b7-57ae-4094-8376-549c10ebc0f5',
            kind: 'C32',
            xmlDoc: xmlStringC32
        },
        referenceInfo: {
            'requestId': 'unit test',
            'sessionId': 'unit test'
        },
        requestStampTime: '20150422150912',
        jobId: '74902dcd-d6cd-4275-a9bc-01ff7816ae28'
    };
}

//------------------------------------------------------------------------------------------------------
// This function returns an environment instance to be used by one test.
//
// returns: An environment instance.
//------------------------------------------------------------------------------------------------------
function getEnvironment() {
    return {
        publisherRouter: new PublisherRouterDummy(),
    };
}

describe('vler-das-xform-vpr-handler', function() {
    describe('convertXmltoHtml()', function() {
        it('Error path: xml parse error received from determineKind', function(done) {
            let xmlString = 'test';
            handle._steps.convertXmltoHtml(log, xmlString, 'xmlParseError', function(result) {
                expect(result).toContain('Placeholder for a VLER DAS Patient Document');
                done();
            });
        });

        it('Normal path: invalid kind', function(done) {
            let xmlString = 'test';
            handle._steps.convertXmltoHtml(log, xmlString, null, function(result) {
                expect(result).toContain('Placeholder for a VLER DAS Patient Document');
                expect(result).toContain('unsupported format');
                done();
            });
        });

        it('Error path: xslt returns error', function(done) {
            handle._steps.convertXmltoHtml(log, {}, 'CCDA', function(result) {
                expect(result).toContain('Placeholder for a VLER DAS Patient Document');
                done();
            });
        });

        it('Normal path: CCDA', function(done) {
            handle._steps.convertXmltoHtml(log, xmlStringCCDA, 'CCDA', function(result) {
                expect(result).toEqual(htmlStringCCDA);
                done();
            });
        });

        it('Normal path: C32', function(done) {
            handle._steps.convertXmltoHtml(log, xmlStringC32, 'C32', function(result) {
                expect(result).toEqual(htmlStringC32);
                done();
            });
        });
    });

    describe('compressionRequired()', function() {
        it('Skip compression (size < minSize)', function() {
            let config = {
                vler: {
                    compression: {
                        minSize: 100000
                    }
                }
            };

            expect(handle._steps.compressionRequired(config, 'test')).toBe(false);
        });

        it('Skip compression (config is NaN, null, or undefined)', function() {
            let config = {
                vler: {
                    compression: {}
                }
            };

            expect(handle._steps.compressionRequired(config, 'test')).toBe(false);

            config.vler.compression.minSize = null;
            expect(handle._steps.compressionRequired(config, 'test')).toBe(false);

            config.vler.compression.minSize = 'a';
            expect(handle._steps.compressionRequired(config, 'test')).toBe(false);
        });

        it('Compress (size >= minSize)', function() {
            let config = {
                vler: {
                    compression: {
                        minSize: 2
                    }
                }
            };

            expect(handle._steps.compressionRequired(config, 'test')).toBe(true);
        });
    });

    describe('compressHtml()', function() {
        // There does not seem to be a way to force lzma compression to fail
        // so we can't test an error condition here.
        it('Normal path: skip compression (size < minSize)', function(done) {
            let config = {
                vler: {
                    compression: {
                        minSize: 100000
                    }
                }
            };

            handle._steps.compressHtml(log, config, 'test', function(resultString, compressed) {
                expect(resultString).toEqual('test');
                expect(compressed).toEqual(false);
                done();
            });
        });

        it('Normal path: compression + base64 encoding required (size >= minSize)', function(done) {
            let config = {
                vler: {
                    compression: {
                        minSize: 0
                    }
                }
            };

            handle._steps.compressHtml(log, config, 'test', function(resultString, compressed) {
                expect(resultString).toEqual('XQAAAQAEAAAAAAAAAAA6GUrOJnKDn//7E4AA');
                expect(compressed).toEqual(true);
                done();
            });
        });
    });

    describe('getAuthorListFromFHIRContainedResources()', function() {
        it('Normal path - No data', function(done) {
            let document = {
                resource: {},
                xmlDoc: ''
            };

            let result = handle._steps.getAuthorListFromFHIRContainedResources(document);
            expect(_.isEmpty(result)).toBe(true);
            done();
        });

        it('Normal path - Missing reference', function(done) {
            let document = {
                resource: {
                    contained: [{
                        id: 'Organization',
                        resourceType: 'Organization',
                        name: 'Department of Veterans Affairs'
                    }],
                    author: [{
                        reference: '#MissingReference'
                    }]
                },
                xmlDoc: ''
            };

            let result = handle._steps.getAuthorListFromFHIRContainedResources(document);
            expect(result).toEqual(jasmine.objectContaining([{
                institution: 'Unknown - could not find contained resource'
            }]));
            done();
        });

        it('Normal path - 1 author', function(done) {
            let document = {
                resource: {
                    contained: [{
                        id: 'Organization',
                        resourceType: 'Organization',
                        name: 'Department of Veterans Affairs'
                    }],
                    author: [{
                        reference: '#Organization'
                    }]
                },
                xmlDoc: ''
            };

            let result = handle._steps.getAuthorListFromFHIRContainedResources(document);
            expect(result).toEqual(jasmine.objectContaining([{
                institution: 'Department of Veterans Affairs'
            }]));
            done();
        });

        it('Normal path - Multiple authors', function(done) {
            let document = {
                resource: {
                    contained: [{
                        id: 'Organization1',
                        resourceType: 'Organization',
                        name: 'Department of Veterans Affairs 1'
                    }, {
                        id: 'Organization2',
                        resourceType: 'Organization',
                        name: 'Department of Veterans Affairs 2'
                    }],
                    author: [{
                        reference: '#Organization1'
                    }, {
                        reference: '#Organization2'
                    }]
                },
                xmlDoc: ''
            };

            let result = handle._steps.getAuthorListFromFHIRContainedResources(document);
            expect(result || []).toContain(jasmine.objectContaining({
                institution: 'Department of Veterans Affairs 1'
            }));
            expect(result || []).toContain(jasmine.objectContaining({
                institution: 'Department of Veterans Affairs 2'
            }));
            done();
        });
    });

    describe('vlerDasDocumentToVPR()', function() {
        let htmlTestString = 'html test string';
        let kind = 'C32';
        let document = {
            'resource': {
                'author': [{
                    'reference': '#Organization'
                }],
                'contained': [{
                    'id': 'Organization',
                    'name': 'Cerner CCDA Example',
                    'resourceType': 'Organization'
                }],
                'created': '20140517022219-0000',
                'description': 'Continuity of Care Document',
                'id': 'DocumentReference/29deea5f-efa3-4d1c-c2de-f672de134c11',
                'identifier': [{
                    'Value': '29deea5f-efa3-4d1c-c2de-f672de134c11',
                    'system': '1.2.840.114350.1.13.58.3.7.2.677780'
                }],
                'masterIdentifier': {
                    'Value': '29deea5f-efa3-4d1c-c2de-f672de134c11',
                    'system': '1.2.840.114350.1.13.58.3.7.2.677780'
                },
                'resourceType': 'DocumentReference'
            },
            'content': [{
                'attachment': {
                    'Data': 'data data data'
                }
            }],
            pid: 'VLER;12345678',
            uid: 'urn:va:vlerdocument:VLER:12345678:aaaaa-bbbbbb-ccccc'
        };

        it('transforms VLER document into VPR format (not compressed)', function(done) {
            let compressed = false;
            let job = getJob();
            let vprDocument = handle._steps.vlerDasDocumentToVPR(document, htmlTestString, kind, job.requestStampTime, compressed);

            expect(vprDocument).toEqual(jasmine.objectContaining({
                kind: kind,
                creationTime: '20140517022219',
                name: 'Continuity of Care Document',
                summary: 'Continuity of Care Document',
                pid: 'VLER;12345678',
                uid: 'urn:va:vlerdocument:VLER:12345678:aaaaa-bbbbbb-ccccc',
                authorList: [jasmine.objectContaining({
                    institution: 'Cerner CCDA Example'
                })],
                documentUniqueId: '29deea5f-efa3-4d1c-c2de-f672de134c11',
                homeCommunityId: '1.2.840.114350.1.13.58.3.7.2.677780',
                stampTime: '20150422150912',
                fullHtml: htmlTestString
            }));
            expect(vprDocument.compressed).toBeUndefined();
            done();
        });

        it('transforms VLER document into VPR format (compressed)', function(done) {
            let compressed = true;
            let job = getJob();
            let vprDocument = handle._steps.vlerDasDocumentToVPR(document, htmlTestString, kind, job.requestStampTime, compressed);
            expect(vprDocument.compressed).toBe(true);
            done();
        });
    });

    describe('createAndPublishJob()', function() {
        let document = {
            name: 'Continuity of Care Document',
            summary: 'Continuity of Care Document',
            pid: 'VLER;12345678',
            uid: 'urn:va:vlerdocument:VLER:12345678:aaaaa-bbbbbb-ccccc',
            fullHtml: 'test'
        };

        it('Error path: publisherRouter returns error', function(done) {
            let environment = getEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallFake(function(jobsToPublish, callback) {
                callback('publish error');
            });
            let job = getJob();

            handle._steps.createAndPublishJob(log, environment, job, document, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });
        });

        it('Normal path: job published to event-proritization', function(done) {
            let environment = getEnvironment();
            let job = getJob();

            handle._steps.createAndPublishJob(log, environment, job, document, function(error, result) {
                expect(error).toBeFalsy();
                expect(result || {}).toEqual(jasmine.objectContaining({
                    type: 'event-prioritization-request',
                    record: document,
                    referenceInfo: job.referenceInfo
                }));
                done();
            });
        });
    });

    describe('handle()', function() {
        let config = {
            vler: {
                compression: {
                    minSize: 1024 * 1024
                }
            }
        };

        it('Error path: null job', function(done) {
            let environment = getEnvironment();

            handle(log, config, environment, null, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });
        });

        it('Error path: wrong job type', function(done) {
            let environment = getEnvironment();
            let job = {
                type: 'wrong-job-type'
            };

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });
        });

        it('Error path: invalid job', function(done) {
            let environment = getEnvironment();
            let job = {
                type: 'vler-das-xform-vpr'
            };

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });
        });

        it('Error path: createAndPublishJob returns error', function(done) {
            let environment = getEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallFake(function(jobsToPublish, callback) {
                callback('publish error');
            });
            let job = getJob();

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });
        });

        it('Normal path: Document kind is xmlParseError', function(done) {
            let environment = getEnvironment();
            let job = getJob();
            job.record.kind = 'xmlParseError';

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result || {}).toEqual(jasmine.objectContaining({
                    type: 'event-prioritization-request'
                }));
                expect(_.get(result, 'record.fullHtml') || '').toContain('Placeholder');
                done();
            });
        });

        it('Normal path: document xml is blank', function(done) {
            let environment = getEnvironment();
            let job = getJob();
            job.record.xmlDoc = '';

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result || {}).toEqual(jasmine.objectContaining({
                    type: 'event-prioritization-request'
                }));
                expect(_.get(result, 'record.fullHtml') || '').toContain('Placeholder');
                done();
            });
        });

        it('Normal path: vlerdocument transformed successfully', function(done) {
            let environment = getEnvironment();
            let job = getJob();

            handle(log, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result || {}).toEqual(jasmine.objectContaining({
                    'type': 'event-prioritization-request',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': {
                        'type': 'pid',
                        'value': 'VLER;10108V420871'
                    },
                    'jpid': '4f82b9c0-52d0-11e4-9c3c-0002a5d5c51b',
                    'rootJobId': '1',
                    'priority': 1,
                    'referenceInfo': {
                        'requestId': 'unit test',
                        'sessionId': 'unit test'
                    },
                    'dataDomain': 'vlerdocument',
                    'record': {
                        'kind': 'C32',
                        'creationTime': '20140517022219',
                        'authorList': [jasmine.objectContaining({
                            institution: 'Department of Veterans Affairs'
                        })],
                        'uid': 'urn:va:vlerdocument:VLER:10108V420871:ec15a2b7-57ae-4094-8376-549c10ebc0f5',
                        'pid': 'VLER;10108V420871',
                        'stampTime': '20150422150912',
                        'fullHtml': htmlStringC32
                    },
                    'jobId': jasmine.any(String)
                }));
                done();
            });
        });
    });
});