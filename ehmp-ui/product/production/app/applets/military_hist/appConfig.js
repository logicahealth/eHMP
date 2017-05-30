define([], function() {
    'use strict';
    var APPLET_ID = 'military_hist';
    var CHANNEL_NAME = APPLET_ID;
    var DATA_VERSION = '2.0.r01';

    var displayNames = {
        //display names by 'name' key
        //'name':'displayName'
        'Branch of Service': 'Branch(es) of service',
        'Years of Service': 'Service date(s)',
        'Areas of Service': 'Areas of service',
        'Occupational Specialties': 'Occupational specialties'
    };

    var Config = {
        APPLET_ID: APPLET_ID,
        DATA_VERSION: DATA_VERSION,
        CHANNEL_NAME: CHANNEL_NAME,
        displayNames: displayNames,
        getDefaults: function getDefaults(version) {
            var defaults = [{
                'description': '',
                get displayName() {
                    return displayNames[this.name];
                },
                'siteHash': '',
                'touchedBy': '',
                'touchedOn': '',
                'name': 'Branch of Service',
                'version': DATA_VERSION,
                'appletId': APPLET_ID
            }, {
                'description': '',
                get displayName() {
                    return displayNames[this.name];
                },
                'siteHash': '',
                'touchedBy': '',
                'touchedOn': '',
                'name': 'Years of Service',
                'version': DATA_VERSION,
                'appletId': APPLET_ID
            }, {
                'description': '',
                get displayName() {
                    return displayNames[this.name];
                },
                'siteHash': '',
                'touchedBy': '',
                'touchedOn': '',
                'name': 'Areas of Service',
                'version': DATA_VERSION,
                'appletId': APPLET_ID
            }, {
                'description': '',
                get displayName() {
                    return displayNames[this.name];
                },
                'siteHash': '',
                'touchedBy': '',
                'touchedOn': '',
                'name': 'Occupational Specialties',
                'version': DATA_VERSION,
                'appletId': APPLET_ID
            }];

            return _.where(defaults, {
                'version': version
            });

        }
    };
    return Config;
});