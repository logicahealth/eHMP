define(function() {
    "use strict";

    var addVitalsConfig = {
        id: "add-vitals",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "addVitals",
            title: "add-vitals",
            region: "center"
        }]
    };

    return addVitalsConfig;
});
