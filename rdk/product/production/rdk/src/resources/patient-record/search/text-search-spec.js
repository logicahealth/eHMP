'use strict';

var textSearch = require('./text-search');
var buildSolrQuery = textSearch._buildSolrQuery;
var buildSpecializedSolrQuery = textSearch._buildSpecializedSolrQuery;
var buildDefaultQuery = textSearch._buildDefaultQuery;

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
        var expectedSolrQuery = 'fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3A*%3A*&fq=domain%3A(NOT%20patient)' +
            '&q=&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';
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
            'fq=domain%3A(NOT%20patient)&q=&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true' +
            '&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';
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
        var expectedSolrQuery = (
            'fl=comment%2Cproblem_status%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_n' +
            'ame%2Cbody&fq=-removed%3Atrue&fq=pid%3A10108&fq=domain%3Adocument&fq=domain%3A(NOT%20pa' +
            'tient)&hl=true&hl.fl=prn_reason%2Cadministration_comment%2Csummary%2Ckind%2Cfacility_name%2Cbody&q=&start=0&rows=101' +
            '&wt=json&synonyms=true&defType=synonym_edismax&hl.fragsize=45&hl.snippets=5');
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
        var expectedSolrQuery = 'sort=overall_stop%20desc&fl=qualified_name%2Cva_type%2Clast_filled%2Clast_give%2Cmed_drug_class_name%2Cuid' +
            '%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&group=true&group.field=qualified_name&hl.fl=administration_comment%2Cprn_reason' +
            '%2Csummary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&q.op=AND&fq=pid%3A10108&fq=domain%3Amed&fq=domain%3A(NOT%20patient)&q=metformin&start=0&' +
            'rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.snippets=5';
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
        var expectedSolrQuery = 'fq=service%3A(LR%20OR%20GMRC%20OR%20RA%20OR%20FH%20OR%20UBEC%20OR%20%22OR%22)' +
            '&fq=-status_name%3A(COMPLETE%20OR%20%22DISCONTINUED%2FEDIT%22%20OR%20DISCONTINUED%20OR%20EXPIRED%20OR%20LAPSED)&fq=pid%3A10108&fq=domain%3Aorder&fq=domain%3A(NOT%20patient)&fl=service%2Cstatus_name%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&hl.fl=content%2Csummary%2Ckind%2Cfacility_name%2Cbody&q=potassium' +
            '&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fragsize=45&hl.snippets=5';
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
        var expectedSolrQuery = 'fl=local_title%2Cphrase%2Cdocument_def_uid%2Cdocument_status%2Cauthor_uid%2Csigner_uid%2Ccosigner_uid%2Cattending_uid%2Cuid%2Cdatetime' +
            '%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&sort=reference_date_time%20desc&hl.fl=body%2Csubject%2Csummary%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain' +
            '%3Adocument&fq=domain%3A(NOT%20patient)&q=metformin&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fragsize=45&hl.snippets=5';
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
        var expectedSolrQuery = 'sort=observed%20desc&group=true&group.field=qualified_name&fl=uid%2Cdatetime' +
            '%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3Avital&fq=domain%3A(NOT%20patient)' +
            '&q=pulse&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';
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
        var expectedSolrQuery = 'fl=lnccodes%2Ctype_code%2Cgroup_name%2Cobserved%2CinterpretationName%2Cunits%2Cuid%2Cdatetime' +
            '%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&sort=observed%20desc&group=true&group.field=qualified_name_units&hl.fl=comment' +
            '%2Csummary%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108&fq=domain%3Aresult&fq=domain%3A(NOT%20patient)&q=plasma&start=0&rows=101' +
            '&wt=json&synonyms=true&defType=synonym_edismax&hl=true&hl.fragsize=45&hl.snippets=5';
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
        var expectedSolrQuery = 'fq=-removed%3Atrue&fq=pid%3A10108&fq=domain%3Aproblem&fq=domain%3A(NOT%20patient)&fl=comment%' +
            '2Cicd_code%2Cicd_name%2Cicd_group%2Cproblem_status%2Cacuity_name%2Cuid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody' +
            '&sort=problem_status%20asc&group=true&group.field=icd_code&q=foo&start=0&rows=101&wt=json&synonyms=true&defType=synonym_edismax&hl=true' +
            '&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';
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

        var expectedSolrQuery = 'debugQuery=true&fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108' +
            '&fq=domain%3A(accession%20OR%20allergy%20OR%20treatment%20OR%20consult%20OR%20procedure%20OR%20obs%20OR%20image%20OR%' +
            '20surgery%20OR%20mh%20OR%20immunization%20OR%20pov%20OR%20skin%20OR%20exam%20OR%20cpt%20OR%20education%20OR%20factor%20OR%' +
            '20appointment%20OR%20visit%20OR%20rad%20OR%20ptf)&fq=domain%3A(NOT%20patient)&q=&start=0&rows=101&wt=json&synonyms=true&' +
            'defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';

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

        var expectedSolrQuery = 'debugQuery=false&fl=uid%2Cdatetime%2Csummary%2Curl%2Ckind%2Cfacility_name%2Cbody&fq=pid%3A10108' +
            '&fq=domain%3A(accession%20OR%20allergy%20OR%20treatment%20OR%20consult%20OR%20procedure%20OR%20obs%20OR%20image%20OR%' +
            '20surgery%20OR%20mh%20OR%20immunization%20OR%20pov%20OR%20skin%20OR%20exam%20OR%20cpt%20OR%20education%20OR%20factor%20OR%' +
            '20appointment%20OR%20visit%20OR%20rad%20OR%20ptf)&fq=domain%3A(NOT%20patient)&q=&start=0&rows=101&wt=json&synonyms=true&' +
            'defType=synonym_edismax&hl=true&hl.fl=summary%2Ckind%2Cfacility_name%2Cbody&hl.fragsize=45&hl.snippets=5';
        expect(solrQuery).to.equal(expectedSolrQuery);

        var defaultQuery = buildDefaultQuery(reqQuery, 'default');
        expect(defaultQuery).to.equal(expectedSolrQuery);
    });
});
