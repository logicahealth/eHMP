define(function() {
    "use strict";

    var logonScreenConfig = {
        contentRegionLayout: "fullOne",
        id: "logon-screen",
        context: "logon",
        applets: [{
            id: "logon",
            title: "Sign In",
            region: "center"
        }],
        patientRequired: false
    };

    return logonScreenConfig;
});
