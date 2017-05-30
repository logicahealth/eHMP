/* global ADK */
define([
    'backbone'
], function(Backbone) {
    'use strict';

    return Backbone.Model.extend({
        idAttribute: 'uid',
        parse: function parse(response) {
            ADK.Enrichment.addFacilityMoniker(response);
            return this.parseLabResponse(response);
        },
        parseLabResponse: function (response) {

            if (response.interpretationCode) {
                var temp = response.interpretationCode.split(':').pop();

                var flagTooltip = '';
                var labelClass = 'applet-badges label-critical';

                if (temp === 'HH') {
                    temp = 'H*';
                    flagTooltip = 'Critical High';
                }
                if (temp === 'LL') {
                    temp = 'L*';
                    flagTooltip = 'Critical Low';
                }
                if (temp === 'H') {
                    flagTooltip = 'Abnormal High';
                    labelClass = 'label-warning';
                }
                if (temp === 'L') {
                    flagTooltip = 'Abnormal Low';
                    labelClass = 'label-warning';
                }

                response.interpretationCode = temp;
                response.flagTooltip = flagTooltip;
                response.labelClass = labelClass;
            }


            return response;
        }
    });
});