define([
    'app/resources/fetch/problems/model',
    'app/resources/fetch/problems/collection'
], function(Problem, Problems) {
    'use strict';

    return {
        Model: Problem,
        Collection: Problems
    };
});
