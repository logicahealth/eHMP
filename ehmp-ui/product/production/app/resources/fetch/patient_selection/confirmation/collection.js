define([
    'underscore'
], function(
    _
) {
    'use strict';

    var BaseCollection = ADK.Resources.Collection.extend({
        model: ADK.Resources.Model.extend({
            childParse: false
        }),
        initialize: function(options) {
            this.patient = _.get(this, 'patient', _.get(options, 'patient'));
        },
        fetch: function(options) {
            this.patient = this.patient || ADK.PatientRecordService.getCurrentPatient();
            var opts = ADK.utils.patient.setPatientFetchParams(this.patient, options);
            if (_.has(opts, 'criteria')) opts.data = _.omit(opts.criteria, '_ack'); // handled by resource abstraction
            return ADK.Resources.Collection.prototype.fetch.call(this, opts);
        },
        parse: Backbone.Collection.prototype.parse // maybe point to another? Backbone.Collection.parse is overwritten in ADK.ResourceService
    });

    return BaseCollection;
});