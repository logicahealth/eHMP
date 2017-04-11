'use strict';

var rdk = require('../../core/rdk');
var conceptRelationships = require('./concept-relationships');
var crsSPARQL = require('./crs-sparql');
var crsDataTransformer = require('./crs-data-transformer');
var crsData = require('./concept-relationships-spec-data').data;
var crsDataItems = crsData.results.bindings;

var logger = {
    debug: function() {}
};

var req = {
    logger: logger,
    audit: {},
    app: {
        config: {
            rpcConfig: {
                context: 'HMP UI CONTEXT',
                siteHash: '9E7A'
            },
            vistaSites: {},
            CRSServer: {
                host: 'crs_host',
                port: 'crs_port'
            }
        }
    },
    session: {
        user: {
            site: '9E7A'
        }
    }
};

function noOp() {}

function removeExcessEmptySpace(str) {
    return str.replace(/\s+/g, ' ');
}

describe('Concept Relationships Resource', function() {

    var testQuery = 'query=PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>     PREFIX owl: <http://www.w3.org/2002/07/owl#>     PREFIX skos: <http://www.w3.org/2004/02/skos/core#>     PREFIX snomed: <http://snomed.info/id/>     PREFIX ehmp: <http://localhost:3030/ehmp/>          SELECT ?targetConceptId ?targetConceptLabel ?isvital     WHERE {       GRAPH ehmp:highlighting {         ?conceptId ?predicate ?targetConceptId .         FILTER( ?conceptId = snomed:my_concept_id ).         OPTIONAL { ?targetConceptId snomed:116680003 ?vital } .         BIND (?vital = snomed:46680005 AS ?isvital)       }      OPTIONAL { GRAPH ehmp:rxnorm {?targetConceptId skos:prefLabel ?targetConceptLabel }}.       OPTIONAL { GRAPH ehmp:loinc  {?targetConceptId skos:prefLabel ?targetConceptLabel }}.       OPTIONAL { GRAPH ehmp:snomed {  ?conceptId rdfs:label ?snomedLabel }} .     }';

    describe('CRS SPARQL module', function() {
        it('generates a correct SPARQL query', function() {
            var query = crsSPARQL.buildQuery('my_concept_id');
            expect(removeExcessEmptySpace(query)).to.equal(removeExcessEmptySpace(testQuery));
        });
    });

    describe('CRS Data Transformer', function() {
        it('converts CRS raw data into correct format for UI consumption', function() {
            var correctConversion = [{
                'concept.domain': 'Medication',
                'code.systems': [{
                    'system': 'RxNORM',
                    'codes': [{
                        'code': '9997',
                        'display': 'Spironolactone'
                    }, {
                        'code': '29046',
                        'display': 'Lisinopril'
                    }, {
                        'code': '37798',
                        'display': 'Terazosin'
                    }]
                }]
            }, {
                'concept.domain': 'Vital',
                'code.systems': [{
                    'system': 'LOINC',
                    'codes': [{
                        'code': '8462-4',
                        'display': 'Intravascular diastolic:Pres:Pt:Arterial system:Qn'
                    }, {
                        'code': '84860',
                        'display': undefined
                    }]
                }]
            }];

            var converted = crsDataTransformer.transform(['Medication', 'Vital'], crsDataItems);
            expect(converted).to.eql(correctConversion);
        });
        it('filters by the provided target domains', function() {
            var correctConversion = [{
                'concept.domain': 'Vital',
                'code.systems': [{
                    'system': 'LOINC',
                    'codes': [{
                        'code': '8462-4',
                        'display': 'Intravascular diastolic:Pres:Pt:Arterial system:Qn'
                    }, {
                        'code': '84860',
                        'display': undefined
                    }]
                }]
            }];

            var converted = crsDataTransformer.transform(['Vital'], crsDataItems);
            expect(converted).to.eql(correctConversion);

            correctConversion = [{
                'concept.domain': 'Medication',
                'code.systems': [{
                    'system': 'RxNORM',
                    'codes': [{
                        'code': '9997',
                        'display': 'Spironolactone'
                    }, {
                        'code': '29046',
                        'display': 'Lisinopril'
                    }, {
                        'code': '37798',
                        'display': 'Terazosin'
                    }]
                }]
            }];
            converted = crsDataTransformer.transform(['Medication'], crsDataItems);
            expect(converted).to.eql(correctConversion);
        });
    });

    describe('Concept Relationships', function() {
        it('calls CRS with the correct parameters', function() {
            var httpOptions;
            sinon.stub(rdk.utils.http, 'post', function(options, callback) {
                httpOptions = options;
                return callback(null, null, crsData);
            });
            conceptRelationships.getRelatedConcepts(req, ['Vital', 'Medication'], 'concept_domain', 'my_concept_id', noOp);

            expect(httpOptions.baseUrl).to.equal('http://crs_host:crs_port');
            expect(httpOptions.url).to.equal('/ehmp/query');
            expect(httpOptions.json).to.equal(true);
            expect(removeExcessEmptySpace(decodeURI(httpOptions.body))).to.equal(removeExcessEmptySpace(testQuery));
            expect(httpOptions.headers['Content-Type']).to.equal('application/x-www-form-urlencoded');
            expect(httpOptions.headers.Accept).to.equal('application/sparql-results+json');
        });
    });
});
