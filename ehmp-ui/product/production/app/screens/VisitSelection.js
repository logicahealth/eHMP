define(function() {
    "use strict";

    return {
        id: "visit-select",
        context: 'patient',
        contentRegionLayout: "gridTwo",
        appletHeader: "patient",
        applets: [
        {
            id: "visit",
            region: "right"
        },
        {
            id: "visit_selection",
            title: "Visit Selection",
            region: "left"
        }],
        patientRequired: true
    };
});
