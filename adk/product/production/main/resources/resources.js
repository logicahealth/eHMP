define([
    'main/resources/abstract',
    'main/resources/writeback/writebackCollection',
    'main/resources/writeback/writebackModel',
    'main/resources/picklist/picklistAbstract'
], function(Abstract, WritebackCollection, WritebackModel, PicklistAbstract) {
    "use strict";

    return {
        Model: Abstract.Model,
        Collection: Abstract.Collection,
        Writeback: {
            Collection: WritebackCollection,
            Model: WritebackModel,
        },
        Picklist: PicklistAbstract
    };
});