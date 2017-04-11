define(function() {
    "use strict";

    var patientSearchScreenConfig = {
        contentRegionLayout: "fullOne",
        id: "patient-search-screen",
        context: "patient",
        applets: [{
            id: "patient_search",
            title: "Patient Search",
            region: "center",
            viewType: 'full'
        }],
        patientRequired: false
    };

    return patientSearchScreenConfig;
});