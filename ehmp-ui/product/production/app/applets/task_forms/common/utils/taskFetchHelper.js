define([
], function() {
    'use strict';

    var fetchHelper = function(e, taskModel, state, parameterObj, onSuccess) {
        var fetchOptions = {
            resourceTitle: 'tasks-update',
            fetchType: 'POST',
            criteria: {
                deploymentid: taskModel.get('DEPLOYMENTID'),
                processDefId: taskModel.get('PROCESSID'),
                taskid: String(taskModel.get('TASKID')),
                state: state,
                icn: taskModel.get('PATIENTICN'),
                pid: taskModel.get('PATIENTICN'),
                parameter: parameterObj
            },
            onSuccess: onSuccess
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    return fetchHelper;
});
