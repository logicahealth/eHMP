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
        requiredPermissions: ['read-timeline']
    }, {
        title: 'Overview',
        id: 'overview',
        screenId: 3,
        routeName: 'overview',
        description: '',
        predefined: true
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
        title: 'My Workspace',
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
    }];

    predefinedScreens.screens = screens;

    return predefinedScreens;
});