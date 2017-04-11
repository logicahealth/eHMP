define(function() {
    "use strict";

    var timelineSummaryConfig = {
        id: "timelineSummary",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "timeline_summary",
            title: "Timeline Summary",
            region: "center"
        }]
    };

    return timelineSummaryConfig;
});
