define(function() {
    "use strict";

    return {
        id: "progress-notes-list",
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "progress_notes",
            title: "Progress Notes",
            region: "center"
        }],
        patientRequired: true
    };
});
