define([
    'app/resources/writeback/problems/model'
], function(Model) {
    var problems = ADK.Resources.Writeback.Collection.extend({
        resource: 'problem-add',
        vpr: 'problems',
        model: Model
    });

    return problems;
});