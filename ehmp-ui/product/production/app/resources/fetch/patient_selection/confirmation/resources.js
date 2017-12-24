define([
    'app/resources/fetch/patient_selection/confirmation/authorize',
    'app/resources/fetch/patient_selection/confirmation/patientMetaData',
    'app/resources/fetch/patient_selection/confirmation/lastWorkspace',
    'app/resources/fetch/patient_selection/confirmation/syncStatus',
    'app/resources/fetch/patient_selection/confirmation/mviSync',
    'app/resources/fetch/patient_selection/confirmation/sites',
    'app/resources/fetch/patient_selection/confirmation/visits',
    'app/resources/fetch/patient_selection/confirmation/patientRecord'
], function(
    Authorize,
    PatientMetaData,
    LastWorkspace,
    SyncStatus,
    MviSync,
    Sites,
    Visits,
    PatientRecord
) {
    'use strict';

    return {
        Authorize: Authorize,
        PatientMetaData: PatientMetaData,
        LastWorkspace: LastWorkspace,
        SyncStatus: SyncStatus,
        MviSync: MviSync,
        Sites: Sites,
        Visits: Visits,
        PatientRecord: PatientRecord
    };
});
