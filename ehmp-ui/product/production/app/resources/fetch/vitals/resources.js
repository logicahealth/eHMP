define([
    'app/resources/fetch/vitals/model',
    'app/resources/fetch/vitals/collection',
    'app/resources/fetch/vitals/aggregate',
    'app/resources/fetch/vitals/operationalDataTypeVitals/collection'
], function(Vital, Vitals, Aggregate, OperationalDataTypeVitals) {
    'use strict';

    return {
        Model: Vital,
        Collection: Vitals,
        Aggregate: Aggregate,
        OperationalDataTypeVitals: OperationalDataTypeVitals
    };
});
