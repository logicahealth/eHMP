define([], function() {
    'use strict';
    var predefinedScreens = {};

    var screens = [{
        title: 'Coversheet',
        id: 'cover-sheet',
        screenId: 1,
        routeName: 'cover-sheet',
        predefined: true,
        description: ''
    }, {
        title: 'Timeline',
        id: 'news-feed',
        screenId: 2,
        routeName: 'news-feed',
        description: '',
        predefined: true,
        requiredPermissions: ['access-general-ehmp']
    }, {
        title: 'Overview',
        id: 'overview',
        screenId: 3,
        routeName: 'overview',
        description: '',
        predefined: true
    }, {
        title: 'Medication Review',
        id: 'medication-review',
        screenId: 4,
        routeName: 'medication-review',
        description: '',
        predefined: true
    }, {
        title: 'Documents',
        id: 'documents-list',
        screenId: 5,
        routeName: 'documents-list',
        description: '',
        predefined: true,
        requiredPermissions: ['read-document']
    }, {
        title: 'Access Control',
        id: 'ehmp-administration',
        screenId: 10,
        routeName: 'ehmp-administration',
        description: '',
        predefined: true
    }, {
        title: 'Notifications',
        id: 'notifications-full',
        screenId: 11,
        routeName: 'notifications-full',
        description: '',
        predefined: true
    }, {
        title: 'Homepage',
        id: 'provider-centric-view',
        screenId: 12,
        routeName: 'provider-centric-view',
        description: '',
        predefined: true
    }, {
        title: 'Summary',
        id: 'summary',
        screenId: 13,
        routeName: 'summary',
        description: '',
        predefined: true
    }, {
        title: 'Discharge Follow Up',
        id: 'discharge-follow-up',
        screenId: 14,
        routeName: 'discharge-follow-up',
        description: '',
        predefined: true
    }, {
        title: 'Ehmp Administration Full',
        id: 'ehmp-administration-full',
        screenId: 15,
        routeName: 'ehmp-administration-full',
        description: '',
        predefined: true
    }, {
        title: 'Logon Screen',
        id: 'logon-screen',
        screenId: 16,
        routeName: 'logon-screen',
        description: '',
        predefined: true
    }, {
        title: 'Appointments Full',
        id: 'appointments-full',
        screenId: 17,
        routeName: 'appointments-full',
        description: '',
        predefined: true
    }, {
        title: 'Immunizations Full',
        id: 'immunizations-full',
        screenId: 18,
        routeName: 'immunizations-full',
        description: '',
        predefined: true
    }, {
        title: 'Reports Full',
        id: 'reports-full',
        screenId: 19,
        routeName: 'reports-full',
        description: '',
        predefined: true
    }, {
        title: 'Lab Results Grid Full',
        id: 'lab-results-grid-full',
        screenId: 20,
        routeName: 'lab-results-grid-full',
        description: '',
        predefined: true
    }, {
        title: 'Narrative Lab Results Grid Full',
        id: 'narrative-lab-results-grid-full',
        screenId: 21,
        routeName: 'narrative-lab-results-grid-full',
        description: '',
        predefined: true
    }, {
        title: 'Allergy Grid Full',
        id: 'allergy-grid-full',
        screenId: 22,
        routeName: 'allergy-grid-full',
        description: '',
        predefined: true
    }, {
        title: 'Record Search',
        id: 'record-search',
        screenId: 23,
        routeName: 'record-search',
        description: '',
        predefined: true
    }, {
        title: 'Problems Full',
        id: 'problems-full',
        screenId: 24,
        routeName: 'problems-full',
        description: '',
        predefined: true
    }, {
        title: 'Orders Full',
        id: 'orders-full',
        screenId: 25,
        routeName: 'orders-full',
        description: '',
        predefined: true
    }, {
        title: 'Vitals Full',
        id: 'vitals-full',
        screenId: 26,
        routeName: 'vitals-full',
        description: '',
        predefined: true
    }, {
        title: 'Vista Health Summaries Full',
        id: 'vista-health-summaries-full',
        screenId: 27,
        routeName: 'vista-health-summaries-full',
        description: '',
        predefined: true
    }, {
        title: 'Visit Select',
        id: 'visit-select',
        screenId: 28,
        routeName: 'visit-select',
        description: '',
        predefined: true
    }, {
        title: 'Ccd List Full',
        id: 'ccd-list-full',
        screenId: 29,
        routeName: 'ccd-list-full',
        description: '',
        predefined: true
    }, {
        title: 'Cds Advice Full',
        id: 'cds-advice-full',
        screenId: 30,
        routeName: 'cds-advice-full',
        description: '',
        predefined: true
    }, {
        title: 'Sso',
        id: 'sso',
        screenId: 31,
        routeName: 'sso',
        description: '',
        predefined: true
    }, {
        title: 'Todo List Full',
        id: 'todo-list-full',
        screenId: 32,
        routeName: 'todo-list-full',
        description: '',
        predefined: true
    }, {
        title: 'Todo List Provider Full',
        id: 'todo-list-provider-full',
        screenId: 33,
        routeName: 'todo-list-provider-full',
        description: '',
        predefined: true
    }, {
        title: 'Military History Full',
        id: 'military-history-full',
        screenId: 34,
        routeName: 'military-history-full',
        description: '',
        predefined: true
    }, {
        title: 'My Notifications Full',
        id: 'my-notifications-full',
        screenId: 35,
        routeName: 'my-notifications-full',
        description: '',
        predefined: true
    }, {
        title: 'Activities Patient Full',
        id: 'activities-patient-full',
        screenId: 36,
        routeName: 'activities-patient-full',
        description: '',
        predefined: true
    }, {
        title: 'Activities Staff Full',
        id: 'activities-staff-full',
        screenId: 37,
        routeName: 'activities-staff-full',
        description: '',
        predefined: true
    }, {
        title: 'Consults Patient Full',
        id: 'consults-patient-full',
        screenId: 38,
        routeName: 'consults-patient-full',
        description: '',
        predefined: true
    }, {
        title: 'Consults Staff Full',
        id: 'consults-staff-full',
        screenId: 39,
        routeName: 'consults-staff-full',
        description: '',
        predefined: true
    }, {
        title: 'Requests Patient Full',
        id: 'requests-patient-full',
        screenId: 40,
        routeName: 'requests-patient-full',
        description: '',
        predefined: true
    }, {
        title: 'Requests Staff Full',
        id: 'requests-staff-full',
        screenId: 41,
        routeName: 'requests-staff-full',
        description: '',
        predefined: true
    }, {
        title: 'Ui Components Demo',
        id: 'ui-components-demo',
        screenId: 42,
        routeName: 'ui-components-demo',
        description: '',
        predefined: true
    }, {
        title: 'Permission Sets Full',
        id: 'permission-sets-full',
        screenId: 43,
        routeName: 'permission-sets-full',
        description: '',
        predefined: true
    }, {
        title: 'Individual Permissions Full',
        id: 'individual-permissions-full',
        screenId: 44,
        routeName: 'individual-permissions-full',
        description: '',
        predefined: true
    }, {
        title: 'Discharge Care Coordination',
        id: 'discharge-care-coordination',
        screenId: 45,
        routeName: 'discharge-care-coordination',
        description: '',
        predefined: true
    }];

    predefinedScreens.screens = screens;

    return predefinedScreens;
});
