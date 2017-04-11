define([
    "backbone",
    "marionette",
    'underscore',
    "app/applets/narrative_lab_results_grid/gridView",
    "app/applets/narrative_lab_results_grid/modal/modalView",
    'app/applets/narrative_lab_results_grid/modal/stackedGraph',
    'app/applets/orders/tray/labs/trayView',
    'app/applets/orders/tray/labs/trayUtils'
], function(Backbone, Marionette, _, GridView, ModalView, StackedGraph, trayView) {
    "use strict";

    var applet = {
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
            //new writeback code added from ADK documentation
            type: 'writeback',
            view: trayView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };


    // expose detail view through messaging
    var channel = ADK.Messaging.getChannel(applet.id);

    channel.on('detailView', function(params) {
        var modalView = new ModalView.ModalView({
            model: params.model,
            navHeader: false,
        });

        var modalOptions = {
            'fullScreen': self.isFullscreen,
            'size': "large",
            'title': params.model.get('typeName')
        };

        var modal = new ADK.UI.Modal({
            view: modalView,
            options: modalOptions
        });

        modal.show();
    });

    // get the chart for the StackedGraph applet
    channel.reply('chartInfo', function(params) {

        var displayName = params.typeName;
        var ChartModel = Backbone.Model.extend({});
        var chartModel = new ChartModel({
            typeName: params.typeName,
            displayName: displayName,
            requesterInstanceId: params.instanceId,
            graphType: params.graphType,
            applet_id: applet.id
        });

        var response = $.Deferred();

        var stackedGraph = new StackedGraph({
            model: chartModel,
            target: null,
            requestParams: params
        });

        response.resolve({
            view: stackedGraph
        });

        return response.promise();
    });

    return applet;
});
