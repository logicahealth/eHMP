define(function() {
    "use strict";

    var patientSearchScreenConfig = {
        contentRegionLayout: "fullOne",
        id: "patient-search-screen",
        applets: [{
            id: "patient_search",
            title: "Patient Search",
            region: "center"
        }],
        appHeader: "searchNav",
        patientRequired: false
    };

    return patientSearchScreenConfig;
});
