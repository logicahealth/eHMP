set serveroutput on
--
-- Truncate the ACTIVITYDB data
--
DECLARE
   sql_statement VARCHAR2(1024);
   CURSOR tables_cur
   IS
      SELECT table_name
      FROM DBA_TABLES DT
      WHERE OWNER = 'ACTIVITYDB' AND table_name NOT IN('AM_TASKSTATUSLOOKUP','AM_PROCESSSTATUSLOOKUP', 'DATA_MODEL_KEYS', 'DATA_MODEL_INSTANCE', 'DATA_MODEL_OBJECT', 'AM_PROCESSINSTANCE');
BEGIN
  -- disable foreign key constraints
  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'ACTIVITYDB' AND constraint_type ='R' AND status = 'ENABLED')
  LOOP
    sql_statement := 'alter table ACTIVITYDB.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  -- disable all constraints
  FOR rec IN (select table_name, constraint_name
  FROM all_constraints
  WHERE owner = 'ACTIVITYDB' AND status = 'ENABLED')
  LOOP
    sql_statement := 'alter table ACTIVITYDB.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP i;
  DBMS_OUTPUT.PUT_LINE('ACTIVITYDB CONSTRAINTS DISABLED');

  -- truncate tables
  FOR table_rec IN tables_cur
  LOOP
    sql_statement := 'TRUNCATE TABLE ACTIVITYDB.'||table_rec.table_name||' ';
    EXECUTE IMMEDIATE sql_statement;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('ACTIVITYDB TABLES TRUNCATED');

  -- delete from tables, preserve test data
  DELETE FROM activitydb.data_model_object WHERE processinstanceid > 0;
  DELETE FROM activitydb.data_model_instance WHERE processinstanceid > 0;
  DELETE FROM activitydb.am_processinstance WHERE processinstanceid > 0;
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('ACTIVITYDB TABLES CLEARED');

   --enable all constraints
  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'ACTIVITYDB' AND constraint_type !='R')
  LOOP
    sql_statement := 'alter table ACTIVITYDB.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'ACTIVITYDB' AND constraint_type ='R')
  LOOP
    sql_statement := 'alter table ACTIVITYDB.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  DBMS_OUTPUT.PUT_LINE('ACTIVITYDB CONSTRAINTS ENABLED');

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION TRUNCATING ACTIVITYDB TABLES '||SQLCODE||SQLERRM);
END;
/

--
-- Insert initial event signal records
--
DECLARE matchCriteriaId NUMBER(20,0);
matchActionId NUMBER(20,0);
listenerId NUMBER(20,0);
R_COUNT NUMBER;
signalContent VARCHAR(2048);
statusCode VARCHAR(2048);
BEGIN
  	signalContent := '{"param":{"objectType":"signalData", "message":"{{{objAsStr RAW_REQUEST}}}", "clinicalObjectUid":"{{uid}}", "referenceId":"{{referenceId}}", "ehmpState":"{{ehmpState}}", "authorUid":"{{authorUid}}", "orderStatusCode":"{{data.statusCode}}", "noResultNotificationDate":"{{ehmpData.pastDueDate}}", "pid":"{{data.pid}}", "facilityCode":"{{data.facilityCode}}", "providerUid":"{{data.providerUid}}", "labTestText":"{{ehmpData.labTestText}}", "name":"{{data.name}}", "urgency":"{{ehmpData.urgency}}"}}';
  	statusCode := 'urn:va:order-status:unr,urn:va:order-status:pend,urn:va:order-status:schd,urn:va:order-status:actv,urn:va:order-status:part';
		matchCriteriaId := ACTIVITYDB.AM_EVENT_MATCH_CRITERIA_ID_SEQ.NEXTVAL;
		INSERT INTO ACTIVITYDB.EVENT_MATCH_CRITERIA(ID) VALUES(matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'domain', 'ehmp-order', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'subDomain', 'laboratory', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'data.statusCode', statusCode, matchCriteriaId);

		matchActionId := ACTIVITYDB.AM_EVENT_MATCH_ACTION_ID_SEQ.NEXTVAL;

		INSERT INTO ACTIVITYDB.EVENT_MATCH_ACTION VALUES(matchActionId, signalContent, 'ORDER.INITIATED', 'Order.Lab', '1.0', NULL);
		INSERT INTO ACTIVITYDB.AM_EVENTLISTENER VALUES(ACTIVITYDB.AM_EVENTLISTENER_ID_SEQ.NEXTVAL, 'Instantiation', '1.0', 'Lab Order Management Signal - initiation signal', 'Lab Order Initiation', matchActionId, matchCriteriaId);

END;
/

-------------------------------------------------------------------
-- Insert initial discharge follow-up activity match criteria and match action
-------------------------------------------------------------------
DECLARE matchCriteriaId NUMBER(20,0);
matchActionId NUMBER(20,0);
listenerId NUMBER(20,0);
BEGIN
  matchCriteriaId := ACTIVITYDB.AM_EVENT_MATCH_CRITERIA_ID_SEQ.NEXTVAL;
  INSERT INTO ACTIVITYDB.EVENT_MATCH_CRITERIA(ID) VALUES(matchCriteriaId);
  INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'domain', 'ehmp-activity', matchCriteriaId);
  INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'subDomain', 'discharge', matchCriteriaId);
  INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'data.deceased', 'false', matchCriteriaId);

  matchActionId := ACTIVITYDB.AM_EVENT_MATCH_ACTION_ID_SEQ.NEXTVAL;

  INSERT INTO ACTIVITYDB.EVENT_MATCH_ACTION VALUES(matchActionId, NULL, NULL, 'Order.DischargeFollowup', '1.0', NULL);
  INSERT INTO ACTIVITYDB.AM_EVENTLISTENER VALUES(ACTIVITYDB.AM_EVENTLISTENER_ID_SEQ.NEXTVAL, 'Instantiation', '1.0', 'Discharge Follow Up Instantiation', 'Discharge Follow Up Instantiation', matchActionId, matchCriteriaId);
END;
/

set serveroutput on
--
-- Drop the NOTIFDB tables
--
DECLARE
   sql_statement VARCHAR2(1024);
   CURSOR tables_cur
   IS
      SELECT table_name
      FROM DBA_TABLES DT
      WHERE OWNER = 'NOTIFDB';

BEGIN
  -- disable foreign key constraints
  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'NOTIFDB' AND constraint_type ='R' AND status = 'ENABLED')
  LOOP
    sql_statement := 'alter table NOTIFDB.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  -- disable all constraints
  FOR rec IN (select table_name, constraint_name
  FROM all_constraints
  WHERE owner = 'NOTIFDB' AND status = 'ENABLED')
  LOOP
    sql_statement := 'alter table NOTIFDB.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP i;
  DBMS_OUTPUT.PUT_LINE('NOTIFDB CONSTRAINTS DISABLED');

  -- trunacte tables
  FOR table_rec IN tables_cur
  LOOP
    sql_statement := 'TRUNCATE TABLE NOTIFDB.'||table_rec.table_name||' ';
    EXECUTE IMMEDIATE sql_statement;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('NOTIFDB TABLES TRUNCATED');

   --enable all constraints
  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'NOTIFDB' AND constraint_type !='R')
  LOOP
    sql_statement := 'alter table NOTIFDB.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'NOTIFDB' AND constraint_type ='R')
  LOOP
    sql_statement := 'alter table NOTIFDB.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
    EXECUTE IMMEDIATE sql_statement;
  END LOOP rec;

  DBMS_OUTPUT.PUT_LINE('NOTIFDB CONSTRAINTS ENABLED');

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION TRUNCATING NOTIFDB TABLES '||SQLCODE||SQLERRM);
END;
/

--
-- Truncate the JBPM tables
--
DECLARE
   sql_statement VARCHAR2(1024);
   TYPE tableNames IS VARRAY(41) OF VARCHAR2(50);
   t_names tableNames;
	 t_count integer;
   u_count integer;

   CURSOR tables_cur
   IS
      SELECT table_name
      FROM DBA_TABLES DT
      WHERE OWNER = 'JBPM';

BEGIN
  t_names := tableNames(
    'ATTACHMENT',
		'AUDITTASKIMPL',
		'BAMTASKSUMMARY',
    'BOOLEANEXPRESSION',
		'CONTENT',
    'CONTEXTMAPPINGINFO',
    'CORRELATIONKEYINFO',
    'CORRELATIONPROPERTYINFO',
    'DEADLINE',
    'DELEGATION_DELEGATES',
		'DEPLOYMENTSTORE',
    'EMAIL_HEADER',
    'ERRORINFO',
    'ESCALATION',
		'EVENTTYPES',
		'I18NTEXT',
		'NODEINSTANCELOG',
    'NOTIFICATION',
    'NOTIFICATION_BAS',
    'NOTIFICATION_EMAIL_HEADER',
    'NOTIFICATION_RECIPIENTS',
    'ORGANIZATIONALENTITY',
		'PEOPLEASSIGNMENTS_BAS',
		'PEOPLEASSIGNMENTS_EXCLOWNERS',
    'PEOPLEASSIGNMENTS_POTOWNERS',
    'PEOPLEASSIGNMENTS_RECIPIENTS',
    'PEOPLEASSIGNMENTS_STAKEHOLDERS',
		'PROCESSINSTANCEINFO',
		'PROCESSINSTANCELOG',
    'QUERYDEFINITIONSTORE',
    'REASSIGNMENT',
    'REASSIGNMENT_POTENTIALOWNERS',
		'REQUESTINFO',
		'SESSIONINFO',
		'TASK',
    'TASKDEF',
		'TASKEVENT',
		'TASKVARIABLEIMPL',
    'TASK_COMMENT',
		'VARIABLEINSTANCELOG',
		'WORKITEMINFO'
		);

  u_count := 0;
  SELECT count(*) INTO u_count FROM DBA_TABLES WHERE OWNER = 'JBPM';

  IF (u_count > 0 ) THEN
  	t_count := t_names.COUNT;

    -- disable foreign key constraints
    FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'JBPM' AND constraint_type ='R' AND status = 'ENABLED')
    LOOP
      sql_statement := 'alter table JBPM.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
      EXECUTE IMMEDIATE sql_statement;
    END LOOP rec;

    -- disable all constraints
    FOR rec IN (select table_name, constraint_name
    FROM all_constraints
    WHERE owner = 'JBPM' AND status = 'ENABLED')
    LOOP
      sql_statement := 'alter table JBPM.' ||rec.table_name|| ' disable constraint ' ||rec.constraint_name;
      EXECUTE IMMEDIATE sql_statement;
    END LOOP i;
    DBMS_OUTPUT.PUT_LINE('JBPM CONSTRAINTS DISABLED');

     FOR i in 1..t_count LOOP
        sql_statement := 'TRUNCATE TABLE JBPM.'||t_names(i)||' ';
        EXECUTE IMMEDIATE sql_statement;
     END LOOP;
     DBMS_OUTPUT.PUT_LINE('JBPM TABLES TRUNCATED');

     --enable all constraints
    FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'JBPM' AND constraint_type !='R')
    LOOP
      sql_statement := 'alter table JBPM.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
      EXECUTE IMMEDIATE sql_statement;
    END LOOP rec;

    FOR rec IN (SELECT table_name, constraint_name FROM all_constraints WHERE owner = 'JBPM' AND constraint_type ='R')
    LOOP
      sql_statement := 'alter table JBPM.' ||rec.table_name|| ' enable constraint ' ||rec.constraint_name;
      EXECUTE IMMEDIATE sql_statement;
    END LOOP rec;

    DBMS_OUTPUT.PUT_LINE('JBPM CONSTRAINTS ENABLED');

  END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION TRUNCATING JBPM TABLES '||SQLCODE||SQLERRM);
END;
/
