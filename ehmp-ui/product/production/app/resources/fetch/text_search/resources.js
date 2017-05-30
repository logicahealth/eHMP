define([
    'app/resources/fetch/text_search/model',
    'app/resources/fetch/text_search/collection',
    'app/resources/fetch/text_search/document_drilldown_collection',
    'app/resources/fetch/text_search/aggregate_collection',
    'app/resources/fetch/text_search/util'
], function(Model, Collection, DocumentDrilldownCollection, AggregateCollection, Utils) {
    'use strict';

    return {
        Model: Model,
        Collection: Collection, 
        DocumentDrilldownCollection: DocumentDrilldownCollection,
        AggregateCollection: AggregateCollection,
        Utils: Utils
    };
});