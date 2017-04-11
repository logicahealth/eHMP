define([
	'backbone',
	'underscore'
], function(Backbone, _) {
	'use strict';

	return Backbone.Model.extend({
		defaults: {
			dueDateFormatted: '',
			doneDateFormatted: '',
			typeText: '',
			priorityText: 'None'
		},
		parse: function(response) {
			if(_.isString(response.type)) {
				response.typeText = _.capitalize(response.type);
			}
			if(!_.isUndefined(response.priority)) {
		        if (response.priority > 80) {
		            response.priorityText = 'Critical';
		        } else if (response.priority > 60) {
		            response.priorityText = 'High';
		        } else if (response.priority > 40) {
		            response.priorityText = 'Moderate';
		        } else if (response.priority > 20) {
		            response.priorityText = 'Low';
		        } else if (response.priority > 0) {
		            response.priorityText = 'Very Low';
		        }
		    }

            if(_.isString(response.dueDate)) {
            	response.dueDateFormatted = ADK.utils.formatDate(response.dueDate, 'M/D/YYYY', 'YYYYMMDDHHmmss');
            }

            if(_.isString(response.dueDate)) {
            	response.doneDateFormatted = ADK.utils.formatDate(response.doneDate, 'M/D/YYYY', 'YYYYMMDDHHmmss');
            }

            return response;
        }
	});
});