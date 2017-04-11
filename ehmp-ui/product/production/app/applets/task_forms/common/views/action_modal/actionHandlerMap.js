define([
    'app/applets/task_forms/common/utils/signalNames',
    'app/applets/task_forms/common/views/action_modal/action_handlers/endAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/completeAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/rescheduleAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/cancelAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/communityUpdateAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/releaseCommunityAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/releaseConsult',
    'app/applets/task_forms/common/views/action_modal/action_handlers/releaseEWLAction',
    'app/applets/task_forms/common/views/action_modal/action_handlers/aptKeptAction'
], function(
    SignalNames, EndAction, CompleteAction, Reschedule, CancelAction, CommunityUpdate,
    ReleaseCommunity, ReleaseConsult, ReleaseEWLAction, AptKeptAction) {

    'use strict';
    var actionHandlerMap = {};
    actionHandlerMap[SignalNames.CONSULT.END] = {
        title: 'Discontinue Consult',
        getModalBody: EndAction.getBodyView,
        onAccept: EndAction.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.COMPLETE] = {
        title: 'Mark as Complete',
        getModalBody: CompleteAction.getBodyView,
        onAccept: CompleteAction.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.RESCHEDULE] = {
        title: 'Change Appointment Date/Info',
        getModalBody: Reschedule.getBodyView,
        fetchData: Reschedule.fetch,
        onAccept: Reschedule.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.APPT.CANCELED] = {
        title: 'Mark as appointment canceled',
        getModalBody: CancelAction.getBodyView,
        onAccept: CancelAction.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.APPT.KEPT] = {
        title: 'Mark as Appointment Checked Out',
        getModalBody: AptKeptAction.getBodyView,
        onAccept: AptKeptAction.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.COMMUNITY.UPDATE.PENDING] = {
        title: 'Update Community Care Appointment - Pending',
        getModalBody: CommunityUpdate.getBodyView,
        onAccept: CommunityUpdate.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.COMMUNITY.UPDATE.SCHEDULED] = {
        title: 'Update Community Care Appointment Status',
        getModalBody: CommunityUpdate.getBodyView,
        onAccept: CommunityUpdate.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.RELEASE.COMMUNITY] = {
        title: 'Remove from Community Care?',
        getModalBody: ReleaseCommunity.getBodyView,
        onAccept: ReleaseCommunity.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.RELEASE.CONSULT] = {
        title: ReleaseConsult.getTitle,
        getModalBody: ReleaseConsult.getBodyView,
        onAccept: ReleaseConsult.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.RELEASE.ECONSULT] = {
        title: ReleaseConsult.getTitle,
        getModalBody: ReleaseConsult.getBodyView,
        onAccept: ReleaseConsult.onAccept
    };
    actionHandlerMap[SignalNames.CONSULT.RELEASE.EWL] = {
        title: 'Release EWL',
        getModalBody: ReleaseEWLAction.getBodyView,
        onAccept: ReleaseEWLAction.onAccept
    };

    return actionHandlerMap;
});