define([], function() {
    var vital = ADK.Resources.Writeback.Model.extend({
        resource: 'vitals-add',
        vpr: 'vitals',
        idAttribute: 'localId',
        parse: function(resp, options) {
            return resp.data;
        },
        methodMap : {
            'create': {
                resource: 'vitals-add',
            },
            'eie': {
                resource: 'vitals-update',
                parameters: {
                    'resourceId': 'localId'
                }
            }
        },
        defaults: {
            'dateTime': null,
            'dfn': null,
            'enterdByIEN': null,
            'locIEN': null,      
            'vitals':null
        }
    });

    return vital;
});