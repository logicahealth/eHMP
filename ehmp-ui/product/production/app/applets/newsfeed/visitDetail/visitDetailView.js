define([
    'backbone',
    'underscore',
    'hbs!app/applets/newsfeed/visitDetail/visitDetailTemplate'
], function(Backbone, _, visitDetailTemplate) {
    "use strict";

    return Backbone.Marionette.ItemView.extend({
        template: visitDetailTemplate,
        serializeData: function() {
			var data = this.model.toJSON();
			if(_.isString(data.appointmentStatus)) {
				var appointmentStatus = data.appointmentStatus.toLowerCase();
				if(appointmentStatus.indexOf('complete') >= 0) {
					data.appointmentStatus = 'Completed';
				} else {
					data.appointmentStatus = _.capitalize(appointmentStatus);
				}
			}

			return data;
        }
    });
});
