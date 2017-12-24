(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD format (for use in app/r.js)
        define(['main/ADK'], function(ADK) {
            return factory(ADK);
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS/Node format (for use in Gruntfile)
        module.exports = factory();
    } else {
        // this follows common pattern, though this is expected to never get hit
        root.AppletsManifest = factory();
    }
}(this, function(ADK) {
    'use strict';
    var appletsManifest = {};
    var crsDomain = {};
    if (ADK) {
        crsDomain = ADK.utils.crsUtil.domain;
    }
    var applets = [{
        id: 'error_reporting',
        title: 'Error Reporting',
        requiredByLayout: true,
        context: ['patient', 'admin', 'staff'],
        permissions: [],
        documentation: true
    }, {
        id: 'system_communication',
        title: 'System Communications',
        permissions: [],
        showInUDWSelection: false,
        requiredByLayout: true,
        documentation: true
    }, {
        id: 'ui_components_demo',
        title: 'UI Components Demo',
        context: ['demo'],
        showInUDWSelection: false,
        permissions: [],
        concatenate: false
    }, {
        id: 'patient_information',
        title: 'Patient Information',
        permissions: [],
        requiredByLayout: ['patient'],
        showInUDWSelection: false
    }, {
        id: 'action',
        title: 'Actions',
        context: ['patient'],
        showInUDWSelection: false,
        permissions: [],
        requiredByLayout: ['patient']
    }, {
        id: 'observations',
        title: 'Observations',
        context: ['patient'],
        showInUDWSelection: false,
        permissions: [],
        requiredByLayout: ['patient']
    }, {
        id: 'notes',
        title: 'Notes',
        context: ['patient'],
        permissions: [],
        requiredByLayout: ['patient']
    }, {
        id: 'vitals',
        title: 'Vitals',
        context: ['patient'],
        maximizeScreen: 'vitals-full',
        showInUDWSelection: true, //true to show up in User Defined Workspace Carousel
        permissions: ['read-vital'],
        crsDomain: crsDomain.VITAL
    }, {
        id: 'short_cuts',
        title: 'Short Cuts',
        context: ['patient', 'admin', 'staff'],
        showInUDWSelection: false,
        permissions: []
    }, {
        id: 'stackedGraph',
        title: 'Stacked Graphs',
        context: ['patient'],
        showInUDWSelection: true,
        permissions: ['access-stack-graph']
    }, {
        id: 'todo_list',
        title: 'Tasks',
        context: ['patient', 'staff'],
        maximizeScreen: 'todo-list-full',
        showInUDWSelection: true,
        permissions: ['read-task'],
        dependencies: ['notes', 'orders']
    }, {
        id: 'activeMeds',
        title: 'Active & Recent Medications',
        context: ['patient'],
        maximizeScreen: 'medication-review',
        showInUDWSelection: true,
        permissions: ['read-active-medication'],
        crsDomain: crsDomain.MEDICATION
    }, {
        id: 'problems',
        title: 'Problems',
        context: ['patient'],
        maximizeScreen: 'problems-full',
        showInUDWSelection: true,
        permissions: ['read-condition-problem'],
        crsDomain: crsDomain.PROBLEM
    }, {
        id: 'lab_results_grid',
        title: 'Numeric Lab Results',
        context: ['patient'],
        maximizeScreen: 'lab-results-grid-full',
        showInUDWSelection: true,
        permissions: ['read-order'],
        crsDomain: crsDomain.LABORATORY
    }, {
        id: 'narrative_lab_results_grid',
        title: 'Narrative Lab Results',
        context: ['patient'],
        maximizeScreen: 'narrative-lab-results-grid-full',
        showInUDWSelection: true,
        permissions: ['read-order']
    }, {
        id: 'encounters',
        title: 'Encounters',
        context: ['patient'],
        maximizeScreen: 'news-feed',
        showInUDWSelection: true,
        permissions: ['read-encounter'],
        requiredByLayout: ['patient'],
        dependencies: ['visit']
    }, {
        id: 'appointments',
        title: 'Appointments & Visits',
        context: ['patient'],
        maximizeScreen: 'appointments-full',
        showInUDWSelection: true,
        permissions: ['read-encounter']
    }, {
        id: 'immunizations',
        title: 'Immunizations',
        context: ['patient'],
        maximizeScreen: 'immunizations-full',
        showInUDWSelection: true,
        permissions: ['read-immunization']
    }, {
        id: 'allergy_grid',
        title: 'Allergies',
        context: ['patient'],
        maximizeScreen: 'allergy-grid-full',
        showInUDWSelection: true,
        permissions: ['read-allergy']
    }, {
        id: 'orders',
        title: 'Orders',
        context: ['patient'],
        maximizeScreen: 'orders-full',
        showInUDWSelection: true,
        permissions: ['read-order']
    }, {
        id: 'ccd_grid',
        title: 'Community Health Summaries',
        context: ['patient'],
        maximizeScreen: 'ccd-list-full',
        showInUDWSelection: true,
        permissions: ['read-community-health-summary', 'read-document']
    }, {
        id: 'cds_advice',
        title: 'Clinical Reminders',
        context: ['patient'],
        maximizeScreen: 'cds-advice-full',
        showInUDWSelection: true,
        permissions: ['read-clinical-reminder']
    }, {
        id: 'documents',
        title: 'Documents',
        context: ['patient'],
        maximizeScreen: 'documents-list',
        showInUDWSelection: true,
        permissions: ['read-document']
    }, {
        id: 'medication_review',
        title: 'Medications Review',
        context: ['patient'],
        maximizeScreen: 'medication-review',
        showInUDWSelection: true,
        permissions: ['read-medication-review'],
        crsDomain: crsDomain.MEDICATION
    }, {
        id: 'newsfeed',
        title: 'Timeline',
        context: ['patient'],
        showInUDWSelection: true,
        maximizeScreen: 'news-feed',
        permissions: []
    }, {
        id: 'vista_health_summaries',
        title: 'VistA Health Summaries',
        context: ['patient'],
        showInUDWSelection: true,
        maximizeScreen: 'vista-health-summaries-full',
        permissions: ['read-vista-health-summary']
    }, {
        id: 'reports',
        title: 'Reports',
        context: ['patient'],
        maximizeScreen: 'reports-full',
        showInUDWSelection: true,
        permissions: ['read-document']
    }, {
        id: 'addApplets',
        title: 'Add Applets',
        context: ['patient'],
        permissions: [],
        requiredByLayout: ['patient']
    }, {
        id: 'workspaceManager',
        title: 'Workspace Manager',
        context: ['patient'],
        permissions: [],
        requiredByLayout: ['patient', 'staff'],
        documentation: true
    }, {
        id: 'logon',
        title: 'Logon',
        context: ['logon'],
        permissions: [],
        dependencies: ['ssoLogon']
    }, {
        id: 'patient_selection',
        title: 'Patient Selection',
        context: ['patient', 'staff'],
        permissions: ['read-patient-record'],
        requiredByLayout: true,
        documentation: true
    }, {
        id: 'discharge_summary',
        title: 'Discharge Summary',
        context: ['patient'],
        permissions: ['read-document']
    }, {
        id: 'vitalsEiE',
        title: 'Vitals in Error',
        context: ['patient'],
        permissions: []
    }, {
        id: 'vitalsObservationList',
        title: 'Patient Vitals Observed List',
        context: ['patient'],
        permissions: ['read-vital']
    }, {
        id: 'visit',
        title: 'Visit',
        context: ['patient'],
        permissions: []
    }, {
        id: 'workspace_context_navigation',
        title: 'Workspace Context Navigation',
        permissions: [],
        requiredByLayout: true,
        showInUDWSelection: false
    }, {
        id: 'search',
        title: 'Search',
        context: ['patient'],
        permissions: [],
        requiredByLayout: ['patient']
    }, {
        id: 'patient_sync_status',
        title: 'Patient Sync Status',
        context: ['patient'],
        permissions: [],
        requiredByLayout: ['patient'],
        documentation: true
    }, {
        id: 'ssoLogon',
        title: 'Auto Signing In',
        context: ['logon'],
        permissions: []
    }, {
        id: 'esignature',
        title: 'eSignature',
        context: ['patient'],
        showInUDWSelection: false,
        permissions: []
    }, {
        id: 'user_management',
        title: 'Users',
        context: ['admin'],
        maximizeScreen: 'ehmp-administration-full',
        showInUDWSelection: true,
        permissions: ['read-user-permission-set', 'read-admin-screen']
    }, {
        id: 'task_forms',
        title: 'Task Forms',
        context: ['patient'],
        permissions: []
    }, {
        id: 'military_hist',
        title: 'Military History',
        context: ['patient'],
        maximizeScreen: 'military-history-full',
        showInUDWSelection: true,
        permissions: []
    }, {
        id: 'notifications',
        title: 'My notifications',
        context: ['staff', 'patient'],
        showInUDWSelection: false,
        permissions: []
    }, {
        id: 'global_datepicker',
        title: 'Global Datepicker',
        context: ['patient'],
        showInUDWSelection: false,
        permissions: [],
        requiredByLayout: ['patient'],
        documentation: true
    }, {
        id: 'activities',
        title: 'Activities',
        context: ['patient', 'staff'],
        showInUDWSelection: true,
        maximizeScreen: 'activities-patient-full',
        permissions: ['read-task'],
        dependencies: ['task_forms']
    }, {
        id: 'tab_manager',
        title: 'Tab Manager',
        context: ['patient', 'staff'],
        showInUDWSelection: false,
        permissions: []
    }, {
        id: 'consults',
        title: 'Consults',
        context: ['patient', 'staff'],
        showInUDWSelection: true,
        maximizeScreen: 'consults-patient-full',
        permissions: ['read-task'],
        dependencies: ['task_forms']
    }, {
        id: 'requests',
        title: 'Requests',
        context: ['patient', 'staff'],
        showInUDWSelection: true,
        maximizeScreen: 'requests-patient-full',
        permissions: ['read-task'],
        dependencies: ['task_forms']
    }, {
        id: 'video_visits',
        title: 'Video Visits - Next 90 Days',
        context: ['patient'],
        showInUDWSelection: true,
        permissions: [],
        documentation: true
    }, {
        id: 'permission_sets',
        title: 'Permission Sets',
        maximizeScreen: 'permission-sets-full',
        context: ['admin'],
        permissions: ['read-permission-sets'],
        documentation: true
    }, {
        id: 'individual_permissions',
        title: 'Individual Permissions',
        context: ['admin'],
        maximizeScreen: 'individual-permissions-full',
        permissions: ['read-permission-sets'],
        documentation: true
    }, {
        id: 'discharge_followup',
        title: 'Inpatient Discharge Follow-Up',
        context: ['staff'],
        showInUDWSelection: true,
        permissions: ['read-discharge-followup'],
        dependencies: ['task_forms']
    }];

    appletsManifest.applets = applets;
    return appletsManifest;
}));
