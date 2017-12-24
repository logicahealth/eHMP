define([
    'app/resources/fetch/problems/model',
    'app/resources/fetch/problems/collection',
    'app/resources/fetch/problems/group-collection'
], function(Problem, Problems, GroupingCollection) {
    'use strict';

    return {
        Model: Problem,
        Collection: Problems,
        GroupingCollection: GroupingCollection
    };
});
