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
        displayNames: displayNames
    };
    return Config;
});