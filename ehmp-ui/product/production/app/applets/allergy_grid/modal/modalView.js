define([
	'backbone',
	'marionette',
	'underscore',
	'hbs!app/applets/allergy_grid/modal/modalTemplate',
	'app/applets/allergy_grid/util'
], function(Backbone, Marionette, _, modalTemplate, Util) {
	'use strict';

	var ModalView = Backbone.Marionette.ItemView.extend({
		template: modalTemplate,
		initialize: function() {
			this.collection = new ADK.UIResources.Fetch.Allergies.Collection();
		},
		onBeforeShow: function() {
			if (this.fetchOptions) {
				this.collection.fetchCollection(this.fetchOptions);
			}
		},
		collectionEvents: {
			'fetch:success': function(collection) {
				this.model.set(collection.first().attributes);
			}
		},
		modelEvents: {
			'change': 'render'
		},
		serializeModel: function() {
			if (!this.model) {
				return {};
			}

			var modelJSON = _.clone(this.model.attributes);
			modelJSON = Util.processAllergyObject(modelJSON);
			return modelJSON;
		}
	});
	return ModalView;
});