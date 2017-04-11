define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.serializeObject = function(ccdObject) {
        ccdObject.referenceDateDisplay = Util.getReferenceDateDisplay(ccdObject.ccdDateTime);
        ccdObject.referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(ccdObject.ccdDateTime);
        ccdObject.facilityName = 'VLER';
        return ccdObject;
    };

    Util.getReferenceDateDisplay = function(ccdDateTime) {
        if (!ccdDateTime) {
            return 'N/A';
        }
        return ADK.utils.formatDate(ccdDateTime);
    };

    Util.getReferenceDateTimeDisplay = function(ccdDateTime) {
        if (!ccdDateTime) {
            return 'N/A';
        }
        return ADK.utils.formatDate(ccdDateTime, 'MM/DD/YYYY - HH:mm');
    };

    return Util;
});
