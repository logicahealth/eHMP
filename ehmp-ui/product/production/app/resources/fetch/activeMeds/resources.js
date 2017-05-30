define([
    'app/resources/fetch/activeMeds/collection',
    'app/resources/fetch/activeMeds/model',
    'app/resources/fetch/activeMeds/handler-collections'
], function(Collection, Model, HandlerCollection) {
    'use strict';
    return {
        Model: Model,
        ResourceCollection: Collection,
        Pageable: HandlerCollection.MedicationPageableCollection,
        NonPageable: HandlerCollection.MedicationFullCollection
    };
});
