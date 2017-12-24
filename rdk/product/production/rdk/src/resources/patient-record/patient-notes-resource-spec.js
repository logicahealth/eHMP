'use strict';

var patientNotesResource = require('./patient-notes-resource');
var httpUtil = require('../../core/rdk').utils.http;
var req;
var sampleNote;
var sampleNoteWithAddendum;
var sampleCPRSAddendum;

describe('The patient-notes-resource', function() {
    beforeEach(function() {
        req = {
            query: {
                localPid: 'SITE;3'
            },
            session: {
                user: {
                    site: 'SITE',
                    duz: {
                        'SITE': '10000000270',
                        'SITE': 'duz2'
                    },
                    division: '500'
                }
            },
            interceptorResults: {
                patientIdentifiers: {
                    site: 'SITE',
                    dfn: '3',
                    uids: ['urn:va:patient:SITE:3:3', 'urn:va:patient:icn:321V123:321V123']
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
            'authorUid': 'urn:va:user:SITE:10000000270',
            'data': {
                '_labelsForSelectedValues': {
                    'documentDefUidUnique': 'FALL  <FALL RISK>'
                },
                'app': 'ehmp',
                'author': 'PROVIDER,EIGHT',
                'authorDisplayName': 'Provider,Eight',
                'authorUid': 'urn:va:user:SITE:10000000270',
                'derivReferenceDate': '02/02/2016',
                'derivReferenceTime': '18:47',
                'documentClass': 'PROGRESS NOTES',
                'documentDefUid': 'urn:va:doc-def:SITE:832',
                'documentDefUidUnique': 'urn:va:doc-def:SITE:832---FALL__<FALL_RISK>---last',
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
                'pid': 'SITE;3',
                'referenceDateTime': '201602021847',
                'signedDateTime': null,
                'signer': null,
                'signerDisplayName': null,
                'signerUid': null,
                'siteHash': 'SITE',
                'status': 'UNSIGNED',
                'statusDisplayName': 'Unsigned',
                'summary': '',
                'text': [{
                    'author': 'PROVIDER,EIGHT',
                    'authorDisplayName': 'PROVIDER,EIGHT',
                    'authorUid': 'urn:va:user:SITE:991',
                    'content': 'test',
                    'dateTime': '2016-02-02T18:47:36-05:00',
                    'signer': null,
                    'signerDisplayName': null,
                    'signerUid': null,
                    'status': 'UNSIGNED'
                }],
                'value': true
            },
            'domain': 'ehmp-note',
            'patientUid': 'SITE;3',
            'referenceId': null,
            'subDomain': 'tiu',
            'uid': 'urn:va:ehmp-note:SITE;3:98a309a4-1b97-4b35-b66a-0d631cac6512',
            'visit': {
                'dateTime': '20160101080000',
                'location': 'urn:va:location:SITE:64',
                'serviceCategory': 'A'
            }
        };

        sampleNoteWithAddendum = {
          'author':'LAST,FIRST',
          'authorDisplayName':'LAST,FIRST',
          'authorUid':'urn:va:user:SITE:10000000272',
          'documentClass':'PROGRESS NOTES',
          'documentDefUid':'urn:va:doc-def:SITE:20',
          'documentTypeCode':'C',
          'documentTypeName':'Crisis Note',
          'encounterName':'7A GEN MED Aug 14, 2014',
          'encounterUid':'urn:va:visit:SITE:3:11420',
          'entered':'20160224133357',
          'facilityCode':'998',
          'facilityName':'ABILENE (CAA)',
          'isInterdisciplinary':'false',
          'kind':'Crisis Note',
          'lastUpdateTime':'20160224133357',
          'localId':'11685',
          'localTitle':'CRISIS NOTE',
          'pid':'SITE;3',
          'referenceDateTime':'201602241333',
          'signedDateTime':'20160224133357',
          'signer':'LAST,FIRST',
          'signerDisplayName':'LAST,FIRST',
          'signerUid':'urn:va:user:SITE:10000000272',
          'stampTime':'20160224133357',
          'status':'COMPLETED',
          'statusDisplayName':'Completed',
          'summary':'CRISIS NOTE',
          'uid':'urn:va:ehmp-note:SITE;3:66dda7d5-a67b-4f83-9436-c7315a83e035',
          'clinicalObject':{
             'addendum':{
                'author':'LAST,FIRST',
                'authorDisplayName':'LAST,FIRST',
                'authorUid':'urn:va:user:SITE:10000000272',
                'encounterDateTime':'',
                'encounterName':'7A GEN MED Aug 14, 2014',
                'encounterServiceCategory':'D',
                'encounterUid':'urn:va:visit:SITE:3:11420',
                'entered':'20150223131640',
                'isInterdisciplinary':'false',
                'lastUpdateTime':'20150223131640',
                'localTitle':'Addendum to: CRISIS NOTE',
                'locationUid':'urn:va:location:SITE:38',
                'noteType':'ADDENDUM',
                'parentUid':'urn:va:document:SITE:3:11685',
                'pid':'SITE;3',
                'referenceDateTime':'20160222121938',
                'status':'UNSIGNED',
                'statusDisplayName':'Unsigned',
                'text':[
                   {
                      'author':'LAST,FIRST',
                      'authorDisplayName':'LAST,FIRST',
                      'authorUid':'urn:va:user:SITE:10000000272',
                      'content':'This is my unsigned addendum\r\n',
                      'dateTime':'2016-02-02T18:47:36-05:00',
                      'status':'UNSIGNED'
                   }
                ]
             },
             'authorUid':'urn:va:user:SITE:10000000272',
             'creationDateTime':'20160224191442+0000',
             'domain':'note',
             'ehmpState':'draft',
             'patientUid':'SITE;3',
             'referenceId':'urn:va:document:SITE:3:11685',
             'subDomain':'addendum',
             'uid':'urn:va:ehmp-note:SITE;3:66dda7d5-a67b-4f83-9436-c7315a83e035',
             'visit':{
                'dateTime':'20140814130730',
                'location':'urn:va:location:SITE:38',
                'serviceCategory':'D'
             }
          }
       };

        sampleCPRSAddendum = {
          'author': 'LAST,FIRST',
          'authorDisplayName': 'LAST,FIRST',
          'authorUid': 'urn:va:user:SITE:10000000272',
          'clinicians': [
            {
              'displayName': 'Vk',
              'name': 'VK',
              'role': 'E',
              'uid': 'urn:va:user:SITE:10000000272'
            },
            {
              'displayName': 'LAST,FIRST',
              'name': 'LAST,FIRST',
              'role': 'AU',
              'uid': 'urn:va:user:SITE:10000000272'
            },
            {
              'displayName': 'LAST,FIRST',
              'name': 'LAST,FIRST',
              'role': 'S',
              'signature': 'LAST,FIRST',
              'signedDateTime': '20160228144041',
              'uid': 'urn:va:user:SITE:10000000272'
            },
            {
              'displayName': 'LAST,FIRST',
              'name': 'LAST,FIRST',
              'role': 'ES',
              'uid': 'urn:va:user:SITE:10000000272'
            }
          ],
          'content': 'This is VKs signed addendum from CPRS.\r\n',
          'dateTime': '20160228144019',
          'signer': 'LAST,FIRST',
          'signerDisplayName': 'LAST,FIRST',
          'signerUid': 'urn:va:user:SITE:10000000272',
          'status': 'COMPLETED',
          'uid': 'urn:va:document:SITE:204:11686'
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
                        site: 'SITE',
                        duz: {
                            'SITE': '123'
                        }
                    }
                }
            };
            expect(patientNotesResource._getCurrentUserId(mockReq)).to.eql('urn:va:user:SITE:123');
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
                documentDefUid: 'urn:va:doc-def:SITE:40'
            };
            expect(patientNotesResource._getDocumentDefUidUnique(note, 'all')).to.eql('urn:va:doc-def:SITE:40---ADDICTION---all');
        });
        it('test with spaces in the title', function() {
            var note = {
                localTitle: 'ADDICTION  <ASI-ADDICTION SEVERITY INDEX>',
                documentDefUid: 'urn:va:doc-def:SITE:40'
            };
            expect(patientNotesResource._getDocumentDefUidUnique(note, 'all')).to.eql('urn:va:doc-def:SITE:40---ADDICTION__<ASI-ADDICTION_SEVERITY_INDEX>---all');
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
                expect(results.notes[0].uid).to.equal('urn:va:ehmp-note:SITE;3:98a309a4-1b97-4b35-b66a-0d631cac6512');
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
            req.query.localPid = 'SITE;8';
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
    describe('Verify createModelForUnsignedAddendum', function() {
        it('returns a model with the expected properties', function() {
            var result = patientNotesResource._createModelForUnsignedAddendum(req.logger, sampleNoteWithAddendum);
            expect(result.app).to.equal('ehmp');
            expect(result.referenceId).to.equal(sampleNoteWithAddendum.clinicalObject.referenceId);
            expect(result.uid).to.equal(sampleNoteWithAddendum.clinicalObject.uid);
            expect(result.statusDisplayName).to.equal('Unsigned');
            expect(result.clinicalObject.uid).to.equal(sampleNoteWithAddendum.clinicalObject.uid);
        });
    });
    describe('Verify createModelForDocumentAddendum', function() {
        it('returns a model with expected properties', function() {
            var result = patientNotesResource._createModelForDocumentAddendum(req.logger, sampleCPRSAddendum, sampleNote);
            expect(result.app).to.equal('vista');
            expect(result.documentDefUid).to.equal(sampleNote.documentDefUid);
            expect(result.localTitle).to.equal('Addendum to: ' +sampleNote.localTitle);
            expect(result.noteType).to.equal('ADDENDUM');
            expect(result.parentUid).to.equal(sampleNote.uid);
            expect(result.pid).to.equal(sampleNote.pid);
            expect(result.referenceDateTime).to.equal(sampleCPRSAddendum.dateTime);

        });
    });
});


