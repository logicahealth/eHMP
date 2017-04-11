define([
    'app/resources/writeback/vitals/model'
], function(Model) {
    var vitals = ADK.Resources.Writeback.Collection.extend({
        resource: 'vitals-add',
        vpr: 'vitals',
        model: Model
    });

    return vitals;
});