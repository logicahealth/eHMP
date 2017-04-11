define([
    'app/resources/writeback/immunizations/model'
], function(Model) {
    var immunizations = ADK.Resources.Writeback.Collection.extend({
        resource: 'immunizations-add',
        vpr: 'immunizations',
        model: Model
    });

    return immunizations;
});