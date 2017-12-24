define([
    'app/resources/picklist/locations/clinics/collection',
    'app/resources/picklist/locations/services/collection',
    'app/resources/picklist/locations/facilities/collection'
], function(Clinics, Services, Facilities) {
    'use strict';

    return {
        Clinics: Clinics,
        Services: Services,
        Facilities: Facilities
    };
});
