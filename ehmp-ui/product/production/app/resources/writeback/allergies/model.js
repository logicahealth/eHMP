define([], function() {
    'use strict';

    var allergy = ADK.Resources.Writeback.Model.extend({
        resource: 'allergies-add',
        vpr: 'allergies',
        idAttribute: 'localId',
        parse: function(resp, options) {
            return resp.data;
        },
        methodMap : {
            'create': {
                resource: 'allergies-add',
            },
            'eie': {
                resource: 'allergies-eie',
                parameters: {
                    'resourceId': 'localId'
                }
            }
        },
        defaults: {
            'IEN': null,
            'allergyName': null,
            'comment': null,
            'enteredBy': null,
            'eventDateTime': null,
            'historicalOrObserved': null,
            'location': null,
            'name': null,
            'natureOfReaction': null,
            'observedDate': null,
            'severity': null,
            'symptoms': null
        }
    });

    return allergy;
});