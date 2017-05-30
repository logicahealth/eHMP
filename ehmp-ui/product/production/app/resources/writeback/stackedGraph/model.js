define(['underscore'], function(_) {
    'use strict';

    var stackedGraph = ADK.Resources.Writeback.Model.extend({
        isNewModel: true,

        defaults: function() {
            return {
                'id': _.get(ADK, 'ADKApp.currentScreen.config.id')
            };
        },
        resource: 'user-defined-stack',
        isNew: function() {
            return this.isNewModel;
        },
        setIsNew: function(isNew) {
            this.isNewModel = isNew;
        }
    });

    return stackedGraph;
});
