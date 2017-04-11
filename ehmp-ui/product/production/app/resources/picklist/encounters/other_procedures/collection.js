define([], function() {
	'use strict';

	var Procedure = ADK.Resources.Picklist.Model.extend({
		idAttribute: 'conceptId',
		label: 'prefText',
		name: 'prefText',
        value: 'conceptId',
		defaults: {
			conceptId: 'None',
			label: 'No Procedures Found.',
			id: 'None',
			value: 'None'
		},
		parse: function(response){
			response.label = response.prefText + ' (' + response.conceptId + ')';
			response.id = response.conceptId || response.prefText;
			response.value = response.id;
			return response;
		}
	});

	var Procedures = ADK.Resources.Picklist.Collection.extend({
		type: 'write-pick-list',
		model: Procedure,
		params: function(method, options) {
            return {
            	type: 'encounters-procedures-lexicon-lookup',
                searchString: options.searchString || '',
                site: this.user.get('site')
            };
        },
    });

	return Procedures;

});