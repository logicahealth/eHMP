'use strict';

var rdk = require('../../core/rdk');
var cdsIntentResource = require('./cds-intent-resource');
var intent = require('./cds-intent');
var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var cdsSubsystem = require('../../subsystems/cds/cds-subsystem');

var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

function createIntentJson(name, scope) {
    var intentJson = {
        'description':'A Mock Intent',
        'globalName':'Enterprise//FirstEngine',
        'governance':null,
        'id':'',
        'invocations':[{
            'dataFormat':'application/json+fhir',
            'dataQueries':null,
            'engineName':'engineOne',
            'name':null,
            'rules':[{
                'id':'genderAgeRule',
                'properties': {
                    'delay':'10'
                }
            }]
        }],
        //'name':'FirstEngine',
        //'scope':'Enterprise',
        'scopeId':null
    };
    //making these optional for required parameter testing...
    if(name) {
        intentJson.name = name;
    }
    if(scope) {
        intentJson.scope = scope;
    }
    return intentJson;
}

describe('CDS Intent Resource', function() {

    var resources = cdsIntentResource.getResourceConfig(appReference());
    var res = mockReqResUtil.response;

    beforeEach(function() {
        sinon.spy(res, 'status');
        //sinon.spy(res, 'rdkSend');
    });

    it('has 4 endpoints configured', function() {
        expect(resources.length).to.equal(4);
    });

    it('has correct configuration for CDS Intent get ', function() {
        var r = resources[0];
        expect(r.name).to.equal('cds-intent-cds-intent-get');
        expect(r.path).to.equal('/registry');
        expect(r.get).not.to.be.undefined();

    });
    it('has correct configuration for CDS Intent post ', function() {
        var r = resources[1];
        expect(r.name).to.equal('cds-intent-cds-intent-post');
        expect(r.path).to.equal('/registry');
        expect(r.post).not.to.be.undefined();
    });
    it('has correct configuration for CDS Intent put ', function() {
        var r = resources[2];
        expect(r.name).to.equal('cds-intent-cds-intent-put');
        expect(r.path).to.equal('/registry');
        expect(r.put).not.to.be.undefined();
    });
    it('has correct configuration for CDS Intent delete', function() {
        var r = resources[3];
        expect(r.name).to.equal('cds-intent-cds-intent-delete');
        expect(r.path).to.equal('/registry');
        expect(r.delete).not.to.be.undefined();
    });

    describe('List endpoint HTTP response codes', function() {
        var db;
        var collectionFunctions;

        beforeEach(function() {
            collectionFunctions = {
                find: function() {
                    return {
                        toArray: function(callback) {
                            callback(null, []);
                        }
                    };
                },
                insert: function(postIntentJson, callback) {
                    var echo = [];
                    postIntentJson._id = 'mongodb12345678';
                    echo.push(postIntentJson);
                    callback(null, echo); // can mock a response here...
                },
                update: function(match, intent, callback){
                    callback(null, ['1']);
                },
                ensureIndex: function() {
                    return;
                },
                remove: function() {
                    return;
                }
            };
            db = cdsSpecUtil.createMockDb(collectionFunctions);

            sinon.stub(cdsSubsystem, 'getCDSDB', function(dbName, callback) {
                callback(null, db);
            });
            intent.init(appReference());
        });

        it('postIntent responds HTTP Bad Request when required parameters are missing, and HTTP Created when not missing', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.insert = function(postIntentJson, callback) {
                var echo = [];
                postIntentJson._id = 'mongodb12345678';
                echo.push(postIntentJson);
                callback(null, echo); // can mock a response here...
            };

            //no name or scope, which are required, and returns a 400 (bad request)
            var postIntentJson = createIntentJson();
            intent.postIntent(mockReqResUtil.createRequestWithParam(null, postIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            //no name, but a scope is provided - returns a 400 (bad request)
            postIntentJson = createIntentJson(null, 'Enterprise');
            intent.postIntent(mockReqResUtil.createRequestWithParam(null, postIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            //no scope, but a name is provided - returns a 400 (bad request)
            postIntentJson = createIntentJson('FirstEngine', null);
            intent.postIntent(mockReqResUtil.createRequestWithParam(null, postIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            //both required values - this should create one, and return a status 201 (created)
            postIntentJson = createIntentJson('FirstEngine', 'Enterprise');
            intent.postIntent(mockReqResUtil.createRequestWithParam(null, postIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.created)).to.be.true();

        });


        it('putIntent responds HTTP Bad Request when required parameters are missing', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.insert = function(postIntentJson, callback) {
                var echo = [];
                postIntentJson._id = 'mongodb12345678';
                echo.push(postIntentJson);
                callback(null, echo); // can mock a response here...
            };
            collectionFunctions.update= function(match, intent, callback){
                callback(null, ['1']);
            };

            //no name or scope, which are required, and returns a 400 (bad request)
            var putIntentJson = createIntentJson();
            intent.putIntent(mockReqResUtil.createRequestWithParam(null, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            //no name, but a scope is provided - returns a 400 (bad request)
            putIntentJson = createIntentJson(null, 'Enterprise');
            intent.putIntent(mockReqResUtil.createRequestWithParam({
                scope: putIntentJson.scope,
            }, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

            //no scope, but a name is provided - returns a 400 (bad request)
            putIntentJson = createIntentJson('FirstEngine', null);
            intent.putIntent(mockReqResUtil.createRequestWithParam({
                name: putIntentJson.name
            }, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

        });


        it('putIntent responds HTTP Not Found when trying to update a non-existant intent', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.insert = function(postIntentJson, callback) {
                var echo = [];
                postIntentJson._id = 'mongodb12345678';
                echo.push(postIntentJson);
                callback(null, echo); // can mock a response here...
            };
            collectionFunctions.update = function(match, intent, callback){
                callback(null, ['1']);
            };

            //both required values, but no record to update - this should be a 404 (not found)
            var putIntentJson = createIntentJson('EngineXYZ', 'EnterpriseXYZ');
            intent.putIntent(mockReqResUtil.createRequestWithParam({
                name: putIntentJson.name,
                scope: putIntentJson.scope,
            }, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();

        });


        it('putIntent responds HTTP Ok when trying to update an intent correctly', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.find = function() {
                return {
                    toArray: function(callback) {
                        callback(null, [createIntentJson('EngineX', 'EnterpriseX')]);
                    }
                };
            };
            collectionFunctions.update = function(match, intent, callback){
                callback(null, 1);
            };

            //both required values, and a record to update - this should be a 200 (ok) if added...
            var putIntentJson = createIntentJson('EngineX', 'EnterpriseX');
            intent.putIntent(mockReqResUtil.createRequestWithParam({
                name: putIntentJson.name,
                scope: putIntentJson.scope,
            }, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();

        });


        it('getIntent responds HTTP not found when trying to find an intent that does not exist', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.find = function() {
                return {
                    toArray: function(callback) {
                        callback(null, []);
                    }
                };
            };

            var putIntentJson = createIntentJson('EngineX', 'EnterpriseX');
            intent.putIntent(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                scope: 'bar',
            }, putIntentJson), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();

        });


        it('deleteIntent responds HTTP not found when trying to delete an intent that does not exist', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            collectionFunctions.remove = function(match, callback){
                callback(null, 0);
            };

            intent.deleteIntent(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                scope: 'bar',
            }), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();

        });

    });

});
