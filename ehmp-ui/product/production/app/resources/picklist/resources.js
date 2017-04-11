define([
    'app/resources/picklist/demo/collection',
    'app/resources/picklist/allergies/resources',
    'app/resources/picklist/lab_orders/resources',
    'app/resources/picklist/immunizations/resources',
    'app/resources/picklist/encounters/resources',
    'app/resources/picklist/vitals/resources',
    'app/resources/picklist/notes/resources',
    'app/resources/picklist/problems/resources',
    'app/resources/picklist/locations/resources'
], function(Demo, Allergies, Lab_Orders, Immunizations, Encounters, Vitals, Notes, Problems, Locations) {
    'use strict';

    return {
        id: 'Picklist',
        resources: {
            Demo: Demo,
            Allergies: Allergies,
            Lab_Orders: Lab_Orders,
            Immunizations: Immunizations,
            Encounters: Encounters,
            Vitals: Vitals,
            Notes: Notes,
            Problems: Problems,
            Locations: Locations
        }
    };
});
