define([
    'app/applets/orders/tray/labs/trayView',
    'app/applets/orders/writeback/labs/formModel',
    'app/applets/orders/writeback/writebackUtils'
], function(LabTrayView, LabFormModel, Utils) {
    'use strict';

    var launchLabTrayForm = function(options) {
        var formModel = new LabFormModel(options);
        var workflowOptions = {
            onBeforeShow: function() {
                ADK.Messaging.getChannel('addOrders').trigger('visit:ready');
            }
        };
        Utils.launchWorkflow(formModel, LabTrayView, workflowOptions, 'Order a Lab Test', 'actions');
    };

    /**
     * Launch the lab order tray UI form for a new lab order.
     */
    var launchLabForm = function() {
        launchLabTrayForm();
    };

    /**
     * Launch the lab order tray UI form with the lab context preselected.
     */
    var launchContextLabOrderForm = function(context) {
        if (context.cdsModel) {
            launchLabTrayForm({
                'contextIen': context.cdsModel.get('data').ien
            });
        }
    };

    /**
     * Launch the lab order tray UI form for the draft order. This function will use workflow options
     * that will load the draft order associated with the 'draftUid' parameter from the RDK Clinical Object
     * subsystem and pre-populate the fields with the draft order information.
     *
     * @param {string} draftUid  Unique ID of the Clinical Object associated with the draft lab order of interest.
     */
    var launchDraftLabOrderForm = function(draftUid) {
        launchLabTrayForm({
            'draft-uid': draftUid
        });
    };

    return {
        launchLabForm: launchLabForm,
        launchDraftLabOrderForm: launchDraftLabOrderForm,
        launchContextLabOrderForm: launchContextLabOrderForm
    };
});