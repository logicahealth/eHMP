define([], function() {
	'use strict';

	var Procedure = ADK.Resources.Picklist.Model.extend({
		idAttribute: 'ien',
		label: 'label',
		name: 'ien',
		value: 'ien',
		defaults: {
			id: '',
			ien: '',
			name: '',
			label: '',
			value: false,
			quantity: 1,
			provider: undefined,
		},
		childParse: false,
		parse: function(response, options) {
			var data = response;
			data.label = response.name + ' (' + response.ien + ')';
			data.id = response.ien;
			data.comments = new Backbone.Collection();
			data.modifiers = new ADK.UIResources.Picklist.Encounters.CptModifiers();
			data.providerPickList = new Backbone.Collection();
			return data;
		}
	});

	var ProcedureCategory = ADK.Resources.Picklist.Group.extend({
		idAttribute: 'categoryName',
		groupLabel: 'categoryName',
		picklist: 'cptCodes',
		Collection: ADK.Resources.Picklist.Collection.extend({
			model: Procedure
		}),
		defaults: {
			categoryName: 'OTHER PROCEDURES',
			cptCodes: new Backbone.Collection()
		},
		initialize: function() {
			this.listenTo(this.get('cptCodes'), 'change:value', function(changed) {
				this.trigger('procedure:change', changed);
			});
		}
	});

	var Procedures = ADK.Resources.Picklist.Collection.extend({
		type: 'write-pick-list',
		model: ProcedureCategory,
		params: function(method, options) {
			return {
				type: 'encounters-procedure-types',
				visitDate: options.dateTime || '',
				site: this.user.get('site'),
				ien: options.clinicIen || ''
			};
		}
	});

	return Procedures;

});