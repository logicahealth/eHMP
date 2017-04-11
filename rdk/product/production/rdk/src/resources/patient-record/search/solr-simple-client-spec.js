'use strict';

var _ = require('lodash');
var solrSimpleClient = require('./solr-simple-client');
var compileQueryParameters = solrSimpleClient.compileQueryParameters;
var emulatedHmpGetRelativeDate = solrSimpleClient.emulatedHmpGetRelativeDate;
var escapeQueryChars = solrSimpleClient.escapeQueryChars;


// FUTURE-TODO: test executeSolrQuery with http interception+mock

describe('get emulated HMP relative date with T- values', function () {
    it('should return a YYYYMMDD date for years', function () {
        var relativeDate = emulatedHmpGetRelativeDate('T-3y');
        expect(relativeDate.match(/^\d{8}$/)).to.be.truthy();
    });
    it('should return a YYYYMMDD date for months', function () {
        var relativeDate = emulatedHmpGetRelativeDate('T-3m');
        expect(relativeDate.match(/^\d{8}$/)).to.be.truthy();
    });
    it('should return a YYYYMMDD date for days', function () {
        var relativeDate = emulatedHmpGetRelativeDate('T-3d');
        expect(relativeDate.match(/^\d{8}$/)).to.be.truthy();
    });
    it('should return a YYYYMMDD date for hours', function () {
        var relativeDate = emulatedHmpGetRelativeDate('T-3h');
        expect(relativeDate.match(/^\d{8}$/)).to.be.truthy();
    });
});

describe('compile query parameters', function () {
    it('should merge fl arrays into a comma-separated string', function () {
        var queryParameters = {
            fl: [
                'foo',
                'bar',
                'baz',
                'quux'
            ]
        };
        var compiledQueryParameters = compileQueryParameters(queryParameters);
        expect(compiledQueryParameters.fl).to.equal('foo,bar,baz,quux');
    });
    it('should merge hl.fl arrays into a comma-separated string', function () {
        var queryParameters = {
            'hl.fl': [
                'aboard',
                'about',
                'above',
                'across'
            ]
        };
        var compiledQueryParameters = compileQueryParameters(queryParameters);
        expect(compiledQueryParameters['hl.fl']).to.equal('aboard,about,above,across');
    });

});

describe('escape query chars', function () {
    it('should not escape regular characters', function () {
        var regularCharacters = 'Thequick,brownfoxjumpsoverthelazydog.';
        var processedCharacters = escapeQueryChars(regularCharacters);
        expect(processedCharacters).to.equal(regularCharacters);
    });
    it('should escape spaces', function () {
        var sentence = 'The quick, brown fox jumps over the lazy dog.';
        var processedSentence = escapeQueryChars(sentence);
        var expectedSentence = 'The\\ quick,\\ brown\\ fox\\ jumps\\ over\\ the\\ lazy\\ dog.';
        expect(processedSentence).to.equal(expectedSentence);
    });
    it('should escape other solr-escapable characters', function () {
        var escapables = '\\+-!():^[]"{}~*?|&;';  // literally \+-!():^[]"{}~*?|&;
        var processedEscapables = escapeQueryChars(escapables);
        var expectedEscapables = '\\\\\\+\\-\\!\\(\\)\\:\\^\\[\\]\\"\\{\\}\\~\\*\\?\\|\\&\\;';
        // the above is literally \\\+\-\!\(\)\:\^\[\]\"\{\}\~\*\?\|\&\;
        expect(processedEscapables).to.equal(expectedEscapables);
    });
});
