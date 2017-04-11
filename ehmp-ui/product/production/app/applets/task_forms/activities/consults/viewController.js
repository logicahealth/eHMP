// TODO: Remove TEMP imports when wireframes are completed
define([
    'backbone',
    'marionette',
    'app/applets/task_forms/activities/consults/views/orderEntry_View',
    'app/applets/task_forms/activities/consults/views/orderEntryFooter_View',
    'app/applets/task_forms/activities/consults/views/notification_View',
    'app/applets/task_forms/activities/consults/views/notificationFooter_View',
    'app/applets/task_forms/activities/consults/views/request_View',
    'app/applets/task_forms/activities/consults/views/requestFooter_View',
    'app/applets/task_forms/common/views/activityOverview_View',
    'app/applets/task_forms/common/views/activityOverviewFooter_View',
    'app/applets/task_forms/activities/consults/views/temp_View',
    'app/applets/task_forms/activities/consults/views/tempFooter_View',
    'app/applets/task_forms/activities/consults/eventHandler',
    'hbs!app/applets/task_forms/activities/consults/templates/consultOverview_Template'
], function(Backbone, Marionette,
    OrderEntryView, OrderEntryFooterView, NotificationView, NotificationFooterView,
    RequestView, RequestFooterView, ActivityOverviewView, ActivityOverviewFooterView,
    TempView, TempFooterView, EventHandler, ConsultOverviewTemplate) {
    "use strict";

    function resolveHelper(response, modalView, footerView, closeOnESC) {
        response.resolve({
            view: modalView,
            footerView: footerView,
            closeOnESC: closeOnESC
        });
    }

    var viewController = {
        initialize: function(appletId) {
            var PROCESSID = 'order' + '.';
            var channel = ADK.Messaging.getChannel(appletId);

            // Consult entry form
            channel.reply(PROCESSID + 'consult-finalize_consult_order', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new OrderEntryView({
                    model: params.model
                });

                var footerView = new OrderEntryFooterView({
                    model: params.model,
                    formModel: modalView.formModel,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // The activity overview modal
            channel.reply(PROCESSID + 'activity_overview_screen', function(params) {
                var response = $.Deferred();

                // Create the specific task view to be inserted in the Activity Overview modal
                var TaskView = Backbone.Marionette.LayoutView.extend({
                    template: ConsultOverviewTemplate
                });

                // Define funtion to be executed upon clicking the Discontinue button
                var discontinueEvent = function() {
                    // Set the tray action to discontinue
                    var actionChannel = ADK.Messaging.getChannel('action');
                    var action = actionChannel.request('getActionTray');
                    action.done(function(response2) {
                        var tray = response2.tray;
                        tray.$('#action').val('discontinued');
                        tray.$('#action').change();
                    });
                };

                // Pass the model and taskView to the Activity View to populate template
                var modalView = new ActivityOverviewView({
                    model: params.model,
                    taskView: new TaskView({model: params.model})
                });

                /*
                 * Uncommenting the below lines will activate the third optional button. 
                 *  If used, the footer view object will need an optionButtonEvent key 
                 *  that is set to the buttons clicked event function (defined below)
                 */
                // params.model.set('optionButtonLabel', 'your buttons label');
                // var optionButtonEvent = function(){ **define optional button process here ** };
                var footerView = new ActivityOverviewFooterView({
                    model: params.model,
                    taskListView: params.taskListView,
                    discontinueEvent: discontinueEvent,
                    // optionButtonEvent: optionButtonEvent
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Triage consult order form
            channel.reply(PROCESSID + 'consult-triage_consult_order', function(params) {
                var response = $.Deferred();

                // Populate form with the correct select actions based on form
                var actions = [
                    {value: 'triaged', label: 'Send to Scheduling'},
                    {value: 'clarification', label: 'Return for Clarification'},
                    {value: 'assigned', label: 'Assign to triage member'},
                    {value: 'eConsult', label: 'eConsult'},
                    {value: 'discontinued', label: 'Discontinue Consult'}
                ];

                // Set order state to Active.
                params.model.get('taskVariables').orderState = 'Active';

                // Pass the model to the view to populate template
                var modalView = new RequestView({
                    model: params.model,
                    actions: actions
                });

                var footerView = new RequestFooterView({
                    model: params.model,
                    formModel: modalView.formModel,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Used for multiple processes
            var formProcess = function(params) {
                var response = $.Deferred();

                // Populate form with the correct select actions based on form
                var actions = [
                    {value: 'scheduled', label: 'Scheduled'},
                    {value: 'contacted', label: 'Contact Patient'},
                    {value: 'discontinued', label: 'Discontinue Consult'}
                ];

                // Pass the model to the view to populate template
                var modalView = new RequestView({
                    model: params.model,
                    actions: actions
                });

                var footerView = new RequestFooterView({
                    model: params.model,
                    formModel: modalView.formModel,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            };

            // Consult request form
            channel.reply(PROCESSID + 'consult-finalize_consult_scheduling', formProcess);

            // Discontinued consult order notification 
            channel.reply(PROCESSID + 'consult-discontinue_consult_order', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });

                params.model.set('button', 'Complete');
                var footerView = new NotificationFooterView({
                    model: params.model,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            channel.reply(PROCESSID + 'consult-respond_to_triage_clarification', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new TempView({
                    model: params.model
                });

                params.model.set('button', 'Respond');
                params.model.set('form', 'RESPOND TO TRIAGE CLARIFICATION');
                var footerView = new TempFooterView({
                    model: params.model,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            channel.reply(PROCESSID + 'consult-complete_consult_note', function(params) {
                var response = $.Deferred();
                // Claim task to be completed
                EventHandler.fetchHelper(null, params.model, 'start', null, function() {
                    resolveHelper(response, null, null, false);
                });

                // After task is claimed
                $.when(response).then(function() {
                    // Complete task
                    EventHandler.tempTaskProcessing({}, params.model, params.taskListView, 'signed',
                        function() {
                            // After task is completed, navigate to overview screen and open Notes tray
                            ADK.Navigation.displayScreen('overview');
                            $('#patientDemographic-noteSummary button').click();
                        }
                    );
                });

                return response.promise();
            });

            channel.reply(PROCESSID + 'consult-complete_econsult_note', function(params) {
                var response = $.Deferred();
                // Claim task to be completed
                EventHandler.fetchHelper(null, params.model, 'start', null, function() {
                    resolveHelper(response, null, null, false);
                });

                // After task is claimed
                $.when(response).then(function() {
                    // Complete task
                    EventHandler.tempTaskProcessing({}, params.model, params.taskListView, 'signed',
                        function() {
                            // After task is completed, navigate to overview screen and open Notes tray
                            ADK.Navigation.displayScreen('overview');
                            $('#patientDemographic-noteSummary button').click();
                        }
                    );
                });

                return response.promise();
            });


            channel.reply(PROCESSID + 'consult-review_consult_note', function(params) {
                var response = $.Deferred();
                // Claim task to be completed
                EventHandler.fetchHelper(null, params.model, 'start', null, function() {
                    resolveHelper(response, null, null, false);
                });

                // After task is claimed
                $.when(response).then(function() {
                    // Complete task
                    EventHandler.tempTaskProcessing({}, params.model, params.taskListView, '',
                        function() {
                            // After task is completed, navigate to overview screen and open Notes tray
                            ADK.Navigation.displayScreen('overview');
                            $('#patientDemographic-noteSummary button').click();
                        }
                    );
                });

                return response.promise();
            });

            // TODO
            // ======================================================
            //                      TEMPORARY
            //          Until the sign process is completed
            // ======================================================

            channel.reply(PROCESSID + 'consult-sign_consult_order', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new TempView({
                    model: params.model
                });

                params.model.set('button', 'Sign');
                params.model.set('form', 'SIGN');
                var footerView = new TempFooterView({
                    model: params.model,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });
        }
    };

    return viewController;
});
