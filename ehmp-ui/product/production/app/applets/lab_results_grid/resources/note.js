define([
    'moment'
], function(moment) {
    "use strict";

    var getDefaultNoteAttributes = function() {
        var siteCode = this.user.get('site');
        var provider = _.get(this.user.get('duz'), siteCode);
        var visit = this.patient.get('visit') || {};

        return {
            patientUid: this.patient.get('uid'),
            authorUid: 'urn:va:user:' + siteCode + ':' + provider,
            visit: {
                serviceCategory: visit.serviceCategory || '',
                dateTime: visit.dateTime || moment().format('YYYYMMDDHHmmss'),
                location: visit.locationUid || ''
            },
            data: {
                madlib: null
            }
        };
    };

    return ADK.Resources.Writeback.Model.extend({
        initialize: function(options) {
            var data = _.defaultsDeep({}, getDefaultNoteAttributes.apply(this), options);
            this.set(data, {silent: true});
        },
        idAttribute: 'uid',
        methodMap: {
            create: {
                resource: 'numeric-lab-results-save-note-object'
            },
        },
        defaults: {
            authorUid: null,
            data: {},
            patientUid: null,
            referenceId: null,
            visit: {
                location: null,
                dateTime: null,
                serviceCategory: null
            }
        },
    });
});