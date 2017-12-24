'use strict';

var cdsengineResource = require('./cds-engine-resource');
var engine = require('./cds-engine');

var rdk = require('../../core/rdk');
var MongoClient = require('mongodb').MongoClient;

var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

function createTestJson(name, scope) {
    var testJson = {
        'name': '',
        'description': 'engine one registry entry',
        'class': 'com.cognitive.cds.invocation.model.EngineInfo',
        'type': 'OpenCDS',
        'version': '2.0.5',
        'environment': 'memory: 32,cpus: 8,java_version: 7,webservice: tomcat, webservice_version: 7'
    };
    //making these optional for required parameter testing...
    if (name) {
        testJson.name = name;
    }
    return testJson;
}

describe('CDS Engine Resource', function() {
    describe('Test configuration', function() {
        var resources = cdsengineResource.getResourceConfig(appReference());
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

        it('has correct configuration for CDS Engine get ', function() {
            var r = resources[0];
            expect(r.name).to.equal('cds-engine-cds-engine-get');
            expect(r.path).to.equal('/registry');
            expect(r.get).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Engine post ', function() {
            var r = resources[1];
            expect(r.name).to.equal('cds-engine-cds-engine-post');
            expect(r.path).to.equal('/registry');
            expect(r.post).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Engine put ', function() {
            var r = resources[2];
            expect(r.name).to.equal('cds-engine-cds-engine-put');
            expect(r.path).to.equal('/registry');
            expect(r.put).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
        it('has correct configuration for CDS Engine delete', function() {
            var r = resources[3];
            expect(r.name).to.equal('cds-engine-cds-engine-delete');
            expect(r.path).to.equal('/registry');
            expect(r.delete).not.to.be.undefined();
            expect(r.interceptors).to.eql(interceptors);
        });
    });

    describe('Engine endpoint HTTP response codes', function() {
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
            engine.getEngine(mockReqResUtil.createRequestWithParam(null, null), buildRes(rdk.httpstatus.not_found));
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            engine.postEngine(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });

        it('POST responds HTTP Created', function() {
            var testJson = createTestJson('engine1');
            engine.postEngine(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.created));
        });

        it('PUT responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            engine.postEngine(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });

        it('Delete responds HTTP Bad Request when required parameter missing', function() {
            var testJson = createTestJson();
            engine.deleteEngine(mockReqResUtil.createRequestWithParam(null, testJson), buildRes(rdk.httpstatus.bad_request));
        });
    });

});
