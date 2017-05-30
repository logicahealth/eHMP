define([
    'app/resources/fetch/vitals/utils'
], function(VitalUtils) {
    'use strict';
	
    var Vital = ADK.Resources.Model.extend({
		idAttribute: 'uid',
		parse: function(response) {
            var crsUtil = ADK.utils.crsUtil;
            response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.VITAL;
            response.observedFormatted = VitalUtils.getFormattedDate(response.observed, ADK.utils.dateUtils.defaultOptions().placeholder + ' - HH:mm');
            response.displayName = VitalUtils.getDisplayName(response);
            response.typeName = VitalUtils.getTypeName(response);
            VitalUtils.setFormattedHeight(response);
            VitalUtils.setFormattedWeight(response);
            VitalUtils.setResultUnits(response);
            VitalUtils.setMetricResult(response);
            response.metricResultUnits = VitalUtils.getMetricResultUnits(response);
            response.resultUnitsMetricResultUnits = VitalUtils.getResultUnitsMetricResultUnits(response);
            response.resultedFormatted = VitalUtils.getFormattedDate(response.resulted, ADK.utils.dateUtils.defaultOptions().placeholder + ' - HH:mm');
            response.qualifierNames = VitalUtils.getQualifiersNames(response);
            ADK.Enrichment.addFacilityMoniker(response);
            response.vitalColumns = true;
            response.observationType = 'vitals';
            response.applet_id = 'vitals';

            var timeSince = ADK.utils.getTimeSince(response.observed, false);
            if(!_.isUndefined(timeSince)) {
                response.timeSince = timeSince.timeSince;
            }
            return response;
		}
    });

    return Vital;
});