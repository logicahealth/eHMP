/* global ADK */
define([
    'underscore',
    'app/resources/fetch/activeMeds/model'
], function setupActiveMedsCollection(_, MedicationModel) {
   'use strict';

    var ActiveMedsCollection = ADK.Resources.Collection.extend({
        model: MedicationModel,
        fetchOptions: {
            resourceTitle: 'patient-record-med',
            cache: true,
            patientData: true,
            criteria: {
                afterFilter: 'or(eq(recent,true),eq(calculatedStatus,"Active"))'
            },
            _inpatientFilter: 'and(ne(vaStatus,"CANCELLED"),or(eq(vaType, "I"),eq(vaType, "IV"),eq(vaType,"V")))',
            _outpatientFilter: 'and(ne(vaStatus,"CANCELLED"),or(eq(vaType, "O"),eq(vaType, "N")))'
        },
        initialize: function initialize(models, options) {
            this.fetchOptions = _.extend({}, this.fetchOptions, options);
            ActiveMedsCollection.__super__.initialize.call(this, models, this.fetchOptions);
        },
        parse: function parse(response) {
            return _.get(response, 'data.items', response);
        },
        _success: function success(collection, resp) {
            collection.originalModels = collection.clone();
        },
        _error: function error(collection, resp) {
            collection.trigger('fetch:error', collection, resp);
        },
        fetchCollection: function fetchCollection(options) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var filter = this.isInpatient(currentPatient) ? this.fetchOptions._inpatientFilter : this.fetchOptions._outpatientFilter;

            _.set(fetchOptions, 'criteria.filter', filter);

            _.set(fetchOptions, 'onSuccess', this._success);
            _.set(fetchOptions, 'error', this._error);

            this.url = fetchOptions.url = ADK.ResourceService.buildUrl(fetchOptions.resourceTitle, fetchOptions.criteria);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        },
        isInpatient: function isInpatient(currentPatient) {
            return currentPatient.patientStatusClass().toUpperCase() === 'INPATIENT';
        },
        abort: function () {
            if (_.get(this, 'options.allowAbort') === true && _.get(this, 'xhr')) {
                this.xhr.abort();
                return true;
            }
            return false;
        }
    });

    return ActiveMedsCollection;
});
