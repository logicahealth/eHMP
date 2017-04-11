define(function() {
    "use strict";

    var addLabOrdersConfig = {
        id: "add-lab-orders",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "addLabOrders",
            title: "add-lab-orders",
            region: "center"
        }]
    };

    return addLabOrderConfig;
});
