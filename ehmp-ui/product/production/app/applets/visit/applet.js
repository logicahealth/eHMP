define([
    'backbone',
    'marionette',
    'jquery',
    'async',
    'app/applets/visit/writeback/addselectVisit',
    'app/applets/visit/collectionHandler',
    'app/applets/visit/currentVisitContext/view'
], function(Backbone, Marionette, $, Async, addselectVisit, collectionHandler, CurrentVisitContext) {
    "use strict";

    // Channel constants
    var OPEN_VISIT_SELECTOR = 'openVisitSelector';
    var VISIT = 'visit';
    var visitChannel = ADK.Messaging.getChannel(VISIT),
        currentAppletKey;
    // *********************************************** MODEL ****************************************************
    var FormModel = Backbone.Model.extend({
        defaults: {
            visit: {}
        }
    });
    visitChannel.comply(OPEN_VISIT_SELECTOR, handleOpenVisit);

    function handleOpenVisit(appletKey) {
        ADK.Messaging.getChannel('visitWriteback').trigger('change.visit');
    }
    var applet = {
        id: "visit",
        viewTypes: [{
            type: 'writeback',
            view: addselectVisit,
            chromeEnabled: false
        }, {
            type: 'currentVisitContext',
            view: CurrentVisitContext,
            chromeEnabled: false
        }],
        defaultViewType: 'writeback'
    };
    return applet;
});