define([], function() {
    'use strict';

    var Clinic = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'uid',
        label: 'displayName',
        value: function() {
            return this.get('uid') + ';' + this.get('displayName');
        },
        childParse: 'false',
        defaults: {
            displayName: '',
            name: '',
            uid: ''
        }
    });

    var Clinics = ADK.Resources.Picklist.Collection.extend({
        model: Clinic,
        resource: 'write-pick-list-clinics-newloc-fetch-list',
        params: function(method, options) {
            return {
                site: options.site,
            };
        }
    });

    return Clinics;
});