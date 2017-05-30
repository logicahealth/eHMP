define([], function() {
    'use strict';

    var Clinic = ADK.Resources.Model.extend({
        idAttribute: 'uid'
    });

    var Clinics = ADK.Resources.Collection.extend({
        resource: 'write-pick-list-clinics-fetch-list',
        model: Clinic,
        parse: function(resp, options) {
            return resp.data || resp;
        },
    });

    return Clinics;
});