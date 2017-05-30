define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    'use strict';

    var Orderable = Backbone.Model.extend({
        defaults: {
            'data': {
                'activity': {
                    'deploymentId': '',
                    'processDefinitionId': ''
                },
                'codes': [{
                    'code': '',
                    'display': '',
                    'system': ''
                }],
                'prerequisites': {},
                'teamFocus': {
                    'code': null,
                    'name': ''
                }
            },
            'domain': 'ehmp-activity',
            'facility-enterprise': '',
            'name': '',
            'state': '',
            'subDomain': '',
            'type': 'ehmp-enterprise-orderable',
            'uid': ''
        }
    });
    return Orderable;
});