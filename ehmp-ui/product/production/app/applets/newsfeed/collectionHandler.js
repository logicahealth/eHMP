define([
    "backbone",
    "underscore",
    "app/applets/newsfeed/newsfeedUtils",
    "app/applets/newsfeed/eventHandlers"

], function(Backbone, _, newsfeedUtils, EventHandlers) {
    "use strict";

    return {
        queryCollection: function(context, dateModel, existingCollection) {
            var options = {};
            if (dateModel !== undefined) {
                options.isOverrideGlobalDate = true;
                options.fromDate = dateModel.from;
                options.toDate = dateModel.to;
            }

            //noinspection JSUnresolvedFunction
            var fetchOptions = {
                cache: true,
                criteria: {
                    filter: 'or(' + context.buildJdsDateFilter('dateTime', options) + ',' + context.buildJdsDateFilter('administeredDateTime', options) + ',' + context.buildJdsDateFilter('observed', options) + ')',
                    order: 'activityDateTime DESC'
                },
                pageable: true,
                allowAbort: true,
                resourceTitle: 'patient-record-timeline',
                viewModel: {
                    parse: function(response) {
                        //response.primaryProviderDisplay = newsfeedUtils.getPrimaryProviderDisplay(response);
                        response.displayType = newsfeedUtils.getDisplayType(response);
                        response.primaryProviderDisplay = newsfeedUtils.getEnteredBy(response);

                        if (!response.activityDateTime) {
                            // DOD puts dates in resulted attribute
                            response.activityDateTime = response.resulted;
                        }

                        //exists to assist with filtering
                        var activityDateTime = response.activityDateTime;
                        if (!activityDateTime) {
                            activityDateTime = response.resulted;
                        }
                        var activityDateTimeMoment = moment(activityDateTime, "YYYYMMDDHHmmss");
                        response.activityDateTimeByIso = activityDateTimeMoment.format("YYYY-MM-DD HH:mm");
                        response.activityDateTimeByIsoWithSlashes = activityDateTimeMoment.format("YYYY/MM/DD HH:mm");

                        response.isFuture = activityDateTimeMoment.isAfter(moment());

                        if (response.kind.toLowerCase() === 'procedure') {
                            response.displayName = response.name || response.typeName || response.summary || "Unknown";
                        }
                        return response;
                    }
                }
            };
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            return ADK.PatientRecordService.fetchCollection(fetchOptions, existingCollection);
        }
    };
});
