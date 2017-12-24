define([
    'app/applets/individual_permissions/individual-permission-grid-view'
], function(IndividualPermissions) {
    'use strict';

    return {
        id: 'individual_permissions',
        viewTypes: [{
            type: 'summary',
            view: IndividualPermissions,
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: IndividualPermissions,
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };
});
