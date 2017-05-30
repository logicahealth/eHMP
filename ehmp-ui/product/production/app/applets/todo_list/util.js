define([

], function() {
	'use strict';
	return {
		isStaffView: function() {
			var requestView = ADK.Messaging.request('get:current:screen').config.id;
			return (requestView === 'provider-centric-view' || requestView === 'todo-list-provider-full');
		}
	};
});