define([], function() {
    "use strict";

    var ClinicalObject = ADK.Resources.Writeback.Model.extend({
        vpr: 'clinical-objects',
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
                resource: 'clinical-object-read',
                parameters: {
                    resourceId: 'uid'
                }
            },
            create: {
                resource: 'clinical-object-add'
            },
            update: {
                resource: 'clinical-object-update',
                parameters: {
                    resourceId: 'uid'
                }
            }
        },
        resourceEvents: {
            'create:success': function(model, resp, options) {
                var location = _.get(resp, 'data.headers.location', '');
                model.set('uid', _.last(location.split('/')));
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