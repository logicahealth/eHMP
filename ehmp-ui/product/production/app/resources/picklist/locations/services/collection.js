define([], function() {

    var Service = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'ien',
        defaults: {}
    });

    var Services = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-services-fetch-list',
        model: Service
    });

    return Services;
});