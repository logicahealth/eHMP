define([
	'underscore',
	'jquery',
	'api/UserService',
	'api/Messaging',
	'main/components/views/notificationsModal'
], function(_, $, UserService, Messaging, NotificationsModal) {

	var NotificationsFetch = function() {
		var options = {
			globalNotificationsCollection: new Backbone.Collection()
		};
		Messaging.on('notifications:realtime', function(notifications) {
			NotificationsModal.show(options);
		});
	};

	var notificationsFetch = new NotificationsFetch();

	return notificationsFetch;
});