define([
	'backbone',
    'marionette',
	'handlebars'
], function(Backbone, Marionette, Handlebars) {
	'use strict';

	return Backbone.Marionette.ItemView.extend({
		template: Handlebars.compile('<button type="button" data-dismiss="modal" id="modalCloseButton" title="Press enter to close." class="btn btn-default btn-sm">Close</button>')
	});
});

