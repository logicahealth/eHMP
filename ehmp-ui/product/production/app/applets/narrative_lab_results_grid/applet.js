/* global ADK */
define([
    "app/applets/narrative_lab_results_grid/gridView",
    'app/applets/orders/tray/labs/trayView',
    'app/applets/narrative_lab_results_grid/detailsListener'
], function(GridView, trayView, DetailsListener) {
    "use strict";

    (function initListener() {
        return new DetailsListener();
    })();

    return {
        id: 'narrative_lab_results_grid',
        viewTypes: [{
            type: 'summary',
            view: GridView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: GridView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: trayView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };
});
