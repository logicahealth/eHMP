define([
    'moment'
], function(Moment) {
    'use strict';

    var Collection = ADK.Resources.Collection.extend({
        model: ADK.Resources.Model.extend({
            childParse: false
        }),
        cache: true,
        childParse: false,
        initialize: function(options) {
            this.patient = _.get(this, 'patient', _.get(options, 'patient'));
        },
        fetch: function(options) {
            var opts = ADK.utils.patient.setPatientFetchParams(this.patient, options);
            if (_.has(opts, 'criteria')) opts.data = _.omit(opts.criteria, '_ack'); // handled by resource abstraction
            this.xhr = ADK.Resources.Collection.prototype.fetch.call(this, opts);
            return this.xhr;
        },
        parse: Backbone.Collection.prototype.parse
    });

    return Collection;
});