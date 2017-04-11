'use strict';
var diagnosticReport = require('./diagnostic-report-resource');
var diagnosticReportIn = require('./diagnostic-report-resource-spec-data');
var labResults = require('./lab-result-resource');
var jdsInput = diagnosticReportIn.inputValue;
var _ = require('lodash');

var req = {
    '_pid': '9E7A;253',
    originalUrl: '/fhir/patient/9E7A;253/diagnosticreport?service=SP,CP,OTH&_ack=true',
    headers: {
        host: 'localhost:8888'
    },
    protocol: 'http',
    query: {}
};

function testJDSPath(params, expectedQuery) {
    var path = diagnosticReport.buildJDSPath('9E7A;253', params, 'accession');
    expect(path).to.eql('/vpr/9E7A;253/index/accession' + expectedQuery);
}

function createParam(propName, value) {
    var obj = {};
    obj[propName] = value;
    return obj;
}


describe('DiagnosticReport Conformance Statement', function() {

    var testConformance = diagnosticReportIn.conformanceData;
    var builtConformance = diagnosticReport.createConformanceData();

    it('verifies that a generated conformance statement exists', function() {
        expect(builtConformance).not.to.be.undefined();
    });

    describe('DiagnosticReport Conformance Details', function() {
        it('verifies metadata are valid', function() {
            expect(builtConformance.type).to.eql(testConformance.rest[0].resource[0].type);
            expect(builtConformance.profile.reference).to.eql(testConformance.rest[0].resource[0].profile.reference);
            expect(builtConformance.interaction[0].code).to.eql('read');
            expect(builtConformance.interaction[1].code).to.eql('search-type');
        });

        it('verifies conformance search parameters are valid', function() {
            expect(builtConformance.searchParam[0].name).to.eql('domain');
            expect(builtConformance.searchParam[1].name).to.eql('service');
            expect(builtConformance.searchParam[2].name).to.eql('subject.identifier');
            expect(builtConformance.searchParam[3].name).to.eql('pid');
            expect(builtConformance.searchParam[4].name).to.eql('date');
        });
    });
});

describe('DiagnosticReport FHIR Resource', function() {
    it('Verifies correct resource name and path', function() {
        var config = diagnosticReport.getResourceConfig()[0];
        expect(config.name).to.eql('fhir-diagnostic-report');
        expect(config.path).to.eql('');
    });

    describe('FHIR API parameters', function() {
        it('builds correct JDS query - no parameters', function() {
            testJDSPath({}, '');
        });
        it('builds correct JDS query - _sort', function() {
            testJDSPath(createParam('_sort', 'date'), '?order=observed');
        });
        it('builds correct JDS query - _count', function() {
            testJDSPath(createParam('_count', 8), '?limit=8');
        });
        it('builds correct JDS query - service', function() {
            var serviceCategories = ['urn:va:lab-category:CY', 'urn:va:lab-category:EM', 'urn:va:lab-category:SP', 'urn:va:lab-category:AP'];
            var path = diagnosticReport.buildJDSPath('9E7A;253', req.query, 'accession', serviceCategories);
            expect(path).to.eql('/vpr/9E7A;253/index/accession?filter=' + encodeURIComponent('in(categoryCode,[urn:va:lab-category:CY,urn:va:lab-category:EM,urn:va:lab-category:SP,urn:va:lab-category:AP])'));
        });
        it('builds correct JDS query - name (LR ANATOMIC PATHOLOGY REPORT)', function() {
            testJDSPath(createParam('name', 'LR ANATOMIC PATHOLOGY REPORT'), '?filter=' + encodeURIComponent('like(categoryCode,%AP)'));
        });
        it('builds correct JDS query - name (code)', function() {
            testJDSPath(createParam('name', 'foo'), '?filter=' +
                encodeURIComponent('or(eq(typeName,"foo"),eq(typeCode,"foo"),eq("results[].localTitle","foo"),eq(vuid,"foo"),eq("codes[].code","foo"),eq("codes[].display","foo"))'));
            testJDSPath(createParam('name', 'RADIOLOGIC EXAMINATION*ANKLE\\, RT'), '?filter=' +
                encodeURIComponent('or(eq(typeName,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq(typeCode,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("results[].localTitle","RADIOLOGIC EXAMINATION*ANKLE, RT"),eq(vuid,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("codes[].code","RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("codes[].display","RADIOLOGIC EXAMINATION*ANKLE, RT"))'));
        });
        it('builds correct JDS query - name (urn:oid:2.16.840.1.113883.6.233|code)', function() {
            testJDSPath(createParam('name', 'urn:oid:2.16.840.1.113883.6.233|foo'), '?filter=' +
                encodeURIComponent('or(eq(vuid,"foo"),eq(typeCode,"foo"),eq(typeName,"foo"))'));
        });
        it('builds correct JDS query - name (system|code)', function() {
            testJDSPath(createParam('name', 'http://loinc.org|2947-0'), '?filter=' +
                encodeURIComponent('and(eq("codes[].system",http://loinc.org),or(eq("codes[].code","2947-0"),eq("codes[].display","2947-0")))'));
        });
        it('builds correct JDS query - name (list combined)', function() {
            var loincQuery = 'and(eq("codes[].system",http://loinc.org),or(eq("codes[].code","2947-0"),eq("codes[].display","2947-0")))';
            var pathologyQuery = 'like(categoryCode,%AP)';
            var radiologicQuery = 'or(eq(typeName,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq(typeCode,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("results[].localTitle","RADIOLOGIC EXAMINATION*ANKLE, RT"),eq(vuid,"RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("codes[].code","RADIOLOGIC EXAMINATION*ANKLE, RT"),eq("codes[].display","RADIOLOGIC EXAMINATION*ANKLE, RT"))';
            testJDSPath(createParam('name', 'http://loinc.org|2947-0,LR ANATOMIC PATHOLOGY REPORT,RADIOLOGIC EXAMINATION*ANKLE\\, RT'), '?filter=' +
                encodeURIComponent('or(' + loincQuery + ',' + pathologyQuery + ',' + radiologicQuery + ')'));
        });
    });

});

describe('DiagnosticReport FHIR conversion methods', function() {

    var fhirBundle = diagnosticReport.buildBundle(jdsInput.data.items, req, jdsInput.data.totalItems);

    it('Bundles results correctly', function() {
        expect(fhirBundle.resourceType).to.eql('Bundle');
        expect(fhirBundle.type).to.eql('collection');
        expect(fhirBundle.id).not.to.be.undefined();
        expect(fhirBundle.link).not.to.be.undefined();
        expect(fhirBundle.link.length).to.eql(1);
        expect(fhirBundle.link[0].relation).to.eql('self');
        expect(fhirBundle.link[0].url).to.eql('http://localhost:8888/fhir/patient/9E7A;253/diagnosticreport?service=SP,CP,OTH&_ack=true');
        expect(fhirBundle.total).to.eql(18);
        expect(fhirBundle.entry).not.to.be.undefined();
        expect(fhirBundle.entry.length).to.eql(18);
    });
});

describe('DiagnosticReport Parameter Validation', function() {

    var success;
    var error;
    var onSuccess = function() {
        success = true;
        error = false;
    };
    var onError = function() {
        error = true;
        success = false;
    };

    it('Accepts valid sort parameters correctly', function() {

        req.query = {
            _sort: 'date'
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);

        req.query = {
            _count: 3,
            '_sort:desc': 'issued',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);
    });

    it('Rejects invalid sort parameters correctly', function() {
        req.query = {
            _sort: 'foo'
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(false);
        expect(error).to.eql(true);

        req.query = {
            '_sort:desc': 'foo'
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(false);
        expect(error).to.eql(true);
    });

    it('Accepts valid date parameters correctly', function() {

        req.query = {
            date: '2015-01-26'
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);

        req.query = {
            date: '2015-01',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);

        req.query = {
            date: '!=2015-01',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);

        req.query = {
            date: '<=2014-09-20',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);

        req.query = {
            date: '2015-01-26T13:45:00',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(true);
        expect(error).to.eql(false);
    });

    it('Rejects invalid date parameters correctly', function() {
        req.query = {
            date: 'foo',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(false);
        expect(error).to.eql(true);

        req.query = {
            date: '2015-01-26aaaaaaaa',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(false);
        expect(error).to.eql(true);

        req.query = {
            date: '2015-01-26T13:45:0',
        };
        diagnosticReport.validateParams(req.query, onSuccess, onError);
        expect(success).to.eql(false);
        expect(error).to.eql(true);
    });
});

describe('DiagnosticReport Sorting', function() {

    it('Results are unsorted when sort parameter is not specified', function() {

        req.query = {};
        var fhirEntries = labResults.convertToFhir(jdsInput, req);
        var fhirBundle = diagnosticReport.buildBundle(fhirEntries, req, jdsInput.data.totalItems);

        var isSortedAsc = true;
        var isSortedDsc = true;
        var entries = fhirBundle.entry;
        var previous;
        var current;
        _.each(entries, function(entry) {
            current = new Date(entry.resource.issued);
            if (previous) {
                if (previous > current) {
                    isSortedAsc = false;
                }
                if (previous < current) {
                    isSortedDsc = false;
                }
            }
            previous = current;
        });
        expect(isSortedAsc).to.eql(false);
        expect(isSortedDsc).to.eql(false);
    });

    it('Results are sorted when _sort parameter is specified', function() {
        req.query = {
            _sort: 'issued'
        };
        var fhirEntries = labResults.convertToFhir(jdsInput, req);
        var fhirBundle = diagnosticReport.buildBundle(fhirEntries, req, jdsInput.data.totalItems);

        var isSortedAsc = true;
        var isSortedDsc = true;
        var entries = fhirBundle.entry;
        var previous;
        var current;
        _.each(entries, function(entry) {
            current = new Date(entry.resource.issued);
            if (previous) {
                if (previous > current) {
                    isSortedAsc = false;
                }
                if (previous < current) {
                    isSortedDsc = false;
                }
            } else {
                previous = current;
            }
        });
        expect(isSortedAsc).to.eql(true);
        expect(isSortedDsc).to.eql(false);
    });

    it('Results are sorted in descending order when _sort:desc parameter is specified', function() {
        req.query = {
            '_sort:desc': 'issued'
        };
        var fhirEntries = labResults.convertToFhir(jdsInput, req);
        var fhirBundle = diagnosticReport.buildBundle(fhirEntries, req, jdsInput.data.totalItems);

        var isSortedAsc = true;
        var isSortedDsc = true;
        var entries = fhirBundle.entry;
        var previous;
        var current;
        _.each(entries, function(entry) {
            current = new Date(entry.resource.issued);
            if (previous) {
                if (previous > current) {
                    isSortedAsc = false;
                }
                if (previous < current) {
                    isSortedDsc = false;
                }
            } else {
                previous = current;
            }
        });
        expect(isSortedAsc).to.eql(false);
        expect(isSortedDsc).to.eql(true);
    });

});
