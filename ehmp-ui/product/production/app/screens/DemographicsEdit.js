define(function() {
    "use strict";

    return {
        id: "demographics-edit",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "demographics_edit",
            title: "DemographicsEdit",
            region: "center"
        }],
        patientRequired: true
    };
});
