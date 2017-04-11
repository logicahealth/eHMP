define([], function() {
	'use strict';

	var Provider = ADK.Resources.Picklist.Model.extend({
		idAttribute: 'code',
		label: name,
		defaults: {
			code: '',
			name: '',
			value: false
		}
	});
	var Providers = ADK.Resources.Picklist.Collection.extend({
		model: Provider,
		params: function(method, options) {
            return {
            	type: 'new-persons-direct',
                newPersonsType: 'PROVIDER',
                date: options.dateTime || '',
                site: this.user.get('site')
            };
        },
    });

	return Providers;

});