define([
	'moment',
    'backbone',
	'app/resources/fetch/timeline/util'
], function(moment, Backbone, TimelineUtil) {
    'use strict';

	return Backbone.Model.extend({
		parse: function(response) {
            response.displayType = TimelineUtil.getDisplayType(response);
            response.primaryProviderDisplay = TimelineUtil.getEnteredBy(response);

            if (!response.activityDateTime) {
                response.activityDateTime = response.resulted;
            }

            var activityDateTime = response.activityDateTime;
            if (!activityDateTime) {
                activityDateTime = response.resulted;
            }
            var activityDateTimeMoment = moment(activityDateTime, "YYYYMMDDHHmmss");
            response.activityDateTimeByIso = activityDateTimeMoment.format("YYYY-MM-DD HH:mm");
            response.activityDateTimeByIsoWithSlashes = activityDateTimeMoment.format("YYYY/MM/DD HH:mm");

            if (response.kind.toLowerCase() === 'procedure') {
                response.displayName = response.name || response.typeName || response.summary || "Unknown";
            }

            return response;
        }
	});
});