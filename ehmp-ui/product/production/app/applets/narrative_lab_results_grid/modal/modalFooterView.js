define([
	'backbone',
    'marionette',
	'handlebars',
	'app/applets/narrative_lab_results_grid/modal/modalView'
], function(Backbone, Marionette, Handlebars, modalView) {
	'use strict';

	return Backbone.Marionette.ItemView.extend({
		template: Handlebars.compile('<button type="button" data-dismiss="modal" id="modalCloseButton" title="Press enter to close." class="btn btn-default btn-sm">Close</button>'),
		events: {
			'click #modalCloseCutton': 'closeModal'
		},
		closeModal: function(e) {
			modalView.resetSharedModalDateRangeOptions();
		}
	});
});

