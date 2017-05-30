define([
    'app/resources/fetch/labs/labs-trend-model',
    'app/resources/fetch/labs/labs-trend-collection',
    'app/resources/fetch/labs/grid-collection',
    'app/resources/fetch/labs/modal/resources',
    'app/resources/fetch/labs/labs-stack-graph-collection',
    'app/resources/fetch/labs/operationalDataTypeLabs/collection'
], function(Model, Collection, GridCollection, Modal, StackGraphCollection, OperationalDataTypeLabs) {
    'use strict';

    return {
        TrendModel: Model,
        TrendCollection: Collection,
        GridCollection: GridCollection,
        OperationalDataTypeLabs: OperationalDataTypeLabs,
        StackGraphCollection: StackGraphCollection,
        Modal: Modal
    };
});