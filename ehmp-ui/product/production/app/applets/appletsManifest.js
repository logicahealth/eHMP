define(function() {
    'use strict';
    var appletsManifest = {};

    var applets = [{
        id: 'ui_components_demo',
        title: 'UI Components Demo',
        showInUDWSelection: false,
        requiredPermissions: []
    }, {
        id: 'action',
        title: 'Actions',
        showInUDWSelection: false,
        requiredPermissions: []
    }, {
        id: 'observations',
        title: 'Observations',
        showInUDWSelection: false,
        requiredPermissions: []
    }, {
        id: 'notes',
        title: 'Notes',
        //requiredPermissions: ['sign-progress-note', 'add-visit']
        requiredPermissions: []
    }, {
        id: 'vitals',
        title: 'Vitals',
        maximizeScreen: 'vitals-full',
        showInUDWSelection: true, //true to show up in User Defined Workspace Carousel
        requiredPermissions: ['read-vital']
    }, {
        id: 'stackedGraph',
        title: 'Stacked Graphs',
        showInUDWSelection: true,
        requiredPermissions: ['access-stack-graph']
    }, {
        id: 'todo_list',
        title: 'All tasks',
        maximizeScreen: 'todo-list-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-task'] // todo: review permission
    }, {
        id: 'activeMeds',
        title: 'Active & Recent Medications',
        maximizeScreen: 'medication-review',
        showInUDWSelection: true,
        requiredPermissions: ['read-active-medication']
    }, {
        id: 'problems',
        title: 'Conditions',
        maximizeScreen: 'problems-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-condition-problem'] // todo: review permission
    }, {
        id: 'lab_results_grid',
        title: 'Numeric Lab Results',
        maximizeScreen: 'lab-results-grid-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-order'] // todo: review permission
    }, {
        id: 'narrative_lab_results_grid',
        title: 'Narrative Lab Results',
        maximizeScreen: 'narrative-lab-results-grid-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-order']
    }, {
        id: 'encounters',
        title: 'Encounters',
        maximizeScreen: 'news-feed',
        showInUDWSelection: true,
        requiredPermissions: ['read-encounter']
    }, {
        id: 'appointments',
        title: 'Appointments & Visits',
        maximizeScreen: 'appointments-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-encounter']
    }, {
        id: 'immunizations',
        title: 'Immunizations',
        maximizeScreen: 'immunizations-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-immunization']
    }, {
        id: 'allergy_grid',
        title: 'Allergies',
        maximizeScreen: 'allergy-grid-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-allergy']
    }, {
        id: 'orders',
        title: 'Orders',
        maximizeScreen: 'orders-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-order']
    }, {
        id: 'ccd_grid',
        title: 'Community Health Summaries',
        maximizeScreen: 'ccd-list-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-community-health-summary', 'read-document']
    }, {
        id: 'cds_advice',
        title: 'Clinical Reminders',
        maximizeScreen: 'cds-advice-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-clinical-reminder']
    }, {
        id: 'documents',
        title: 'Documents',
        maximizeScreen: 'documents-list',
        showInUDWSelection: true,
        requiredPermissions: ['read-document'] // todo: review permission
        //requiredPermissions: []
    }, {
        id: 'medication_review',
        title: 'Medications Review',
        maximizeScreen: 'medication-review',
        showInUDWSelection: true,
        requiredPermissions: ['read-medication-review'] // todo: review permission
    }, {
        id: 'newsfeed',
        title: 'Timeline',
        showInUDWSelection: true,
        maximizeScreen: 'news-feed',
        requiredPermissions: []
    }, {
        id: 'vista_health_summaries',
        title: 'VistA Health Summaries',
        showInUDWSelection: true,
        maximizeScreen: 'vista-health-summaries-full',
        requiredPermissions: ['read-vista-health-summary']
    }, {
        id: 'reports',
        title: 'Reports',
        maximizeScreen: 'reports-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-document'] // todo: review permission
    }, {
        id: 'addApplets',
        title: 'Add Applets',
        requiredPermissions: []
    }, {
        id: 'workspaceManager',
        title: 'Workspace Manager',
        requiredPermissions: []
    }, {
        id: 'logon',
        title: 'Logon',
        requiredBeforeLogin: true,
        requiredPermissions: []
    }, {
        id: 'patient_search',
        title: 'Patient Search',
        requiredBeforeLogin: true,
        requiredPermissions: ['read-patient-record']
    }, {
        id: 'reports',
        title: 'Reports',
        requiredPermissions: ['read-document'] // todo: review permission
    }, {
        id: 'discharge_summary',
        title: 'Discharge Summary',
        requiredPermissions: ['read-document']
    }, {
        id: 'addOrder',
        title: 'Add New Order',
        requiredPermissions: []
    }, {
        id: 'vitalsEiE',
        title: 'Vitals in Error',
        requiredPermissions: []
    }, {
        id: 'vitalsObservationList',
        title: 'Patient Vitals Observed List',
        requiredPermissions: ['read-vital']
    }, {
        id: 'visit',
        title: 'Visit',
        requiredPermissions: []
    }, {
        id: "modalTest",
        title: "Modal Tests",
        requiredPermissions: []
    }, {
        id: 'search',
        title: 'Search',
        requiredPermissions: []
    }, {
        id: "problems_add_edit",
        title: "Add/Edit Problem",
        requiredPermissions: []
    }, {
        id: "ssoLogon",
        title: "Auto Signing In",
        requiredBeforeLogin: true,
        requiredPermissions: []
    }, {
        id: "esignature",
        title: "eSignature",
        showInUDWSelection: false,
        requiredPermissions: []
    }, {
        id: 'user_management',
        title: 'Users',
        maximizeScreen: 'ehmp-administration-full',
        showInUDWSelection: true,
        requiredPermissions: ['read-user-permission-set', 'read-admin-screen']
    }, {
        id: "task_forms",
        title: "Task Forms",
        requiredPermissions: []
    }, {
        id: "military_hist",
        title: "Military History",
        maximizeScreen: 'military-history-full',
        showInUDWSelection: true,
        requiredPermissions: []
    }, {
        id: "notifications",
        title: "My notifications",
        maximizeScreen: 'notifications',
        requiredPermissions: []
    }];

    appletsManifest.applets = applets;

    return appletsManifest;
});