define([
    'main/collections/base',
    'main/collections/domain',
    'main/collections/server',
    'main/collections/group'
], function(BaseCollection, DomainCollection, ServerCollection, GroupCollection) {
    'use strict';
    return {
        BaseCollection: BaseCollection,
        DomainCollection: DomainCollection,
        ServerCollection: ServerCollection,
        GroupingCollection: GroupCollection
    };
});
