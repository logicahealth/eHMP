'use strict';

var documentSignatures = require('./patient-record-document-view-signatures');
var httpUtil = require('../../core/rdk').utils.http;
var req;
var sampleSigner;
var sampleCosigner;
var documentResponse;

describe('The patient-record-document-view-signatures', function() {
    beforeEach(function() {
        req = {
            query: {
                visitLocation: 'urn:va:location:9E7A:64',
                visitDateTime: '20160101080000',
                visitServiceCategory: 'A',
                pid: '9E7A;3'
            },
            session: {
                user: {
                    site: '9E7A',
                    duz: {
                        '9E7A': '10000000270',
                        'C77A': 'duz2'
                    },
                }
            },
            app: {
                config: {
                    jdsServer: {
                        baseUrl: ''
                    }
                }
            },
            logger: sinon.stub(require('bunyan').createLogger({
                name: 'patient-notes-resource'
            })),
            interceptorResults: {
                patientIdentifiers: {
                    dfn: '3'
                }
            }
        };

        sampleSigner = {
            'apiVersion': '1.0',
            'data': {
                'updated': 20160331101354,
                'totalItems': 2,
                'currentItemCount': 2,
                'items': [
                    {
                        'intial': 'P8',
                        'localId': 991,
                        'name': 'PROVIDER,EIGHT',
                        'providerClass': 'FELLOW',
                        'providerType': 'FULL TIME',
                        'service': 'MEDICINE',
                        'signaturePrintedName': 'EIGHT PROVIDER',
                        'signatureTitle': 'MD',
                        'ssn': 666000012,
                        'stampTime': 20160329075007,
                        'title': 'Physician',
                        'uid': 'urn:va:user:9E7A:991'
                    }
                ]
            }
        };

        sampleCosigner = {
            'apiVersion': '1.0',
            'data': {
                'updated': 20160331101354,
                'totalItems': 2,
                'currentItemCount': 2,
                'items': [
                    {
                        'genderCode': 'urn:va:gender:M',
                        'genderName': 'MALE',
                        'intial': 'SS',
                        'localId': 11736,
                        'name': 'RADTECH,TWENTY',
                        'service': 'MEDICINE',
                        'signaturePrintedName': 'TWENTY RADTECH',
                        'signatureTitle': 'MEDICAL STUDENT',
                        'ssn': 666000634,
                        'stampTime': 20160329075007,
                        'title': 'MEDICAL STUDENT',
                        'uid': 'urn:va:user:9E7A:11736'
                    }
                ]
            }
        };

        documentResponse = {
            data: {
                items: [{
                    'author': 'PROVIDER,EIGHT',
                    'authorDisplayName': 'Provider,Eight',
                    'authorUid': 'urn:va:user:9E7A:991',
                    'clinicians': [
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'AU',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'S',
                            'signature': 'EIGHT PROVIDER MD',
                            'signedDateTime': '20160329110512',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'ES',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'P8',
                            'name': 'P8',
                            'role': 'E',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        }
                    ],
                    'documentClass': 'PROGRESS NOTES',
                    'documentDefUid': 'urn:va:doc-def:9E7A:20',
                    'documentTypeCode': 'C',
                    'documentTypeName': 'Crisis Note',
                    'encounterName': '7A GEN MED Aug 14, 2014',
                    'encounterUid': 'urn:va:visit:9E7A:3:11420',
                    'entered': '201603291105',
                    'facilityCode': '998',
                    'facilityName': 'ABILENE (CAA)',
                    'isInterdisciplinary': 'false',
                    'kind': 'Crisis Note',
                    'lastUpdateTime': '20160329110512',
                    'localId': '11737',
                    'localTitle': 'CRISIS NOTE',
                    'pid': '9E7A;3',
                    'referenceDateTime': '201603291104',
                    'signedDateTime': '20160329110512',
                    'signer': 'PROVIDER,EIGHT',
                    'signerDisplayName': 'Provider,Eight',
                    'signerUid': 'urn:va:user:9E7A:991',
                    'stampTime': '20160329110512',
                    'status': 'COMPLETED',
                    'statusDisplayName': 'Completed',
                    'summary': 'CRISIS NOTE',
                    'text': [
                        {
                            'author': 'PROVIDER,EIGHT',
                            'authorDisplayName': 'Provider,Eight',
                            'authorUid': 'urn:va:user:9E7A:991',
                            'clinicians': [
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'AU',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'S',
                                    'signature': 'EIGHT PROVIDER MD',
                                    'signedDateTime': '20160329110512',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'ES',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'P8',
                                    'name': 'P8',
                                    'role': 'E',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                }
                            ],
                            'content': 'afadsfaffd adfasdf adf asdf\r\n',
                            'dateTime': '201603291104',
                            'signer': 'PROVIDER,EIGHT',
                            'signerDisplayName': 'Provider,Eight',
                            'signerUid': 'urn:va:user:9E7A:991',
                            'status': 'COMPLETED',
                            'summary': 'DocumentText{uid="urn:va:document:9E7A:3:11737"}',
                            'uid': 'urn:va:document:9E7A:3:11737'
                        }
                    ],
                    'uid': 'urn:va:document:9E7A:3:11737'
                },
                {
                    'author': 'PROVIDER,EIGHT',
                    'authorDisplayName': 'Provider,Eight',
                    'authorUid': 'urn:va:user:9E7A:991',
                    'clinicians': [
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'AU',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'S',
                            'signature': 'EIGHT PROVIDER MD',
                            'signedDateTime': '20160329110819',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'ES',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'P8',
                            'name': 'P8',
                            'role': 'E',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        }
                    ],
                    'documentClass': 'PROGRESS NOTES',
                    'documentDefUid': 'urn:va:doc-def:9E7A:20',
                    'documentTypeCode': 'C',
                    'documentTypeName': 'Crisis Note',
                    'encounterName': '7A GEN MED Aug 14, 2014',
                    'encounterUid': 'urn:va:visit:9E7A:3:11420',
                    'entered': '20160329110810',
                    'facilityCode': '998',
                    'facilityName': 'ABILENE (CAA)',
                    'isInterdisciplinary': 'false',
                    'kind': 'Crisis Note',
                    'lastUpdateTime': '20160329110819',
                    'localId': '11738',
                    'localTitle': 'CRISIS NOTE',
                    'pid': '9E7A;3',
                    'referenceDateTime': '201603291108',
                    'signedDateTime': '20160329110819',
                    'signer': 'PROVIDER,EIGHT',
                    'signerDisplayName': 'Provider,Eight',
                    'signerUid': 'urn:va:user:9E7A:991',
                    'stampTime': '20160329110819',
                    'status': 'COMPLETED',
                    'statusDisplayName': 'Completed',
                    'summary': 'CRISIS NOTE',
                    'text': [
                        {
                            'author': 'PROVIDER,EIGHT',
                            'authorDisplayName': 'Provider,Eight',
                            'authorUid': 'urn:va:user:9E7A:991',
                            'clinicians': [
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'AU',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'S',
                                    'signature': 'EIGHT PROVIDER MD',
                                    'signedDateTime': '20160329110819',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'ES',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'P8',
                                    'name': 'P8',
                                    'role': 'E',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                }
                            ],
                            'content': 'abcded\r\n',
                            'dateTime': '201603291108',
                            'signer': 'PROVIDER,EIGHT',
                            'signerDisplayName': 'Provider,Eight',
                            'signerUid': 'urn:va:user:9E7A:991',
                            'status': 'COMPLETED',
                            'summary': 'DocumentText{uid="urn:va:document:9E7A:3:11738"}',
                            'uid': 'urn:va:document:9E7A:3:11738'
                        }
                    ],
                    'uid': 'urn:va:document:9E7A:3:11738'
                },
                {
                    'author': 'RADTECH,TWENTY',
                    'authorDisplayName': 'Radtech,Twenty',
                    'authorUid': 'urn:va:user:9E7A:11736',
                    'clinicians': [
                        {
                            'displayName': 'Radtech,Twenty',
                            'name': 'RADTECH,TWENTY',
                            'role': 'AU',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                            'uid': 'urn:va:user:9E7A:11736'
                        },
                        {
                            'displayName': 'Radtech,Twenty',
                            'name': 'RADTECH,TWENTY',
                            'role': 'S',
                            'signature': 'TWENTY RADTECH MEDICAL STUDENT',
                            'signedDateTime': '20160330083817',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                            'uid': 'urn:va:user:9E7A:11736'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'C',
                            'signature': 'EIGHT PROVIDER MD',
                            'signedDateTime': '20160330135254',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Radtech,Twenty',
                            'name': 'RADTECH,TWENTY',
                            'role': 'ES',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                            'uid': 'urn:va:user:9E7A:11736'
                        },
                        {
                            'displayName': 'Provider,Eight',
                            'name': 'PROVIDER,EIGHT',
                            'role': 'EC',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                            'uid': 'urn:va:user:9E7A:991'
                        },
                        {
                            'displayName': 'Ss',
                            'name': 'SS',
                            'role': 'E',
                            'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                            'uid': 'urn:va:user:9E7A:11736'
                        }
                    ],
                    'cosignedDateTime': '20160330135254',
                    'cosigner': 'PROVIDER,EIGHT',
                    'cosignerDisplayName': 'Provider,Eight',
                    'cosignerUid': 'urn:va:user:9E7A:991',
                    'documentClass': 'PROGRESS NOTES',
                    'documentDefUid': 'urn:va:doc-def:9E7A:40',
                    'documentTypeCode': 'PN',
                    'documentTypeName': 'Progress Note',
                    'encounterName': '7A GEN MED Aug 14, 2014',
                    'encounterUid': 'urn:va:visit:9E7A:3:11420',
                    'entered': '20160330083802',
                    'facilityCode': '998',
                    'facilityName': 'ABILENE (CAA)',
                    'isInterdisciplinary': 'false',
                    'kind': 'Progress Note',
                    'lastUpdateTime': '20160330150254',
                    'localId': '11741',
                    'localTitle': 'ASI-ADDICTION SEVERITY INDEX',
                    'pid': '9E7A;3',
                    'referenceDateTime': '201603300837',
                    'signedDateTime': '20160330083817',
                    'signer': 'RADTECH,TWENTY',
                    'signerDisplayName': 'Radtech,Twenty',
                    'signerUid': 'urn:va:user:9E7A:11736',
                    'stampTime': '20160330150254',
                    'status': 'COMPLETED',
                    'statusDisplayName': 'Completed',
                    'summary': 'ASI-ADDICTION SEVERITY INDEX',
                    'text': [
                        {
                            'author': 'RADTECH,TWENTY',
                            'authorDisplayName': 'Radtech,Twenty',
                            'authorUid': 'urn:va:user:9E7A:11736',
                            'clinicians': [
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'AU',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'S',
                                    'signature': 'TWENTY RADTECH MEDICAL STUDENT',
                                    'signedDateTime': '20160330083817',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'C',
                                    'signature': 'EIGHT PROVIDER MD',
                                    'signedDateTime': '20160330135254',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'ES',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'EC',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Ss',
                                    'name': 'SS',
                                    'role': 'E',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                }
                            ],
                            'content': 'test cosign note\r\n',
                            'cosigner': 'PROVIDER,EIGHT',
                            'cosignerDisplayName': 'Provider,Eight',
                            'cosignerUid': 'urn:va:user:9E7A:991',
                            'dateTime': '201603300837',
                            'signer': 'RADTECH,TWENTY',
                            'signerDisplayName': 'Radtech,Twenty',
                            'signerUid': 'urn:va:user:9E7A:11736',
                            'status': 'COMPLETED',
                            'summary': 'DocumentText{uid="urn:va:document:9E7A:3:11741"}',
                            'uid': 'urn:va:document:9E7A:3:11741'
                        },
                        {
                            'author': 'RADTECH,TWENTY',
                            'authorDisplayName': 'Radtech,Twenty',
                            'authorUid': 'urn:va:user:9E7A:11736',
                            'clinicians': [
                                {
                                    'displayName': 'Ss',
                                    'name': 'SS',
                                    'role': 'E',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'AU',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'S',
                                    'signature': 'RADTECH,TWENTY',
                                    'signedDateTime': '20160330150127',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'C',
                                    'signature': 'PROVIDER,EIGHT',
                                    'signedDateTime': '20160330150254',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                },
                                {
                                    'displayName': 'Radtech,Twenty',
                                    'name': 'RADTECH,TWENTY',
                                    'role': 'ES',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:11736"}',
                                    'uid': 'urn:va:user:9E7A:11736'
                                },
                                {
                                    'displayName': 'Provider,Eight',
                                    'name': 'PROVIDER,EIGHT',
                                    'role': 'EC',
                                    'summary': 'DocumentClinician{uid="urn:va:user:9E7A:991"}',
                                    'uid': 'urn:va:user:9E7A:991'
                                }
                            ],
                            'content': 'gavin lam addendum\r\n',
                            'cosigner': 'PROVIDER,EIGHT',
                            'cosignerDisplayName': 'Provider,Eight',
                            'cosignerUid': 'urn:va:user:9E7A:991',
                            'dateTime': '201603301501',
                            'signer': 'RADTECH,TWENTY',
                            'signerDisplayName': 'Radtech,Twenty',
                            'signerUid': 'urn:va:user:9E7A:11736',
                            'status': 'COMPLETED',
                            'summary': 'DocumentText{uid="urn:va:document:9E7A:3:11743"}',
                            'uid': 'urn:va:document:9E7A:3:11743'
                        }
                    ],
                    'uid': 'urn:va:document:9E7A:3:11741'
                }]
            }
        };
    });

    describe('addSignatures', function() {
        it('signaturePrintedName and signatureTitle are added to the clinician', function() {
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var err = null;
                var usersResponse = {
                    statusCode: 200
                };

                if (options.url === '/data/urn:va:user:9E7A:991') {
                    return callback(err, usersResponse, sampleSigner);
                } else {
                    return callback(err, usersResponse, sampleCosigner);
                }
            });
            documentSignatures.addSignatures(req, documentResponse, function(error, req, results) {
                expect(results.data.items[0].text[0].clinicians[1].signaturePrintedName).to.equal(undefined);
                expect(results.data.items[0].text[0].clinicians[1].signatureTitle).to.equal(undefined);
                expect(results.data.items[1].text[0].clinicians[1].signaturePrintedName).to.equal(undefined);
                expect(results.data.items[1].text[0].clinicians[1].signatureTitle).to.equal(undefined);
                expect(results.data.items[2].text[0].clinicians[1].signaturePrintedName).to.equal('TWENTY RADTECH');
                expect(results.data.items[2].text[0].clinicians[1].signatureTitle).to.equal('MEDICAL STUDENT');
                expect(results.data.items[2].text[0].clinicians[2].signaturePrintedName).to.equal('EIGHT PROVIDER');
                expect(results.data.items[2].text[0].clinicians[2].signatureTitle).to.equal('MD');
                expect(results.data.items[2].text[1].clinicians[2].signaturePrintedName).to.equal('TWENTY RADTECH');
                expect(results.data.items[2].text[1].clinicians[2].signatureTitle).to.equal('MEDICAL STUDENT');
                expect(results.data.items[2].text[1].clinicians[3].signaturePrintedName).to.equal('EIGHT PROVIDER');
                expect(results.data.items[2].text[1].clinicians[3].signatureTitle).to.equal('MD');
            });
        });

        it('signaturePrintedName and signatureTitle are not added to the clinician', function() {
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var err = 'this is an error';
                var usersResponse = {
                    statusCode: 500
                };
                return callback(err, usersResponse, sampleSigner);
            });
            documentSignatures.addSignatures(req, documentResponse, function(error, results) {
                expect(error).to.equal('this is an error');
                expect(results).to.equal(undefined);
            });
        });
    });
});
