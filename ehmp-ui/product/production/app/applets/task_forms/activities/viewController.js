define([
    // 'app/applets/task_forms/common/views/modalFooterView'
], function(/*ModalFooterView*/) {
    "use strict";

    /*
     *  NOTE:
     *  ==========
     *  THE SHARED VIEW CONTROLLER FOR EVERYTHING THAT IS COMMON AMONGST ALL ACTIVITIES
     */

    function resolveHelper(response, modalView, footerView, closeOnESC) {
        response.resolve({
            view: modalView,
            footerView: footerView,
            closeOnESC:closeOnESC 
        });
    }

    var viewController = {
        initialize: function(appletId) {
            // var channel = ADK.Messaging.getChannel(appletId);

            // REFERENCE A VIEW CONTROLLER IN A SPECIFIC ACTIVITY (ie. activities/FIT_FOBT/viewController.js)
        }
    };

    return viewController;
});
