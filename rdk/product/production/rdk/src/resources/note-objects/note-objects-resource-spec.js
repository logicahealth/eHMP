'use strict';

var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var noteObjectsResource = require('./note-objects-resource');
var httpUtil = require('../../core/rdk').utils.http;
var httpMocks = require('node-mocks-http');
var req;
var res;
var noteObjectResponse;

describe('The note-objects-madlib-generator', function() {
    var spyStatus;

    beforeEach(function() {
        req = {
            query: {
                visitLocation: '64',
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

        res = httpMocks.createResponse();
        res.rdkSend = sinon.spy();
        spyStatus = sinon.spy(res, 'status');

        noteObjectResponse = {
            data: {
                items: []
            }
        };
    });

    describe('getNoteObjects', function() {
             it('identifies missing Location parameter', function() {
            delete req.query.visitLocation;
            noteObjectsResource.getNoteObjects(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Missing visitLocation parameter')).to.be.true();
        });

        it('identifies missing visitDateTime parameter', function() {
            delete req.query.visitDateTime;
            noteObjectsResource.getNoteObjects(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Missing visitDateTime parameter')).to.be.true();
        });

        it('identifies missing visitServiceCategory parameter', function() {
            delete req.query.visitServiceCategory;
            noteObjectsResource.getNoteObjects(req, res);
            expect(spyStatus.calledWith(400)).to.be.true();
            expect(res.rdkSend.calledWith('Missing visitServiceCategory parameter')).to.be.true();
        });

        it('returns error message when clincialObjectsSubsystem.find returns an error', function() {
            sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, clinicalObjFilter, loadResource, callback) {
                var errorMessages = ['error'];
                return callback(errorMessages, spawnClinicalObject());
            });

            noteObjectsResource.getNoteObjects(req, res);
            expect(spyStatus.calledWith(500)).to.be.true();
            expect(res.rdkSend.calledWith(['error'])).to.be.true();
        });

        it('returns with no data when clincialObjectsSubsystem.find returns no Note Objects', function() {
            sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, clinicalObjFilter, loadResource, callback) {
                var noteObjects = {
                    items: []
                };
                return callback(null, noteObjects);
            });

            noteObjectsResource.getNoteObjects(req, res);
            expect(res.rdkSend.calledWith(noteObjectResponse)).to.be.true();
        });
    });

    describe('generateNoteObjectString', function() {
        it('fails elegantly on a malformed noteObject argument', function() {

            expect(noteObjectsResource.generateNoteObjectString(null)).to.equal('note-objects-resource.js::generateNoteObject has malformed noteObject argument');
        });

        it('fails elegantly on a malformed noteObject.data field', function() {
            var cleanNoteObject = spawnNoteObject();
            delete cleanNoteObject.data;

            expect(noteObjectsResource.generateNoteObjectString(cleanNoteObject)).to.equal('note-objects-resource.js::generateNoteObject has invalid "data" subfield (subfield is empty)');
        });

        it('populates noteObjectString with an empty string when problem, madlib, and annotation are malformed', function() {
            var cleanNoteObject = spawnNoteObject();
            delete cleanNoteObject.data.problem;
            delete cleanNoteObject.data.madlib;
            delete cleanNoteObject.data.annotation;

            noteObjectsResource.generateNoteObjectString(cleanNoteObject);
            expect(cleanNoteObject.data.noteObjectString).to.equal('');
        });

        it('populates problemText and noteObjectString using the problem.problemText - snomed/i9 (instead of those codes` strings)', function() {
            var cleanNoteObject = spawnNoteObject();

            noteObjectsResource.generateNoteObjectString(cleanNoteObject);
            expect(cleanNoteObject.data.noteObjectString).to.equal('Hypertension\nTest annotation');
            expect(cleanNoteObject.data.problemText).to.equal('Hypertension');
        });

        it('populates noteObjectString with madlib text', function() {
            var cleanNoteObject = spawnNoteObject();
            cleanNoteObject.data.madlib = 'Sample madlib';

            noteObjectsResource.generateNoteObjectString(cleanNoteObject);
            expect(cleanNoteObject.data.noteObjectString).to.equal('Hypertension\nSample madlib\nTest annotation');
        });

        it('populates noteObjectString with madlib text and no annotation', function() {
            var cleanNoteObject = spawnNoteObject();
            cleanNoteObject.data.madlib = 'Sample madlib';
            delete cleanNoteObject.data.annotation;

            noteObjectsResource.generateNoteObjectString(cleanNoteObject);
            expect(cleanNoteObject.data.noteObjectString).to.equal('Hypertension\nSample madlib');
        });

        it('populates noteObjectString without problem text', function() {
            var cleanNoteObject = spawnNoteObject();
            cleanNoteObject.data.madlib = 'Sample madlib';
            delete cleanNoteObject.data.problem.problemText;

            noteObjectsResource.generateNoteObjectString(cleanNoteObject);
            expect(cleanNoteObject.data.noteObjectString).to.equal('Sample madlib\nTest annotation');
        });
    });
});

function spawnClinicalObject() {
    return {
        'authorUid': 'urn:va:user:9E7A:10000000272',
        'data': '',
        'displayName': '25 OH VITAMIN D',
        'domain': 'order',
        'ehmpState': 'active',
        'patientUid': 'urn:va:patient:9E7A:3:3',
        'referenceId': 'urn:va:order:9E7A:3:12519',
        'subDomain': 'laboratory',
        'uid': 'urn:va:ehmp-order:9E7A:3:43869185-fe18-44e1-bc70-fc34baf91d19',
        'visit': {
            'dateTime': '201602231125',
            'location': 'urn:va:location:9E7A:195',
            'serviceCategory': 'I'
        }
    };
}

function spawnNoteObject() {
    return {
        'authorUid': 'urn:va:user:9E7A:10000000270',
        'creationDateTime': '20160224201321+0000',
        'data': {
            'annotation': 'Test annotation',
            'problem': {
                'acuityCode': 'urn:va:prob-acuity:c',
                'acuityName': 'chronic',
                'agentOrangeExposure': 'NO',
                'codes': [
                    {
                        'code': 401.9,
                        'display': 'HYPERTENSION NOS',
                        'system': 'urn:oid:2.16.840.1.113883.6.42'
                    },
                    {
                        'code': '59621000',
                        'display': 'Essential hypertension (disorder)',
                        'system': 'http://snomed.info/sct'
                    }
                ],
                'entered': '20070410',
                'facilityCode': '500',
                'facilityName': 'CAMP MASTER',
                'icdCode': 'urn:icd:401.9',
                'icdGroup': '401',
                'icdName': 'HYPERTENSION NOS',
                'kind': 'Problem',
                'lastUpdateTime': '20070410000000',
                'localId': '627',
                'onset': '20050407',
                'persianGulfExposure': 'NO',
                'pid': '9E7A;3',
                'problemText': 'Hypertension (ICD-9-CM 401.9)', // Codes go in but they never come out alive...
                'providerDisplayName': 'Vehu,Onehundred',
                'providerName': 'VEHU,ONEHUNDRED',
                'providerUid': 'urn:va:user:9E7A:10000000031',
                'radiationExposure': 'NO',
                'service': 'MEDICAL',
                'serviceConnected': false,
                'stampTime': '20070410000000',
                'statusCode': 'urn:sct:55561003',
                'statusDisplayName': 'Active',
                'statusName': 'ACTIVE',
                'summary': 'Hypertension (ICD-9-CM 401.9)',
                'uid': 'urn:va:problem:9E7A:3:627',
                'updated': '20070410'
            },
            'problemRelationship': 'urn:va:problem:9E7A:3:183',
            'sourceUid': 'urn:va:ehmp-note:9E7A:3:27ee3356-1aeb-479b-84a3-a45f60460f66'
        },
        'domain': 'note',
        'ehmpState': 'active',
        'patientUid': 'urn:va:patient:9E7A:3:3',
        'referenceId': null,
        'subDomain': 'noteObject',
        'uid': 'urn:va:ehmp-note:9E7A:3:04dd71e8-a5dc-4994-85f5-b3c55531ad58',
        'visit': {
            'dateTime': '20160101080000',
            'location': 'urn:va:location:9E7A:64',
            'serviceCategory': 'A'
        }
    };
}
