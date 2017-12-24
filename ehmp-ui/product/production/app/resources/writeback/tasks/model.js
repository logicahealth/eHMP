define([], function() {
    'use strict';

    var task = ADK.Resources.Writeback.Model.extend({
        idAttribute: 'taskid',
        vpr: 'tasks',
        methodMap: {
            'update': {
                resource: 'tasks-update'
            }
        },
        parse: function(resp, options) {
            return resp.data;
        }
    });

    return task;
});