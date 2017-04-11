define(function() {
    "use strict";

    return {
        id: "peg",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "patient_entered_goals",
            title: "Patient Entered Goals",
            region: "center"
        }],
        patientRequired: true
    };
});
