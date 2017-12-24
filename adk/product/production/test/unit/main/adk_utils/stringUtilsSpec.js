define([
    'backbone',
    'marionette',
    'underscore',
    'jasminejquery',
    'main/adk_utils/stringUtils'
], function(Backbone, Marionette, _, jasmine, StringUtils) {
    'use strict';

    describe('StringUtils', function() {
        describe('has a function named addSearchResultElementHighlighting', function(){
            it('inserts highlight markup when finding matching text', function(){
                var terms = ['diabetes', 'diabete'];
                var textToHighlight = 'Diabetes Consultation';
                var highlightedText = StringUtils.addSearchResultElementHighlighting(textToHighlight, terms);
                expect(highlightedText).toEqual('{{addTag "Diabetes" "mark" "cpe-search-term-match"}} Consultation');
            });

            it('does not insert highlight markup when there is no match', function(){
                var terms = ['diabetes', 'diabete'];
                var textToHighlight = 'Hypertension Consultation';
                var highlightedText = StringUtils.addSearchResultElementHighlighting(textToHighlight, terms);
                expect(highlightedText).toEqual('Hypertension Consultation');
            });

            it('DE7756: Correctly highlight keyword that precedes a > character. First diabetes keyword should be marked', function(){
                var terms = ['diabetes', 'diabete'];
                var textToHighlight = 'diabetes Ref: >= 60 orthotics request (camp) <diabetes/orthotics request (camp)> cons Details';
                var highlightedText = StringUtils.addSearchResultElementHighlighting(textToHighlight, terms);
                expect(highlightedText).toEqual('{{addTag "diabetes" "mark" "cpe-search-term-match"}} Ref: >= 60 orthotics request (camp) <{{addTag "diabetes" "mark" "cpe-search-term-match"}}/orthotics request (camp)> cons Details');
            });
        });

    });
});