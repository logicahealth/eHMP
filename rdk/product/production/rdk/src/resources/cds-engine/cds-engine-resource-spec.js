'use strict';

var cdsengineResource = require('./cds-engine-resource');
var engine = require('./cds-engine');

var rdk = require('../../core/rdk');
var mongo = require('mongoskin');

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
    if(name) {
        testJson.name = name;
    }
    return testJson;
}

describe('CDS Engine Resource', function () {

    var resources = cdsengineResource.getResourceConfig(appReference());
    var interceptors = {
        audit: true,
        metrics: true,
        authentication: true,
        operationalDataCheck: false,
        synchronize: false
    };

    it('has 4 endpoints configured', function () {
        expect(resources.length).to.equal(4);
    });

    it('has correct configuration for CDS Engine get ', function () {
        var r = resources[0];
        expect(r.name).to.equal('cds-engine-cds-engine-get');
        expect(r.path).to.equal('/registry');
        expect(r.get).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Engine post ', function () {
        var r = resources[1];
        expect(r.name).to.equal('cds-engine-cds-engine-post');
        expect(r.path).to.equal('/registry');
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Engine put ', function () {
        var r = resources[2];
        expect(r.name).to.equal('cds-engine-cds-engine-put');
        expect(r.path).to.equal('/registry');
        expect(r.put).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Engine delete', function () {
        var r = resources[3];
        expect(r.name).to.equal('cds-engine-cds-engine-delete');
        expect(r.path).to.equal('/registry');
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    var res = mockReqResUtil.response;
    beforeEach(function() {
        sinon.spy(res, 'status');
        //sinon.spy(res, 'rdkSend');
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
            insert: function(testJson, callback){
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

        it('GET responds HTTP Not Found', function() {

            sinon.stub(mongo, 'db').returns(db);
            engine.init(appReference());

            //GET w/name, and return a status 404 (not found)
            engine.getEngine(mockReqResUtil.createRequestWithParam(null,null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(mongo, 'db').returns(db);
            engine.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            var testJson = createTestJson();
            engine.postEngine(mockReqResUtil.createRequestWithParam(null, testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('POST responds HTTP Created', function() {

            sinon.stub(mongo, 'db').returns(db);
            engine.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            var testJson = createTestJson('engine1');
            engine.postEngine(mockReqResUtil.createRequestWithParam(null, testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.created)).to.be.true();
        });

        it('PUT responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(mongo, 'db').returns(db);
            engine.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            var testJson = createTestJson();
            engine.putEngine(mockReqResUtil.createRequestWithParam(null, testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('Delete responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(mongo, 'db').returns(db);
            engine.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            var testJson = createTestJson();
            engine.deleteEngine(mockReqResUtil.createRequestWithParam(null, testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });

});
