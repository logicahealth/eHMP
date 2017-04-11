define('main/NewUserScreen', [], function(require) {
    "use strict";
    return {
        id: 'new-screen',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: false,
        applets: [],
        patientRequired: true
    };
});