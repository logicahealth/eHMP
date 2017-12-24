'use strict';

var _ = require('lodash');
var textSearch = require('./text-search');
var buildSolrQuery = textSearch._buildSolrQuery;
var buildSpecializedSolrQuery = textSearch._buildSpecializedSolrQuery;
var buildDefaultQuery = textSearch._buildDefaultQuery;
var executeAndTransformSolrQuerys = textSearch._executeAndTransformSolrQuerys;

var solrSimpleClient = require('./solr-simple-client');
var asuUtils = require('../asu-utils');

describe('build solr query', function() {

    it('should return an error when no pid is specified', function() {
        var solrQuery = buildSolrQuery();
        expect(solrQuery instanceof Error).to.be.true();
    });

    it('should accept minimal input with just reqQuery.pid, pidJoinedList', function() {
        var reqQuery = {
            pid: '10108',
            pidJoinedList: '10108'
        };
        var solrQuery = buildSolrQuery(reqQuery);
        var expectedSolrQuery = 'fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&' +
            'fq=domain%3A*%3A*&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&' +
            'hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(solrQuery).to.equal(expectedSolrQuery);
    });

    it('should accept a single specific domain to query', function() {
        var reqQuery = {
            pid: '10108',
            pidJoinedList: '10108'
        };
        var domain = 'document';
        var solrQuery = buildSolrQuery(reqQuery, domain);
        var expectedSolrQuery = 'fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3Adocument&' +
            'fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&' +
            'hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(solrQuery).to.equal(expectedSolrQuery);
    });

    it('should construct a query string with all arguments filled', function() {
        var reqQuery = {
            q: 'metformin',
            pid: '10108',
            pidJoinedList: '10108',
            types: [
                'document',
                'med'
            ]
        };
        var domain = 'document';
        var queryParameters = {
            fl: [
                'comment',
                'problem_status'
            ],
            fq: [
                '-removed:true'
            ],
            hl: true,
            'hl.fl': [
                'prn_reason',
                'administration_comment'
            ]
        };
        var solrQueryString = buildSolrQuery(reqQuery, domain, queryParameters);
        var expectedSolrQuery = ('fl=comment%2Cproblem_status%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=-removed%3Atrue&' +
            'fq=pid%3A10108&fq=domain%3Adocument&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&hl=true&hl.fl=prn_reason%2Cadministration_comment%2Csummary%2Ckind%2Cfacility_name%2Cbody&' +
            'q=&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D');
        expect(solrQueryString).to.equal(expectedSolrQuery);
    });
});


describe('build specialized solr query', function() {
    it('should build a specialized solr query for med domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'med',
            query: 'metformin'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'med');
        var expectedSolrQuery = 'sort=overall_stop%20desc&fl=qualified_name%2Cva_type%2Clast_filled%2Clast_give%2Cmed_drug_class_name%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&' +
            'group=true&group.field=qualified_name&hl.fl=administration_comment%2Cprn_reason%2Csummary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=72&' +
            'q.op=AND&fq=pid%3A10108&fq=domain%3Amed&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=metformin&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&' +
            'hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for order domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'order',
            query: 'potassium'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'order');
        var expectedSolrQuery = 'fq=service%3A(LR%20OR%20GMRC%20OR%20RA%20OR%20FH%20OR%20UBEC%20OR%20%22OR%22)&' +
            'fq=-status_name%3A(COMPLETE%20OR%20%22DISCONTINUED%2FEDIT%22%20OR%20DISCONTINUED%20OR%20EXPIRED%20OR%20LAPSED)&' +
            'fq=pid%3A10108&fq=domain%3Aorder&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&fl=service%2Cstatus_name%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&' +
            'hl.fl=content%2Csummary%2Ckind%2Cfacility_name%2Cbody&q=potassium&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&' +
            'hl=true&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for document domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'document',
            query: 'metformin'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'document');
        var expectedSolrQuery = 'fl=local_title%2Cphrase%2Cdocument_def_uid%2Cdocument_status%2Cauthor_uid%2Csigner_uid%2Ccosigner_uid%2Cattending_uid%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&sort=reference_date_time%20desc&' +
            'hl.fl=body%2Csubject%2Csummary%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3Adocument&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&' +
            'q=metformin&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for vital domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'vital',
            query: 'pulse'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'vital');
        var expectedSolrQuery = 'sort=observed%20desc&group=true&group.field=qualified_name&fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&' +
            'fq=pid%3A10108&fq=domain%3Avital&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=pulse&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&' +
            'hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for lab domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'lab',
            query: 'plasma'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'lab');
        var expectedSolrQuery = 'fl=lnccodes%2Ctype_code%2Cgroup_name%2Cobserved%2CinterpretationName%2Cunits%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&' +
            'sort=observed%20desc&group=true&group.field=qualified_name_units&hl.fl=comment%2Csummary%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3Aresult&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&' +
            'q=plasma&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for problem domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'problem',
            query: 'foo'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'problem');
        var expectedSolrQuery = 'fl=comment%2Cicd_code%2Cicd_name%2Cicd_group%2Cproblem_status%2Cacuity_name%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&sort=problem_status%20asc&group=true&group.field=icd_code&fq=pid%3A10108&' +
            'fq=domain%3Aproblem&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&' +
            'q=foo&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&' +
            'hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
    it('should build a specialized solr query for ehmp-activity domain', function() {
        var reqQuery = {
            pid: 10108,
            pidJoinedList: '10108',
            domain: 'ehmp-activity',
            query: 'glucose'
        };
        var specializedSolrQuery = buildSpecializedSolrQuery(reqQuery, 'ehmp-activity');
        var expectedSolrQuery = 'fl=domain%2Csub_domain%2Cactivity_process_instance_id%2Cactivity_source_facility_id%2Cconsult_name%2Cconsult_orders_override_reason%2Cconsult_orders_order_result_comment%2C' +
            'consult_orders_conditions%2Cconsult_orders_request%2Cconsult_orders_comment%2Cconsult_orders_accepting_provider_uid%2Cconsult_orders_accepting_provider_display_name%2Cconsult_orders_order_results_order_name%2C' +
            'consult_orders_order_results_order_status%2Cconsult_orders_accepted_date%2Cschedules_comment%2Ctriages_comment%2C' +
            'request_accepted_date%2Crequest_title%2Crequest_text%2Cresponse_request%2Csignals_data_comment%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&' +
            'hl.fl=domain%2Csub_domain%2Cconsult_name%2Cconsult_orders_override_reason%2Cconsult_orders_order_result_comment%2Cconsult_orders_conditions%2Cconsult_orders_request%2Cconsult_orders_comment%2C' +
            'consult_orders_accepting_provider_display_name%2Cconsult_orders_order_results_order_name%2Cconsult_orders_order_results_order_status%2Cschedules_comment%2Ctriages_comment%2C' +
            'request_title%2Crequest_text%2Cresponse_request%2Csignals_data_comment%2Csummary%2Ckind%2Cfacility_name%2Cbody&' +
            'hl.fragsize=200&fq=pid%3A10108&fq=domain%3Aehmp-activity&fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=glucose&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(specializedSolrQuery).to.equal(expectedSolrQuery);
    });
});

describe('build query with/without returnSynonyms', function() {
    it('Expect debugQuery to be true', function() {
        var reqQuery = {
            pid: '10108',
            pidJoinedList: '10108',
            domain: 'default',
            returnSynonyms: 'true'
        };
        var solrQuery = buildSpecializedSolrQuery(reqQuery, 'default');

        var expectedSolrQuery = 'debugQuery=true&fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&' +
            'fq=domain%3A(accession%20OR%20allergy%20OR%20treatment%20OR%20consult%20OR%20procedure%20OR%20obs%20OR%20image%20OR%20surgery%20OR%20mh%20OR%20immunization%20OR%20pov%20OR%20skin%20OR%20exam%20OR%20cpt%20OR%20education%20OR%20factor%20OR%20appointment%20OR%20visit%20OR%20rad%20OR%20ptf)&' +
            'fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(solrQuery).to.equal(expectedSolrQuery);

        var defaultQuery = buildDefaultQuery(reqQuery, 'default');
        expect(defaultQuery).to.equal(expectedSolrQuery);
    });

    it('Expect debugQuery to be false', function() {
        var reqQuery = {
            pid: '10108',
            pidJoinedList: '10108',
            domain: 'default',
            returnSynonyms: 'false'
        };
        var solrQuery = buildSpecializedSolrQuery(reqQuery, 'default');

        var expectedSolrQuery = 'debugQuery=false&fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&' +
            'fq=domain%3A(accession%20OR%20allergy%20OR%20treatment%20OR%20consult%20OR%20procedure%20OR%20obs%20OR%20image%20OR%20surgery%20OR%20mh%20OR%20immunization%20OR%20pov%20OR%20skin%20OR%20exam%20OR%20cpt%20OR%20education%20OR%20factor%20OR%20appointment%20OR%20visit%20OR%20rad%20OR%20ptf)&' +
            'fq=domain%3A(NOT%20patient)&fq=-removed%3Atrue&q=&start=0&rows=500&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5&' +
            'hl.simple.pre=%7B%7BaddTag%20%22&' +
            'hl.simple.post=%22%20%22mark%22%20%22cpe-search-term-match%22%7D%7D';
        expect(solrQuery).to.equal(expectedSolrQuery);

        var defaultQuery = buildDefaultQuery(reqQuery, 'default');
        expect(defaultQuery).to.equal(expectedSolrQuery);
    });
});

describe('execute and transform SOLR queries', function() {
        var solrResponse = {
            responseHeader: {
                status: 0,
                QTime: 271,
                params: {
                    hl: 'true',
                    echoParams: 'all',
                    fl: 'local_title,phrase,document_def_uid,document_status,author_uid,signer_uid,cosigner_uid,attending_uid,uid,datetime,summary,url,kind,facility_name,body',
                    synonyms: 'true',
                    start: '0',
                    'hl.fragsize': '45',
                    sort: 'reference_date_time desc',
                    fq: [
                        'pid:(SITE;100022 OR SITE;100022 OR DOD;0000000010 OR HDR;5000000341V359724 OR JPID;54f433bf-fa01-4467-b236-e79118852271 OR VLER;5000000341V359724)',
                        'domain:document',
                        'domain:(NOT patient)',
                        '-removed:true'
                    ],
                    rows: '101',
                    'hl.simple.pre': '{{addTag \'',
                    'hl.snippets': '5',
                    q: 'progress',
                    defType: 'synonym_edismax',
                    'hl.simple.post': '\' \'mark\' \'cpe-search-term-match\'}}',
                    requestId: 'a9f65645-c8c7-459e-b3d9-dd0be43996de',
                    'hl.fl': 'body,subject,summary,kind,facility_name,body',
                    wt: [
                        'json',
                        'json'
                    ],
                    'synonyms.constructPhrases': 'true'
                }
            },
            response: {
                numFound: 3,
                start: 0,
                docs: [
                    {
                        uid: 'urn:va:document:SITE:100022:8315',
                        facility_name: 'CAMP BEE',
                        phrase: [
                            'CAMP BEE',
                            'Progress Note',
                            'Nurse Admission evaluation note',
                            'PROGRESS NOTES',
                            'NURSING ADMISSION PRETEST '
                        ],
                        kind: 'Progress Note',
                        summary: 'NURSING ADMISSION PRETEST ',
                        datetime: '20140127180900',
                        body: [
                            'current admission new note\r\n'
                        ],
                        author_uid: 'urn:va:user:SITE:1',
                        signer_uid: 'urn:va:user:SITE:1',
                        document_status: 'COMPLETED',
                        local_title: 'NURSING ADMISSION PRETEST ',
                        document_def_uid: 'urn:va:doc-def:SITE:1653'
                    },
                    {
                        uid: 'urn:va:document:SITE:100022:8315',
                        facility_name: 'CAMP MASTER',
                        phrase: [
                            'CAMP MASTER',
                            'Progress Note',
                            'Nurse Admission evaluation note',
                            'PROGRESS NOTES',
                            'NURSING ADMISSION ASSESSMENT '
                        ],
                        kind: 'Progress Note',
                        summary: 'NURSING ADMISSION ASSESSMENT ',
                        datetime: '20140127180900',
                        body: [
                            'current admission new note\r\n'
                        ],
                        author_uid: 'urn:va:user:SITE:1',
                        signer_uid: 'urn:va:user:SITE:1',
                        document_status: 'RETRACTED',
                        local_title: 'NURSING ADMISSION ASSESSMENT ',
                        document_def_uid: 'urn:va:doc-def:SITE:1653'
                    },
                    {
                        uid: 'urn:va:document:SITE:100022:8314',
                        facility_name: 'CAMP BEE',
                        phrase: [
                            'CAMP BEE',
                            'Progress Note',
                            'PROGRESS NOTES',
                            'C&P ACROMEGALY'
                        ],
                        kind: 'Progress Note',
                        summary: 'C&P ACROMEGALY',
                        datetime: '20140127180800',
                        body: [
                            'old admission new note\r\n'
                        ],
                        author_uid: 'urn:va:user:SITE:1',
                        signer_uid: 'urn:va:user:SITE:1',
                        document_status: 'COMPLETED',
                        local_title: 'C&P ACROMEGALY',
                        document_def_uid: 'urn:va:doc-def:SITE:1295'
                    }
                ]
            },
            highlighting: {
                'urn:va:document:SITE:100022:8315': {},
                'urn:va:document:SITE:100022:8315': {},
                'urn:va:document:SITE:100022:8314': {
                    summary: [
                        '{{addTag \'Progress\' \'mark\' \'cpe-search-term-match\'}} Note'
                    ]
                }
            }
        };
    var req = {
        route: {
            stack: [{method: 'get'}],
            path: '/text/search'
        },
        timers: {
            start: function(){},
            stop: function(){}
        }
    };
    var res = {};

    it('should remove retracted documents from the results', function(done) {
        sinon.stub(solrSimpleClient, 'executeSolrQuery').callsFake(function(query, method, req, callback) {
            callback(null, solrResponse);
        });
        sinon.stub(asuUtils, 'applyAsuRules').callsFake(function(req, hmpResponse, callback) {
            var retracted = _.find(hmpResponse.data.items, {status: 'RETRACTED'});
            retracted.stub = 'true';
            callback(null, hmpResponse.data.items);
        });

        res.rdkSend = function(body) {
            expect(body.data.items.length).to.be(2);
            expect(_.find(body.data.items, {status: 'RETRACTED'})).to.be.undefined();
            done();
        };

        var queryStrings = [''];
        var query = {pid: 'SITE;1234', query: 'blood'};

        executeAndTransformSolrQuerys(queryStrings, res, req, query);
    });
});
