define([
	'backbone'
], function(Backbone) {
	'use strict';

	return Backbone.Model.extend({
		resource: 'cds-advice-detail',
		defaults: function() {
			return {
				pid: ADK.PatientRecordService.getCurrentPatient().getIdentifier()
			};
		},
		initialize: function(options) {
			this.url = ADK.ResourceService.buildUrl(this.resource, this.attributes);
		},
		parse: function(response) {
			if(_.get(response, 'data.items') && response.data.items.length > 0) {
				response = response.data.items[0];
			}
			return response;
		}
	});
});