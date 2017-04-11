define([], function() {

    var Service = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'ien',
        defaults: {}
    });

    var Services = ADK.Resources.Picklist.Collection.extend({
        type: 'services-fetch-list',
        model: Service
    });

    return Services;
});
