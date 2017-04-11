define([
    'app/screens/OrdersFull' //probably unnecessary
], function(OrdersFull) {
    'use strict';
    var detailAppletChannels = {
        "med": "medication_review",
        "document": "documents"
    };
    var config = {
        id: 'summary',
        context: 'patient',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true,
        "applets": [{
            "id": "todo_list",
            "title": "Tasks",
            "context": ["patient", "staff"],
            "maximizeScreen": "todo-list-full",
            "showInUDWSelection": true,
            "permissions": ["read-task"],
            "dependencies": ["notes", "orders"],
            "instanceId": "applet-1",
            "region": "applet-1",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "summary",
            "filterName": ""
        }, {
            "id": "problems",
            "title": "Problems",
            "context": ["patient"],
            "maximizeScreen": "problems-full",
            "showInUDWSelection": true,
            "permissions": ["read-condition-problem"],
            "crsDomain": "Problem",
            "instanceId": "applet-2",
            "region": "applet-2",
            "dataRow": "5",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "gist",
            "filterName": ""
        }, {
            "id": "allergy_grid",
            "title": "Allergies",
            "context": ["patient"],
            "maximizeScreen": "allergy-grid-full",
            "showInUDWSelection": true,
            "permissions": ["read-allergy"],
            "instanceId": "applet-3",
            "region": "applet-3",
            "dataRow": "9",
            "dataCol": "1",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "gist",
            "filterName": ""
        }, {
            "id": "documents",
            "title": "Documents",
            "context": ["patient"],
            "maximizeScreen": "documents-list",
            "showInUDWSelection": true,
            "permissions": ["read-document"],
            "instanceId": "applet-4",
            "region": "applet-4",
            "dataRow": "1",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "summary",
            "filterName": ""
        }, {
            "id": "lab_results_grid",
            "title": "Numeric Lab Results",
            "context": ["patient"],
            "maximizeScreen": "lab-results-grid-full",
            "showInUDWSelection": true,
            "permissions": ["read-order"],
            "crsDomain": "Laboratory",
            "instanceId": "applet-5",
            "region": "applet-5",
            "dataRow": "5",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "gist",
            "filterName": ""
        }, {
            "id": "narrative_lab_results_grid",
            "title": "Narrative Lab Results",
            "context": ["patient"],
            "maximizeScreen": "narrative-lab-results-grid-full",
            "showInUDWSelection": true,
            "permissions": ["read-order"],
            "instanceId": "applet-6",
            "region": "applet-6",
            "dataRow": "9",
            "dataCol": "5",
            "dataSizeX": "4",
            "dataSizeY": "4",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "summary",
            "filterName": ""
        }, {
            "id": "activeMeds",
            "title": "Active & Recent Medications",
            "context": ["patient"],
            "maximizeScreen": "medication-review",
            "showInUDWSelection": true,
            "permissions": ["read-active-medication"],
            "crsDomain": "Medication",
            "instanceId": "applet-7",
            "region": "applet-7",
            "dataRow": "1",
            "dataCol": "9",
            "dataSizeX": "4",
            "dataSizeY": "7",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "gist",
            "filterName": ""
        }, {
            "id": "activities",
            "title": "Activities",
            "context": ["patient", "staff"],
            "showInUDWSelection": true,
            "maximizeScreen": "activities-patient-full",
            "permissions": [],
            "instanceId": "applet-8",
            "region": "applet-8",
            "dataRow": "8",
            "dataCol": "9",
            "dataSizeX": "8",
            "dataSizeY": "5",
            "dataMinSizeX": 8,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 12,
            "dataMaxSizeY": 12,
            "viewType": "expanded",
            "filterName": ""
        }, {
            "id": "stackedGraph",
            "title": "Stacked Graphs",
            "context": ["patient"],
            "showInUDWSelection": true,
            "permissions": ["access-stack-graph"],
            "instanceId": "applet-9",
            "region": "applet-9",
            "dataRow": "1",
            "dataCol": "13",
            "dataSizeX": "8",
            "dataSizeY": "7",
            "dataMinSizeX": 8,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 12,
            "dataMaxSizeY": 12,
            "viewType": "expanded",
            "filterName": ""
        }, {
            "id": "appointments",
            "title": "Appointments & Visits",
            "context": ["patient"],
            "maximizeScreen": "appointments-full",
            "showInUDWSelection": true,
            "permissions": ["read-encounter"],
            "instanceId": "applet-10",
            "region": "applet-10",
            "dataRow": "8",
            "dataCol": "17",
            "dataSizeX": "4",
            "dataSizeY": "5",
            "dataMinSizeX": 4,
            "dataMinSizeY": 4,
            "dataMaxSizeX": 8,
            "dataMaxSizeY": 12,
            "viewType": "summary",
            "filterName": ""
        }],/*most likely dead code
        onResultClicked: function(clickedResult) {
            var domain = clickedResult.uid.split(":")[2],
                channelName = detailAppletChannels[domain],
                modalView = null,
                deferredResponse = $.Deferred();

            if (channelName) {
                if (!clickedResult.suppressModal) {
                    // display spinner in modal while detail view is loading
                    var modal = new ADK.UI.Modal({
                        view: ADK.Views.Loading.create(),
                        options: {
                            size: "large",
                            title: "Loading..."
                        }
                    });
                    modal.show();
                }

                // request detail view from whatever applet is listening for this domain
                var channel = ADK.Messaging.getChannel(channelName),
                    deferredDetailResponse = channel.request('detailView', clickedResult);

                deferredDetailResponse.done(function(response) {
                    if (!clickedResult.suppressModal) {
                        var modal = new ADK.UI.Modal({
                            view: response.view,
                            options: {
                                size: "large",
                                title: response.title
                            }
                        });
                        modal.show();
                        deferredResponse.resolve();
                    } else {
                        deferredResponse.resolve({
                            view: response.view
                        });
                    }
                });
                deferredDetailResponse.fail(function(response) {
                    deferredResponse.reject(response);
                });
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
            return deferredResponse.promise();
        },*/
        onStart: function() {

            OrdersFull.setUpEvents();  //probably not needed
        },
        onStop: function() {
            OrdersFull.turnOffEvents();
        },
        patientRequired: true
    };

    return config;
});
