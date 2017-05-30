define([
    'backbone',
    'marionette',
    'app/resources/fetch/immunizations/utils'
], function(Backbone, Marionette, Util) {
    'use strict';

    var ImmunizationsModel = Backbone.Model.extend({
        parse: function(response) {
            response.administeredFormatted = Util.formatAdministeredDateTime(_.get(response, 'administeredDateTime', ''));
            response.standardizedName = Util.createStandardizedName(_.get(response, 'codes', ''));
            return response;
        },
        defaults: {
            "administeredDateTime": "",
            "administeredFormatted": "",
            "applet_id": "immunizations",
            "codes": null,
            "contraindicatedDisplay": "",
            "facilityCode": "",
            "facilityColor": "",
            "facilityDisplay": "",
            "facilityMoniker": "",
            "facilityName": "",
            "kind": "",
            "name": "",
            "numericDate": "",
            "observedFormatted": "",
            "observedTimeFormatted":"",
            "pid": "",
            "performer":"",
            "reactionName": "",
            "reactionCode": "",
            "resultedFormatted":"",
            "seriesName": "",
            "stampTime": "",
            "standardizedName": "",
            "summary": "",
            "timeSinceDate": "",
            "uid": ""
        }
    });

    return ImmunizationsModel;
});