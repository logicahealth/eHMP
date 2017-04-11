define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/problems/utilParse'
], function(Backbone, Marionette, _, Util) {
    "use strict";
    Util.getOnsetFormatted = function(response) {
        if (!_.isUndefined(response.onset)) {
            var onset = response.onset.replace(/0000$/,"").replace(/00$/,"");

            if (onset.length == 4) { //
                response.onsetFormatted = ADK.utils.formatDate(onset, 'YYYY');
            } else if(onset.length == 6){
                response.onsetFormatted = ADK.utils.formatDate(onset, 'MM/YYYY');
            } else {
                response.onsetFormatted = ADK.utils.formatDate(onset);
            }
        } else {
            response.onset = "";
        }
        return response;
    };

    Util.getUpdatedFormatted = function(response) {
        if (response.updated) {
            response.updatedFormatted = ADK.utils.formatDate(response.updated);
        }
        return response;
    };

    Util.getEnteredFormatted = function(response) {
        if (response.entered) {
            response.enteredFormatted = ADK.utils.formatDate(response.entered);
        }
        return response;
    };

    Util.getModalTitle = function(model) {
        return !_.isUndefined(model.get('groupName')) ? model.get('groupName') : model.get('problemText');
    };
    return Util;
});
