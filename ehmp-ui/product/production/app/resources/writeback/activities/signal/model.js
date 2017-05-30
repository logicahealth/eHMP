define([], function() {
    'use strict';

    var signalResource = ADK.Resources.Writeback.Model.extend({
        resource: 'activities-signal',
        vpr: 'activities',
        parse: function(resp, options) {
            return resp.data;
        },
        methodMap: {
            'create': {
                resource: 'activities-signal',
            }
        },
        defaults: {
            'deploymentId': null,
            'signalName': null,
            'processInstanceId': null
        }
    });

    return signalResource;
});