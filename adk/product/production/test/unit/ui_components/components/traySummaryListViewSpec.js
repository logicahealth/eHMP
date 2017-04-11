/**
 * Created by alexluong on 3/21/16.
 */

/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/ui_components/tray/views/summary/view', 'jasminejquery'],
    function($, Handlebars, Backbone, Marionette, TraySummaryListView) {

        describe('A Tray Summary List view', function() {
            var testPage, testTraySummaryListView;

            var TestView = Backbone.Marionette.LayoutView.extend({
                template: Handlebars.compile([
                    '<div class="test-region"></div>'
                ].join('\n')),
                ui: {
                    'TestRegion': '.test-region'
                },
                regions: {
                    'TestRegion': '@ui.TestRegion'
                },
                initialize: function(options) {
                    this.ViewToTest = options.view;
                    if (!_.isFunction(this.ViewToTest.initialize)) {
                        this.ViewToTest = new this.ViewToTest();
                    }
                },
                onRender: function() {
                    this.showChildView('TestRegion', this.ViewToTest);
                }
            });

            afterEach(function() {
                testPage.remove();
                testTraySummaryListView = null;
            });

            describe('basic', function() {
                var $testPage;
                var testNotes = [
                    {
                        "author": "KHAN,VIHAAN",
                        "authorDisplayName": "Khan,Vihaan",
                        "authorUid": "urn:va:user:9E7A:10000000272",
                        "clinicians": [
                            {
                                "displayName": "Khan,Vihaan",
                                "name": "KHAN,VIHAAN",
                                "role": "AU",
                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                "uid": "urn:va:user:9E7A:10000000272"
                            },
                            {
                                "displayName": "Khan,Vihaan",
                                "name": "KHAN,VIHAAN",
                                "role": "S",
                                "signature": "VIHAAN KHAN VK",
                                "signedDateTime": "20160316102005",
                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                "uid": "urn:va:user:9E7A:10000000272"
                            },
                            {
                                "displayName": "Khan,Vihaan",
                                "name": "KHAN,VIHAAN",
                                "role": "ES",
                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                "uid": "urn:va:user:9E7A:10000000272"
                            },
                            {
                                "displayName": "Vk",
                                "name": "VK",
                                "role": "E",
                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                "uid": "urn:va:user:9E7A:10000000272"
                            }
                        ],
                        "documentClass": "PROGRESS NOTES",
                        "documentDefUid": "urn:va:doc-def:9E7A:20",
                        "documentTypeCode": "C",
                        "documentTypeName": "Crisis Note",
                        "encounterName": "7A GEN MED Mar 25, 2004",
                        "encounterUid": "urn:va:visit:9E7A:3:3313",
                        "entered": "20160316102005",
                        "facilityCode": "998",
                        "facilityName": "ABILENE (CAA)",
                        "isInterdisciplinary": "false",
                        "kind": "Crisis Note",
                        "lastUpdateTime": "20160316102346",
                        "localId": "11735",
                        "localTitle": "CRISIS NOTE",
                        "pid": "9E7A;3",
                        "referenceDateTime": "201603161019",
                        "signedDateTime": "20160316102005",
                        "signer": "KHAN,VIHAAN",
                        "signerDisplayName": "Khan,Vihaan",
                        "signerUid": "urn:va:user:9E7A:10000000272",
                        "stampTime": "20160316102346",
                        "status": "COMPLETED",
                        "statusDisplayName": "Completed",
                        "summary": "CRISIS NOTE",
                        "text": [
                            {
                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "clinicians": [
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "AU",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "S",
                                        "signature": "VIHAAN KHAN VK",
                                        "signedDateTime": "20160316102005",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "ES",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Vk",
                                        "name": "VK",
                                        "role": "E",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    }
                                ],
                                "content": "this is my signed crisis note.\r\n",
                                "dateTime": "201603161019",
                                "signer": "KHAN,VIHAAN",
                                "signerDisplayName": "Khan,Vihaan",
                                "signerUid": "urn:va:user:9E7A:10000000272",
                                "status": "COMPLETED",
                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11735'}",
                                "uid": "urn:va:document:9E7A:3:11735"
                            },
                            {
                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "clinicians": [
                                    {
                                        "displayName": "Vk",
                                        "name": "VK",
                                        "role": "E",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "AU",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "ES",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    }
                                ],
                                "content": " You may not PRINT this UNSIGNED Addendum.\r\n",
                                "dateTime": "20160316102259",
                                "status": "UNSIGNED",
                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11736'}",
                                "uid": "urn:va:document:9E7A:3:11736"
                            },
                            {
                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "clinicians": [
                                    {
                                        "displayName": "Vk",
                                        "name": "VK",
                                        "role": "E",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "AU",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "S",
                                        "signature": "KHAN,VIHAAN",
                                        "signedDateTime": "20160316102346",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "ES",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    }
                                ],
                                "content": "This is my signed addendum created in CPRS.\r\n",
                                "dateTime": "20160316102325",
                                "signer": "KHAN,VIHAAN",
                                "signerDisplayName": "Khan,Vihaan",
                                "signerUid": "urn:va:user:9E7A:10000000272",
                                "status": "COMPLETED",
                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11737'}",
                                "uid": "urn:va:document:9E7A:3:11737"
                            }
                        ],
                        "uid": "urn:va:document:9E7A:3:11735",
                        "addenda": [
                            {
                                "addenda": [
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "clinicians": [
                                            {
                                                "displayName": "Vk",
                                                "name": "VK",
                                                "role": "E",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "AU",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "S",
                                                "signature": "KHAN,VIHAAN",
                                                "signedDateTime": "20160316102346",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "ES",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            }
                                        ],
                                        "content": "This is my signed addendum created in CPRS.\r\n",
                                        "dateTime": "20160316102325",
                                        "signer": "KHAN,VIHAAN",
                                        "signerDisplayName": "Khan,Vihaan",
                                        "signerUid": "urn:va:user:9E7A:10000000272",
                                        "status": "COMPLETED",
                                        "summary": "DocumentText{uid='urn:va:document:9E7A:3:11737'}",
                                        "uid": "urn:va:document:9E7A:3:11737",
                                        "app": "vista",
                                        "documentDefUid": "urn:va:doc-def:9E7A:20",
                                        "encounterName": "7A GEN MED Mar 25, 2004",
                                        "encounterUid": "urn:va:visit:9E7A:3:3313",
                                        "isInterdisciplinary": "false",
                                        "localId": "",
                                        "localTitle": "Addendum to: Addendum to: CRISIS NOTE",
                                        "noteType": "ADDENDUM",
                                        "parentUid": "urn:va:document:9E7A:3:11735",
                                        "pid": "9E7A;3",
                                        "referenceDateTime": "20160316102325",
                                        "statusDisplayName": "Completed",
                                        "text": [
                                            {
                                                "author": "KHAN,VIHAAN",
                                                "authorDisplayName": "Khan,Vihaan",
                                                "authorUid": "urn:va:user:9E7A:10000000272",
                                                "clinicians": [
                                                    {
                                                        "displayName": "Vk",
                                                        "name": "VK",
                                                        "role": "E",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    },
                                                    {
                                                        "displayName": "Khan,Vihaan",
                                                        "name": "KHAN,VIHAAN",
                                                        "role": "AU",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    },
                                                    {
                                                        "displayName": "Khan,Vihaan",
                                                        "name": "KHAN,VIHAAN",
                                                        "role": "S",
                                                        "signature": "KHAN,VIHAAN",
                                                        "signedDateTime": "20160316102346",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    },
                                                    {
                                                        "displayName": "Khan,Vihaan",
                                                        "name": "KHAN,VIHAAN",
                                                        "role": "ES",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    }
                                                ],
                                                "content": "This is my signed addendum created in CPRS.\r\n",
                                                "dateTime": "20160316102325",
                                                "signer": "KHAN,VIHAAN",
                                                "signerDisplayName": "Khan,Vihaan",
                                                "signerUid": "urn:va:user:9E7A:10000000272",
                                                "status": "COMPLETED",
                                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11737'}",
                                                "uid": "urn:va:document:9E7A:3:11737"
                                            }
                                        ]
                                    },
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "clinicians": [
                                            {
                                                "displayName": "Vk",
                                                "name": "VK",
                                                "role": "E",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "AU",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "ES",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            }
                                        ],
                                        "content": " You may not PRINT this UNSIGNED Addendum.\r\n",
                                        "dateTime": "20160316102259",
                                        "status": "UNSIGNED",
                                        "summary": "DocumentText{uid='urn:va:document:9E7A:3:11736'}",
                                        "uid": "urn:va:document:9E7A:3:11736",
                                        "app": "vista",
                                        "documentDefUid": "urn:va:doc-def:9E7A:20",
                                        "encounterName": "7A GEN MED Mar 25, 2004",
                                        "encounterUid": "urn:va:visit:9E7A:3:3313",
                                        "isInterdisciplinary": "false",
                                        "localId": "",
                                        "localTitle": "Addendum to: Addendum to: CRISIS NOTE",
                                        "noteType": "ADDENDUM",
                                        "parentUid": "urn:va:document:9E7A:3:11735",
                                        "pid": "9E7A;3",
                                        "referenceDateTime": "20160316102259",
                                        "statusDisplayName": "Unsigned",
                                        "text": [
                                            {
                                                "author": "KHAN,VIHAAN",
                                                "authorDisplayName": "Khan,Vihaan",
                                                "authorUid": "urn:va:user:9E7A:10000000272",
                                                "clinicians": [
                                                    {
                                                        "displayName": "Vk",
                                                        "name": "VK",
                                                        "role": "E",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    },
                                                    {
                                                        "displayName": "Khan,Vihaan",
                                                        "name": "KHAN,VIHAAN",
                                                        "role": "AU",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    },
                                                    {
                                                        "displayName": "Khan,Vihaan",
                                                        "name": "KHAN,VIHAAN",
                                                        "role": "ES",
                                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                        "uid": "urn:va:user:9E7A:10000000272"
                                                    }
                                                ],
                                                "content": " You may not PRINT this UNSIGNED Addendum.\r\n",
                                                "dateTime": "20160316102259",
                                                "status": "UNSIGNED",
                                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11736'}",
                                                "uid": "urn:va:document:9E7A:3:11736"
                                            }
                                        ]
                                    },
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "documentDefUid": "urn:va:doc-def:9E7A:20",
                                        "encounterDateTime": "",
                                        "encounterName": "7A GEN MED Aug 14, 2014",
                                        "encounterServiceCategory": "D",
                                        "encounterUid": "urn:va:visit:9E7A:3:11420",
                                        "entered": "20150223131640",
                                        "isInterdisciplinary": "false",
                                        "lastUpdateTime": "20150223131640",
                                        "localTitle": "Addendum to: Addendum to: CRISIS NOTE",
                                        "locationIEN": "urn:va:location:9E7A:38",
                                        "noteType": "ADDENDUM",
                                        "parentUid": "urn:va:document:9E7A:3:11735",
                                        "pid": "9E7A;3",
                                        "referenceDateTime": "20160222121938",
                                        "status": "UNSIGNED",
                                        "statusDisplayName": "Unsigned",
                                        "text": [
                                            {
                                                "author": "KHAN,VIHAAN",
                                                "authorDisplayName": "Khan,Vihaan",
                                                "authorUid": "urn:va:user:9E7A:10000000272",
                                                "content": "This is my CRISIS NOTE unsigned addendum\r\n",
                                                "dateTime": "20160213180037",
                                                "status": "UNSIGNED"
                                            }
                                        ],
                                        "referenceId": "urn:va:document:9E7A:3:11735",
                                        "uid": "urn:va:ehmp-note:9E7A:3:3762b3f1-bfc3-4ade-999d-1cd8569092f0",
                                        "app": "ehmp",
                                        "clinicalObject": {
                                            "authorUid": "urn:va:user:9E7A:10000000272",
                                            "creationDateTime": "20160316143559+0000",
                                            "domain": "ehmp-note",
                                            "ehmpState": "draft",
                                            "patientUid": "urn:va:patient:9E7A:3:3",
                                            "referenceId": "urn:va:document:9E7A:3:11735",
                                            "subDomain": "addendum",
                                            "uid": "urn:va:ehmp-note:9E7A:3:3762b3f1-bfc3-4ade-999d-1cd8569092f0",
                                            "visit": {
                                                "dateTime": "20140814130730",
                                                "location": "urn:va:location:9E7A:38",
                                                "serviceCategory": "D"
                                            }
                                        }
                                    }
                                ],

                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "clinicians": [
                                    {
                                        "displayName": "Vk",
                                        "name": "VK",
                                        "role": "E",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "AU",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "S",
                                        "signature": "KHAN,VIHAAN",
                                        "signedDateTime": "20160316102346",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "ES",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    }
                                ],
                                "content": "This is my signed addendum created in CPRS.\r\n",
                                "dateTime": "20160316102325",
                                "signer": "KHAN,VIHAAN",
                                "signerDisplayName": "Khan,Vihaan",
                                "signerUid": "urn:va:user:9E7A:10000000272",
                                "status": "COMPLETED",
                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11737'}",
                                "uid": "urn:va:document:9E7A:3:11737",
                                "app": "vista",
                                "documentDefUid": "urn:va:doc-def:9E7A:20",
                                "encounterName": "7A GEN MED Mar 25, 2004",
                                "encounterUid": "urn:va:visit:9E7A:3:3313",
                                "isInterdisciplinary": "false",
                                "localId": "",
                                "localTitle": "Addendum to: CRISIS NOTE",
                                "noteType": "ADDENDUM",
                                "parentUid": "urn:va:document:9E7A:3:11735",
                                "pid": "9E7A;3",
                                "referenceDateTime": "20160316102325",
                                "statusDisplayName": "Completed",
                                "text": [
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "clinicians": [
                                            {
                                                "displayName": "Vk",
                                                "name": "VK",
                                                "role": "E",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "AU",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "S",
                                                "signature": "KHAN,VIHAAN",
                                                "signedDateTime": "20160316102346",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "ES",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            }
                                        ],
                                        "content": "This is my signed addendum created in CPRS.\r\n",
                                        "dateTime": "20160316102325",
                                        "signer": "KHAN,VIHAAN",
                                        "signerDisplayName": "Khan,Vihaan",
                                        "signerUid": "urn:va:user:9E7A:10000000272",
                                        "status": "COMPLETED",
                                        "summary": "DocumentText{uid='urn:va:document:9E7A:3:11737'}",
                                        "uid": "urn:va:document:9E7A:3:11737"
                                    }
                                ]
                            },
                            {
                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "clinicians": [
                                    {
                                        "displayName": "Vk",
                                        "name": "VK",
                                        "role": "E",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "AU",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    },
                                    {
                                        "displayName": "Khan,Vihaan",
                                        "name": "KHAN,VIHAAN",
                                        "role": "ES",
                                        "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                        "uid": "urn:va:user:9E7A:10000000272"
                                    }
                                ],
                                "content": " You may not PRINT this UNSIGNED Addendum.\r\n",
                                "dateTime": "20160316102259",
                                "status": "UNSIGNED",
                                "summary": "DocumentText{uid='urn:va:document:9E7A:3:11736'}",
                                "uid": "urn:va:document:9E7A:3:11736",
                                "app": "vista",
                                "documentDefUid": "urn:va:doc-def:9E7A:20",
                                "encounterName": "7A GEN MED Mar 25, 2004",
                                "encounterUid": "urn:va:visit:9E7A:3:3313",
                                "isInterdisciplinary": "false",
                                "localId": "",
                                "localTitle": "Addendum to: CRISIS NOTE",
                                "noteType": "ADDENDUM",
                                "parentUid": "urn:va:document:9E7A:3:11735",
                                "pid": "9E7A;3",
                                "referenceDateTime": "20160316102259",
                                "statusDisplayName": "Unsigned",
                                "text": [
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "clinicians": [
                                            {
                                                "displayName": "Vk",
                                                "name": "VK",
                                                "role": "E",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "AU",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            },
                                            {
                                                "displayName": "Khan,Vihaan",
                                                "name": "KHAN,VIHAAN",
                                                "role": "ES",
                                                "summary": "DocumentClinician{uid='urn:va:user:9E7A:10000000272'}",
                                                "uid": "urn:va:user:9E7A:10000000272"
                                            }
                                        ],
                                        "content": " You may not PRINT this UNSIGNED Addendum.\r\n",
                                        "dateTime": "20160316102259",
                                        "status": "UNSIGNED",
                                        "summary": "DocumentText{uid='urn:va:document:9E7A:3:11736'}",
                                        "uid": "urn:va:document:9E7A:3:11736"
                                    }
                                ]
                            },
                            {
                                "author": "KHAN,VIHAAN",
                                "authorDisplayName": "Khan,Vihaan",
                                "authorUid": "urn:va:user:9E7A:10000000272",
                                "documentDefUid": "urn:va:doc-def:9E7A:20",
                                "encounterDateTime": "",
                                "encounterName": "7A GEN MED Aug 14, 2014",
                                "encounterServiceCategory": "D",
                                "encounterUid": "urn:va:visit:9E7A:3:11420",
                                "entered": "20150223131640",
                                "isInterdisciplinary": "false",
                                "lastUpdateTime": "20150223131640",
                                "localTitle": "Addendum to: CRISIS NOTE",
                                "locationIEN": "urn:va:location:9E7A:38",
                                "noteType": "ADDENDUM",
                                "parentUid": "urn:va:document:9E7A:3:11735",
                                "pid": "9E7A;3",
                                "referenceDateTime": "20160222121938",
                                "status": "UNSIGNED",
                                "statusDisplayName": "Unsigned",
                                "text": [
                                    {
                                        "author": "KHAN,VIHAAN",
                                        "authorDisplayName": "Khan,Vihaan",
                                        "authorUid": "urn:va:user:9E7A:10000000272",
                                        "content": "This is my CRISIS NOTE unsigned addendum\r\n",
                                        "dateTime": "20160213180037",
                                        "status": "UNSIGNED"
                                    }
                                ],
                                "referenceId": "urn:va:document:9E7A:3:11735",
                                "uid": "urn:va:ehmp-note:9E7A:3:3762b3f1-bfc3-4ade-999d-1cd8569092f0",
                                "app": "ehmp",
                                "clinicalObject": {
                                    "authorUid": "urn:va:user:9E7A:10000000272",
                                    "creationDateTime": "20160316143559+0000",
                                    "domain": "ehmp-note",
                                    "ehmpState": "draft",
                                    "patientUid": "urn:va:patient:9E7A:3:3",
                                    "referenceId": "urn:va:document:9E7A:3:11735",
                                    "subDomain": "addendum",
                                    "uid": "urn:va:ehmp-note:9E7A:3:3762b3f1-bfc3-4ade-999d-1cd8569092f0",
                                    "visit": {
                                        "dateTime": "20140814130730",
                                        "location": "urn:va:location:9E7A:38",
                                        "serviceCategory": "D"
                                    }
                                }
                            }
                        ],
                        "app": "ehmp",
                        "documentDefUidUnique": "urn:va:doc-def:9E7A:20---CRISIS_NOTE---all",
                        "asuPermissions": [
                            "VIEW"
                        ]
                    }
                ];
                var testAttributeMapping = {
                    groupID: "groupId",
                    groupLabel: "name",
                    groupItems: "groupItems",
                    itemUniqueId: "itemUniqueId",
                    itemLabel: "localTitle",
                    itemStatus: "statusDisplayName",
                    itemDateTime: "referenceDateTime",
                    nodes: "addenda"
                };
                var mockClick = null;

                beforeEach(function () {
                    mockClick = jasmine.createSpy('mockClick');

                    testTraySummaryListView = TraySummaryListView.extend({
                        initialize: function() {
                            this.collection = new Backbone.Collection({
                                groupId: 'SAMPLE_ID',
                                groupLabel: 'SAMPLE_NAME',
                                groupItems: new Backbone.Collection(testNotes)
                            });
                        },
                        onClick: mockClick,
                        options: {
                            label: "ITEMS",
                            attributeMapping: testAttributeMapping
                        }
                    });

                    testPage = new TestView({
                        view: testTraySummaryListView
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it('has the correct number of accordions and sub-accordions', function () {
                    expect($testPage.find('.accordion-container').length).toBe(3);  // main accordion + addenda
                });

                it('that contain the correct number of items', function() {
                    expect($testPage.find('a[href="#li-item"]').length).toBe(_.size(testNotes)+_.size(testNotes[0][testAttributeMapping.nodes])+_.size(testNotes[0][testAttributeMapping.nodes][0][testAttributeMapping.nodes]));
                });

                describe('items', function() {
                    it('onClick', function() {
                        $testPage.find('a[href="#li-item"]:first-of-type').click();
                        expect(mockClick).toHaveBeenCalled();
                    });
                    describe('node item', function() {
                        it('contains the correct title', function(){
                            expect($testPage.find('a[href="#li-item"]')[0]).toContainText(testNotes[0][testAttributeMapping.itemLabel]);
                        });
                        it('toggle button collapses node', function(){
                            $testPage.find('#node-toggle-button:first-of-type').click();
                            expect($testPage.find('.panel-title')[1]).not.toHaveClass('collapsed');
                        });
                    });
                    describe('leaf item', function() {
                        it('contains the correct title', function(){
                            expect($testPage.find('a[href="#li-item"]')[1]).toContainText(testNotes[0][testAttributeMapping.nodes][0][testAttributeMapping.itemLabel]);
                        });
                    });
                });

            });
        });

    }
);


