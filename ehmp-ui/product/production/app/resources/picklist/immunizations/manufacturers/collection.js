define([], function() {

    var Manufacturer = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'mvx',
        label: 'name',
        value: 'name',
        childParse: 'false',
        defaults: {
            mvx: '',
            name: ''
        }
    });

    var Manufacturers = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-immunization-manufacturer',
        model: Manufacturer,
    });

    return Manufacturers;
});