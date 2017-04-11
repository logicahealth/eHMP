define(function() {
    'use strict';
    var screenConfig = {
        id: 'todo-list-provider-full',
        context: 'staff',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'todo_list',
            title: 'Tasks',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: false
    };

    return screenConfig;
});