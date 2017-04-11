'use strict';

var patientNotesResource = require('./patient-notes-resource');
var httpUtil = require('../../core/rdk').utils.http;
var req;
var sampleNote;

describe('The patient-notes-resource', function() {
    beforeEach(function() {
        req = {
            query: {
                localPid: '9E7A;3'
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
            }))
        };

        sampleNote = {
            'authorUid': 'urn:va:user:9E7A:10000000270',
            'data': {
                '_labelsForSelectedValues': {
                    'documentDefUidUnique': 'FALL  <FALL RISK>'
                },
                'app': 'ehmp',
                'author': 'PROVIDER,EIGHT',
                'authorDisplayName': 'Provider,Eight',
                'authorUid': 'urn:va:user:9E7A:10000000270',
                'derivReferenceDate': '02/02/2016',
                'derivReferenceTime': '18:47',
                'documentClass': 'PROGRESS NOTES',
                'documentDefUid': 'urn:va:doc-def:9E7A:832',
                'documentDefUidUnique': 'urn:va:doc-def:9E7A:832---FALL__<FALL_RISK>---last',
                'documentTypeName': 'Progress Note',
                'encounterDateTime': '',
                'encounterDisplayName': '7A GEN MED',
                'encounterName': '7A GEN MED',
                'entered': '20160202184736',
                'formUid': '0',
                'isInterdisciplinary': 'false',
                'lastSavedDisplayTime': '',
                'lastSavedTime': '20160202184736',
                'lastUpdateTime': '20160202184736',
                'localId': null,
                'localTitle': 'FALL  <FALL RISK>',
                'nationalTitle': {
                    'name': '',
                    'vuid': ''
                },
                'patientBirthDate': '19350407',
                'patientIcn': '10108V420871',
                'patientName': 'Eight,Patient',
                'patientStatus': 'INPATIENT',
                'pid': '9E7A;3',
                'referenceDateTime': '201602021847',
                'signedDateTime': null,
                'signer': null,
                'signerDisplayName': null,
                'signerUid': null,
                'siteHash': '9E7A',
                'status': 'UNSIGNED',
                'statusDisplayName': 'Unsigned',
                'summary': '',
                'text': [{
                    'author': 'PROVIDER,EIGHT',
                    'authorDisplayName': 'PROVIDER,EIGHT',
                    'authorUid': 'urn:va:user:9E7A:991',
                    'content': 'test',
                    'dateTime': '2016-02-02T18:47:36-05:00',
                    'signer': null,
                    'signerDisplayName': null,
                    'signerUid': null,
                    'status': 'UNSIGNED'
                }],
                'value': true
            },
            'domain': 'note',
            'patientUid': '9E7A;3',
            'referenceId': null,
            'subDomain': 'tiu',
            'uid': 'urn:va:ehmp:9E7A;3:98a309a4-1b97-4b35-b66a-0d631cac6512',
            'visit': {
                'dateTime': '20160101080000',
                'location': 'urn:va:location:9E7A:64',
                'serviceCategory': 'A'
            }
        };
    });

    describe('Verify custom date sort', function() {
        it('works on an empty set', function() {
            var notes = [];
            expect(patientNotesResource._customDateSort(notes)).to.eql([]);
        });
        it('works on a 1-item set', function() {
            var notes = [{
                entered: null,
                referenceDateTime: '201511010000'
            }];
            expect(patientNotesResource._customDateSort(notes)).to.eql([notes[0]]);
        });
        it('works on a multi-item set where some notes don\'t have a referenceDateTime', function() {
            var notes = [{
                entered: '201509010000',
                referenceDateTime: null
            }, {
                entered: '201509020000',
                referenceDateTime: null
            }, {
                entered: '201509030000',
                referenceDateTime: '201510010000'
            }, {
                entered: '201511020000',
                referenceDateTime: '201510020000'
            }, {
                entered: '201508040000',
                referenceDateTime: '201508010000'
            }];
            expect(patientNotesResource._customDateSort(notes)).to.eql([
                notes[1],
                notes[0],
                notes[3],
                notes[2],
                notes[4]
            ]);
        });
    });

    describe('Verify getUserId', function() {
        it('basic test', function() {
            var mockReq = {
                session: {
                    user: {
                        site: '9E7A',
                        duz: {
                            '9E7A': '123'
                        }
                    }
                }
            };
            expect(patientNotesResource._getCurrentUserId(mockReq)).to.eql('urn:va:user:9E7A:123');
        });
    });

    describe('Verify wrapItems', function() {
        it('basic test', function() {
            var items = [1, 2, 3, 4];
            expect(patientNotesResource._wrapItems(items)).to.eql({
                data: {
                    items: items
                }
            });
        });
    });

    describe('Verify getDocumentDefUidUnique', function() {
        it('basic test', function() {
            var note = {
                localTitle: 'ADDICTION',
                documentDefUid: 'urn:va:doc-def:9E7A:40'
            };
            expect(patientNotesResource._getDocumentDefUidUnique(note, 'all')).to.eql('urn:va:doc-def:9E7A:40---ADDICTION---all');
        });
        it('test with spaces in the title', function() {
            var note = {
                localTitle: 'ADDICTION  <ASI-ADDICTION SEVERITY INDEX>',
                documentDefUid: 'urn:va:doc-def:9E7A:40'
            };
            expect(patientNotesResource._getDocumentDefUidUnique(note, 'all')).to.eql('urn:va:doc-def:9E7A:40---ADDICTION__<ASI-ADDICTION_SEVERITY_INDEX>---all');
        });
    });

    describe('Verify getDocumentsFromPjds', function() {
        it('without errors', function() {
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var err = null;
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    items: [sampleNote]
                };
                return callback(err, fakeResponse, fakeBody);
            });
            patientNotesResource._getDocumentsFromPjds(req, function(error, results) {
                expect(results.notes[0].uid).to.equal('urn:va:ehmp:9E7A;3:98a309a4-1b97-4b35-b66a-0d631cac6512');
            });
        });

        it('with null clinical objects', function() {
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var err = null;
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {
                    items: null
                };
                return callback(err, fakeResponse, fakeBody);
            });
            patientNotesResource._getDocumentsFromPjds(req, function(error, results) {
                expect(results.notes.length).to.equal(0);
            });
        });

        it('with no notes', function() {
            req.query.localPid = '9E7A;8';
            sinon.stub(httpUtil, 'get', function(options, callback) {
                var err = null;
                var fakeResponse = {
                    statusCode: 200
                };
                var fakeBody = {};
                return callback(err, fakeResponse, fakeBody);
            });
            patientNotesResource._getDocumentsFromPjds(req, function(error, results) {
                expect(results.notes.length).to.equal(0);
            });
        });
    });
});
