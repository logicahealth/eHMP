define(function() {
    'use strict';
    var screenConfig = {
        id: 'todo-list-full',
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: 'todo_list',
            title: 'Tasks',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: true,
        globalDatepicker: false,
        locked: {
            filters: false
        }
    };

    return screenConfig;
});