define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    'use strict';

    // temporary default detail view. remove once all detail view have been implemented
    var DefaultDetailView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div>A detail view for this document type is not yet implemented.</div>')
    });

    var detailAppletChannels = {
        // mapping of model.kind --> appletId
        // "surgery report": "surgery",
        "discharge summary": "discharge_summary",
        // "clinical procedure": "consults"
    };

    function getExternalDetailView(params) {
        var kind = params.kind,
            channelName = detailAppletChannels[kind.toLowerCase()],
            deferredResponse;

        if (channelName) {
            // request detail view from whatever applet is listening for this document type
            var channel = ADK.Messaging.getChannel(channelName);

            deferredResponse = channel.request('detailView', params);
        } else {
            // no detail view implemented yet; use the default placeholder view
            deferredResponse = $.Deferred();

            deferredResponse.resolve({
                view: new DefaultDetailView(),
                title: "Detail - Placeholder"
            });
            deferredResponse = deferredResponse.promise();
        }
        return deferredResponse;
    }

    // Listen for requests for external detail views
    // These should only come from the documents applet
    var docsChannel = ADK.Messaging.getChannel('documents');
    docsChannel.reply('extDetailView', getExternalDetailView);

    var screenConfig = {
        id: "documents-list",
        context: 'patient',
        contentRegionLayout: "gridster",
        appletHeader: "navigation",
        appLeft: "patientInfo",
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        applets: [{
            "id": "documents",
            'instanceId': 'applet-1',
            "title": "Documents",
            "region": "center",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "12",
            "dataSizeY": "12",
            "fullScreen": true,
            "viewType": "expanded"
        }],
        locked: {
            filters: false
        },
        patientRequired: true,
        predefined: true
    };
    return screenConfig;
});