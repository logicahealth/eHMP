define(['backbone',
	'marionette',
	'underscore',
], function(Backbone, Marionette, _) {
	"use strict";
	var tabManagerView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: Handlebars.compile(''),
		initialize: function(options) {
			self.viewerWindows = [];
			$(window).on('unload.' + this.cid  ,function() {
				ADK.Messaging.trigger('ImageViewer:close');
			});
			this.listenTo(ADK.Messaging, 'ImageViewer:close', function() {
				this.closeTabs();
			}, this);
			this.listenTo(ADK.Messaging, 'screen:navigate', function(navId) {
				if (navId === 'patient-search-screen' || navId === 'my-notifications-full') {
					this.closeTabs('navigate');
				}
			}, this);
			this.listenTo(ADK.Messaging, 'context:patient:change', function(patient){
				this.closeTabs();
			}, this);
			this.listenTo(ADK.Messaging, 'app:logout', function() {
				this.closeTabs();
			}, this);

			var ImageViewerChannel = ADK.Messaging.getChannel('image_viewer');
			ImageViewerChannel.reply('viewer-tab', function(viewerInfo) {
				var viewerWindow = window.open(viewerInfo.viewerUrl);
				self.viewerWindows.push(viewerWindow);
			});
		},
		closeTabs: function(action) {
			if (self.viewerWindows.length > 0) {
					self.viewerWindows.forEach(function(viewer) {
						viewer.focus();
						viewer.close();
					});
					self.viewerWindows = [];			}
		},
		onDestroy:function(){
			$(window).unbind('unload.' + this.cid);
		}

	});


	ADK.Messaging.trigger('register:component', {
		type: "applicationHeaderItem",
		group: "left",
		key: "image_viewer_manager",
		view: tabManagerView,
		orderIndex: 4,
		shouldShow: function() {
			return (ADK.UserService.hasPermissions('read-patient-record'));
		}
	});

	return tabManagerView;
});