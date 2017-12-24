(function(root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD format (for use in app/r.js)
        define(function() {
            return factory();
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS/Node format (for use in Gruntfile)
        module.exports = factory();
    } else {
        // this follows common pattern, though this is expected to never get hit
        root.ScreensManifest = factory();
    }
}(this, function() {
    "use strict";
    var screensManifest = {
        ssoLogonScreen: 'sso'
    };

    var screens = [];
    screens.push({
        routeName: 'ui-components-demo',
        fileName: 'UIComponentsDemo'
    });
    screens.push({
        routeName: 'logon-screen',
        fileName: 'LogonScreen'
    });
    screens.push({
        routeName: 'medication-review',
        fileName: 'MedicationReview'
    });
    screens.push({
        routeName: 'appointments-full',
        fileName: 'AppointmentsFull'
    });
    screens.push({
        routeName: 'immunizations-full',
        fileName: 'ImmunizationsFull'
    });
    screens.push({
        routeName: 'reports-full',
        fileName: 'ReportsFull',
        requiredPermissions: []
    });
    screens.push({
        routeName: 'lab-results-grid-full',
        fileName: 'LabResultsGridFull'
    });
    screens.push({
        routeName: 'narrative-lab-results-grid-full',
        fileName: 'NarrativeLabResultsGridFull'
    });
    screens.push({
        routeName: 'cover-sheet',
        fileName: 'CoverSheet'
    });
    screens.push({
        routeName: 'allergy-grid-full',
        fileName: 'AllergyGridFull'
    });
    screens.push({
        routeName: 'documents-list',
        fileName: 'Documents',
        requiredPermissions: []
    });
    screens.push({
        routeName: 'record-search',
        fileName: 'RecordSearch'
    });
    screens.push({
        routeName: 'problems-full',
        fileName: 'ProblemsGridFull',
        requiredPermissions: []
    });
    screens.push({
        routeName: 'orders-full',
        fileName: 'OrdersFull'
    });
    screens.push({
        routeName: 'news-feed',
        fileName: 'NewsFeed',
        requiredPermissions: []
    });
    screens.push({
        routeName: 'vitals-full',
        fileName: 'VitalsFull'
    });
    screens.push({
        routeName: 'vista-health-summaries-full',
        fileName: 'VistaHealthSummariesFull'
    });
    screens.push({
        routeName: 'visit-select',
        fileName: 'VisitSelection'
    });
    screens.push({
        routeName: 'ccd-list-full',
        fileName: 'CCDListFull'
    });
    screens.push({
        routeName: 'overview',
        fileName: 'Overview'
    });
    screens.push({
        routeName: 'summary',
        fileName: 'Summary'
    });
    screens.push({
        routeName: 'cds-advice-full',
        fileName: 'CDSAdviceFull'
    });
    screens.push({
        routeName: 'sso',
        fileName: 'ssoLogonScreen'
    });
    screens.push({
        routeName: 'ehmp-administration',
        fileName: 'EHMPAdministration',
        requiredPermissions: ['read-admin-screen']
    });
    screens.push({
        routeName: 'provider-centric-view',
        fileName: 'ProviderCentricView'
    });
    screens.push({
        routeName: 'ehmp-administration-full',
        fileName: 'EHMPAdministrationFull',
        requiredPermissions: ['read-admin-screen']
    });
    screens.push({
        routeName: 'todo-list-full',
        fileName: 'TodoListFull'
    });
    screens.push({
        routeName: 'todo-list-provider-full',
        fileName: 'TodoListFullProvider'
    });
    screens.push({
        routeName: 'military-history-full',
        fileName: 'MilitaryHistFull'
    });
    screens.push({
        routeName: 'my-notifications-full',
        fileName: 'NotificationsProviderFull'
    });
    screens.push({
        routeName: 'notifications-full',
        fileName: 'NotificationsFull'
    });
    screens.push({
        routeName: 'activities-patient-full',
        fileName: 'ActivitiesPatientFull'
    });
    screens.push({
        routeName: 'activities-staff-full',
        fileName: 'ActivitiesStaffFull'
    });
    screens.push({
        routeName: 'consults-patient-full',
        fileName: 'ConsultsPatientFull'
    });
    screens.push({
        routeName: 'consults-staff-full',
        fileName: 'ConsultsStaffFull'
    });
    screens.push({
        routeName: 'requests-patient-full',
        fileName: 'RequestsPatientFull'
    });
    screens.push({
        routeName: 'requests-staff-full',
        fileName: 'RequestsStaffFull'
    });
    screens.push({
        routeName: 'individual-permissions-full',
        fileName: 'IndividualPermissionsFull',
        requiredPermissions: ['read-admin-screen']
    });
    screens.push({
        routeName: 'permission-sets-full',
        fileName: 'PermissionSetsFull',
        requiredPermissions: ['read-admin-screen']
    });
    screens.push({
        routeName: 'discharge-follow-up',
        fileName: 'DischargeFollowUp'
    });
    screens.push({
        routeName: 'discharge-care-coordination',
        fileName: 'DischargeCareCoordination'
    });

    screensManifest.screens = screens;

    return screensManifest;
}));