DECLARE
    v_max_id number;
    PROCEDURE reset_seq(i_seq_owner IN VARCHAR2, i_seq_name IN VARCHAR2, i_max_val IN NUMBER)
    AS
        v_cur_val number;
        v_cache_size number;
    BEGIN
        SELECT last_number, cache_size INTO v_cur_val, v_cache_size FROM dba_sequences WHERE sequence_owner = i_seq_owner and sequence_name = i_seq_name;
        IF v_cur_val < i_max_val THEN
            EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || i_seq_owner || '.' || i_seq_name || ' INCREMENT BY ' || ((i_max_val - v_cur_val) + v_cache_size);
            EXECUTE IMMEDIATE 'SELECT ' || i_seq_owner || '.' || i_seq_name || '.NEXTVAL FROM DUAL' INTO v_cur_val;
            EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || i_seq_owner || '.' || i_seq_name || ' INCREMENT BY 1';
        END IF;
    END;
BEGIN

    SELECT nvl(max(listener_id), 100) INTO v_max_id FROM ACTIVITYDB.AM_EVENTLISTENER;
    reset_seq('ACTIVITYDB', 'AM_EVENTLISTENER_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.EVENT_MATCH_ACTION;
    reset_seq('ACTIVITYDB', 'AM_EVENT_MATCH_ACTION_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.EVENT_MATCH_CRITERIA;
    reset_seq('ACTIVITYDB', 'AM_EVENT_MATCH_CRITERIA_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.AM_HISTORICALTASKDATA;
    reset_seq('ACTIVITYDB', 'AM_HISTORICALTASKDATA_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.PROCESSED_EVENT_STATE;
    reset_seq('ACTIVITYDB', 'AM_PRCSD_EVNT_STT_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.AM_PROCESSROUTE;
    reset_seq('ACTIVITYDB', 'AM_PROCESSROUTE_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.AM_SIGNALINSTANCE;
    reset_seq('ACTIVITYDB', 'AM_SIGNAL_INSTANCE_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.SIMPLE_MATCH;
    reset_seq('ACTIVITYDB', 'AM_SIMPLE_MATCH_ID_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM ACTIVITYDB.AM_TASKROUTE;
    reset_seq('ACTIVITYDB', 'AM_TASKROUTE_ID_SEQ', v_max_id);

    SELECT nvl(max(data_model_instance_id), 100) INTO v_max_id FROM ACTIVITYDB.DATA_MODEL_INSTANCE;
    reset_seq('ACTIVITYDB', 'DATA_MODEL_INSTANCE_SEQ', v_max_id);

    SELECT nvl(max(data_model_object_id), 100) INTO v_max_id FROM ACTIVITYDB.DATA_MODEL_OBJECT;
    reset_seq('ACTIVITYDB', 'DATA_MODEL_OBJECT_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM NOTIFDB.ASSOCIATEDITEMS;
    reset_seq('NOTIFDB', 'ASSOCIATEDITEMS_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM NOTIFDB.HISTORY;
    reset_seq('NOTIFDB', 'HISTORY_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM NOTIFDB.PRODUCERS;
    reset_seq('NOTIFDB', 'PRODUCERS_SEQ', v_max_id);

    SELECT nvl(max(id), 100) INTO v_max_id FROM NOTIFDB.RECIPIENTS;
    reset_seq('NOTIFDB', 'RECIPIENTS_SEQ', v_max_id);

    reset_seq('JBPM', 'ATTACHMENT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'AUDIT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'BAM_TASK_ID_SEQ', 1000000);
    reset_seq('JBPM', 'BOOLEANEXPR_ID_SEQ', 1000000);
    reset_seq('JBPM', 'COMMENT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'CONTENT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'CONTEXT_MAPPING_INFO_ID_SEQ', 1000000);
    reset_seq('JBPM', 'CORRELATION_KEY_ID_SEQ', 1000000);
    reset_seq('JBPM', 'CORRELATION_PROP_ID_SEQ', 1000000);
    reset_seq('JBPM', 'DEADLINE_ID_SEQ', 1000000);
    reset_seq('JBPM', 'DEPLOY_STORE_ID_SEQ', 1000000);
    reset_seq('JBPM', 'EMAILNOTIFHEAD_ID_SEQ', 1000000);
    reset_seq('JBPM', 'ERROR_INFO_ID_SEQ', 1000000);
    reset_seq('JBPM', 'ESCALATION_ID_SEQ', 1000000);
    reset_seq('JBPM', 'HIBERNATE_SEQUENCE', 1000000);
    reset_seq('JBPM', 'I18NTEXT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'NODE_INST_LOG_ID_SEQ', 100000000);
    reset_seq('JBPM', 'NOTIFICATION_ID_SEQ', 1000000);
    reset_seq('JBPM', 'PROCESS_INSTANCE_INFO_ID_SEQ', 1000000);
    reset_seq('JBPM', 'PROC_INST_LOG_ID_SEQ', 1000000);
    reset_seq('JBPM', 'QUERY_DEF_ID_SEQ', 1000000);
    reset_seq('JBPM', 'REASSIGNMENT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'REQUEST_INFO_ID_SEQ', 1000000);
    reset_seq('JBPM', 'SESSIONINFO_ID_SEQ', 1000000);
    reset_seq('JBPM', 'TASK_DEF_ID_SEQ', 1000000);
    reset_seq('JBPM', 'TASK_EVENT_ID_SEQ', 1000000);
    reset_seq('JBPM', 'TASK_ID_SEQ', 1000000);
    reset_seq('JBPM', 'TASK_VAR_ID_SEQ', 1000000);
    reset_seq('JBPM', 'VAR_INST_LOG_ID_SEQ', 100000000);
    reset_seq('JBPM', 'WORKITEMINFO_ID_SEQ', 1000000);
END;
/