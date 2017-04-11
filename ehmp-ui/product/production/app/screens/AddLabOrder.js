define(function() {
    "use strict";

    var addLabOrderConfig = {
        id: "add-lab-order",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "addLabOrder",
            title: "add-lab-order",
            region: "center"
        }]
    };

    return addLabOrderConfig;
});
