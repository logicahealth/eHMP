define([], function() {
    'use strict';

    var displayNames = {
        //display names by 'name' key
        //'name':'displayName'
        'Branch of Service': 'Branch(es) of Service',
        'Years of Service': 'Service Date(s)',
        'Areas of Service': 'Areas of Service',
        'Occupational Specialties': 'Occupational Specialties'
    };

    var Config = {
        displayNames: displayNames,
        getDefaults: function getDefaults() {
            return {
                'val': [{
                    'description': '',
                    get displayName() {
                        return displayNames[this.name];
                    },
                    'location': '',
                    'modifiedBy': '',
                    'modifiedOn': '',
                    'name': 'Branch of Service'
                }, {
                    'description': '',
                    get displayName() {
                        return displayNames[this.name];
                    },
                    'location': '',
                    'modifiedBy': '',
                    'modifiedOn': '',
                    'name': 'Years of Service'
                }, {
                    'description': '',
                    get displayName() {
                        return displayNames[this.name];
                    },
                    'location': '',
                    'modifiedBy': '',
                    'modifiedOn': '',
                    'name': 'Areas of Service'
                }, {
                    'description': '',
                    get displayName() {
                        return displayNames[this.name];
                    },
                    'location': '',
                    'modifiedBy': '',
                    'modifiedOn': '',
                    'name': 'Occupational Specialties'
                }]
            };


        }
    };
    return Config;
});