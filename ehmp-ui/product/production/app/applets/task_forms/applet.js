define([
    "app/applets/task_forms/activities/viewController",
    "app/applets/task_forms/activities/FIT_FOBT/viewController",
    "app/applets/task_forms/activities/simple_activity/viewController",
    "app/applets/task_forms/activities/sign_note/viewController",
    "app/applets/task_forms/activities/order.consult/viewController",
    "app/applets/task_forms/activities/order.lab/viewController",
    "app/applets/task_forms/activities/requests/responseViewController",
    "app/applets/task_forms/activities/order.consult/utils",
], function(CommonViewController, FITFOBTViewController, SimpleActivityViewController,
            SignNoteViewController, ConsultsViewController, LabViewController, ResponseViewController, OrderConsultUtils) {
    "use strict";

    var channel = ADK.Messaging.getChannel('task_forms');
    channel.reply('get_consult_utils', function() {
        return OrderConsultUtils;
    });

    var appletDefinition = {
        appletId: "task_forms"
    };

    // Initialize all activity viewControllers
    CommonViewController.initialize(appletDefinition.appletId);
    FITFOBTViewController.initialize(appletDefinition.appletId);
    SimpleActivityViewController.initialize(appletDefinition.appletId);
    SignNoteViewController.initialize(appletDefinition.appletId);
    ConsultsViewController.initialize(appletDefinition.appletId);
    LabViewController.initialize(appletDefinition.appletId);
    ResponseViewController.initialize(appletDefinition.appletId);

    return ADK.createSimpleApplet(appletDefinition);
});
