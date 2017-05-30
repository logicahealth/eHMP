define([
    'app/resources/fetch/tasks/model',
    'app/resources/fetch/tasks/collection',
    'app/resources/fetch/tasks/current'
], function(Model, Collection, Current) {
    'use strict';
    return {
        Model: Model,
        Tasks: Collection,
        Current: Current
    };
});