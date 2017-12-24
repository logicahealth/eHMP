define([

], function() {
	'use strict';
	return {
		isStaffView: function() {
			return ADK.WorkspaceContextRepository.currentContextId === 'staff';
		}
	};
});