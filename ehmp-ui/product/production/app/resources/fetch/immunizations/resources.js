define([
    'app/resources/fetch/immunizations/model',
    'app/resources/fetch/immunizations/collection'
], function(Immunization, Immunizations) {
    'use strict';

    return {
        Model: Immunization,
        Collection: Immunizations
    };
});
