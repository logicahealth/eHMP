'use strict';

//-----------------------------------------------------------------
// This will test the solr-vlerdocument-xform.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var xformer = require(global.VX_UTILS + 'solr-xform/solr-vlerdocument-xform');
var xformHtmlToTxt = xformer._steps.xformHtmlToTxt;
var getTextFromHtml =  xformer._steps.getTextFromHtml;
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-vlerdocument-xformer-spec',
//     level: 'debug'
// });

var vlerDocTestHtml = '<head><meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"></head><body><h2 align="center">SILVER SPRING</h2><div style="text-align:center;"><span style="font-size:larger;font-weight:bold">Summarization of Episode Note</span></div><b>Created On: </b>August 8, 2014<table width="100%" class="first"><tbody><tr><td width="15%" valign="top"><b>Patient: </b></td><td width="35%" valign="top"> Chdrone Chdrzzztestpatient <br>1234 HOWARD ST<br>LA JOLLA,CA,92038<br>tel:+1-760-111-1111<b> Home</b><br>tel:+1-000-000-0000<b> Work</b></td><td width="15%" align="right" valign="top"><b>Patient ID: </b></td><td width="35%" valign="top">65189967</td></tr><tr><td width="15%" valign="top"><b>Birthdate: </b></td><td width="35%" valign="top">March 3, 1960</td><td width="15%" align="right" valign="top"><b>Sex: </b></td><td width="35%" valign="top">M</td></tr><tr><td width="15%" valign="top"><b>Language(s):</b></td><td width="35%" valign="top"><li>English</li></td><td width="15%" valign="top"></td><td width="35%" valign="top"></td></tr></tbody></table><table width="100%" class="second"><tbody><tr><td width="15%"><b>Source:</b></td><td width="85%">SILVER SPRING</td></tr></tbody></table><div style="margin-bottom:35px"><h3><a name="toc">Table of Contents</a></h3><ul><li><a style="font-family:georgia;font-size:12pt" href="#N65836">Active Allergies and Adverse Reactions</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N67381">Active Problems</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N67699">Encounters from 05/08/2014 to 08/08/2014</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68106">Immunizations</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68629">Last Filed Vitals</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N66179">Medications</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68401">Procedures from 05/08/2014 to 08/08/2014</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68524">Results from 05/08/2014 to 08/08/2014</a></li></ul></div><h3><span style="font-weight:bold;line-height:40%"><a name="N65836" href="#toc">Active Allergies and Adverse Reactions</a></span></h3><table border="1" style="font-size:14px"><thead><tr><th class="first">Allergens - Count (2)</th><th class="first">Verification Date</th><th class="first">Event Type</th><th class="first">Reaction</th><th class="first">Severity</th><th class="first">Source</th></tr></thead><tbody><tr class="second"><td><div style="overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;"><span onmouseover="DisplayTip(this,25,-50,0)">CALCIUM</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">Jul 7, 2014</div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span onmouseover="DisplayTip(this,25,-50,0)">propensity to adverse reactions to drug</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span title="Not Available">--</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">--</div></td><td><div style="overflow:hidden; white-space:nowrap; width:150px;"><span onmouseover="DisplayTip(this,25,-50,0)">SILVER SPRING</span></div></td></tr><tr class="second"><td><div style="overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;"><span onmouseover="DisplayTip(this,25,-50,0)">FISH - DERIVATIVE</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">Jul 7, 2014</div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span onmouseover="DisplayTip(this,25,-50,0)">propensity to adverse reactions to drug</span></div></td><td><span>^multipart^^Base64^4p88C4AO8BAK1H1sj5aeNRMrkm1AePKgDaPxbUr5H</span><div style="overflow:hidden; white-space:nowrap; width:180px;"><span title="Not Available">--</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">--</div></td><td><div style="overflow:hidden; white-space:nowrap; width:150px;"><span onmouseover="DisplayTip(this,25,-50,0)">SILVER SPRING</span></div></td></tr></tbody></table><br><br><br>&nbsp;<div id="TipBox" style="display:none;position:absolute;font-size:12px;font-weight:bold;font-family:verdana;border:#72B0E6 solid 1px;padding:15px;color:black;background-color:#FFFFFF;">&nbsp;</div></body>';
var vlerDocTestHtmlCompressed = 'XQAAAQDXEAAAAAAAAAAeGgimJFD4kTPJ1iXZB80UrqKhmEzCVqhM0QYtZFFw8L3bMV5OErdLTCF4YESAXsoGxWhAl+664O7bR0VbD0fAQ6u2+SFNKuUcevPD0iirLjz4fYIq1MHsTRJiapusEgyN9VSJDbaFldKh7Fyw4dx1ouMzReOsCV5zUwCbuVOkXnwSAjLhUZmZ9deuJNVb26JtaTxUUxO1XmQC1s1LuXDGdEWUQubvkvSHih67phTkNlp4sDFhcowsHvhR2zXIidQEKoJdN0TULc1S4YjCP5LNTsyFqV7RLkRmvuzdAOHvy6wbCKda0sw/wNGtIBYlp8hajDXpSsAuxwBUcT9SqI1ZxWMEDMBBGZH5ynPxsB3Wsl3WIXOxa7Pe+V1EFKzxP9gsifLoxYcapPcrxwwga4SPTIOklPf/P9qVnWOLJevO8B0W+34LeL2MtwFuxwxvD3dxvimYeRY4vC0Gsjtxyf3phvZnloIULPedoEz0S2soPryX/zmf7zmd2KyQVsV+N6pu6sPVOzAroKKhmcrMof8FoqsO9e1ZsxvKvhFuAMGTcXWt2nR4KjRHQAplqIq+8o4i2QmhpVxXTxHP4vvBXhkoIrS45JLd5pPT3SWfqSi3GXAvj+YzV+BCmOwz0DG3cmBcLBmkOvS+LiOUzNxgjFxzN1D0yMHtiLZ2MqPh8gyvOFKey5qpORJgBR0pxyFyNTxy/ggMD2TWgbnW4+AHBEdnxOcs2TlVXpM1iMJ1A5DG3LIEUY8l5Ofw+BaJ3WWZhprWjbAD6COagR2XYx3iXkKim+lGdBMIb7+38DgZIcyIzkO2qu0uQRSna7qzPbyWwJ6vwMFCvNEuPNdTiFxxJ1PjMMdjon4xJOaDWaVgOTSx7r3f2iXc14IucaItK6Q7SlnyIxC4jvlNu8JMgdiCNsUjtfln8/4p88C4AO8BAK1H1sj5aeNRMrkm1AePKgDaPxbUr5H+NTPUR+covFdVpu+slrknUis4khoIc5i+8El0eB8LFjOxux0P8vK74jLVzMtW3VpsI8ShXDlc9G2pItWnzNq43pa3+qOCR/oPGFcFdD3gM3ZYt5H8ITjH8en2saUk7nTVM18WayaohBISj4n+JCBpyOEaxQCEsQon85XB0tA6949pimM5AbfiHvrLLNDzhn5UqwcuAjC1GsnjMxcCLV6N3dHz9KMZVPjg9xKEz4Bx38LGVTn3LzGuWJvk2BRxDbV6ak+ZPIHJX8AkiIUK+foy/lnF3lsnHuaPhvWj+140GUVL0jXOzWW0YVtqbsgjsz+BpX21IzK/YqGxRR6Sd5n1WeWYZy8RSNBPg7q/zwcFDa9crrEMzz9PX8mVmxfraOAJGwLepKhjdfH9h/1J6tUnMwg7NHq43zTmSigSd7tn2zt729hBPBCd49vp0EoX99R61USBcpZr6rYPvINND2ecMGIfbCAMKS91wvMIdfyrqnI/GAuB4qgA8t3FXm1Lod3395wiqZVSoinqhgyuAq8RuLYZakfUuj3YoxDSXD3nUJD8GAeOF6uPxKG9Vzj7LsvU66ZHvf9s3yB80xf+AwFg';

var xformConfig = {
    vlerdocument: {
        regexFilters: ['\\^multipart\\^\\^Base64\\^\\w*']
    }
};

var noConfig = null;

describe('solr-vlerdocument-xform.js', function() {
    describe('Transformer', function() {
        it('Happy Path', function() {
            var vprRecord = {
                'authorList': [{
                    'institution': 'Conemaugh Health System',
                    'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO'
                }],
                'creationTime': '20140617014116',
                'doucmentUniqueId': '29deea5f-efa3-4d1c-a43d-d64ea4f4de30',
                'homeCommunityId': 'urn:oid:1.3.6.1.4.1.26580.10',
                'kind': 'C32 Document',
                'mimeType': null,
                'name': 'Continuity of Care Document',
                'pid': 'VLER;10108V420871',
                'repositoryUniqueId': '1.2.840.114350.1.13.48.3.7.2.688879',
                'sections': [{
                    'code': {
                        'code': '48765-2',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.102'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.13'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.2'
                    }],
                    'text': 'First line of text.',
                    'title': 'Allergies and Adverse Reactions'
                }, {
                    'code': {
                        'code': '11450-4',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.103'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.6'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.11'
                    }],
                    'text': 'Second line of text.',
                    'title': 'Problems'
                }, {
                    'code': {
                        'code': '10160-0',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.112'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.19'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.8'
                    }],
                    'text': 'Third line of text.',
                    'title': 'Medications'
                }],
                'fullHtml': 'XQAAAQADAAAAAAAAAAAzG8pMNEjf//XEQAA=',
                'compressed': true,
                'sourcePatientId': '\'8394^^^& 1.3.6.1.4.1.26580.10.1.100&ISO\'',
                'stampTime': '20150415124228',
                'summary': 'Continuity of Care Document',
                'uid': 'urn:va:vlerdocument:VLER:10108V420871:29deea5f-efa3-4d1c-a43d-d64ea4f4de30'
            };
            xformer(vprRecord, log, noConfig, function(error, solrRecord) {
                expect(error).toBeFalsy();
                // Verify Common Fields
                //---------------------
                expect(solrRecord.uid).toBe(vprRecord.uid);
                expect(solrRecord.pid).toBe(vprRecord.pid);
                expect(solrRecord.kind).toBe(vprRecord.kind);
                expect(solrRecord.summary).toBe(vprRecord.summary);

                // Verify Vlerdocument Specific Fields
                //-------------------------------
                expect(solrRecord.domain).toBe('vlerdocument');
                expect(solrRecord.creation_time).toBe(vprRecord.creationTime);
                expect(solrRecord.datetime).toBe(vprRecord.creationTime);
                expect(solrRecord.datetime_all).toContain(vprRecord.creationTime);
                expect(solrRecord.name).toBe(vprRecord.name);
                expect(_.isArray(solrRecord.section)).toBe(true);
                if (_.isArray(solrRecord.section)) {
                    expect(solrRecord.section.length).toBe(3);
                    if (solrRecord.section.length === 3) {
                        expect(solrRecord.section).toContain(vprRecord.sections[0].title + ' ' + vprRecord.sections[0].text);
                        expect(solrRecord.section).toContain(vprRecord.sections[1].title + ' ' + vprRecord.sections[1].text);
                        expect(solrRecord.section).toContain(vprRecord.sections[2].title + ' ' + vprRecord.sections[2].text);
                    }
                }
                expect(solrRecord.document_unique_id).toBe(vprRecord.documentUniqueId);
                expect(solrRecord.home_community_id).toBe(vprRecord.homeCommunityId);
                expect(solrRecord.repository_unique_id).toBe(vprRecord.repositoryUniqueId);
                expect(solrRecord.source_patient_id).toBe(vprRecord.sourcePatientId);
                expect(solrRecord.body).toEqual('foo');
            });
        });

        it('Error Path: xformHtmlToTxt returns error', function(done) {
            var vprRecord = {
                'authorList': [{
                    'institution': 'Conemaugh Health System',
                    'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO'
                }],
                'creationTime': '20140617014116',
                'doucmentUniqueId': '29deea5f-efa3-4d1c-a43d-d64ea4f4de30',
                'homeCommunityId': 'urn:oid:1.3.6.1.4.1.26580.10',
                'kind': 'C32 Document',
                'mimeType': null,
                'name': 'Continuity of Care Document',
                'pid': 'VLER;10108V420871',
                'repositoryUniqueId': '1.2.840.114350.1.13.48.3.7.2.688879',
                'fullHtml': 'invalid data',
                'compressed': true,
                'sourcePatientId': '\'8394^^^& 1.3.6.1.4.1.26580.10.1.100&ISO\'',
                'stampTime': '20150415124228',
                'summary': 'Continuity of Care Document',
                'uid': 'urn:va:vlerdocument:VLER:10108V420871:29deea5f-efa3-4d1c-a43d-d64ea4f4de30'
            };

            xformer(vprRecord, log, noConfig, function(error, solrRecord) {
                expect(error).toBeTruthy();
                expect(solrRecord).toBeFalsy();
                done();
            });
        });
    });

    describe('xformHtmlToTxt', function() {
        it('Normal path: no html to convert', function(done) {
            var solrRecord = {};
            var vprRecord = {};

            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeFalsy();
                done();
            });
        });
        it('Normal path: decompress then transform to text', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: vlerDocTestHtmlCompressed,
                compressed: true
            };
            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeTruthy();
                expect(solrRecord.body).toContain('Summarization of Episode Note');
                done();
            });
        });
        it('Normal path: transform to text (no decompression needed)', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: vlerDocTestHtml
            };
            xformHtmlToTxt(solrRecord, vprRecord, log, xformConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeTruthy();
                expect(solrRecord.body).toContain('Summarization of Episode Note');
                expect(solrRecord.body).not.toContain('multipart');
                done();
            });
        });
        it('Error path: decompress error', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: 'invalid data',
                compressed: true
            };

            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeTruthy();
                expect(solrRecord.body).toBeFalsy();
                done();
            });
        });
    });

    describe('getTextFromHtml', function(){
        it('No xformConfig', function(){
            var result = getTextFromHtml(noConfig, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).toContain('multipart');
        });

        it('No vlerdocument config', function(){
            var result = getTextFromHtml({}, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).toContain('multipart');
        });

        it('run regexFilters from xformConfig', function(){
            var result = getTextFromHtml(xformConfig, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).not.toContain('multipart');
        });
    });
});