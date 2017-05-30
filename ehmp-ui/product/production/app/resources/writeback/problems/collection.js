define([
    'app/resources/writeback/problems/model'
], function(Model) {
    'use strict';

    var problems = ADK.Resources.Writeback.Collection.extend({
        resource: 'problem-add',
        vpr: 'problems',
        model: Model
    });

    return problems;
});