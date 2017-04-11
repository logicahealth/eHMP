define([], function() {
    var problem = ADK.Resources.Writeback.Model.extend({
        resource: 'problem-add',
        vpr: 'problems',
        idAttribute: 'problemIEN',
        methodMap : {
            'create': {
                resource: 'problem-add'
            },
            'update': {
                resource: 'problem-update',
                parameters: {
                    'resourceId': 'problemIEN'
                }
            }
        },
        parse: function(resp, options) {
            return resp.data;
        },
        defaults: {
        }
    });

    return problem;
});