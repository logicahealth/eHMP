define([
	'app/resources/fetch/tasks/util',
	'app/resources/fetch/tasks/model'
], function(Util, Task) {
	'use strict';

	var Current = ADK.Resources.Collection.extend({
		resource: 'tasks-current',
		vpr: 'currenttask',
		fetchType: 'POST',
		model: Task,
		parse: function(response) {
			return response.data.items;
		},
		fetchCollection: function(criteria) {
			var fetchOptions = {
				resourceTitle: this.resource,
				fetchType: this.fetchType,
				criteria: criteria
			};
			return ADK.ResourceService.fetchCollection(fetchOptions, this);
		}
	});

	return Current;
});