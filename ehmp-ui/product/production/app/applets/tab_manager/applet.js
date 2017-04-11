define(['backbone',
		'marionette',
		'underscore',
		'handlebars',
		'app/applets/tab_manager/views/tabManagerView'
	],
	function(Backbone, Marionette, _, Handlebars, tabManagerView) {
		"use strict";
		var applet = {
			id: 'tab_manager',
			viewTypes: [{
				type: 'summary',
				view: tabManagerView
			}],
			defaultViewType: 'summary'
		};
		return applet;
	});