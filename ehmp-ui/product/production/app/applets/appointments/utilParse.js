define([
    'backbone',
    'marionette',
    'underscore',
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.getFormattedDisplayTypeName = function(response) {
        var formattedTypeName = '';
        if (response.typeDisplayName && response.typeDisplayName == 'Event (Historical)') {
            response.formattedTypeName = "Other";
        }else{
            response.formattedTypeName = response.typeDisplayName;
        }

        return response;
    };

    Util.getFacilityColor = function(response) {

        if (response.facilityCode && response.facilityCode == 'DOD') {
            response.facilityColor = 'DOD';
        } else {
            response.facilityColor = 'nonDOD';
        }

        return response;
    };

    Util.getModalTitle = function(model) {
        return model.get('typeDisplayName');
    };

    Util.getFormattedDecription = function(response) {
        if (response.kind) {
            response.formattedDescription = response.kind;
        }else{
            if (response.description && !response.kind) {
                response.formattedDescription = response.description;
            }
        }
        return response;
    };
    Util.getFormattedStatus = function(response) {
        if (response.appointmentStatus) {
            var lowerStatus = response.appointmentStatus.toLowerCase();
            response.status = _.capitalize(lowerStatus);
        } else if( response.appoinmentStatus ) {
            var lowerStatusCompleteFlag = response.appoinmentStatus.toLowerCase();
            if(lowerStatusCompleteFlag === 'complete' || lowerStatusCompleteFlag === 'completed')
            {
                response.status = "Completed";
            }
        }
        return response;
    };

    return Util;
});
