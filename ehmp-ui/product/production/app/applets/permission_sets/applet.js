define([
    'app/applets/permission_sets/permission-sets-grid-view'
], function(PermissionSets) {
    'use strict';

    return {
        id: 'permission_sets',
        viewTypes: [{
            type: 'expanded',
            view: PermissionSets,
            chromeEnabled: true
        }],
        defaultViewType: 'expanded'
    };
});
