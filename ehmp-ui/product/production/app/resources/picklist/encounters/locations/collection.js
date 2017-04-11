define([], function() {

    var Clinic = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'uid',
        label: 'displayName',
        value: function() {
            return this.get('uid') + ';' + this.get('displayName');
        },
        childParse: 'false',
        defaults: {
            displayName: '',
            name: '',
            uid: ''
        }
    });

    var Clinics = ADK.Resources.Picklist.Collection.extend({
        type: 'clinics-newloc-fetch-list',
        model: Clinic,
        params: function(method, options) {
            return {
                site: options.site,
            };
        }
    });

    return Clinics;
});