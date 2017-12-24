'use strict';

//-----------------------------------------------------------------
// This will test the solr-request-xform.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var xformer = require(global.VX_UTILS + 'solr-xform/solr-ehmp-activity-request-xform');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-request-xformer-spec',
//     level: 'debug'
// });

describe('solr-request-xform.js', function () {
    describe('Transformer', function () {
        it('Happy Path', function () {
            var vprRecord = {
                'uid': 'urn:va:ehmp-activity:SITE:8:30fe0301-14ac-4d8d-95a9-9f538866be12',
                'patientUid': 'urn:va:patient:SITE:8:8',
                'authorUid': 'urn:va:user:SITE:100',
                'domain': 'ehmp-activity',
                'subDomain': 'request',
                'visit': {
                    'location': 'urn:va:location:SITE:12',
                    'serviceCategory': 'PSB',
                    'dateTime': '20071217151553'
                },
                'ehmpState': 'active',
                'displayName': 'Post procedure follow-up',
                'referenceId': '',
                'data': {
                    'activity': {
                        'deploymentId': 'VistaCore:Order',
                        'processDefinitionId': 'Order:Request',
                        'type': 'Order',
                        'domain': 'Request',
                        'processInstanceId': '123',
                        'instanceName': 'Post procedure follow-up',
                        'patientUid': 'urn:va:patient:SITE:8:8',
                        'clinicalObjectUid': '',
                        'sourceFacilityId': '100',
                        'destinationFacilityId': '',
                        'state': 'active:scheduling underway',
                        'initiator': 'urn:va:user:SITE:100',
                        'timeStamp': '20160420000000',
                        'urgency': '9',
                        'assignedTo': '',
                        'activityHealthy': '1',
                        'activityHealthDescription': ''
                    },
                    'signals': [{
                        'name': 'END',
                        'actionId': '1',
                        'actionText': 'Discontinue',
                        'history': 'Some history',
                        'executionUserId': 'urn:va:user:SITE:10000000271',
                        'executionUserName': 'LAST,FIRST',
                        'executionDateTime': '20170112161157+0000',
                        'data': {
                            'comment': 'Comment from UI Screen 1'
                        }
                    }, {
                        'name': 'END',
                        'actionId': '1',
                        'actionText': 'Discontinue',
                        'history': 'Some history',
                        'executionUserId': 'urn:va:user:SITE:10000000271',
                        'executionUserName': 'LAST,FIRST',
                        'executionDateTime': '20170112161157+0000',
                        'data': {
                            'comment': 'Comment from UI Screen 2'
                        }
                    }
                    ],
                    'requests': [
                        {
                            'taskInstanceId': '12',
                            'urgencyId': '10',
                            'urgency': 'Urgent',
                            'earliestDate': '20160329000000',
                            'latestDate': '20160420000000',
                            'title': 'Post procedure follow-up',
                            'assignTo': 'My Teams',
                            'route': {
                                'facility': '500',
                                'person': '12',
                                'team': {
                                    'code': '12',
                                    'name': 'ReportingTeam'
                                },
                                'teamFocus': {
                                    'code': '12',
                                    'name': 'Reporting'
                                },
                                'teamCareType': {
                                    'code': '12',
                                    'name': 'Reporting'
                                },
                                'patientsAssignment': true,
                                'assignedRoles': [
                                    {
                                        'code': '500',
                                        'name': 'Resolver'
                                    }
                                ],
                                'routingCode': 'TR: Nurse Practitioner(24)'
                            },
                            'request': 'This is my request',
                            'submittedByUid': 'urn:va:user:SITE:12',
                            'submittedByName': 'John Doe',
                            'submittedTimeStamp': '20160420000000',
                            'visit': {
                                'location': 'urn:va:location:SITE:12',
                                'serviceCategory': 'PSB',
                                'dateTime': '20141324050402'
                            }
                        },
                        {
                            'taskInstanceId': '13',
                            'urgencyId': '11',
                            'urgency': 'Urgent',
                            'earliestDate': '20170529000000',
                            'latestDate': '20170420000000',
                            'title': 'Ovaltine',
                            'assignTo': 'My Teams',
                            'route': {
                                'facility': '500',
                                'person': '12',
                                'team': {
                                    'code': '12',
                                    'name': 'ReportingTeam'
                                },
                                'teamFocus': {
                                    'code': '12',
                                    'name': 'Reporting'
                                },
                                'teamCareType': {
                                    'code': '12',
                                    'name': 'Reporting'
                                },
                                'patientsAssignment': true,
                                'assignedRoles': [
                                    {
                                        'code': '500',
                                        'name': 'Resolver'
                                    }
                                ],
                                'routingCode': 'TR: Nurse Practitioner(24)'
                            },
                            'request': 'This is another request',
                            'submittedByUid': 'urn:va:user:SITE:12',
                            'submittedByName': 'John Doe',
                            'submittedTimeStamp': '20160420000000',
                            'visit': {
                                'location': 'urn:va:location:SITE:12',
                                'serviceCategory': 'PSB',
                                'dateTime': '20141324050402'
                            }
                        }
                    ],
                    'responses': [
                        {
                            'taskInstanceId': '12',
                            'action': 'Reassign',
                            'comment': 'Admiral Tarkin learns a lesson',
                            'request': 'SomeRequest1',
                            'assignTo': 'My Teams',
                            'route': {
                                'facility': '500',
                                'person': 'urn:va:user:SITE:7',
                                'patientsAssignment': true,
                                'assignedRoles': [
                                    {
                                        'code': '23',
                                        'name': 'Requestor'
                                    }
                                ],
                                'routingCode': 'TR: Nurse Practitioner(24)'
                            },
                            'submittedBy': 'urn:va:user:SITE:7',
                            'submittedByUid': 'urn:va:user:SITE:7',
                            'submittedByName': 'urn:va:user:SITE:7',
                            'visit': {
                                'location': 'urn:va:location:SITE:500',
                                'serviceCategory': 'PSB',
                                'dateTime': '20061234134523'
                            }
                        },
                        {
                            'taskInstanceId': '13',
                            'action': 'Reassign',
                            'comment': 'Vader is out of Admirals',
                            'request': 'SomeRequest2',
                            'assignTo': 'My Teams',
                            'route': {
                                'facility': '500',
                                'person': 'urn:va:user:SITE:7',
                                'patientsAssignment': true,
                                'assignedRoles': [
                                    {
                                        'code': '23',
                                        'name': 'Requestor'
                                    }
                                ],
                                'routingCode': 'TR: Nurse Practitioner(24)'
                            },
                            'submittedBy': 'urn:va:user:SITE:7',
                            'submittedByUid': 'urn:va:user:SITE:7',
                            'submittedByName': 'urn:va:user:SITE:7',
                            'visit': {
                                'location': 'urn:va:location:SITE:500',
                                'serviceCategory': 'PSB',
                                'dateTime': '20061234134523'
                            }
                        }
                    ]
                }
            };
            var solrRecord = xformer(vprRecord, log);

            // Verify Common Fields
            //---------------------
            expect(solrRecord.uid).toBe(vprRecord.uid);
            expect(solrRecord.pid).toBe('SITE;8');
            expect(solrRecord.facility_code).toBeUndefined();
            expect(solrRecord.facility_name).toBeUndefined();
            expect(solrRecord.kind).toBeUndefined();
            expect(solrRecord.summary).toBeUndefined();
            expect(solrRecord.codes_code).toBeUndefined();
            expect(solrRecord.codes_system).toBeUndefined();
            expect(solrRecord.codes_display).toBeUndefined();
            expect(solrRecord.entered).toBeUndefined();
            expect(solrRecord.verified).toBeUndefined();

            // Verify Request Specific Fields
            //-------------------------------
            expect(solrRecord.domain).toBe('ehmp-activity');
            expect(solrRecord.sub_domain).toBe(vprRecord.subDomain);
            expect(solrRecord.datetime).toBe(vprRecord.entered);
            expect(solrRecord.request_title).toEqual([vprRecord.data.requests[0].title, vprRecord.data.requests[1].title]);
            expect(solrRecord.request_text).toEqual([vprRecord.data.requests[0].request, vprRecord.data.requests[1].request]);
            expect(solrRecord.request_accepted_date).toEqual([vprRecord.data.requests[0].submittedTimeStamp, vprRecord.data.requests[1].submittedTimeStamp]);
            expect(solrRecord.response_request).toEqual([vprRecord.data.responses[0].request, vprRecord.data.responses[1].request]);
            expect(solrRecord.activity_process_instance_id).toEqual(vprRecord.data.activity.processInstanceId);
            expect(solrRecord.activity_source_facility_id).toEqual(vprRecord.data.activity.sourceFacilityId);
            expect(solrRecord.signals_data_comment).toBe(vprRecord.data.signals[1].data.comment);
        });
    });
});
