'use strict';

//-----------------------------------------------------------------
// This will test the solr-ehmp-activity-consult-xform.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var xformer = require(global.VX_UTILS + 'solr-xform/solr-ehmp-activity-consult-xform');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'solr-ehmp-activity-consult-xform-spec',
//     level: 'debug'
// });

describe('solr-ehmp-activity-consult-xform.js', function () {
    describe('Transformer', function () {
        it('Happy Path', function () {
            var vprRecord = {
                'authorUid': 'urn:va:user:SITE:10000000271',
                'data': {
                    'activity': {
                        'activityHealthDescription': '',
                        'activityHealthy': true,
                        'assignedTo': '[FC:PANORAMA(500)/TF:Rheumatology(75)]',
                        'clinicalObjectUid': 'urn:va:ehmp-activity:SITE:239:29fe0301-14ac-4d8d-95a9-9f538866beba',
                        'deploymentId': 'VistaCore:Order:0.0.0',
                        'destinationFacilityId': '500',
                        'domain': 'ehmp-activity',
                        'initiator': 'urn:va:user:SITE:10000000271',
                        'instanceName': 'Rheumatology',
                        'patientUid': 'urn:va:patient:SITE:239:239',
                        'processDefinitionId': 'Order.Consult',
                        'processInstanceId': '9',
                        'sourceFacilityId': '500',
                        'state': 'Unreleased:Pending Signature',
                        'timeStamp': '20170112151048+0000',
                        'type': 'Order',
                        'urgency': 9
                    },
                    'consultOrders': [{
                        'action': 'workup',
                        'cdsIntentResult': {
                            'data': {
                                'results': [{
                                    'coding': {
                                        'code': '55235003',
                                        'display': 'C Reactive Protein',
                                        'system': 'http://snomed.org'
                                    },
                                    'detail': {
                                        'comments': 'C Reactive Protein',
                                        'identifier': [{
                                            'system': 'http://snomed.org',
                                            'value': '55235003'
                                        }],
                                        'resourceType': 'Observation',
                                        'status': 'final'
                                    },
                                    'duration': '60d',
                                    'remediation': {
                                        'action': 'order',
                                        'coding': {
                                            'code': 'urn:va:oi:239',
                                            'display': 'C Reactive Protein',
                                            'system': 'urn:oid:2.16.840.1.113883.6.233:SITE'
                                        },
                                        'domain': 'lab'
                                    },
                                    'status': 'Failed'
                                }, {
                                    'coding': {
                                        'code': '415301001',
                                        'display': 'Rheumatoid Factor',
                                        'system': 'http://snomed.org'
                                    },
                                    'detail': {
                                        'comments': 'Rheumatoid Factor',
                                        'identifier': [{
                                            'system': 'http://snomed.org',
                                            'value': '415301001'
                                        }],
                                        'resourceType': 'Observation',
                                        'status': 'final'
                                    },
                                    'duration': '60d',
                                    'remediation': {
                                        'action': 'order',
                                        'coding': {
                                            'code': 'urn:va:oi:252',
                                            'display': 'Rheumatoid Factor',
                                            'system': 'urn:oid:2.16.840.1.113883.6.233:SITE'
                                        },
                                        'domain': 'lab'
                                    },
                                    'status': 'Failed'
                                }],
                                'status': {
                                    'code': '0',
                                    'httpStatus': 'OK'
                                }
                            },
                            'status': 200
                        },
                        'comment': 'This is the Comment (clinical history) entry -#1',
                        'conditions': [{
                            'code': 'urn:va:problem:SITE:239:773',
                            'name': 'Hyperlipidemia Icd 9 Cm 272 4 - #1'
                        }, {
                            'code': 'urn:va:problem:SITE:239:773',
                            'name': 'Hyperlipidemia Icd 9 Cm 272 4 - #2'
                        }],
                        'earliestDate': '01/12/2017',
                        'executionDateTime': '20170112151048+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000271',
                        'executionUserName': 'XIU, MARGARET',
                        'facility': {
                            'code': '500',
                            'name': 'PANORAMA'
                        },
                        'latestDate': '02/11/2017',
                        'orderResultComment': 'This is an explanation for Rheumatiod Factor to explain the Satisfied response.',
                        'orderResults': [{
                            'ien': '239',
                            'orderName': 'C Reactive Protein - #1',
                            'signalRegistered': true,
                            'status': 'urn:va:order-status:comp - #1',
                            'statusDate': '20170112161021+0000',
                            'uid': 'urn:va:ehmp-order:SITE:239:98c0b603-18eb-4f5e-8a3e-416147d355d3'
                        }, {
                            'ien': '252',
                            'orderName': 'Rheumatoid Factor - #2',
                            'status': 'Satisfied - #2',
                            'statusDate': '',
                            'uid': 'null'
                        }],
                        'orderable': {
                            'data': {
                                'activity': {
                                    'deploymentId': 'VistaCore:Order',
                                    'processDefinitionId': 'Order:Consult'
                                },
                                'codes': [{
                                    'code': '415279002',
                                    'display': 'Referral to rheumatology clinic',
                                    'system': 'urn:oid:2.16.840.1.113883.6.96'
                                }],
                                'instructions': 'Rheumatoid arthritis (RA) is a chronic, systemic, inflammatory disorder of unknown etiology that primarily involves synovial joints. The arthritis is typically symmetrical, and usually leads, if uncontrolled, to destruction of joints due to erosion of cartilage and bone, causing joint deformities.\n\nDisease Activity Score Calculator for Rheumatoid Arthritis \n\nhttp://www.4s-dawn.com/DAS28/\n\nSmoking can trigger and perpetuate Rheumatoid Arthritis Inflammation. Please refer your patient for Smoking Cessation.',
                                'prerequisites': {
                                    'cdsIntent': 'RheumatologyConsultScreen',
                                    'ehmp-questionnaire': {
                                        'observation-results': [{
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': '4461E7DA-1629-464A-91D5-02DFF7648898',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': '88d89788-1d4f-4419-a7c4-796ba8869016',
                                                'observable': '339c876c-15a1-4975-ae29-d4815aef242c',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                                'timing': '[2016.03.3.29T16:50:39, 2016.03.29T16:50:40]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }, {
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': '4F49C2CE-FAE5-4385-A76C-B43DADB34B32',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': 'c4828d28-8d64-4b3e-81c4-a9c00921d412',
                                                'observable': '86703071-0f81-411a-82f8-8ac28be46ef1',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                                'timing': '[2016.01.30T16:50:39, 2016.03.29T16:50:40]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }, {
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': 'F61AFA3D-BCA0-4E93-8B21-8CD560B9C8CA',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': '7831e8cd-bb5d-4d22-8010-3496a06a7bb1',
                                                'observable': 'b3abf762-1893-40a6-aea2-51139e5dd7f3',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                                'timing': '[2016.01.30T16:50:39, 2016.03.29T16:50:39]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }]
                                    }
                                },
                                'teamFocus': {
                                    'code': 75,
                                    'name': 'Rheumatology'
                                }
                            },
                            'domain': 'ehmp-activity',
                            'facility-enterprise': 'enterprise',
                            'name': 'Rheumatology',
                            'questions': [{
                                'label': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                'name': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }, {
                                'label': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                'name': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }, {
                                'label': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                'name': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }],
                            'state': 'active',
                            'subDomain': 'consult',
                            'type': 'ehmp-enterprise-orderable',
                            'uid': 'urn:va:entordrbls:2'
                        },
                        'overrideReason': 'Question 2 Override reason...This could also be used for a Lab override reason.',
                        'questions': [{
                            'answer': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                            'question': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?'
                        }, {
                            'answer': '3E8DD206-FBDF-4478-9B05-7638682DD102',
                            'question': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?'
                        }, {
                            'answer': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                            'question': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N'
                        }],
                        'request': 'This is the Reason for request (Request) entry',
                        'urgency': 9,
                        'visit': {
                            'dateTime': '20170112093600',
                            'location': 'urn:va:location:SITE:64',
                            'locationDesc': 'Audiology',
                            'serviceCategory': 'I'
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': 'Doe, Jane',
                            'uid': 'urn:va:user:SITE:100:100'
                        },
                        'action': 'accepted',
                        'cdsIntentResult': {
                            'data': {
                                'results': [{
                                    'coding': {
                                        'code': '55235003',
                                        'display': 'C Reactive Protein',
                                        'system': 'http://snomed.org'
                                    },
                                    'detail': {
                                        'comments': 'C Reactive Protein',
                                        'identifier': [{
                                            'system': 'http://snomed.org',
                                            'value': '55235003'
                                        }],
                                        'resourceType': 'Observation',
                                        'status': 'final'
                                    },
                                    'duration': '60d',
                                    'remediation': {
                                        'action': 'order',
                                        'coding': {
                                            'code': 'urn:va:oi:239',
                                            'display': 'C Reactive Protein',
                                            'system': 'urn:oid:2.16.840.1.113883.6.233:SITE'
                                        },
                                        'domain': 'lab'
                                    },
                                    'status': 'Failed'
                                }, {
                                    'coding': {
                                        'code': '415301001',
                                        'display': 'Rheumatoid Factor',
                                        'system': 'http://snomed.org'
                                    },
                                    'detail': {
                                        'comments': 'Rheumatoid Factor',
                                        'identifier': [{
                                            'system': 'http://snomed.org',
                                            'value': '415301001'
                                        }],
                                        'resourceType': 'Observation',
                                        'status': 'final'
                                    },
                                    'duration': '60d',
                                    'remediation': {
                                        'action': 'order',
                                        'coding': {
                                            'code': 'urn:va:oi:252',
                                            'display': 'Rheumatoid Factor',
                                            'system': 'urn:oid:2.16.840.1.113883.6.233:SITE'
                                        },
                                        'domain': 'lab'
                                    },
                                    'status': 'Failed'
                                }],
                                'status': {
                                    'code': '0',
                                    'httpStatus': 'OK'
                                }
                            },
                            'status': 200
                        },
                        'comment': 'This is the Comment (clinical history) entry - #2',
                        'conditions': [{
                            'code': 'urn:va:problem:SITE:239:773',
                            'name': 'Hyperlipidemia Icd 9 Cm 272 4 - #100'
                        }, {
                            'code': 'urn:va:problem:SITE:239:773',
                            'name': 'Hyperlipidemia Icd 9 Cm 272 4 - #200'
                        }],
                        'earliestDate': '01/12/2017',
                        'executionDateTime': '20170112161157+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000271',
                        'executionUserName': 'XIU, MARGARET',
                        'facility': {
                            'code': '500',
                            'name': 'PANORAMA'
                        },
                        'latestDate': '02/11/2017',
                        'orderResultComment': 'This is an explanation for Rheumatiod Factor to explain the Satisfied response.\nThis is updated after the Lab results were received',
                        'orderResults': [{
                            'ien': '239',
                            'orderName': 'C Reactive Protein - #10',
                            'status': 'urn:va:order-status:comp - #10',
                            'statusDate': '20170112161021+0000',
                            'uid': 'urn:va:ehmp-order:SITE:239:98c0b603-18eb-4f5e-8a3e-416147d355d3'
                        }, {
                            'ien': '252',
                            'orderName': 'Rheumatoid Factor - #20',
                            'status': 'Satisfied - #20',
                            'statusDate': '',
                            'uid': 'null'
                        }],
                        'orderable': {
                            'data': {
                                'activity': {
                                    'deploymentId': 'VistaCore:Order',
                                    'processDefinitionId': 'Order:Consult'
                                },
                                'codes': [{
                                    'code': '415279002',
                                    'display': 'Referral to rheumatology clinic',
                                    'system': 'urn:oid:2.16.840.1.113883.6.96'
                                }],
                                'instructions': 'Rheumatoid arthritis (RA) is a chronic, systemic, inflammatory disorder of unknown etiology that primarily involves synovial joints. The arthritis is typically symmetrical, and usually leads, if uncontrolled, to destruction of joints due to erosion of cartilage and bone, causing joint deformities.\n\nDisease Activity Score Calculator for Rheumatoid Arthritis \n\nhttp://www.4s-dawn.com/DAS28/\n\nSmoking can trigger and perpetuate Rheumatoid Arthritis Inflammation. Please refer your patient for Smoking Cessation.',
                                'prerequisites': {
                                    'cdsIntent': 'RheumatologyConsultScreen',
                                    'ehmp-questionnaire': {
                                        'observation-results': [{
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': '4461E7DA-1629-464A-91D5-02DFF7648898',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': '88d89788-1d4f-4419-a7c4-796ba8869016',
                                                'observable': '339c876c-15a1-4975-ae29-d4815aef242c',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                                'timing': '[2016.03.3.29T16:50:39, 2016.03.29T16:50:40]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }, {
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': '4F49C2CE-FAE5-4385-A76C-B43DADB34B32',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': 'c4828d28-8d64-4b3e-81c4-a9c00921d412',
                                                'observable': '86703071-0f81-411a-82f8-8ac28be46ef1',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                                'timing': '[2016.01.30T16:50:39, 2016.03.29T16:50:40]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }, {
                                            'observation-result': {
                                                'derived-from': {
                                                    'form': '4F4723CF-E537-4257-98DB-8754665E6A93',
                                                    'item': 'F61AFA3D-BCA0-4E93-8B21-8CD560B9C8CA',
                                                    'version': {
                                                        'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                        'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                        'time': '2016.03.29T16:00:00'
                                                    }
                                                },
                                                'episodicity': '',
                                                'lego-id': '7831e8cd-bb5d-4d22-8010-3496a06a7bb1',
                                                'observable': 'b3abf762-1893-40a6-aea2-51139e5dd7f3',
                                                'provenance': 'ed2f734a-9196-3410-ae04-751808edf584',
                                                'question-text': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                                'timing': '[2016.01.30T16:50:39, 2016.03.29T16:50:39]',
                                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                                                'version': {
                                                    'module': '4BAF7D55-E9BE-4CC5-BFF0-BAEE985DCDC4',
                                                    'path': '2BBF7E6B-EEE3-4C10-98D4-5307A35B27AA',
                                                    'time': '2016.03.29T16:00:00'
                                                }
                                            }
                                        }]
                                    }
                                },
                                'teamFocus': {
                                    'code': 75,
                                    'name': 'Rheumatology'
                                }
                            },
                            'domain': 'ehmp-activity',
                            'facility-enterprise': 'enterprise',
                            'name': 'Rheumatology',
                            'questions': [{
                                'label': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                'name': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }, {
                                'label': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                'name': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }, {
                                'label': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                'name': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N',
                                'value': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3'
                            }],
                            'state': 'active',
                            'subDomain': 'consult',
                            'type': 'ehmp-enterprise-orderable',
                            'uid': 'urn:va:entordrbls:2'
                        },
                        'overrideReason': 'Question 2 Override reason...This could also be used for a Lab override reason.\nThis is updated after the Lab results were received...',
                        'questions': [{
                            'answer': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                            'question': 'Has patient been informed to bring a copy of all external reports and radiology images to their consult visit?'
                        }, {
                            'answer': '3E8DD206-FBDF-4478-9B05-7638682DD102',
                            'question': 'Has the patient been tried on a regime of antiinflamatory medications for at least 4 weeks?'
                        }, {
                            'answer': 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                            'question': 'Has the patient had recent (last 60 days) Xrays of any effected joint? Y/N'
                        }],
                        'request': 'This is the Reason for request (Request) entry',
                        'urgency': 9
                    }],
                    'milestones': [{
                        'name': 'Order Date',
                        'startDateTime': '20170112161157+0000'
                    }],
                    'order': {
                        'facility': {
                            'code': '500',
                            'name': 'PANORAMA'
                        },
                        'flag': false,
                        'orderDate': '20170112161157+0000',
                        'orderName': 'Rheumatology',
                        'provider': {
                            'displayName': 'XIU, MARGARET',
                            'uid': 'urn:va:user:SITE:10000000271'
                        },
                        'startDate': '20170112151048+0000',
                        'status': 'UNRELEASED',
                        'type': 'Consult-eHMP'
                    },
                    'schedules': [{
                        'actionId': '1',
                        'actionText': 'Scheduled',
                        'appointment': {
                            'clinic': {
                                'code': 'CARDIOLOGY',
                                'name': 'CARDIOLOGY'
                            },
                            'date': '04/12/2017',
                            'ewl': false,
                            'provider': 'USER, PANORAMA',
                            'status': {
                                'id': '2',
                                'name': 'Scheduled'
                            },
                            'type': {
                                'id': '1',
                                'name': 'VA'
                            }
                        },
                        'comment': 'magnus4',
                        'contactAttempt': 'First Attempt',
                        'executionDateTime': '20170412203406+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000272',
                        'executionUserName': 'LAST,FIRST'
                    }, {
                        'actionId': '2',
                        'actionText': 'Scheduled',
                        'appointment': {
                            'clinic': {
                                'code': 'CARDIOLOGY',
                                'name': 'CARDIOLOGY'
                            },
                            'date': '04/12/2017',
                            'ewl': false,
                            'provider': 'USER, PANORAMA',
                            'status': {
                                'id': '2',
                                'name': 'Scheduled'
                            },
                            'type': {
                                'id': '1',
                                'name': 'VA'
                            }
                        },
                        'comment': 'magnus5',
                        'contactAttempt': 'Second Attempt',
                        'executionDateTime': '20170412203406+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000272',
                        'executionUserName': 'LAST,FIRST'
                    }],
                    'signals': [{
                        'executionUserName': 'USER,PANORAMA',
                        'executionUserId': 'SITE;10000000270',
                        'data': {
                            'reason': 'By Ordering Provider',
                            'comment': 'testing discontinue 1',
                            'executionUserId': 'SITE;10000000270',
                            'executionUserName':'USER,PANORAMA'},
                        'name': 'END',
                        'executionDateTime': '20170516162742+0000'
                    }, {
                        'executionUserName': 'USER,PANORAMA',
                        'executionUserId': 'SITE;10000000270',
                        'data': {
                            'reason': 'By Ordering Provider',
                            'comment': 'testing discontinue 2',
                            'executionUserId': 'SITE;10000000270',
                            'executionUserName':'USER,PANORAMA'},
                        'name': 'END',
                        'executionDateTime': '20170516162742+0000'
                    }],
                    'triages': [{
                        'actionId': '1',
                        'actionText': 'Send to Scheduling',
                        'appointment': {
                            'ewl': false,
                            'status': {
                                'id': '1',
                                'name': 'Pending'
                            },
                            'type': {
                                'id': '1',
                                'name': 'VA'
                            }
                        },
                        'comment': 'magnus3',
                        'executionDateTime': '20170412203318+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000272',
                        'executionUserName': 'LAST,FIRST'
                    }, {
                        'actionId': '1',
                        'actionText': 'Send to Scheduling',
                        'appointment': {
                            'ewl': false,
                            'status': {
                                'id': '1',
                                'name': 'Pending'
                            },
                            'type': {
                                'id': '1',
                                'name': 'VA'
                            }
                        },
                        'comment': 'magnus4',
                        'executionDateTime': '20170412203318+0000',
                        'executionUserId': 'urn:va:user:SITE:10000000272',
                        'executionUserName': 'LAST,FIRST'
                    }]
                },
                'displayName': 'Rheumatology',
                'domain': 'ehmp-activity',
                'ehmpState': 'active',
                'patientUid': 'urn:va:patient:SITE:239:239',
                'referenceId': '',
                'subDomain': 'consult',
                'uid': 'urn:va:ehmp-activity:SITE:239:29fe0301-14ac-4d8d-95a9-9f538866beba',
                'visit': {
                    'dateTime': '20170112093600',
                    'location': 'urn:va:location:SITE:64',
                    'locationDesc': 'Audiology',
                    'serviceCategory': 'I'
                }
            };
            var solrRecord = xformer(vprRecord, log);

            // Verify Common Fields - Also verify that we did not pick up any common fields we do not expect
            //----------------------------------------------------------------------------------------------
            expect(solrRecord.uid).toBe(vprRecord.uid);
            expect(solrRecord.pid).toBe('SITE;239');
            expect(solrRecord.facility_code).toBeUndefined();
            expect(solrRecord.facility_name).toBeUndefined();
            expect(solrRecord.kind).toBeUndefined();
            expect(solrRecord.summary).toBeUndefined();
            expect(solrRecord.codes_code).toBeUndefined();
            expect(solrRecord.codes_system).toBeUndefined();
            expect(solrRecord.codes_display).toBeUndefined();
            expect(solrRecord.entered).toBeUndefined();
            expect(solrRecord.verified).toBeUndefined();

            // Verify EHMP Activity - Consult Specific Fields
            //------------------------------------------------
            expect(solrRecord.domain).toBe('ehmp-activity');
            expect(solrRecord.sub_domain).toBe('consult');
            expect(solrRecord.consult_name).toBe(vprRecord.displayName);
            expect(solrRecord.consult_orders_override_reason).toBe(vprRecord.data.consultOrders[1].overrideReason);
            expect(solrRecord.consult_orders_order_result_comment).toBe(vprRecord.data.consultOrders[1].orderResultComment);
            expect(solrRecord.consult_orders_conditions).toEqual([vprRecord.data.consultOrders[1].conditions[0].name, vprRecord.data.consultOrders[1].conditions[1].name]);
            expect(solrRecord.consult_orders_request).toBe(vprRecord.data.consultOrders[1].request);
            expect(solrRecord.consult_orders_comment).toEqual([vprRecord.data.consultOrders[0].comment, vprRecord.data.consultOrders[1].comment]);
            expect(solrRecord.consult_orders_accepting_provider_uid).toBe(vprRecord.data.consultOrders[1].acceptingProvider.uid);
            expect(solrRecord.consult_orders_accepting_provider_display_name).toBe(vprRecord.data.consultOrders[1].acceptingProvider.displayName);
            expect(solrRecord.consult_orders_order_results_order_name).toEqual([vprRecord.data.consultOrders[1].orderResults[0].orderName, vprRecord.data.consultOrders[1].orderResults[1].orderName]);
            expect(solrRecord.consult_orders_order_results_order_status).toEqual([vprRecord.data.consultOrders[1].orderResults[0].status, vprRecord.data.consultOrders[1].orderResults[1].status]);
            expect(solrRecord.consult_orders_accepted_date).toEqual(vprRecord.data.consultOrders[1].executionDateTime);
            expect(solrRecord.activity_process_instance_id).toEqual(vprRecord.data.activity.processInstanceId);
            expect(solrRecord.activity_source_facility_id).toEqual(vprRecord.data.activity.sourceFacilityId);
            expect(solrRecord.schedules_comment).toEqual([vprRecord.data.schedules[0].comment, vprRecord.data.schedules[1].comment]);
            expect(solrRecord.triages_comment).toEqual([vprRecord.data.triages[0].comment, vprRecord.data.triages[1].comment]);
            expect(solrRecord.signals_data_comment).toBe(vprRecord.data.signals[1].data.comment);
        });
    });
});