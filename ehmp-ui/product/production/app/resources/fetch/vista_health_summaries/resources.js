define([
    'app/resources/fetch/vista_health_summaries/reports/collection',
    'app/resources/fetch/vista_health_summaries/details/model'
], function (HealthSummaryReports, HealthSummaryDetails) {
    'use strict';

    return {
        Reports: HealthSummaryReports,
        Details: HealthSummaryDetails
    };
});