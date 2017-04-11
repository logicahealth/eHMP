define([], function() {
    "use strict";

    var ClinicalObject = ADK.Resources.Writeback.Model.extend({
        vpr: 'orders',
        childParse: false,
        idAttribute: 'uid',
        parse: function(resp) {
            return _.get(resp, 'data', {});
        },
        params: {
            loadReference: true
        },
        methodMap: {
            read: {
                resource: 'orders-read-draft',
                parameters: {
                    resourceId: 'uid'
                }
            }
        },
        defaults: {
            authorUid: null,
            creationDateTime: null,
            data: {},
            displayName: null,
            domain: null,
            ehmpState: null,
            patientUid: null,
            referenceId: null,
            subDomain: null,
            uid: null,
            visit: {}
        },
    });

    return ClinicalObject;
});
