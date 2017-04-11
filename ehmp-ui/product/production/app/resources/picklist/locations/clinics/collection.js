define([], function() {

    var Clinic = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'ien',
        defaults: {}
    });

    var Clinics = ADK.Resources.Picklist.Collection.extend({
        type: 'clinics-fetch-list',
        model: Clinic
    });

    return Clinics;
});
