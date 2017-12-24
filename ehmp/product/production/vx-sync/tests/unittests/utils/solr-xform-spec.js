'use strict';

require('../../../env-setup');

var _ = require('underscore');

var solrXform = require(global.VX_UTILS + 'solr-xform');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'solr-xform-spec',
//     level: 'debug'
// });

var config = {};

describe('solr-xform.js', function () {
	it('Normal path: Can locate and find a transform and use it to transform a record.', function (done) {
		var vprAllergyRecord = {
			'codes': [{
				'code': 'C0008299',
				'display': 'Chocolate',
				'system': 'urn:oid:2.16.840.1.113883.6.86'
			}],
			'drugClasses': [{
				'code': 'CHOCO100',
				'name': 'CHOCOLATE'
			}],
			'entered': '200712171515',
			'enteredByUid': 'urn:va:user:SITE:100',
			'verifiedByUid': 'urn:va:user:SITE:101',
			'facilityCode': '500',
			'facilityName': 'CAMP MASTER',
			'historical': true,
			'kind': 'Allergy/Adverse Reaction',
			'lastUpdateTime': '20071217151553',
			'localId': '876',
			'mechanism': 'ALLERGY',
			'originatorName': 'PROVIDER,ONE',
			'pid': 'SITE;8',
			'products': [{
				'name': 'CHOCOLATE',
				'summary': 'AllergyProduct{uid=\'\'}',
				'vuid': 'urn:va:vuid:4636681'
			}],
			'reactions': [{
				'name': 'DIARRHEA',
				'summary': 'AllergyReaction{uid=\'\'}',
				'vuid': 'urn:va:vuid:4637011'
			}],
			'reference': '3;GMRD(120.82,',
			'stampTime': '20071217151553',
			'summary': 'CHOCOLATE',
			'typeName': 'DRUG, FOOD',
			'uid': 'urn:va:allergy:SITE:8:876',
			'verified': '20071217151553',
			'verifierName': '<auto-verified>',
			'comments': [{
				'entered': 200503172009,
				'comment': 'The allergy comment.'
			}],
			'observations': [{
				'date': 200503172009,
				'severity': 'bad'
			}],
			'severityName': 'SEVERE'

		};
		solrXform(vprAllergyRecord, log, config, function (error, solrRecord) {
			expect(error).toBeFalsy();
			expect(_.isObject(solrRecord)).toBe(true);
			expect(solrRecord.uid).toBe(vprAllergyRecord.uid);
			done();
		});
	});

	it('Error path: returns error when transform returns error', function (done) {
		var vlerdocumentRecord = {
			fullHtml: 'invalid data',
			compressed: true,
			uid: 'urn:va:vlerdocument:ABCD:1234:56'
		};
		solrXform(vlerdocumentRecord, log, config, function (error, solrRecord) {
			expect(error).toBeTruthy();
			expect(_.isObject(solrRecord)).toBe(false);
			done();
		});
	});

	it('Error path: returns error when record uid is missing', function (done) {
		solrXform(null, log, config, function (error, solrRecord) {
			expect(error).toBeTruthy();
			expect(_.isObject(solrRecord)).toBe(false);
			done();
		});
	});

	it('Error path: returns error when domain has no transformation ', function(done){
		var record={
			uid: 'urn:va:auxillary:ABCD:1234:56'
		};
		solrXform(record, log, config, function(error, solrRecord){
			expect(error).toBeTruthy();
			expect(_.isObject(solrRecord)).toBe(false);
			done();
		});
	});

	it('Error path: returns error when domain=ehmp-activity and there is no subDomain ', function (done) {
		var record = {
			uid: 'urn:va:ehmp-activity:ABCD:1234:29fe0301-14ac-4d8d-95a9-9f538866beba'
		};
		solrXform(record, log, config, function (error, solrRecord) {
			expect(error).toBeTruthy();
			expect(_.isObject(solrRecord)).toBe(false);
			done();
		});
	});

	it('Error path: returns error when domain=ehmp-activity there is a subDomain, but there is no transformation script for that domain and subDomain ', function (done) {
		var record = {
			uid: 'urn:va:ehmp-activity:ABCD:1234:29fe0301-14ac-4d8d-95a9-9f538866beba',
			subDomain: 'test'
		};
		solrXform(record, log, config, function (error, solrRecord) {
			expect(error).toBeTruthy();
			expect(_.isObject(solrRecord)).toBe(false);
			done();
		});
	});

	it('Normal path: returns transform when domain=ehmp-activity, there is a subDomain, there is a transformation script for that domain and subDomain ', function (done) {
		var record = {
			uid: 'urn:va:ehmp-activity:ABCD:1234:29fe0301-14ac-4d8d-95a9-9f538866beba',
			subDomain: 'consult'
		};
		solrXform(record, log, config, function (error, solrRecord) {
			expect(error).toBeFalsy();
			expect(_.isObject(solrRecord)).toBe(true);
			expect(solrRecord.uid).toBe(record.uid);
			done();
		});
	});

});