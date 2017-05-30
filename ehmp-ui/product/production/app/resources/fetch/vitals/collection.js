/* global ADK */
define([
    'underscore',
    'app/resources/fetch/vitals/model'
], function (_, VitalModel) {
    'use strict';

    var fetchOptions = {
        resourceTitle: 'patient-record-vital',
        allowAbort: true,
        cache: true
    };

    var parse = function(resp) {
        var vitals = _.get(resp, 'data.items');

        if (vitals) {
            return vitals;
        }
        return resp;
    };

    var fetchCollection = function(criteria, splitBP, vitalTypes) {
        this.splitBP = splitBP || false;
        this.vitalTypes = vitalTypes || [];
        this.fetchOptions.criteria = criteria;
        return ADK.PatientRecordService.fetchCollection(this.fetchOptions, this);
    };

    var VitalsCollection = ADK.Resources.Collection.extend({
        fetchOptions: fetchOptions,
        model: VitalModel,
        parse: parse,
        fetchCollection: fetchCollection
    });

    var VitalsPageableCollection = ADK.ResourceService.PageableCollection.extend({
        model: VitalModel,
        fetchOptions: fetchOptions,
        state: {
            pageSize: 40
        },
        mode: 'client',
        initialize: function() {
            this.fetchOptions.pageable = true;
        },
        fetchCollection: fetchCollection
    });

    return {
        Collection: VitalsCollection,
        PageableCollection: VitalsPageableCollection
    };
});