define(function() {
    'use strict';
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
        routeName: 'patient-search-screen',
        fileName: 'PatientSearch'
    });
    screens.push({
        routeName: 'medication-review',
        fileName: 'MedicationReview'
    });
    screens.push({
        routeName: 'vital-list',
        fileName: 'VitalList'
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
            //requiredPermissions: ['read-document'],
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
        routeName: 'cover-sheet-gridster',
        fileName: 'CoverSheetGridster'
    });
    screens.push({
        routeName: 'allergy-grid-full',
        fileName: 'AllergyGridFull'
    });
    screens.push({
        routeName: 'documents-list',
        fileName: 'Documents',
        requiredPermissions: []
            //requiredPermissions: ['read-document']
    });
    screens.push({
        routeName: 'record-search',
        fileName: 'RecordSearch'
    });
    screens.push({
        routeName: 'problems-full',
        fileName: 'ProblemsGridFull',
        requiredPermissions: []
            //requiredPermissons: ['read-patient-problem']
    });
    screens.push({
        routeName: 'orders-full',
        fileName: 'OrdersFull'
    });
    screens.push({
        routeName: 'news-feed',
        fileName: 'NewsFeed',
        requiredPermissions: []
            //requiredPermissions: ['read-timeline']
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


    screensManifest.screens = screens;

    return screensManifest;
});