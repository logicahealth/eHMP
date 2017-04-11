define([], function() {
    'use strict';

    var Person = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'personID',
        label: 'name',
        value: 'personID',
        childParse: 'false',
        defaults: {
            name: '',
            personID: ''
        }
    });

    var People = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-people-for-facility',
        model: Person,
        params: function(method, options) {
            return {
                facilityID: options.facilityID || ''
            };
        }
    });

    return People;
});