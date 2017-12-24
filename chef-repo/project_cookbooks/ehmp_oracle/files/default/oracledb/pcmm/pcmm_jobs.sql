
Declare
    object_exists EXCEPTION;
    PRAGMA exception_init(object_exists, -27477);
    job_running EXCEPTION;
    PRAGMA exception_init(job_running, -27478);
Begin

    Begin
        dbms_scheduler.create_job(
            job_name      => 'PCMM.REPLICATE_PATIENT_PCM_JOB',
            job_type      => 'STORED_PROCEDURE',
            job_action    => 'PCMM.PCMM_API.LOAD_PATIENT_PCM',
            schedule_name => 'PCMM.REPLICATE_PCMM_SCHEDULE',
            enabled       => TRUE
        );
        EXCEPTION
            WHEN object_exists THEN
                NULL;
    End;

    Begin
        dbms_scheduler.run_job(
            job_name => 'PCMM.REPLICATE_PATIENT_PCM_JOB',
            use_current_session => FALSE
        );
        EXCEPTION
            WHEN job_running THEN
                NULL;
    End;

    Begin
        dbms_scheduler.create_job(
            job_name      => 'PCMM.REPLICATE_TEAM_STAFF_INST_JOB',
            job_type      => 'STORED_PROCEDURE',
            job_action    => 'PCMM.PCMM_API.LOAD_TEAM_STAFF_INST',
            schedule_name => 'PCMM.REPLICATE_PCMM_SCHEDULE',
            enabled       => TRUE
        );
        EXCEPTION
            WHEN object_exists THEN
                NULL;
    End;

    Begin
        dbms_scheduler.run_job(
            job_name => 'PCMM.REPLICATE_TEAM_STAFF_INST_JOB',
            use_current_session => FALSE
        );
        EXCEPTION
            WHEN job_running THEN
                NULL;
    End;
End;
/