'use strict';

var patientListResource = require('./patient-list-resource');
var criteria = require('./criteria');
var definition = require('./definition');
var patientlist = require('./patient-list');

var rdk = require('../../core/rdk');
var MongoClient = require('mongodb').MongoClient;

var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var cdsSubsystem = require('../../subsystems/cds/cds-subsystem');
var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

function createCriteriaJson(name) {
    var testJson = {
        'name': '',
        'accessor': 'vital:items[]:qualifiedName',
        'datatype': 'integer',
        'piece': '2:/'
    };
    //making these optional for required parameter testing...
    if (name) {
        testJson.name = name;
    }
    return testJson;
}

function createDefinitionJson(name) {
    var testJson = {
        'name': '',
        'description': 'user defined description of this definition template',
        'expression': '{and: [ {or: [\'A.A\',\'B.B\'], {\'A.A\'} ]}'
    };
    //making these optional for required parameter testing...
    if (name) {
        testJson.name = name;
    }
    return testJson;
}

function createPatientlistJson(name) {
    var testJson = {
        'name': '',
        'definition': {
            'name': 'def five',
            'description': '2nd user defined description of this definition template',
            'expression': '{eq: [ {or: [\'A.A\',\'B.B\'], {} ]}',
            'date': '2015-03-10T12:54:56.899Z',
            'scope': 'private',
            'owner': '9E7A;PW    '
        }
    };
    //making these optional for required parameter testing...
    if (name) {
        testJson.name = name;
    }
    return testJson;
}

describe('CDS Patient List Resource', function() {
    var resources = patientListResource.getResourceConfig(appReference());
    var interceptors = {
        operationalDataCheck: false,
        synchronize: false
    };

    it('has 14 endpoints configured', function() {
        expect(resources.length).to.equal(14);
    });

    it('has correct configuration for Criteria get ', function() {
        var r = resources[0];
        expect(r.name).to.equal('cds-patient-list-cds-criteria-get');
        expect(r.path).to.equal('/criteria');
        expect(r.get).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Criteria post ', function() {
        var r = resources[1];
        expect(r.name).to.equal('cds-patient-list-cds-criteria-post');
        expect(r.path).to.equal('/criteria');
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Criteria delete ', function() {
        var r = resources[2];
        expect(r.name).to.equal('cds-patient-list-cds-criteria-delete');
        expect(r.path).to.equal('/criteria');
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    it('has correct configuration for Definition get ', function() {
        var r = resources[3];
        expect(r.name).to.equal('cds-patient-list-cds-definition-get');
        expect(r.path).to.equal('/definition');
        expect(r.get).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Definition post ', function() {
        var r = resources[4];
        expect(r.name).to.equal('cds-patient-list-cds-definition-post');
        expect(r.path).to.equal('/definition');
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Definition delete ', function() {
        var r = resources[5];
        expect(r.name).to.equal('cds-patient-list-cds-definition-delete');
        expect(r.path).to.equal('/definition');
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    it('has correct configuration for Definition copy ', function() {
        var r = resources[6];
        expect(r.name).to.equal('cds-patient-list-cds-definition-copy');
        expect(r.path).to.equal('/definition/copy');
        expect(r.get).to.be.undefined();
        expect(r.post).not.to.be.undefined();
        expect(r.delete).to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    it('has correct configuration for Patientlist get ', function() {
        var r = resources[7];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-get');
        expect(r.path).to.equal('/list');
        expect(r.get).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Patientlist post ', function() {
        var r = resources[8];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-post');
        expect(r.path).to.equal('/list');
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Patientlist delete ', function() {
        var r = resources[9];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-delete');
        expect(r.path).to.equal('/list');
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    it('has correct configuration for Patientlist add ', function() {
        var r = resources[10];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-add');
        expect(r.path).to.equal('/list/patients');
        expect(r.get).to.be.undefined();
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Patientlist remove ', function() {
        var r = resources[11];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-remove');
        expect(r.path).to.equal('/list/patients');
        expect(r.get).to.be.undefined();
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for Patientlist status ', function() {
        var r = resources[12];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-status');
        expect(r.path).to.equal('/list/status');
        expect(r.get).not.to.be.undefined();
        expect(r.put).to.be.undefined();
        expect(r.post).to.be.undefined();
        expect(r.delete).to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    it('has correct configuration for Patientlist copy ', function() {
        var r = resources[13];
        expect(r.name).to.equal('cds-patient-list-cds-patientlist-copy');
        expect(r.path).to.equal('/list/copy');
        expect(r.get).to.be.undefined();
        expect(r.post).not.to.be.undefined();
        expect(r.delete).to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });

    var res = mockReqResUtil.response;
    var mockData;
    var db;

    beforeEach(function() {
        sinon.spy(res, 'status');

        mockData = {
            testJson: null,
            echo: null
        };

        db = cdsSpecUtil.createMockDb({
            find: function() {
                return {
                    toArray: function(callback) {
                        callback(null, []);
                    }
                };
            },
            findOne: function(match, callback) {
                callback(null, mockData.echo);
            },
            insert: function(testJson, callback) {
                mockData.testJson = {
                    _id: 'mongodb12345678'
                };
                mockData.echo = [mockData.testJson];
                callback(null, mockData.echo); // can mock a response here...
            },
            ensureIndex: function() {
                return;
            },
            remove: function() {
                return;
            }

        });
        sinon.stub(cdsSubsystem, 'getCDSDB', function(dbName, init, callback) {
            callback(null, db);
        });
    });

    // Criteria tests
    describe('Criteria endpoint HTTP response codes', function() {
        it('GET responds HTTP Not Found', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            criteria.init(appReference());

            //GET w/name, and return a status 404 (not found)
            criteria.getCriteria(mockReqResUtil.createRequestWithParam(null, null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            criteria.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createCriteriaJson();
            criteria.postCriteria(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('POST responds HTTP Conflict', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            criteria.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            mockData.testJson = createCriteriaJson('criteria1');
            mockData.echo = mockData.testJson;
            criteria.postCriteria(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });

        it('POST responds HTTP Created', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            criteria.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            mockData.testJson = createCriteriaJson('criteria1');
            mockData.echo = {};
            criteria.postCriteria(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.created)).to.be.true();
        });

        it('DELETE responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            criteria.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createCriteriaJson();
            criteria.deleteCriteria(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });

    // Definition tests
    describe('Definition endpoint HTTP response codes', function() {
        it('GET responds HTTP Not Found', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //GET w/name, and return a status 404 (not found)
            definition.getDefinition(mockReqResUtil.createRequestWithParam(null, null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createDefinitionJson();
            definition.postDefinition(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('POST responds HTTP Conflict', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            mockData.testJson = createDefinitionJson('definition1');
            mockData.echo = mockData.testJson;
            definition.postDefinition(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });

        it('POST responds HTTP Created', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            mockData.testJson = createDefinitionJson('definition1');
            mockData.echo = {};
            definition.postDefinition(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.created)).to.be.true();
        });

        it('DELETE responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createDefinitionJson();
            definition.deleteDefinition(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('COPY responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createDefinitionJson();
            definition.copyDefinition(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('COPY responds HTTP Not Found when source missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST no source, returns a 404 (not found)
            mockData.echo = null;
            definition.copyDefinition(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                newname: 'bar'
            }, null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });
        it('COPY responds HTTP Conflict when destination exists', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            definition.init(appReference());

            //POST no source, returns a 404 (not found)
            mockData.echo = createDefinitionJson();
            definition.copyDefinition(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                newname: 'bar'
            }, null), res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
    });

    // PatientList tests
    describe('Patient-list endpoint HTTP response codes', function() {
        it('GET responds HTTP Not Found', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //GET w/name, and return a status 404 (not found)
            patientlist.getPatientList(mockReqResUtil.createRequestWithParam(null, null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });

        it('POST responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createPatientlistJson();
            patientlist.postPatientlist(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('POST responds HTTP Conflict', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST provide required name - echo - exists
            mockData.testJson = createPatientlistJson('patientlist1');
            mockData.echo = mockData.testJson;
            patientlist.postPatientlist(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });

        it('POST responds HTTP Created', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST provide required name - this should create one, and return a status 201 (created)
            mockData.testJson = createPatientlistJson('patientlist1');
            mockData.echo = {};
            patientlist.postPatientlist(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.created)).to.be.true();
        });

        it('DELETE responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createPatientlistJson();
            patientlist.deletePatientlist(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

        it('COPY responds HTTP Bad Request when required parameter missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST w/o name, required, and returns a 400 (bad request)
            mockData.testJson = createPatientlistJson();
            patientlist.copyPatientlist(mockReqResUtil.createRequestWithParam(null, mockData.testJson), res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('COPY responds HTTP Not Found when source missing', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST no source, returns a 404 (not found)
            mockData.echo = null;
            patientlist.copyPatientlist(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                newname: 'bar'
            }, null), res);
            expect(res.status.calledWith(rdk.httpstatus.not_found)).to.be.true();
        });
        it('COPY responds HTTP Conflict when destination exists', function() {

            sinon.stub(MongoClient, 'connect', function(string, options, callback) {
                callback(null, db);
            });
            patientlist.init(appReference());

            //POST no source, returns a 404 (not found)
            mockData.echo = createPatientlistJson();
            patientlist.copyPatientlist(mockReqResUtil.createRequestWithParam({
                name: 'foo',
                newname: 'bar'
            }, null), res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
    });
});
