define([
    'app/resources/picklist/allergies/allergens/collection',
    'app/resources/picklist/allergies/operational_data/collection'
], function(Allergens, OperationalData) {
    'use strict';

    return {
        Allergens: Allergens,
        OperationalData: OperationalData
    };
});
