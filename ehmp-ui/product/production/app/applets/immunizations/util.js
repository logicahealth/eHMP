define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.getTimeSinceDate = function(response){
        if(response.administeredDateTime) {
            var timeSinceDate = response.administeredDateTime;
            while(timeSinceDate.length > 4 && timeSinceDate.substring(timeSinceDate.length - 2, timeSinceDate.length) === '00'){
                timeSinceDate = timeSinceDate.substring(0, timeSinceDate.length - 2);
            }
            response.timeSinceDate = timeSinceDate;
        }
        return response;
    };

    Util.getNumericDate = function(response) {
        if (response.administeredDateTime) {
            response.numericDate = ADK.utils.formatDate(response.administeredDateTime, 'YYYYMMDD');
        }
        return response;
    };

    Util.getModalTitle = function(model) {
        return 'Vaccine - ' + model.get('name');
    };

    Util.getObservedFormatted = function(response) {
        response.observedFormatted = '';
        if (response.observed) {
            response.observedFormatted = ADK.utils.formatDate(response.observed);
        }
        return response;
    };

    Util.getObservedTimeFormatted = function(response) {
        response.observedTimeFormatted = '';
        if (response.observed) {
            response.observedTimeFormatted = ADK.utils.formatDate(response.observed, 'HH:mm');
        }
        return response;
    };

    Util.getResultedFormatted = function(response) {
        response.resultedFormatted = '';
        if (response.resulted) {
            response.resultedFormatted = ADK.utils.formatDate(response.resulted);
        }
        return response;
    };

    Util.getResultedTimeFormatted = function(response) {
        response.resultedTimeFormatted = '';
        if (response.resulted) {
            response.resultedTimeFormatted = ADK.utils.formatDate(response.resulted, 'HH:mm');
        }
        return response;
    };

    Util.getContraindicated = function(response) {
        if (response.contraindicated) {
            response.contraindicatedDisplay = 'Yes';

        } else {
          response.contraindicatedDisplay = 'No';
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

    Util.hasCommentBubble = function(response) {
        if (_.get(response, 'comment')) {
            response.commentBubble = true;
        }
        return response;
    };

    Util.isReaction = function(reaction) {
        if (_.isString(reaction)) {
            if ((reaction.toLowerCase() === "no") || (reaction.toLowerCase() === "none"))
                return "No";
        }
        return (reaction ? "Yes" : "No");
    };

    Util.seriesNormalization = function(series) {
        if (series === '0' || _.isEmpty(series)) {
            return false;
        } else {
            return series;
        }
    };

    return Util;
});