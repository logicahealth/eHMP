define([], function() {
    var problem = ADK.Resources.Writeback.Model.extend({
        resource: 'problem-add',
        vpr: 'problems',
        idAttribute: 'uid',
        parse: function(resp, options) {
            return resp.data;
        },
        defaults: {
        }
    });

    return problem;
});