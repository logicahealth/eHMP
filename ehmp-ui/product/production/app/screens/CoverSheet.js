define([
    'app/screens/AllergyGridFull',
    'app/screens/VitalsFull',
    'app/screens/ImmunizationsFull',
    'app/screens/OrdersFull'
], function(AllergyGridFull, VitalsFull, ImmunizationsFull, OrdersFull) {
    'use strict';
    var detailAppletChannels = {
        // mapping of domain --> appletId
        "med": "medication_review",
        "document": "documents"
    };

    var config = {
        id: 'cover-sheet',
        context: 'patient',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        applets: [{
            "id": "problems",
            'instanceId': 'applet-1',
            "title": "Problems",
            "maximizeScreen": "problems-full",
            "region": "bc2652653929",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "vitals",
            'instanceId': 'applet-2',
            "title": "Vitals",
            "maximizeScreen": "vitals-full",
            "region": "dc49ad17e67c",
            "dataRow": "1",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "allergy_grid",
            'instanceId': 'applet-3',
            "title": "Allergies",
            "maximizeScreen": "allergy-grid-full",
            "region": "e543e81ca31a",
            "dataRow": "1",
            "dataCol": "9",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "2",
            "dataMinSizeY": "1",
            "dataMaxSizeX": "4",
            "dataMaxSizeY": "4",
            "viewType": "gist"
        }, {
            "id": "appointments",
            'instanceId': 'applet-4',
            "title": "Appointments & Visits",
            "maximizeScreen": "appointments-full",
            "region": "c7c6294343c0",
            "dataRow": "5",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "immunizations",
            'instanceId': 'applet-5',
            "title": "Immunizations",
            "maximizeScreen": "immunizations-full",
            "region": "a7dace4f6e1f",
            "dataRow": "9",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "activeMeds",
            'instanceId': 'applet-6',
            "title": "Active & Recent Medications",
            "region": "041456e4af17",
            "dataRow": "9",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary",
            "maximizeScreen": "medication-review"
        }, {
            "id": "lab_results_grid",
            'instanceId': 'applet-7',
            "title": "Numeric Lab Results",
            "maximizeScreen": "lab-results-grid-full",
            "region": "9dc9f289d846",
            "dataRow": "5",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "orders",
            'instanceId': 'applet-8',
            "title": "Orders",
            "maximizeScreen": "orders-full",
            "region": "54cdb996d9c8",
            "dataRow": "9",
            "dataCol": "9",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "ccd_grid",
            'instanceId': 'applet-9',
            "title": "Community Health Summaries",
            "maximizeScreen": "ccd-list-full",
            "region": "76fed10ec8c0",
            "dataRow": "5",
            "dataCol": "9",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }],
        onResultClicked: function(clickedResult) {

            var domain = clickedResult.uid.split(":")[2],
                channelName = detailAppletChannels[domain],
                modalView = null,
                deferredResponse = $.Deferred();

            if (channelName) {
                // request detail view from whatever applet is listening for this domain
                var channel = ADK.Messaging.getChannel(channelName),
                    response = channel.request('detailView', clickedResult);


                if (!clickedResult.suppressModal) {
                    var modal = new ADK.UI.Modal({
                        view: new response.view({
                            model: clickedResult.model
                        }),
                        options: {
                            size: "large",
                            title: response.title
                        }
                    });
                    modal.show();
                } else {
                    return response;
                }
            } else {
                // no detail view available; use the default placeholder view
                var detailView = new DefaultDetailView();

                if (!clickedResult.suppressModal) {
                    var modalView2 = new ADK.UI.Modal({
                        view: detailView,
                        options: {
                            size: "large",
                            title: "Detail - Placeholder"
                        }
                    });
                    modalView2.show();
                    deferredResponse.resolve();
                } else {
                    deferredResponse.resolve({
                        view: detailView
                    });
                }
            }

        },
        onStart: function() {
            AllergyGridFull.setUpEvents();
            VitalsFull.setUpEvents();
            ImmunizationsFull.setUpEvents();
            OrdersFull.setUpEvents();
        },
        onStop: function() {
            OrdersFull.turnOffEvents();
        },
        patientRequired: true
    };
    ADK.Messaging.getChannel("lab_results_grid").reply('extDetailView', config.onResultClicked);
    ADK.Messaging.getChannel("narrative_lab_results_grid").reply('extDetailView', config.onResultClicked);
    return config;
});
