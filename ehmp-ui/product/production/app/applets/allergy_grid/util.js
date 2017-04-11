define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.getModalTitle = function(model) {
        return 'Allergen - ' + model.get('summary');
    };

    Util.getOriginatedFormatted = function(response) {
        response.originatedFormatted = '';
        if (response.originated) {
            response.originatedFormatted = ADK.utils.formatDate(response.originated, "MM/DD/YYYY - HH:mm");
        }
        return response;
    };

    Util.setFacilityColor = function(response) {
        if (_.get(response, 'facilityCode') === 'DOD') {
            response.facilityColor = 'DOD';
        } else {
            response.facilityColor = 'nonDOD';
        }

        return response;
    };

    Util.getSeverityCss = function(response) {
        if (_.isString(response.acuityName)) {
            response.severityCss = response.acuityName.toLowerCase();
        } else {
            response.severityCss = 'no-severity';
        }
        return response;
    };

    Util.processAllergyObject = function(allergyObject) {
        if (!_.isEmpty(allergyObject.products)) {
            allergyObject = ADK.utils.extract(allergyObject, allergyObject.products[0], {
                name: 'name'
            });
        }

        if (_.get(allergyObject, 'entered')) {
            allergyObject.originatedFormatted = ADK.utils.formatDate(allergyObject.entered, "MM/DD/YYYY - HH:mm");
        }

        allergyObject = Util.setFacilityColor(allergyObject);
        allergyObject = Util.getSeverityCss(allergyObject);
        return allergyObject;
    };

    return Util;
});
