define([
    'app/resources/fetch/patient_selection/confirmation/resources',
    'app/resources/fetch/patient_selection/clinics/collection',
    'app/resources/fetch/patient_selection/wards/collection'
], function(
	Confirmation,
	Clinics,
	Wards
) {
    'use strict';

    return {
        Clinics: Clinics,
        Wards: Wards,
        Confirmation: Confirmation
    };
});
