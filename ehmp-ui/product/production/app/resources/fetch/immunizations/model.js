define([
    'backbone',
    'marionette',
    'app/resources/fetch/immunizations/utils'
], function(Backbone, Marionette, Util) {
    'use strict';

    var ImmunizationsModel = Backbone.Model.extend({
        parse: function(response) {
            response = Util.getStandardizedName(response);
            response = Util.getAdministeredFormatted(response);
            return response;
        },
        defaults: {
            "administeredDateTime": "",
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
            "pid": "",
            "performer":"",
            "reactionName": "",
            "reactionCode": "",
            "seriesName": "",
            "stampTime": "",
            "summary": "",
            "uid": ""
        }
    });

    return ImmunizationsModel;
});