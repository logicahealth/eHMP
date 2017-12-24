define([], function() {
    'use strict';

    var Facility = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'division',
        label: 'name',
        value: 'division',
        childParse: 'false',
        defaults: {
            name: '',
            siteCode: '',
            division: '',
        }
    });

    var Facilities = ADK.Resources.Picklist.Collection.extend({
        resource: 'facility-list',
        model: Facility,
        parse: function(resp, options) {
            return _.get(resp, 'data.items');
        }
    });

    return Facilities;
});