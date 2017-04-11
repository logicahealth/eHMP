define([], function() {

    var ExtendedTerm = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'lexIen',
        label: 'prefText',
        value: function() {
            return this.get('lexIen');
        },
        defaults: {}
    });

    var extendedTerms = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-problems-lexicon-extended-lookup',
        model: ExtendedTerm,
        params: function(method, options) {
            return {
                searchString: options.searchString || '',
                synonym: options.synonym,
                noMinimumLength: options.noMinimumLength
            };
        }
    });

    return extendedTerms;
});