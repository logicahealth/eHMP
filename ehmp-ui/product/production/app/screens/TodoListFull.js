define(function() {
    'use strict';
    var screenConfig = {
        id: 'todo-list-full',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: 'todo_list',
            title: 'All tasks',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: true,
        globalDatepicker: true
    };

    return screenConfig;
});