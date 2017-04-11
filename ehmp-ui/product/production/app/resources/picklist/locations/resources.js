define([
    'app/resources/picklist/locations/clinics/collection',
    'app/resources/picklist/locations/services/collection'
], function(Clinics, Services) {
    'use strict';

    return {
        Clinics: Clinics,
        Services: Services
    };
});
