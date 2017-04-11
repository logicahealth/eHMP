define([
], function() {
    'use strict';

    var Team = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'teamID',
        label: 'teamName',
        value: 'teamID',
        childParse: 'false',
        defaults: {
            teamName: '',
            teamID: ''
        }
    });

    return Team;
});
