define([
    'app/screens/EHMPAdministration',
    'app/screens/ProviderCentricView'
], function(EHMPAdministration, ProviderCentricView) {
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
        //requiredPermissions: []
        requiredPermissions: ['read-timeline']
    }, {
        title: 'Overview',
        id: 'overview',
        screenId: 3,
        routeName: 'overview',
        description: '',
        predefined: true,
        defaultScreen: true
    }, {
        title: 'Meds Review',
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
        //requiredPermissions: []
        requiredPermissions: ['read-document']
    }, {
        title: 'Depression',
        id: 'depression-cbw',
        screenId: 6,
        routeName: 'depression-cbw',
        description: '',
        predefined: true
    }, {
        title: 'Diabetes Mellitus',
        id: 'diabetes-mellitus-cbw',
        screenId: 7,
        routeName: 'diabetes-mellitus-cbw',
        description: '',
        predefined: true
    }, {
        title: 'Hypertension',
        id: 'hypertension-cbw',
        screenId: 8,
        routeName: 'hypertension-cbw',
        description: '',
        predefined: true
    }, {
        title: 'Pre-Procedure',
        id: 'pre-procedure-cbw',
        screenId: 9,
        routeName: 'pre-procedure-cbw',
        description: '',
        predefined: true
    }, {
        title: 'Access Control',
        id: 'ehmp-administration',
        screenId: 10,
        routeName: 'ehmp-administration',
        description: '',
        predefined: true,
        addNavigationTab: true
    }, {
        title: 'Notifications',
        id: 'notifications-full',
        screenId: 11,
        routeName: 'notifications-full',
        description: '',
        predefined: true
    }, {
        title: 'My Workspace',
        id: 'provider-centric-view',
        screenId: 12,
        routeName: 'provider-centric-view',
        description: '',
        predefined: true,
        addNavigationTab: true
    }];

    predefinedScreens.screens = screens;

    return predefinedScreens;
});