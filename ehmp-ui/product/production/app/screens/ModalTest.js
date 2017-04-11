define(function() {
    "use strict";

    var allergyListConfig = {
        id: "modal-test",
        context: 'patient',
        contentRegionLayout: "gridOne",
        appletHeader: "patient",
        applets: [{
            id: "modalTest",
            title: "Modal Tests",
            region: "center"
        }]
    };

    return allergyListConfig;
});
