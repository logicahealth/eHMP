'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var vixEnrichment = require('./vix-enrichment');
var fetchBseToken = require('./vix-fetch-bse-token');
var fetchStudyQuery = require('./vix-fetch-study-query');

describe('vix-enrichment.addImagesToDocument', function() {
    var req;
    var jdsResponse;

    beforeEach(function() {
        req = {};
        req.body = {};
        req.query = {};
        _.set(req, 'audit.patientIdentifiers.icn', 'bad');
        _.set(req, 'session.user', {});
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'vix-enrichment-spec'
        }));
        jdsResponse = {};
        _.set(jdsResponse, 'data.items', []);
    });

    function tryWithPidInQueryAndBody(pid, description, test, skipOrOnly) {
        if (skipOrOnly) {
            describe('(query pid)', function() {
                beforeEach(function() {
                    _.set(req, 'query.pid', pid);
                });
                it[skipOrOnly](description, test);
            });
            describe('(body pid)', function() {
                beforeEach(function() {
                    _.set(req, 'query.pid', pid);
                });
                it[skipOrOnly](description, test);
            });
        } else {
            describe('(query pid)', function() {
                beforeEach(function() {
                    _.set(req, 'query.pid', pid);
                });
                it(description, test);
            });
            describe('(body pid)', function() {
                beforeEach(function() {
                    _.set(req, 'query.pid', pid);
                });
                it(description, test);
            });
        }
    }

    tryWithPidInQueryAndBody.only = _.bind(tryWithPidInQueryAndBody, this, _, _, _, 'only');
    tryWithPidInQueryAndBody.skip = _.bind(tryWithPidInQueryAndBody, this, _, _, _, 'skip');

    tryWithPidInQueryAndBody('10108V420871', 'skips enrichment with non-site;dfn pid', function() {
        vixEnrichment.addImagesToDocument(req, jdsResponse, function(err, innerJdsResponse) {
            expect(innerJdsResponse).to.eql(jdsResponse);
            expect(req.logger.info.calledWithMatch(sinon.match.object, /pid is not valid.*skipping.*enrichment/)).to.be.true();
        });
    });
    tryWithPidInQueryAndBody('9E7A;3', 'does nothing with empty response from VIX', function() {
        sinon.stub(fetchBseToken, 'fetch', function(req, callback) {
            return callback(null, 'token');
        });
        sinon.stub(fetchStudyQuery, 'fetch', function(req, token, queryRecords, callback) {
            return callback(null, []);
        });
        vixEnrichment.addImagesToDocument(req, jdsResponse, function(err, innerJdsResponse) {
            expect(innerJdsResponse).to.eql(jdsResponse);
            expect(req.logger.error.calledWithMatch(/Empty response from VIX/)).to.be.true();
        });
    });
    tryWithPidInQueryAndBody('9E7A;3', 'adds properties to records that have associated images', function() {
        var vixResponse = {
            studies: [{
                localId: 3,
                contextId: 'RPT^CPRS^3^^3^^^^^^^^0',
                viewerUrl: 'abc',
                imageCount: 1
            }, {
                localId: 4,
                contextId: 'RPT^CPRS^3^^4^^^^^^^^0',
                viewerUrl: '123',
                imageCount: 2
            }, {
                localId: 5
            }, {
                localId: 6
            }]
        };
        sinon.stub(fetchBseToken, 'fetch', function(req, callback) {
            return callback(null, 'token');
        });
        sinon.stub(fetchStudyQuery, 'fetch', function(req, token, queryRecords, callback) {
            return callback(null, vixResponse);
        });
        _.set(jdsResponse, 'data.items', [{
            localId: 1
        }, {
            localId: 2
        }, {
            localId: 3
        }, {
            localId: 4
        }]);
        vixEnrichment.addImagesToDocument(req, jdsResponse, function(err, innerJdsResponse) {
            expect(innerJdsResponse.data.items).to.eql([{
                'localId': 1,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^1^^^^^^^^0',
                'hasImages': false
            }, {
                'localId': 2,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^2^^^^^^^^0',
                'hasImages': false
            }, {
                'localId': 3,
                'thumbnails': [
                    undefined
                ],
                'viewerUrl': 'abc',
                'detailsUrl': undefined,
                'studyId': undefined,
                'contextId': 'RPT^CPRS^3^^3^^^^^^^^0',
                'hasImages': true,
                'imageCount': 1
            }, {
                'localId': 4,
                'thumbnails': [
                    undefined
                ],
                'viewerUrl': '123',
                'detailsUrl': undefined,
                'studyId': undefined,
                'contextId': 'RPT^CPRS^3^^4^^^^^^^^0',
                'hasImages': true,
                'imageCount': 2
            }]);
        });
    });
    tryWithPidInQueryAndBody('9E7A;3', 'does not add properties to records that have no associated images', function() {
        var vixResponse = {
            studies: [{
                localId: 8,
                contextId: 'RPT^CPRS^3^^8^^^^^^^^0',
                viewerUrl: 'abc',
                imageCount: 1
            }, {
                localId: 9,
                contextId: 'RPT^CPRS^3^^9^^^^^^^^0',
                viewerUrl: '123',
                imageCount: 2
            }, {
                localId: 10
            }, {
                localId: 11
            }]
        };
        sinon.stub(fetchBseToken, 'fetch', function(req, callback) {
            return callback(null, 'token');
        });
        sinon.stub(fetchStudyQuery, 'fetch', function(req, token, queryRecords, callback) {
            return callback(null, vixResponse);
        });
        _.set(jdsResponse, 'data.items', [{
            localId: 1
        }, {
            localId: 2
        }, {
            localId: 3
        }, {
            localId: 4
        }]);
        vixEnrichment.addImagesToDocument(req, jdsResponse, function(err, innerJdsResponse) {
            expect(innerJdsResponse.data.items).to.eql([{
                'localId': 1,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^1^^^^^^^^0',
                'hasImages': false
            }, {
                'localId': 2,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^2^^^^^^^^0',
                'hasImages': false
            }, {
                'localId': 3,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^3^^^^^^^^0',
                'hasImages': false
            }, {
                'localId': 4,
                'thumbnails': [],
                'viewerUrl': '',
                'detailsUrl': '',
                'studyId': '',
                'contextId': 'RPT^CPRS^3^^4^^^^^^^^0',
                'hasImages': false
            }]);
        });
    });
    tryWithPidInQueryAndBody('9E7A;3', 'does nothing when vix is unavailable', function() {
        sinon.stub(fetchBseToken, 'fetch', function(req, callback) {
            return callback('vix unavailable');
        });
        vixEnrichment.addImagesToDocument(req, jdsResponse, function(err, innerJdsResponse) {
            expect(req.logger.debug.calledWith(sinon.match.object, /vix not available/));
            expect(innerJdsResponse).to.eql(jdsResponse);
        });
    });
});
