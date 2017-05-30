/* global ADK */
define([
    'app/applets/lab_results_grid/labsTrendView',
    'app/applets/lab_results_grid/gridView',
    'app/applets/orders/tray/labs/trayView',
    'app/applets/lab_results_grid/labsChannel'
], function (GistView, GridView, trayView, Channel) {
    'use strict';

    var AppletID = 'lab_results_grid';

    Channel.start();

    return {
        id: AppletID,
        viewTypes: [{
            type: 'summary',
            view: GridView.extend({
                columnsViewType: 'summary'
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: GridView.extend({
                columnsViewType: 'expanded'
            }),
            chromeEnabled: true
        }, {
            type: 'gist',
            view: GistView.extend({
                columnsViewType: 'gist'
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
