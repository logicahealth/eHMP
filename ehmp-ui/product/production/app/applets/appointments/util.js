define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.getDateTimeFormatted = function(response) {
        var dateTime = _.get(response, 'dateTime');
        if (dateTime) {
            response.dateTimeFormatted = ADK.utils.formatDate(dateTime, 'MM/DD/YYYY - HH:mm');
        }
        return response;
    };

    Util.getFormattedDisplayTypeName = function(response) {
        var typeDisplayName = _.get(response, 'typeDisplayName');
        if (typeDisplayName === 'Event (Historical)') {
            response.formattedTypeName = 'Other';
        } else {
            response.formattedTypeName = typeDisplayName;
        }

        return response;
    };

    Util.getFacilityColor = function(response) {
        if (_.get(response, 'facilityCode') === 'DOD') {
            response.facilityColor = 'DOD';
        } else {
            response.facilityColor = 'nonDOD';
        }

        return response;
    };

    Util.getModalTitle = function(model) {
        return model.get('typeDisplayName');
    };

    Util.getFormattedDescription = function(response) {
        var kind = _.get(response, 'kind');
        var description = _.get(response, 'description');
        if (kind) {
            response.formattedDescription = kind;
        } else if (description) {
            response.formattedDescription = description;
        }
        return response;
    };

    Util.getFormattedStatus = function(response) {
        var status = _.get(response, 'appointmentStatus') || _.get(response, 'appoinmentStatus');
        if (status) {
            status = status.toLowerCase();
            if (_.isEqual(status, 'complete') || _.isEqual(status, 'completed')) {
                status = 'completed';
            }
            status = _.capitalize(status);
            response.status = status;
        }

        return response;
    };

    return Util;
});