define([
    'app/resources/fetch/patient_selection/resources',
    'app/resources/fetch/allergies/resources',
	'app/resources/fetch/problems/resources',
    'app/resources/fetch/community_health_summaries/resources',
    'app/resources/fetch/vista_health_summaries/resources',
    'app/resources/fetch/cds_advice/resources',
    'app/resources/fetch/immunizations/resources'
], function(
    PatientSelection,
    Allergies,
	Problems,
    CommunityHealthSummaries,
    VistaHealthSummaries,
    CdsAdvice,
    Immunizations
) {
    'use strict';

    return {
        id: 'Fetch',
        resources: {
            PatientSelection: PatientSelection,
            Allergies: Allergies,
			Problems: Problems,
            CommunityHealthSummaries: CommunityHealthSummaries,
            VistaHealthSummaries: VistaHealthSummaries,
            CdsAdvice: CdsAdvice,
            Immunizations: Immunizations
        }
    };
});