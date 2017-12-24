set serveroutput on
--
-- Delete records from ACTIVITYDB if there is no matching data in JBPM tables
--
BEGIN

  -- delete from tables
  DELETE FROM activitydb.simple_match
  WHERE event_mtch_cri_id IN (
    SELECT event_mtch_criteria_id FROM activitydb.am_eventlistener
      WHERE event_mtch_action_id IN (
        SELECT id FROM activitydb.event_match_action
          WHERE event_mtch_inst_id IN (
            SELECT processinstanceid FROM activitydb.am_processinstance pi
              WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
          )
      )
  );

  DELETE FROM activitydb.am_eventlistener WHERE event_mtch_action_id IN (
        SELECT id FROM activitydb.event_match_action
          WHERE event_mtch_inst_id IN (
            SELECT processinstanceid FROM activitydb.am_processinstance pi
              WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
          )
   );

  DELETE FROM activitydb.event_match_criteria
    WHERE id IN (
    SELECT event_mtch_criteria_id FROM activitydb.am_eventlistener
      WHERE event_mtch_action_id IN (
        SELECT id FROM activitydb.event_match_action
          WHERE event_mtch_inst_id IN (
            SELECT processinstanceid FROM activitydb.am_processinstance pi
              WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
          )
      )
  );

  DELETE FROM activitydb.processed_event_state
    WHERE listener_id IN (
    SELECT listener_id FROM activitydb.am_eventlistener
      WHERE event_mtch_action_id IN (
        SELECT id FROM activitydb.event_match_action
          WHERE event_mtch_inst_id IN (
            SELECT processinstanceid FROM activitydb.am_processinstance pi
              WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
          )
      )
   );


   DELETE FROM activitydb.event_match_action
    WHERE event_mtch_inst_id IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
  );

  DELETE FROM activitydb.am_processroute
    WHERE processinstanceid IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
   );

  DELETE FROM activitydb.am_signalinstance
    WHERE processed_signal_id IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
   );

  DELETE FROM activitydb.am_taskroute WHERE taskinstanceid IN (
      SELECT id FROM activitydb.am_taskinstance
        WHERE processinstanceid IN (
            SELECT processinstanceid FROM activitydb.am_processinstance pi
              WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
        )
  );

  DELETE FROM activitydb.am_taskinstance
    WHERE processinstanceid IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
   );

  DELETE FROM activitydb.data_model_object WHERE processinstanceid IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
  );
  DELETE FROM activitydb.data_model_instance WHERE processinstanceid IN (
        SELECT processinstanceid FROM activitydb.am_processinstance pi
            WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid)
  );

  DELETE FROM activitydb.am_processinstance pi
        WHERE NOT EXISTS (select null FROM jbpm.processinstancelog pil WHERE pi.processinstanceid = pil.processinstanceid);

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('ACTIVITYDB TABLES CLEANED UP');

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CLEANING UP ACTIVITYDB TABLES '||SQLCODE||SQLERRM);
END;
/

