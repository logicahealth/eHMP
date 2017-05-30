'use strict';

var asu = require('../../subsystems/asu/asu-process');
var jds = require('../../subsystems/jds/jds-subsystem');

var patientrecordResource = require('./patient-record-resource');
var httpMocks = require('node-mocks-http');

var documentSignatures = require('./patient-record-document-view-signatures');
var immunizationDupes = require('./patient-record-immunization-dupes');
var _ = require('lodash');

describe('JdsQuery', function() {
    it('handles undefined values', function() {
        var jdsQuery = new patientrecordResource._JdsQuery(undefined, '', null, undefined, undefined);

        expect(jdsQuery.start).to.be(0);
        expect(jdsQuery.limit).to.be.undefined();
        expect(jdsQuery.order).to.be.undefined();
        expect(jdsQuery.filter).to.be.undefined();
        expect(jdsQuery.range).to.be.undefined();
    });
    it('handles all values set to something valid', function() {
        var jdsQuery = new patientrecordResource._JdsQuery(1, 10, 'localTitle', '9E23', [
            ['like', 'localTitle', 'Drug']
        ], '19500101..20160101');

        expect(jdsQuery.start).to.be(1);
        expect(jdsQuery.limit).to.be(10);
        expect(jdsQuery.order).to.be('localTitle');
        expect(jdsQuery.filter).to.be('like("localTitle","Drug"),like("uid","9E23")');
        expect(jdsQuery.range).to.be('19500101..20160101');
    });
});


describe('Wildcard', function() {
    it('creates an empty string from undefined input', function() {
        var expectedOutput = '';
        var result = patientrecordResource._wildCard();

        expect(result).to.be(expectedOutput);
    });

    it('surrounds string input with %s', function() {
        var input = 'test';
        var expectedOutput = '%test%';
        var result = patientrecordResource._wildCard(input);

        expect(result).to.equal(expectedOutput);
    });
});


describe('createTextFilter', function () {
    it('creates an empty array from empty strings', function () {
        var filterString = '';
        var fieldString = '';
        var result = patientrecordResource._createTextFilter(fieldString, filterString);

        expect(result).to.eql([]);
    });

    it('creates a new filter when there are no originals present', function() {
        var filterString = 'One,Two';
        var fieldString = 'testField';
        var expectedOutput = [
            ['or', ['ilike', 'testField', '%One%'],
                ['ilike', 'testField', '%Two%']
            ]
        ];
        var result = patientrecordResource._createTextFilter(filterString, fieldString);

        expect(result).to.eql(expectedOutput);
    });

    it('creates a new filter and combines it correctly with a filter that already exists', function() {
        var filterString = 'One,Two';
        var fieldString = 'testField';
        var original = ['not', ['ilike', 'otherField', '%other%']];
        var expectedOutput = [
            ['not', ['ilike', 'otherField', '%other%']],
            ['or', ['ilike', 'testField', '%One%'],
                ['ilike', 'testField', '%Two%']
            ]
        ];
        var result = patientrecordResource._createTextFilter(filterString, fieldString, original);

        expect(result).to.eql(expectedOutput);
    });

});

describe('noData', function() {
    it('returns true when arguments are empty', function() {
        expect(patientrecordResource._noData('')).to.be.true();
        expect(patientrecordResource._noData()).to.be.true();
        expect(patientrecordResource._noData(null)).to.be.true();
    });
    it('returns true when the data property is empty', function() {
        expect(patientrecordResource._noData({
            data: ''
        })).to.be.true();
        expect(patientrecordResource._noData({})).to.be.true();
        expect(patientrecordResource._noData({
            data: null
        })).to.be.true();
    });
    it('returns true when data.items is nullish', function() {
        expect(patientrecordResource._noData({
            data: {
                items: ''
            }
        })).to.be.true();
        expect(patientrecordResource._noData({
            data: {}
        })).to.be.true();
        expect(patientrecordResource._noData({
            data: {
                items: null
            }
        })).to.be.true();
    });
    it('returns true when data.items is an empty array', function() {
        expect(patientrecordResource._noData({
            data: {
                items: []
            }
        })).to.be.true();
    });
});

describe('getFilter', function() {
    it('handles GET requests with valid filters which used the jdsFilter interceptor', function() {
        var req = {};
        req.method = 'GET';
        var interceptorFilter = [
            ['eq', 'foo', 'bar']
        ];
        _.set(req, 'interceptorResults.jdsFilter.filter', interceptorFilter);
        var filter = patientrecordResource._getFilter(req);
        expect(filter).to.eql(interceptorFilter);
    });
    it('handles GET requests with invalid filters which used the jdsFilter interceptor', function() {
        var req = {};
        req.method = 'GET';
        var interceptorFilter = 'bad filter';
        _.set(req, 'interceptorResults.jdsFilter.error', interceptorFilter);
        var filter = patientrecordResource._getFilter(req);
        expect(filter).to.eql(interceptorFilter);
    });
    it('handles POST requests with valid filters', function() {
        var req = {};
        req.method = 'POST';
        var bodyFilter = 'eq(foo,bar)';
        var parsedFilter = [
            ['eq', 'foo', 'bar']
        ];
        _.set(req, 'body.filter', bodyFilter);
        var filter = patientrecordResource._getFilter(req);
        expect(filter).to.eql(parsedFilter);
    });
    it('handles POST requests with invalid filters', function() {
        var req = {};
        req.method = 'POST';
        var bodyFilter = 'eq(foo,bar';
        _.set(req, 'body.filter', bodyFilter);
        var filter = patientrecordResource._getFilter(req);
        expect(filter).to.be.an.error(/Parse error/);
    });
});

describe('validatePostPid', function() {
    it('does not return an error if the query pid matches the body pid', function() {
        var req = {};
        req.method = 'POST';
        _.set(req, 'body.pid', '1234');
        _.set(req, 'query.pid', '1234');
        var pidError = patientrecordResource._validatePostPid(req);
        expect(pidError).to.be.falsy();
    });
    it('does not return an error if there is no body pid', function() {
        var req = {};
        req.body = {};
        req.method = 'POST';
        _.set(req, 'query.pid', '1234');
        var pidError = patientrecordResource._validatePostPid(req);
        expect(pidError).to.be.falsy();
    });
    it('returns an error if the query pid does not match the body pid', function() {
        var req = {};
        req.method = 'POST';
        _.set(req, 'body.pid', '12345');
        _.set(req, 'query.pid', '1234');
        var pidError = patientrecordResource._validatePostPid(req);
        expect(pidError).to.be.an.error(/pid must match/);
    });
});

describe.skip('filter docs by asu permissions', function() {
    var logger, req, mock;

    beforeEach(function(done) {
        logger = sinon.stub(require('bunyan').createLogger({
            name: 'patient-record-resource-spec.js'
        }));
        req = {};
        req.logger = logger;
        req.audit = {};
        req.param = {};
        req.query = {};
        req.query.order = '';
        req.interceptorResults = {};
        req.interceptorResults.jdsFilter = {};
        req.interceptorResults.jdsFilter.filter = [];

        done();
    });

    afterEach(function(done) {
        if (mock) {
            asu.getAsuPermission.restore();
            mock = undefined;
        }
        done();
    });

    it('skip asu check for item if documentDefUid is undefined', function(done) {
        var dataItems = {
            data: {
                items: [{
                    localTitle: 'one'
                }]
            }
        };
        mock = sinon.spy(asu, 'getAsuPermission');

        patientrecordResource._filterDocuments(req, dataItems, function(err, results) {
            expect(results).must.eql([{
                localTitle: 'one'
            }]);
        });

        expect(mock.callCount).to.be(0);
        done();
    });

    it('does not return item if there is asu permission check error', function(done) {
        var dataItems = {
            data: {
                items: [{
                    documentDefUid: '1',
                    localTitle: 'one'
                }]
            }
        };
        mock = sinon.stub(asu, 'getAsuPermission', function(req, dataItems, callback) {
            return callback('error');
        });

        patientrecordResource._filterDocuments(req, dataItems, function(err, results) {
            expect(results).must.eql([]);
        });

        expect(mock.callCount).to.be(1);
        done();
    });

    it('returns item if has asu permission', function(done) {
        var dataItems = {
            data: {
                items: [{
                    documentDefUid: '1',
                    localTitle: 'one'
                }]
            }
        };
        mock = sinon.stub(asu, 'getAsuPermission', function(req, dataItems, callback) {
            return callback(false, 'true');
        });

        patientrecordResource._filterDocuments(req, dataItems, function(err, results) {
            expect(results).must.eql([{
                documentDefUid: '1',
                localTitle: 'one'
            }]);
        });

        expect(mock.callCount).to.be(1);
        done();
    });

    it('does not return item if does not have asu permission', function(done) {
        var dataItems = {
            data: {
                items: [{
                    documentDefUid: '1',
                    localTitle: 'one'
                }]
            }
        };
        mock = sinon.stub(asu, 'getAsuPermission', function(req, dataItems, callback) {
            return callback(false, 'false');
        });

        patientrecordResource._filterDocuments(req, dataItems, function(err, results) {
            expect(results).must.eql([]);
        });

        expect(mock.callCount).to.be(1);
        done();
    });

    it('with 3 items and has asu permission for 2 items', function(done) {
        var dataItems = {
            data: {
                items: [{
                    documentDefUid: '1',
                    localTitle: 'one'
                }, {
                    documentDefUid: '2',
                    localTitle: 'two'
                }, {
                    documentDefUid: '3',
                    localTitle: 'three'
                }]
            }
        };
        mock = sinon.stub(asu, 'getAsuPermission', function(req, dataItems, callback) {
            if (dataItems.data.items[0].documentDefUid === '2') {
                return callback(false, 'false');
            }
            return callback(false, 'true');
        });

        patientrecordResource._filterDocuments(req, dataItems, function(err, results) {
            expect(results).must.eql([{
                documentDefUid: '1',
                localTitle: 'one'
            }, {
                documentDefUid: '3',
                localTitle: 'three'
            }]);
        });

        expect(mock.callCount).to.be(3);

        done();
    });
});

describe('JdsQuery', function() {
    it('is made to a string with toString', function() {
        var jdsQuery = new patientrecordResource._JdsQuery(1, 10, 'localTitle', undefined, undefined);
        expect(jdsQuery.toString()).to.be('start=1&limit=10&order=localTitle');
    });
});

describe('removeDuplicates', function() {
    var req;
    var mockImmunizationDupes;
    var res;

    beforeEach(function(done) {
        req = {};
        _.set(req, 'audit', {});
        _.set(req, 'app.config.vistaSites', {});
        _.set(req, 'query', {});

        res = httpMocks.createResponse();
        _.set(res, 'data.items', {});

        done();
    });

    it('calls removeDuplicateImmunizations when index is immunization', function() {
        mockImmunizationDupes = sinon.stub(immunizationDupes, 'removeDuplicateImmunizations', function(vistaSites, immunizations) {
            return 'remove duplicate';
        });
        expect(patientrecordResource._removeDuplicates('immunization', req, res)).to.be('remove duplicate');
    });

    it('calls does not removeDuplicateImmunizations when index is not immunization', function() {
        mockImmunizationDupes = sinon.stub(immunizationDupes, 'removeDuplicateImmunizations', function(vistaSites, immunizations) {
            return 'remove duplicate';
        });
        expect(patientrecordResource._removeDuplicates('non_immunization', req, res)).to.not.be('remove duplicate');
    });
});

describe('fetchDomainData', function() {
    var logger;
    var req;
    var mockJds;
    var mockDocumentSignatures;
    var res;
    var spyStatus;

    beforeEach(function(done) {
        logger = sinon.stub(require('bunyan').createLogger({
            name: 'patient-record-resource-spec.js'
        }));
        req = {};
        req.logger = logger;
        req.audit = {};
        req.params = {};
        req.params.callType = 'modal';
        req.params.vler_uid = 'urn:va:order:9E7A:227:16682';
        req.param = function(name, defaultValue) {
            return _.get(this, ['params', name]) || defaultValue;
        };
        req.method = 'GET';
        req.query = {};
        req.body = {};
        req.query.pid = '11016V630869';
        req.query.order = '';
        _.set(req, 'interceptorResults.jdsFilter.filter', []);

        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');

        done();
    });

    afterEach(function(done) {
        if (mockJds) {
            jds.getPatientDomainData.restore();
            mockJds = undefined;
        }
        spyStatus.reset();
        done();
    });

    it('skipped if pid param not set', function(done) {
        req.query.pid = undefined;

        function tester(response) {
            expect(spyStatus.withArgs(400).called).to.be.true();
            expect(response).to.be('Missing pid parameter');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });
    it('returns a 400 if the query pid does not match the body pid', function(done) {
        req.query.pid = '9E7A;3';
        req.body.pid = 'C877;3';
        req.method = 'POST';

        function tester(response) {
            expect(spyStatus.withArgs(400).called).to.be.true();
            expect(response).to.match(/pid must match/);
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('returns a 400 if the filter parameter is malformed', function(done) {
        req.body.filter = 'eq(foo,bar';
        req.method = 'POST';

        function tester(response) {
            expect(spyStatus.withArgs(400).called).to.be.true();
            expect(response).to.match(/Malformed filter parameter/);
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('returns a failure response when jds query fails with an error', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback('error', {}, 404);
        });

        function tester(response) {
            expect(spyStatus.withArgs(404).called).to.be.true();
            expect(response).to.be('error');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('returns no data if no data is returned from jds', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: []
                }
            }, 200);
        });

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql({
                data: {
                    items: []
                }
            });
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('returns non document view data from jds', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'one'
                    }]
                }
            }, 200);
        });

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql({
                data: {
                    items: [{
                        localTitle: 'one'
                    }]
                }
            });
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'sync', req, res);
    });

    it('returns document view data from jds', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            }, 200);
        });

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql({
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            });
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('returns a failure response when documentSignatures processAddenda function call fails with an error for document', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            }, 200);
        });

        mockDocumentSignatures = sinon.stub(documentSignatures, 'processAddenda', function(req, response, callback) {
            return callback('processAddenda error msg', {}, 404);
        });

        function tester(response) {
            expect(spyStatus.withArgs(500).called).to.be.true();
            expect(response).must.eql('processAddenda error msg');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('document', 'document-view', req, res);
    });

    it('returns a failure response when documentSignatures processAddenda function call fails with an error for docs-view', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            }, 200);
        });

        mockDocumentSignatures = sinon.stub(documentSignatures, 'processAddenda', function(req, response, callback) {
            return callback('processAddenda error msg', {}, 404);
        });

        function tester(response) {
            expect(spyStatus.withArgs(500).called).to.be.true();
            expect(response).must.eql('processAddenda error msg');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('docs-view', 'document-view', req, res);
    });

    it('returns expected when documentSignatures processAddenda function call returns for document', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            }, 200);
        });

        mockDocumentSignatures = sinon.stub(documentSignatures, 'processAddenda', function(req, response, callback) {
            return callback(null, 'good response', 200);
        });

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql('good response');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('document', 'document-view', req, res);
    });

    it('returns expected when documentSignatures processAddenda function call returns for docs-view', function(done) {
        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            return callback(null, {
                data: {
                    items: [{
                        localTitle: 'two'
                    }]
                }
            }, 200);
        });

        mockDocumentSignatures = sinon.stub(documentSignatures, 'processAddenda', function(req, response, callback) {
            return callback(null, 'good response', 200);
        });

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql('good response');
            done();
        }
        res.rdkSend = tester;

        patientrecordResource._fetchDomainData('docs-view', 'document-view', req, res);
    });


    it('uses filterList and filterFields without original filter', function(done) {
        var expectedFilter = 'or(' +
            'ilike("status","%complete%"),' +
            'ilike("status","%active%"),' +
            'ilike("codes","%complete%"),' +
            'ilike("codes","%active%"),' +
            'ilike("statusDisplayName","%complete%"),' +
            'ilike("statusDisplayName","%active%")' +
            ')';

        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            expect(jdsQuery.filter).to.equal(expectedFilter);
            return callback(null, {
                data: {
                    items: []
                }
            }, 200);
        });

        req.query.filterList = ['complete', 'active'];
        req.query.filterFields = ['status', 'codes', 'statusDisplayName'];

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql({
                data: {
                    items: []
                }
            });
            done();
        }
        res.rdkSend = tester;
        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });

    it('uses filterList and filterFields with original filter', function(done) {
        var expectedFilter = 'eq("foo","bar"),' +
            'or(' +
            'ilike("status","%complete%"),' +
            'ilike("status","%active%"),' +
            'ilike("codes","%complete%"),' +
            'ilike("codes","%active%"),' +
            'ilike("statusDisplayName","%complete%"),' +
            'ilike("statusDisplayName","%active%")' +
            ')';

        mockJds = sinon.stub(jds, 'getPatientDomainData', function(req, pid, index, jdsQuery, vlerQuery, callback) {
            expect(jdsQuery.filter).to.equal(expectedFilter);
            return callback(null, {
                data: {
                    items: []
                }
            }, 200);
        });

        req.query.filterList = ['complete', 'active'];
        req.query.filterFields = ['status', 'codes', 'statusDisplayName'];
        req.interceptorResults.jdsFilter.filter = 'eq(foo,bar)';

        function tester(response) {
            expect(spyStatus.withArgs(200).called).to.be.true();
            expect(response).must.eql({
                data: {
                    items: []
                }
            });
            done();
        }
        res.rdkSend = tester;
        patientrecordResource._fetchDomainData('allergies', 'document-view', req, res);
    });
});
