'use strict';

var cdsexecuteResource = require('./cds-execute-resource');
var execute = require('./cds-execute');

var rdk = require('../../core/rdk');
var MongoClient = require('mongodb').MongoClient;

var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

function createTestJson(name, scope) {
    // name HTNList
    var testJson = {
        'execution': {
            'jobId': null,
            'baseContext': {
                'specialty': {
                    'entityType': 'Specialty',
                    'codeSystem': null,
                    'name': null,
                    'id': null,
                    'type': null
                },
                'user': {
                    'entityType': 'User',
                    'codeSystem': 'VA:DUZ',
                    'name': 'USER PANORAMA',
                    'id': 'PW         ',
                    'type': 'provider'
                },
                'location': {
                    'entityType': 'Location',
                    'codeSystem': null,
                    'name': null,
                    'id': null,
                    'type': null
                },
                'subject': {
                    'entityType': 'Subject',
                    'codeSystem': null,
                    'name': null,
                    'id': null,
                    'type': null
                }
            },
            'subjectListReferences': ['Timeout'],
            'subjectIds': null,
            'target': {
                'intentsSet': [
                    'providerBatchAdvice'
                ],
                'supplementalMappings': null,
                'perceivedExecutionTime': null,
                'type': 'Background',
                'mode': 'Normal'
            }
        },
        'lastRun': 1429134978313,
        'name': '',
        'owner': {
            'entityType': 'User',
            'codeSystem': 'VA:DUZ',
            'name': 'USER PANORAMA',
            'id': 'SITE:10000000230',
            'type': 'provider'
        },
        'description': 'A Test job from the unit tests',
        'disabled': false
    };
    //making these optional for required parameter testing...
    if (name) {
        testJson.name = name;
    }
    return testJson;
}

describe('CDS Execute Resource', function() {
    describe('Test configuration', function() {
        var resources = cdsexecuteResource.getResourceConfig(appReference());
        var interceptors = {
            audit: true,
            metrics: true,
            authentication: true,
            operationalDataCheck: false,
            synchronize: false
        };

        it('has 4 endpoints configured', function() {
            expect(resources.length).to.equal(4);
        });

        it('has correct configuration for CDS Execute get ', function() {
            var r = resources[0];
            expect(r.name).to.equal('cds-execute-cds-execute-get');
            expect(r.path).to.equal('/request');
            expect(r.get).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Execute post ', function() {
            var r = resources[1];
            expect(r.name).to.equal('cds-execute-cds-execute-post');
            expect(r.path).to.equal('/request');
            expect(r.post).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Execute put ', function() {
            var r = resources[2];
            expect(r.name).to.equal('cds-execute-cds-execute-put');
            expect(r.path).to.equal('/request');
            expect(r.put).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Execute delete', function() {
            var r = resources[3];
            expect(r.name).to.equal('cds-execute-cds-execute-delete');
            expect(r.path).to.equal('/request');
            expect(r.delete).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
    });

    describe('Execute endpoint HTTP response codes', function() {
        //Create the mocked MongoDB functions that are used by the code that we're testing...
        var db = cdsSpecUtil.createMockDb({
            find: function(callback) {
                return {
                    toArray: function(callback) {
                        callback(null, []);
                    }
                };
            },
            insert: function(testJson, callback) {
                var echo = [];
                testJson._id = 'mongodb12345678';
                echo.push(testJson);
                callback(null, echo); // can mock a response here...
            },
            ensureIndex: function() {
                return;
            },
            remove: function() {
                return;
            }
        });

        function buildRes(expectedStatus) {
            return {
                status: function(statusCode) {
                    expect(statusCode === expectedStatus).to.be.true();
                    return this;
                },
                rdkSend: function() {
                    return this;
                },
                send: function() {
                    return this;
                },
                end: function() {
                    return this;
                }
            };
        }

        beforeEach(function() {
            sinon.stub(MongoClient, 'connect').callsFake(function(string, options, callback) {
                callback(null, db);
            });
        });

        it('GET responds HTTP Not Found', function() {
            execute.getExecute(mockReqResUtil.createRequestWithParam(null, null), buildRes(rdk.httpstatus.not_found));
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            execute.postExecute(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });

        it('POST responds HTTP Created', function() {
            var testJson = createTestJson('execute1');
            execute.postExecute(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.created));
        });

        it('POST responds HTTP Bad Request when payload has an _id attribute', function() {
            var testJson = createTestJson('execute1');
            testJson._id = 'foo';
            execute.postExecute(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });

        it('PUT responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            execute.putExecute(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });

        it('Delete responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            execute.deleteExecute(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });
    });
});
