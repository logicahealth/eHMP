define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.createTimeSinceDate = function(administeredDateTime){
        var timeSinceDate = administeredDateTime;
        while(timeSinceDate.length > 4 && timeSinceDate.substring(timeSinceDate.length - 2, timeSinceDate.length) === '00'){
            timeSinceDate = timeSinceDate.substring(0, timeSinceDate.length - 2);
        }
        return timeSinceDate;
    };

    Util.formatNumericDate = function(administeredDateTime) {
        return ADK.utils.formatDate(administeredDateTime, 'YYYYMMDD');
    };

    Util.createModalTitle = function(model) {
        return 'Vaccine - ' + model.get('name');
    };

    Util.formatDate = function(date) {
        return ADK.utils.formatDate(date);
    };

    Util.formatTime = function(time) {
        return ADK.utils.formatDate(time, 'HH:mm');
    };

    Util.createContraindicated = function(contraindicated) {
        return contraindicated ? 'Yes' : 'No';
    };

    Util.createFacilityColor = function(facilityCode) {
        return facilityCode === 'DOD' ? 'DOD' : 'nonDOD';
    };

    Util.hasCommentBubble = function(comment) {
        return comment ? true : false;
    };

    Util.isReaction = function(reaction) {
        if (_.isString(reaction)) {
            if ((reaction.toLowerCase() === "no") || (reaction.toLowerCase() === "none"))
                return "No";
        }
        return (reaction ? "Yes" : "No");
    };

    Util.seriesNormalization = function(series) {
        return (series === '0' || _.isEmpty(series)) ? false : series;
    };

    return Util;
});