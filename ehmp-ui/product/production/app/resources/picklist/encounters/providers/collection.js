define([], function() {
    'use strict';

    var Provider = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'code',
        label: name,
        defaults: {
            code: '',
            name: '',
            value: false
        }
    });
    var Providers = ADK.Resources.Picklist.Collection.extend({
        model: Provider,
        resource: 'write-pick-list-new-persons-direct',
        params: function(method, options) {
            return {
                newPersonsType: 'PROVIDER',
                date: options.dateTime || '',
                site: this.user.get('site')
            };
        },
    });

    return Providers;

});