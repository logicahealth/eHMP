define([
    'backbone'
], function(Backbone) {
    'use strict';

    var ReportModel = Backbone.Model.extend({
    	parse: function(response) {
    		ADK.Enrichment.addFacilityMoniker(response);
    		return response;
    	}
    });

    return ADK.Resources.Collection.extend({
    	resource: 'healthsummaries-getSitesInfoFromPatientData',
    	model: ReportModel,
    	parse: function(response) {
            return _.get(response, 'data');
        },
    	fetchCollection: function() {
    		var fetchOptions = {
		        resourceTitle: this.resource,
		        pageable: false,
		        cache: true
			};

			return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
    	}
    });
});