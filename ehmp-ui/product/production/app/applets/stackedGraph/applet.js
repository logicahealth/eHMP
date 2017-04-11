define([
    'app/applets/stackedGraph/list/stackedGraphView',
    'app/applets/stackedGraph/list/pickListView'
], function(StackedGraphView, PickListView) {
    "use strict";

    var stackedGraphChannel = ADK.Messaging.getChannel('stackedGraph');
    var applet = {
        id: 'stackedGraph',
        getRootView: function(viewTypeOption) {
            return ADK.Views.AppletControllerView.extend({
                viewType: viewTypeOption
            });
        },
        viewTypes: [{
            type: 'expanded',
            view: StackedGraphView,
            chromeEnabled: true,
            chromeOptions: {
                additionalButtons: [{
                    'id': 'addGraphs',
                    'view': PickListView
                }]
            }
        }],

        defaultView: StackedGraphView
    };



    return applet;
});
