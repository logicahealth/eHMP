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
                expect(highlightedText).toEqual('<mark class="cpe-search-term-match">Diabetes</mark> Consultation');
            });

            it('does not insert highlight markup when there is no match', function(){
                var terms = ['diabetes', 'diabete'];
                var textToHighlight = 'Hypertension Consultation';
                var highlightedText = StringUtils.addSearchResultElementHighlighting(textToHighlight, terms);
                expect(highlightedText).toEqual('Hypertension Consultation');
            });

            it('escapes characters on original text', function(){
                var terms = ['diabetes', 'diabete'];
                var textToHighlight = 'diabetes orthotics request (camp) <diabetes/orthotics request (camp)> cons Details';
                var highlightedText = StringUtils.addSearchResultElementHighlighting(textToHighlight, terms);
                expect(highlightedText).toEqual('<mark class="cpe-search-term-match">diabetes</mark> orthotics request (camp) &lt;<mark class="cpe-search-term-match">diabetes</mark>/orthotics request (camp)&gt; cons Details');
            });

        });

    });
});