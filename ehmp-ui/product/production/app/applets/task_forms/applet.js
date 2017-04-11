define([
    "app/applets/task_forms/activities/viewController",
    "app/applets/task_forms/activities/FIT_FOBT/viewController",
    "app/applets/task_forms/activities/simple_activity/viewController",
    "app/applets/task_forms/activities/sign_note/viewController",
    "app/applets/task_forms/activities/consults/viewController"
], function(CommonViewController, FITFOBTViewController, SimpleActivityViewController,
        SignNoteViewController, ConsultsViewController) {
    "use strict";

    var appletDefinition = {
        appletId: "task_forms"
    };

    // Initialize all activity viewControllers
    CommonViewController.initialize(appletDefinition.appletId);
    FITFOBTViewController.initialize(appletDefinition.appletId);
    SimpleActivityViewController.initialize(appletDefinition.appletId);
    SignNoteViewController.initialize(appletDefinition.appletId);
    ConsultsViewController.initialize(appletDefinition.appletId);

    return ADK.createSimpleApplet(appletDefinition);
});
