define([
    'app/resources/fetch/allergies/model',
    'app/resources/fetch/allergies/collection'
], function(Allergy, Allergies) {
    'use strict';

    return {
        Model: Allergy,
        Collection: Allergies
    };
});
