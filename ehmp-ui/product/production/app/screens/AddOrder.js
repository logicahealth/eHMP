define(function() {
    "use strict";

    var addOrderConfig = {
        id: "add-order",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "addOrder",
            title: "add-order",
            region: "center"
        }]
    };

    return addOrderConfig;
});
