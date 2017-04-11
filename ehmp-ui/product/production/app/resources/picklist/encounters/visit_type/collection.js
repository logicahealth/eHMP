define([], function() {
	'use strict';

	var VisitType = ADK.Resources.Picklist.Model.extend({
		label: 'display',
		name: 'name',
		defaults: {
			ien: '',
			name: '',
			label: '',
			value: false
		},
		childParse: false,
		parse: function(response, options){
			var data = response;
			data.label = response.name + ' (' + response.ien + ')';
			return data;
		}
	});

	var VisitCategory = ADK.Resources.Picklist.Group.extend({
		idAttribute: 'categoryName',
		groupLabel: 'categoryName',
		picklist: 'cptCodes',
		Collection: ADK.Resources.Picklist.Collection.extend({
			model: VisitType
		}),
		defaults: {
			categoryName: '',
			cptCodes: new Backbone.Collection()
		},
		initialize: function(){
        	this.listenTo(this.get('cptCodes'), 'change:value', function(changed){
        		this.trigger('visit:change', changed);
        	});
        }
	});

	var VisitTypes = ADK.Resources.Picklist.Collection.extend({
		type: 'write-pick-list',
		model: VisitCategory,
		params: function(method, options) {
            return {
            	type: 'encounters-visit-categories',
                visitDate: options.dateTime || '',
                site: this.user.get('site'),
                locationUid: options.locationUid || ''
            };
        }    });

	return VisitTypes;

});