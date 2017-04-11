define([
    "app/applets/medication_review_v2/detailController/detailController"
], function( DetailController) {
    "use strict";

    var applet = {
        id: "medication_review_v2",
        hasCSS: true,
        viewTypes: [{
            type: 'expanded',
            chromeEnabled: true
        }],
        defaultViewType: 'expanded'
    };
    DetailController.initialize(applet.id);
    return applet;
});