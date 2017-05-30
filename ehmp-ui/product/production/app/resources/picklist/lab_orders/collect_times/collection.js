define([], function() {
    'use strict';

    var CollectTimesModel = ADK.Resources.Picklist.Model.extend({
        label: 'text'
    });

    var CollectTimesCollection = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-lab-collect-times',
        model: CollectTimesModel,
        params: function(method, options) {
            return {
                division: ADK.UserService.getUserSession().get('division')
            };
        }
    });

    return CollectTimesCollection;
});