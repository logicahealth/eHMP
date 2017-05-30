define([], function() {
    'use strict';

    var Term = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'lexIen',
        label: 'prefText',
        value: function() {
            return this.get('lexIen');
        },
        defaults: {}
    });

    var terms = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-problems-lexicon-lookup',
        model: Term,
        params: function(method, options) {
            return {
                searchString: options.searchString || '',
                synonym: options.synonym,
                noMinimumLength: options.noMinimumLength
            };
        }
    });

    return terms;
});