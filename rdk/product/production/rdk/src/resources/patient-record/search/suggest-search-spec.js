'use strict';

var _ = require('lodash');
var nock = require('nock');
var bunyan = require('bunyan');
var solrClientLib = require('solr-client');

var suggestClient = require('./suggest-search');

var logger = bunyan.createLogger({
    name: 'suggest-search-spec'
});

// comment this out to see logging
logger = sinon.stub(logger);

var SOLR_ADDR = 'solrserver.com';
var SOLR_PORT = PORT;
var SOLR_CORE = 'vpr';
var SOLR_PATH = '/solr';
var SOLR_BASE_URL = 'http://' + SOLR_ADDR + ':' + SOLR_PORT; // made up value for mocking

var SOLR_CLIENT_OPTIONS = {
    'host': SOLR_ADDR,
    'port': SOLR_PORT,
    'core': SOLR_CORE,
    'path': SOLR_PATH
};


/*******************************************************************************/
/*      Functions returning Objects to to make them safe for modification      */
/*******************************************************************************/

function createDefaultRequest() {
    // disable ontology
    return {
        solrTestClient: solrClientLib.createClient(SOLR_CLIENT_OPTIONS),
        logger: logger,
        app: {
            config: {
                ontologySuggest: {
                    enabled: false,
                    baseUrl: 'https://browser-aws-1.ihtsdotools.org',
                    url: '/api/snomed',
                    database: 'us-edition',
                    version: 'v20150901'
                },
                solrClient: {
                    core: SOLR_CORE,
                    zooKeeperConnection: 'IP            '
                },
            }
        },
        query: {
            pid: 'AAAA',
            query: 'pencollin'
        }
    };
}

function createDefaultSolrSuggestResponse() {
    return {
        responseHeader: {
            status: 0,
            QTime: 9
        },
        suggest: {
            freetext_suggester: {
                pencollin: {
                    numFound: 0,
                    suggestions: []
                }
            },
            phrase_suggester: {
                pencollin: {
                    numFound: 0,
                    suggestions: []
                }
            }
        },
        spellcheck: {
            suggestions: [
                'pencollin', {
                    numFound: 5,
                    startOffset: 0,
                    endOffset: 9,
                    origFreq: 0,
                    suggestion: [{
                        word: 'penicillin',
                        freq: -1
                    }, {
                        word: 'penicillins',
                        freq: -1
                    }, {
                        word: 'hemicollin',
                        freq: -1
                    }, {
                        word: 'penicillinic',
                        freq: -1
                    }, {
                        word: 'tenuicollis',
                        freq: -1
                    }]
                }
            ],
            correctlySpelled: false,
            collations: [
                'collation',
                'penicillin'
            ]
        }
    };
}

/*******************************************************************************/
/*                                                                             */
/*******************************************************************************/

describe('suggest-search', function() {
    var spies = {};
    var mockResponse = null;
    var fetchDone = false;

    var afterFetchDoneDo = function(callback) {
        if (!fetchDone) {
            return setTimeout(afterFetchDoneDo, 0, callback);
        }

        return setTimeout(callback);
    };

    beforeEach(function() {
        fetchDone = false;

        var rdkSendSpy = sinon.spy(function() {
            fetchDone = true;
        });

        mockResponse = {
            rdkSend: rdkSendSpy,
            status: function() {
                return {
                    rdkSend: rdkSendSpy
                };
            }
        };

        spies.rdkSend = rdkSendSpy;

        // Reset the nock mocking--otherwise the tests on failure conditions will
        // erroneously succeed due to nock throwing err for unexpected calls.
        nock.cleanAll();
    });

    it('tests retrieve suggestions (happy path)', function(done) {
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=kind&terms.sort=count&terms.regex=.*pencollin.*&terms.regex.flag=case_insensitive&requestId=&wt=json')
            .reply(200, {});
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=med_drug_class_name&terms.sort=count&terms.regex=.*pencollin.*&terms.regex.flag=case_insensitive&requestId=&wt=json')
            .reply(200, {});
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/suggest?q=pencollin&requestId=&wt=json')
            .reply(200, createDefaultSolrSuggestResponse());
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/select?q=pencollin&rows=0&facet=true&facet.pivot=med_drug_class_name%2Cqualified_name&facet.limit=5&requestId=&wt=json')
            .reply(200, {});


        suggestClient.suggestSearch(createDefaultRequest(), mockResponse);

        afterFetchDoneDo(function() {
            expect(spies.rdkSend.called).to.be.true();
            expect(spies.rdkSend.calledOnce).to.be.true();

            var suggestResponse = spies.rdkSend.args[0][0];

            expect(_.has(suggestResponse, 'data')).to.be.true();
            expect(_.get(suggestResponse, 'data.items.length')).to.eql(6);

            // Check the first and second record to ensure they are structured correctly
            var items = suggestResponse.data.items;
            expect(_.get(items, ['0', 'display'])).to.not.be.null();
            expect(_.get(items, ['0', 'query'])).to.not.be.null();
            expect(_.get(items, ['0', 'textSearchTerm'])).to.not.be.null();

            expect(_.get(items, ['1', 'display'])).to.not.be.null();
            expect(_.get(items, ['1', 'query'])).to.not.be.null();
            expect(_.get(items, ['1', 'textSearchTerm'])).to.not.be.null();
            expect(_.get(items, ['1', 'category'])).to.not.be.null();

            done();
        });
    });


    it('tests DE3181 fix - gets suggests for lowercase value of the query', function(done) {
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=kind&terms.sort=count&terms.regex=.*Pencollin.*&terms.regex.flag=case_insensitive&requestId=&wt=json')
            .reply(200, {});
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/terms?qt=%2Fterms&terms.fl=med_drug_class_name&terms.sort=count&terms.regex=.*Pencollin.*&terms.regex.flag=case_insensitive&requestId=&wt=json')
            .reply(200, {});

        // query is still specified with lower case version of 'Pencollin'
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/suggest?q=pencollin&requestId=&wt=json')
            .reply(200, createDefaultSolrSuggestResponse());
        nock(SOLR_BASE_URL)
            .get('/solr/vpr/select?q=Pencollin&rows=0&facet=true&facet.pivot=med_drug_class_name%2Cqualified_name&facet.limit=5&requestId=&wt=json')
            .reply(200, {});


        var request = createDefaultRequest();
        request.query.query = 'Pencollin'; // use capitalized version
        suggestClient.suggestSearch(request, mockResponse);

        afterFetchDoneDo(function() {
            expect(spies.rdkSend.called).to.be.true();
            expect(spies.rdkSend.calledOnce).to.be.true();

            var suggestResponse = spies.rdkSend.args[0][0];

            expect(_.get(suggestResponse, 'data.items.length')).to.eql(6);

            done();
        });
    });
});
