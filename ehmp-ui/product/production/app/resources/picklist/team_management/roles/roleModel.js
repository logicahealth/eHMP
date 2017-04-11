define([
], function() {
    'use strict';

    var Role = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'roleID',
        label: 'name',
        value: 'roleID',
        childParse: 'false',
        defaults: {
            roleID: '',
            name: ''
        }
    });

    return Role;
});
