define([], function () {
    'use strict';

    var Modifier = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: name,
        name: name,
        value: 'ien',
        defaults: {
            ien: '',
            name: '',
            value: false
        }
    });

    var Modifiers = ADK.Resources.Picklist.Collection.extend({
        type: 'write-pick-list',
        model: Modifier,
        params: function (method, options) {
            return {
                type: 'encounters-procedures-cpt-modifier',
                cpt: options.cpt || '',
                dateTime: options.dateTime || '',
                site: this.user.get('site')
            };
        },
    });

    return Modifiers;

});