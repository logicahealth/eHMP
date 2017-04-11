define(function() {
    'use strict';
    var screenConfig = {
        id: 'todo-list-provider-full',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appHeader: 'nav',
        appLeft: 'patientInfo',
        applets: [{
            id: 'todo_list',
            title: 'My tasks',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: false,
        nonPatientCentricView: true
    };

    return screenConfig;
});