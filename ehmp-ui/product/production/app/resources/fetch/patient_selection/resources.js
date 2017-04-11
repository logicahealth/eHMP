define([
    'app/resources/fetch/patient_selection/clinics/collection',
    'app/resources/fetch/patient_selection/wards/collection'
], function(
	Clinics,
	Wards
) {
    'use strict';

    return {
        Clinics: Clinics,
        Wards: Wards
    };
});
