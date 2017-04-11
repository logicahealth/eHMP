define([
    "app/applets/activeMeds/appletLayout",
    "app/applets/activeMeds/gistView",
    'app/applets/medication_review/medicationsUngrouped/medicationOrderModel'
], function(AppletLayoutView, GistView, MedicationOrderModel) {
    "use strict";
    var applet = {
        id: "activeMeds",
        viewTypes: [{
            type: 'gist',
            view: GistView,
            chromeEnabled: true
        }, {
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };

    var getDetailsModal = function(newModel, newCollection) {
        var uid = newModel.get('uid');
        var currentPatient = ADK.PatientRecordService.getCurrentPatient();
        ADK.Messaging.getChannel("activeMeds").trigger('detailView', {
            uid: uid,
            patient: {
                icn: currentPatient.attributes.icn,
                pid: currentPatient.attributes.pid
            },
            model: newModel,
            collection: newCollection
        });
    };

    (function initMessaging() {
        ADK.Messaging.getChannel('activeMeds').on('detailView', function(clickedResult) {
            var medModel = new MedicationOrderModel(clickedResult.model.attributes);

            var channel = ADK.Messaging.getChannel('medication_review');
            var response = channel.request('detailView', clickedResult);

            var modal = new ADK.UI.Modal({
                view: new response.view({
                    model: medModel
                }),
                options: {
                    size: "large",
                    title: response.title,
                    'nextPreviousCollection': clickedResult.collection,
                    'nextPreviousModel': clickedResult.model
                },
                callbackFunction: getDetailsModal
            });
            modal.show();
        });
    })();

    return applet;
});