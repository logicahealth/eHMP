define(function () {
    "use strict";

    var ssoLogonScreenConfig = {
        contentRegionLayout: "gridOne",
        appCenterLayout: 'fullScreenAppletCenterLayout',
        id: "sso",
        context: 'logon',
        applets: [{
            id: "ssoLogon",
            title: "Auto Signing In",
            region: "center"
        }]
    };
    return ssoLogonScreenConfig;
});
