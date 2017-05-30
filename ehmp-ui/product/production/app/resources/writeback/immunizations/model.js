define([], function() {
    'use strict';

    var immunization = ADK.Resources.Writeback.Model.extend({
        resource: 'immunizations-add',
        vpr: 'immunizations',
        idAttribute: 'uid',
        parse: function(resp, options) {
            return resp.data;
        },
        defaults: {
        }
    });

    return immunization;
});