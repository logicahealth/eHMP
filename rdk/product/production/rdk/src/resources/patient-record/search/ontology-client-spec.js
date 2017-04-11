'use strict';

var ontologyClient = require('./ontology-client');
var nock = require('nock');
nock.cleanAll();

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'ontology-client'
}));

var defaultRequest = {
    logger: logger,
    app: {
        config: {
            'ontologySuggest': {
                'enabled': true,
                'baseUrl': 'https://browser-aws-1.ihtsdotools.org',
                'url': '/api/snomed',
                'database': 'us-edition',
                'version': 'v20150901'
            }
        }
    }
};

function buildExpectedQuery(ontologySuggest, queryString) {
    return ontologySuggest.url + '/' + ontologySuggest.database + '/' + ontologySuggest.version +
        '/descriptions?query=' + queryString +
        '&lang=english&statusFilter=activeOnly&normalize=true&returnLimit=100&skipTo=0&groupByConcept=1&searchMode=partialMatching';
}
describe('ontology-client', function() {

    beforeEach(function() {
        //reset the nock mocking.  Otherwise the tests on failure conditions will erroneously succeed due to
        //nock throwing err for unexpected calls.
        nock.cleanAll();
    });

    it('creates default error result in correct format', function(done) {
        var result = ontologyClient.createUnavailableResults();
        expectUnavailableResult(result);
        done();
    });

    it('calls the snomed service', function(done) {

        var queryString = 'head';
        var request = defaultRequest;
        var mockResult = {
            'matches': [
                {
                    'term': 'Head CT',
                    'conceptId': '303653007',
                    'active': true,
                    'conceptActive': true,
                    'fsn': 'Computed tomography of head (procedure)',
                    'module': '900000000000207008',
                    'definitionStatus': 'Fully defined'
                },
            ],
            'details': {
                'total': 1,
                'skipTo': 0,
                'returnLimit': 100
            }
        };

        //build expected url
        var ontologySuggest = request.app.config.ontologySuggest;
        var query = buildExpectedQuery(ontologySuggest, queryString);

        //nock it
        nock(ontologySuggest.baseUrl)
            .get( query)
            .reply(200, mockResult);


        ontologyClient.executeTermQuery(queryString, request, function(error, result){
            expect(error).to.be.null();
            expect(result).to.not.be.null();
            expect(result.details.total).to.be(1);
            expect(result.matches[0].term).to.be('Head CT');
            done();
        });
    });

    it('returns default result if snomed service refuses connection with http 502', function(done) {

        var queryString = 'head';
        var request = defaultRequest;

        //build expected url
        var ontologySuggest = request.app.config.ontologySuggest;
        var query = buildExpectedQuery(ontologySuggest, queryString);

        //nock it
        nock(ontologySuggest.baseUrl)
            .get( query)
            .reply(502, 'connection refused');


        ontologyClient.executeTermQuery(queryString, request, function(error, result){
            expect(error).to.be.null();
            expectUnavailableResult(result);
            done();
        });
    });


    it('returns default result if snomed service does not return JSON', function(done) {

        var queryString = 'head';
        var request = defaultRequest;

        //build expected url
        var ontologySuggest = request.app.config.ontologySuggest;
        var query = buildExpectedQuery(ontologySuggest, queryString);

        //nock it
        nock(ontologySuggest.baseUrl)
            .get( query)
            .reply(200, 'not a JSON response');


        ontologyClient.executeTermQuery(queryString, request, function(error, result){
            expect(error).to.be.null();
            expectUnavailableResult(result);
            done();
        });
    });

    it('returns default result if snomed service configured to bad host', function(done) {
        var queryString = 'head';
        var request = defaultRequest;

        //build expected url
        var ontologySuggest = request.app.config.ontologySuggest;
        var query = buildExpectedQuery(ontologySuggest, queryString);

        //nock it and have the request fail to simulate connection issue
        nock(ontologySuggest.baseUrl)
            .get( query)
            .replyWithError('Simulated connection error');

        ontologyClient.executeTermQuery(queryString, request, function(error, result){
            expect(error).to.be.null();
            expectUnavailableResult(result);
            done();
        });
    });

    function expectUnavailableResult(result) {
        expect(result).to.not.be.null();

        expect(result.details.total).to.be(1);
        expect(result.matches[0].term).to.be('Ontology Suggestions unavailable');
    }

});
