define([
    'app/applets/military_hist/views/modalEditView',
    'app/applets/military_hist/views/modalDetailsView'
], function(ModalEditView,ModalDetailsView) {
    "use strict";

    var eventHandler = {

        showEditView: function(model) {

            var options = {
                size: "small",
                title: 'Edit Military History',
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: ModalEditView,
                    viewModel: model
                }]
            };
            var workflow = new ADK.UI.Workflow(options);
            workflow.show();
        },
        showDetailsView: function(model) {
            var options = {
                size: "medium",
                title: " ",
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: ModalDetailsView,
                    viewModel: model
                }]
            };
            var workflow = new ADK.UI.Workflow(options);
            workflow.show();
        }
    };
    return eventHandler;
});