define(function() {
    "use strict";

    return {
        id: "vital-list",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "vitals",
            title: "Vitals",
            region: "center"
        }],
        patientRequired: true
    };
});
