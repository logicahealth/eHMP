define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/esignature/signatureView',
    'app/applets/esignature/errorView'
], function(Backbone, Marionette, $, Handlebars, SignatureView, ErrorView) {
    "use strict";

    var applet = {
        id: "esignature",
        viewTypes: [{
            type: 'signature',
            view: SignatureView,
            chromeEnabled: false
        }, {
            type: 'error',
            view: ErrorView,
            chromeEnabled: false
        }],
        defaultViewType: 'signature'
    };
    return applet;
});