'use strict';

var _ = require('lodash');
var suggestClient = require('./suggest-search');
var nock = require('nock');

nock.cleanAll();

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'suggest-search'
}));

var solrBaseUrl = 'http://solrserver.com';  //made up value for mocking

//disable ontology
var defaultRequest = {
    logger: logger,
    app: {
        config: {
            "ontologySuggest": {
                "enabled": false,
                "baseUrl": "https://browser-aws-1.ihtsdotools.org",
                "url": "/api/snomed",
                "database": "us-edition",
                "version": "v20150901"
            },
            solrServer: {
                baseUrl: solrBaseUrl,
                url: '/solr/vpr'
            },
        }
    },
    query: {
        pid: 'AAAA',
        query: 'pencollin'
    }
}

var defaultSolrSuggestResponse = {
    "responseHeader": {
        "status": 0,
        "QTime": 9
    },
    "suggest": {
        "freetext_suggester": {
            "pencollin": {
                "numFound": 0,
                "suggestions": []
            }
        },
        "phrase_suggester": {
            "pencollin": {
                "numFound": 0,
                "suggestions": []
            }
        }
    },
    "spellcheck": {
        "suggestions": [
            "pencollin",
            {
                "numFound": 5,
                "startOffset": 0,
                "endOffset": 9,
                "origFreq": 0,
                "suggestion": [
                    {
                        "word": "penicillin",
                        "freq": -1
                    },
                    {
                        "word": "penicillins",
                        "freq": -1
                    },
                    {
                        "word": "hemicollin",
                        "freq": -1
                    },
                    {
                        "word": "penicillinic",
                        "freq": -1
                    },
                    {
                        "word": "tenuicollis",
                        "freq": -1
                    }
                ]
            }
        ],
        "correctlySpelled": false,
        "collations": [
            "collation",
            "penicillin"
        ]
    }
}

describe('suggest-search', function() {

    var spies = null;
    var mockResponse = null;
    var fetchDone = false;

    var setFetchDone = function() {
        fetchDone = true;
    };

    var afterFetchDoneDo = function(cb) {
        if (!fetchDone) {
            setTimeout(function() {afterFetchDoneDo(cb)}, 500);
            return;
        }

        cb();
    };

    beforeEach(function() {
        fetchDone = false;

        mockResponse = {
            rdkSend: function() {
                // no-op
            }
        };

        spies = {};
        _.set(spies, 'rdkSend', sinon.stub(mockResponse, 'rdkSend', setFetchDone));

        //reset the nock mocking.  Otherwise the tests on failure conditions will erroneously succeed due to
        //nock throwing err for unexpected calls.
        nock.cleanAll();
    });

    it('retrieves suggestions (happy path)', function(done) {

        //focusing on the solr suggest response

        //very specific url's at the moment, if there's a breaking issue later, may need to decide whether to make
        //it more general or not.
        nock(solrBaseUrl)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=kind&terms.sort=count&terms.regex=.*pencollin.*&terms.regex.flag=case_insensitive&wt=json')
            .reply(200, {});
        nock(solrBaseUrl)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=med_drug_class_name&terms.sort=count&terms.regex=.*pencollin.*&terms.regex.flag=case_insensitive&wt=json')
            .reply(200, {});
        nock(solrBaseUrl)
            .get('/solr/vpr/suggest?q=pencollin&wt=json')
            .reply(200, defaultSolrSuggestResponse);
        nock(solrBaseUrl)
            .get('/solr/vpr/select?fl=qualified_name%2Cmed_drug_class_name&fq=domain%3Amed&q=*pencollin*&rows=0&wt=json&facet=true&facet.pivot=med_drug_class_name%2Cqualified_name&synonyms=true&defType=synonym_edismax')
            .reply(200, {});


        suggestClient.suggestSearch(defaultRequest, mockResponse);

        afterFetchDoneDo(function() {
            expect(spies.rdkSend.called).to.be.true();
            expect(spies.rdkSend.calledOnce).to.be.true();

            var suggestResponse = spies.rdkSend.args[0][0]
            expect(suggestResponse.data.items.length).to.eql(6);

            //Check the first and second record to ensure they are structured correctly
            var items = suggestResponse.data.items;
            expect(items[0].display).to.not.be.null();
            expect(items[0].query).to.not.be.null();
            expect(items[0].textSearchTerm).to.not.be.null();

            expect(items[1].display).to.not.be.null();
            expect(items[1].query).to.not.be.null();
            expect(items[1].textSearchTerm).to.not.be.null();
            expect(items[1].category).to.not.be.null();

            done();
        });
    });


    it('DE3181 - gets suggests for lowercase value of the query', function(done) {

        //focusing on the solr suggest response

        //very specific url's at the moment, if there's a breaking issue later, may need to decide whether to make
        //it more general or not.
        nock(solrBaseUrl)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=kind&terms.sort=count&terms.regex=.*Pencollin.*&terms.regex.flag=case_insensitive&wt=json')
            .reply(200, {});
        nock(solrBaseUrl)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=med_drug_class_name&terms.sort=count&terms.regex=.*Pencollin.*&terms.regex.flag=case_insensitive&wt=json')
            .reply(200, {});

        //query is still specified with lower case version of "Pencollin"
        nock(solrBaseUrl)
            .get('/solr/vpr/suggest?q=pencollin&wt=json')
            .reply(200, defaultSolrSuggestResponse);
        nock(solrBaseUrl)
            .get('/solr/vpr/select?fl=qualified_name%2Cmed_drug_class_name&fq=domain%3Amed&q=*Pencollin*&rows=0&wt=json&facet=true&facet.pivot=med_drug_class_name%2Cqualified_name&synonyms=true&defType=synonym_edismax')
            .reply(200, {});


        var request = _.clone(defaultRequest);
        request.query.query = "Pencollin"  //use capitalized version
        suggestClient.suggestSearch(defaultRequest, mockResponse);

        afterFetchDoneDo(function() {
            expect(spies.rdkSend.called).to.be.true();
            expect(spies.rdkSend.calledOnce).to.be.true();

            var suggestResponse = spies.rdkSend.args[0][0]

            expect(suggestResponse.data.items.length).to.eql(6);

            done();
        });
    });


});
