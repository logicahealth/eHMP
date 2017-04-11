define([
	'backbone',
	'marionette',
	'app/applets/lab_results_grid/modal/modalView',
	'hbs!app/applets/lab_results_grid/modal/modalFooterTemplate'
], function(Backbone, Marionette, modalView, modalFooterTemplate) {
	'use strict';

	return Backbone.Marionette.ItemView.extend({
		template: modalFooterTemplate,
		events: {
			'click #modalCloseButton': 'closeModal'
		},
		closeModal: function(e) {
			modalView.resetSharedModalDateRangeOptions();
		}
	});
});