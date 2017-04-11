'use strict';
var singleInstance = require('./single-instance');
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;

describe('single-instance ', function () {


    describe('happy path', function () {
        var mockHttp;
        var req = {};
        beforeEach(function () {
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'single-instance'
            }));
            req.app = {};
            req.app.config = {};
            req.app.config.vistaSites = {
                "C877": {
                    "name": "KODAK",
                    "division": "500"
                },
                "9E7A": {
                    "name": "PANORAMA",
                    "division": "500"
                }
            };
            req.app.config.jbpm = {};
            req.app.config.activityDatabase = {
                "user": "activitydbuser",
                "password": "activitydb$11",
                "connectString": "IP_ADDRESS:PORT/xe"
            };

            req.query = {};
            req.query.id = 1;
            req.jdsServer = {
                "baseUrl": "http://IP_ADDRESS:PORT",
                "urlLengthLimit": 120
            };
        });
        xit('_getUserDemographicsQuery', function () {

            var input = {};
            input.userID = '9E7A;10000000270';
            var result = singleInstance._getUserDemographicsQuery(req, input.userID);
            expect(result.url).to.be.equal('/data/find/user?filter=eq(%22uid%22%2C%22urn%3Ava%3Auser%3A9E7A%3A10000000270%22)');
        });

        it('_getPatientDemographics', function () {

            var patient = {};
            patient.genderName = 'Male';
            patient.displayName = 'Eightysix,Inpatient';
            patient.birthDate = '19450309';
            patient.last4 = '0886';

            var result = singleInstance._getPatientDemographics(req.logger, patient);
            expect(result.DOB).to.be.equal('19450309');
            expect(result.firstName).to.be.equal('Inpatient');
            expect(result.lastName).to.be.equal('Eightysix');
            expect(result.gender).to.be.equal('M');
            expect(result.ssn).to.be.equal('0886');
        });

        it('_composeInstanceQuery', function () {
            var result = singleInstance._composeInstanceQuery(122);
            var query = 'SELECT TO_CHAR(AM_PROCESSINSTANCE.STATESTARTDATE, \'YYYYMMDDhhmmss\') as startedDateTime, ' +
                'AM_PROCESSINSTANCE.PROCESSNAME as activityName, ' +
                'AM_PROCESSINSTANCE.PROCESSDEFINITIONID as processDefinitionId, ' +
                'AM_PROCESSINSTANCE.DESCRIPTION as activityDescription, ' +
                'AM_PROCESSINSTANCE.DOMAIN as domain, ' +
                'AM_PROCESSINSTANCE.DEPLOYMENTID as deploymentId, ' +
                'AM_PROCESSINSTANCE.ICN as pid, ' +
                'AM_PROCESSINSTANCE.CREATEDBYID as userID, ' +
                'AM_PROCESSINSTANCE.ACTIVITYHEALTHY as healthIndicator, ' +
                'AM_PROCESSINSTANCE.ACTIVITYHEALTHDESCRIPTION as healthIndicatorReason, ' +
                'AM_PROCESSINSTANCE.CLINICALOBJECTUID as clinicalObjectUID, ' +
                'AM_PROCESSINSTANCE.STATE as state, ' +
                'AM_PROCESSINSTANCE.URGENCY, ' +
                'AM_PROCESSINSTANCE.INSTANCENAME, ' +
                'TO_CHAR(AM_PROCESSINSTANCE.INITIATIONDATE, \'YYYYMMDD\') as initiationDate ' +
                'FROM ACTIVITYDB.AM_PROCESSINSTANCE  ' +
                'WHERE ' +
                '   ACTIVITYDB.AM_PROCESSINSTANCE.PROCESSINSTANCEID=122';
            expect(result).to.be.equal(query);
        });

    });

    describe('unhappy path', function () {
        var mockHttp;
        var req = {};
        beforeEach(function () {
            req.logger = sinon.stub(require('bunyan').createLogger({
                name: 'single-instance'
            }));
            req.app = {};
            req.app.config = {};
            req.app.config.vistaSites = {
                "C877": {
                    "name": "KODAK",
                    "division": "500"
                },
                "9E7A": {
                    "name": "PANORAMA",
                    "division": "500"
                }
            };
            req.app.config.jbpm = {};
            req.app.config.activityDatabase = {
                "user": "activitydbuser",
                "password": "activitydb$11",
                "connectString": "IP_ADDRESS:PORT/xe"
            };

            req.query = {};
            req.query.id = 1;
            req.jdsServer = {
                "baseUrl": "http://IP_ADDRESS:PORT",
                "urlLengthLimit": 120
            };
        });
        it('_getUserDemographicsQuery', function () {

            var result = singleInstance._getUserDemographicsQuery(req);
            expect(result).to.be.undefined();
        });

        it('_getPatientDemographics', function () {

            var patient = {};
            var result = singleInstance._getPatientDemographics(req.logger);
            expect(result).to.be.undefined();

            result = singleInstance._getPatientDemographics(req.logger, patient);
            expect(result).to.be.undefined();
        });

        xit('_transformQueryResults', function () {
            var input = {};

            var result = singleInstance._transformQueryResults(req, 1);
            expect(result).to.be.equal(null);

            result = singleInstance._transformQueryResults(req, 1, input);
            expect(result).to.be.equal(null);
        });

        it('getClinical object from pJDS with bad object', function (done) {
            var object = {
                "clinicalObject": {
                    "authorUid": "urn:va:user:9E7A:10000000270",
                    "creationDateTime": "20160505200028+0000",
                    "data": {
                        "activity": {
                            "deploymentId": "VistaCore:Order",
                            "processDefinitionId": "Order:Consult",
                            "processInstanceId": "92"
                        },
                        "clinicalNote": "",
                        "formRecord": {
                            "consultName": "Rheumatology Consult",
                            "deploymentId": "VistaCore:Order:2.0.0.37",
                            "earliestDate": "05\/05\/2016",
                            "facility": "9E7A",
                            "icn": "9E7A;419",
                            "latestDate": "05\/12\/2016",
                            "objectType": "consultOrder",
                            "orderingProviderId": "9E7A;10000000270",
                            "overrideReason": "Test override",
                            "pid": "9E7A;419",
                            "preReqOrders": [
                                {
                                    "ien": "239",
                                    "label": "C Reactive Protein",
                                    "name": "C Reactive Protein",
                                    "status": "final",
                                    "value": "Order"
                                },
                                {
                                    "ien": "252",
                                    "label": "Rheumatoid Factor",
                                    "name": "Rheumatoid Factor",
                                    "status": "final",
                                    "value": "Satisfied"
                                }
                            ],
                            "preReqQuestions": [
                                {
                                    "label": "Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?",
                                    "name": "Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?",
                                    "value": "Yes"
                                },
                                {
                                    "label": "Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?",
                                    "name": "Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?",
                                    "value": "Override"
                                },
                                {
                                    "label": "Has the patient had recent (last 60 days) Xrays of any effected joint? Y\/N",
                                    "name": "Has the patient had recent (last 60 days) Xrays of any effected joint? Y\/N",
                                    "value": "Yes"
                                }
                            ],
                            "processDefId": "Order.Consult",
                            "requestQuestion": "Reason",
                            "specialty": "Rheumatology Consult",
                            "urgency": "Urgent"
                        },
                        "instructions": "Order Instructions for this order",
                        "prerequisites": {
                            "cdsObject": {
                                "data": {
                                    "activity": {
                                        "deploymentId": "VistaCore:Order",
                                        "processDefinitionId": "Order:Consult"
                                    },
                                    "codes": [
                                        {
                                            "code": "415279002",
                                            "display": "Referral to rheumatology clinic",
                                            "system": "urn:oid:2.16.840.1.113883.6.96"
                                        }
                                    ],
                                    "instructions": "Rheumatoid arthritis (RA) is a chronic, systemic, inflammatory disorder of unknown etiology that primarily involves synovial joints. The arthritis is typically symmetrical, and usually leads, if uncontrolled, to destruction of joints due to erosion of cartilage and bone, causing joint deformities.\n\nDisease Activity Score Calculator for Rheumatoid Arthritis[RM1] \n\nhttp:\/\/www.4s-dawn.com\/DAS28\/\n\nSmoking can trigger and perpetuate Rheumatoid Arthritis Inflammation. Please refer your patient for Smoking Cessation.",
                                    "prerequisites": {
                                        "cdsIntent": "RheumatologyConsultScreen",
                                        "ehmp-questionnaire": {
                                            "observation-results": [
                                                {
                                                    "observation-result": {
                                                        "derived-from": {
                                                            "form": "4F4723CF-E537-4257-98DB-8754665E6A93",
                                                            "item": "4461E7DA-1629-464A-91D5-02DFF7648898",
                                                            "version": {
                                                                "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                                "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                                "time": "2016.03.29T16:00:00"
                                                            }
                                                        },
                                                        "episodicity": "",
                                                        "lego-id": "88d89788-1d4f-4419-a7c4-796ba8869016",
                                                        "observable": "339c876c-15a1-4975-ae29-d4815aef242c",
                                                        "provenance": "ed2f734a-9196-3410-ae04-751808edf584",
                                                        "question-text": "Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?",
                                                        "timing": "[2016.03.3.29T16:50:39, 2016.03.29T16:50:40]",
                                                        "value": "c928767e-f519-3b34-bff2-a2ed3cd5c6c3",
                                                        "version": {
                                                            "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                            "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                            "time": "2016.03.29T16:00:00"
                                                        }
                                                    }
                                                },
                                                {
                                                    "observation-result": {
                                                        "derived-from": {
                                                            "form": "4F4723CF-E537-4257-98DB-8754665E6A93",
                                                            "item": "4F49C2CE-FAE5-4385-A76C-B43DADB34B32",
                                                            "version": {
                                                                "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                                "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                                "time": "2016.03.29T16:00:00"
                                                            }
                                                        },
                                                        "episodicity": "",
                                                        "lego-id": "c4828d28-8d64-4b3e-81c4-a9c00921d412",
                                                        "observable": "86703071-0f81-411a-82f8-8ac28be46ef1",
                                                        "provenance": "ed2f734a-9196-3410-ae04-751808edf584",
                                                        "question-text": "Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?",
                                                        "timing": "[2016.01.30T16:50:39, 2016.03.29T16:50:40]",
                                                        "value": "c928767e-f519-3b34-bff2-a2ed3cd5c6c3",
                                                        "version": {
                                                            "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                            "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                            "time": "2016.03.29T16:00:00"
                                                        }
                                                    }
                                                },
                                                {
                                                    "observation-result": {
                                                        "derived-from": {
                                                            "form": "4F4723CF-E537-4257-98DB-8754665E6A93",
                                                            "item": "F61AFA3D-BCA0-4E93-8B21-8CD560B9C8CA",
                                                            "version": {
                                                                "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                                "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                                "time": "2016.03.29T16:00:00"
                                                            }
                                                        },
                                                        "episodicity": "",
                                                        "lego-id": "7831e8cd-bb5d-4d22-8010-3496a06a7bb1",
                                                        "observable": "b3abf762-1893-40a6-aea2-51139e5dd7f3",
                                                        "provenance": "ed2f734a-9196-3410-ae04-751808edf584",
                                                        "question-text": "Has the patient had recent (last 60 days) Xrays of any effected joint? Y\/N",
                                                        "timing": "[2016.01.30T16:50:39, 2016.03.29T16:50:39]",
                                                        "value": "c928767e-f519-3b34-bff2-a2ed3cd5c6c3",
                                                        "version": {
                                                            "module": "4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4",
                                                            "path": "2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA",
                                                            "time": "2016.03.29T16:00:00"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    "teamFocus": {
                                        "code": 75,
                                        "name": "Rheumatology"
                                    }
                                },
                                "domain": "ehmp-activity",
                                "facility-enterprise": "enterprise",
                                "name": "Rheumatology Consult",
                                "state": "active",
                                "subDomain": "consult",
                                "type": "ehmp-enterprise-orderable",
                                "uid": "urn:va:entordrbls:2"
                            }
                        },
                        "teamFocus": {
                            "code": 75,
                            "name": "Rheumatology"
                        }
                    },
                    "displayName": "Rheumatology Consult - Urgent",
                    "domain": "ehmp-activity",
                    "ehmpState": "draft",
                    "patientUid": "urn:va:patient:9E7A:419:419",
                    "referenceId": "",
                    "subDomain": "consult",
                    "uid": "urn:va:ehmp-activity:9E7A:419:6027a1f6-7177-4f56-8663-87e66f88fcf3",
                    "visit": {
                        "dateTime": "20160505155500",
                        "location": "urn:va:location:9E7A:64",
                        "serviceCategory": "I"
                    }
                }
            };

            var results = {};
            results.clinicalObjectUID = 'urn:va:entordrbls:2';

            mockHttp = sinon.stub(httpUtil, 'get', function (options, callback) {
                return callback(null, {
                    statusCode: 200
                }, object);
            });

            singleInstance.getClinicalObjectDetails(req, results, function (error, results) {
                expect(results).to.be.undefined();
            });

            mockHttp.restore();

            done();
        });

        it('getClinical object from pJDS with no object', function (done) {
            var input = {};

            mockHttp = sinon.stub(httpUtil, 'get', function (options, callback) {
                return callback(null, {
                    statusCode: 200
                }, object);
            });

            singleInstance.getClinicalObjectDetails(req, input, function (error, results) {
                expect(results).to.be.eql('');
            });

            mockHttp.restore();
            done();
        });

    });
});
