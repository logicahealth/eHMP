define(function() {
    "use strict";

    return {
        id: "psa",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "patient_self_assessment",
            title: "Patient Self Assessment",
            region: "center"
        }],
        patientRequired: true
    };
});
