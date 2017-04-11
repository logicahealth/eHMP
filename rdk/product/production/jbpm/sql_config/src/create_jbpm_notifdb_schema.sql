ALTER SESSION SET CURRENT_SCHEMA = NOTIFDB;
/

--------------------------------------------------------
--  DDL for Sequence ASSOCIATEDITEMS_SEQ
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(512);
BEGIN

  sql_statement:='CREATE SEQUENCE  "NOTIFDB"."ASSOCIATEDITEMS_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
  execute immediate sql_statement;

  EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Sequence ASSOC_SEQ
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(512);
BEGIN

  sql_statement:='CREATE SEQUENCE  "NOTIFDB"."RECIPIENTS_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
  execute immediate sql_statement;

  EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Sequence HISTORY_SEQ
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(512);
BEGIN

  sql_statement:='CREATE SEQUENCE  "NOTIFDB"."HISTORY_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
  execute immediate sql_statement;

  EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Sequence PRODUCERS_SEQ
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(512);
BEGIN

  sql_statement:='CREATE SEQUENCE  "NOTIFDB"."PRODUCERS_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 61 CACHE 20 NOORDER  NOCYCLE';
  execute immediate sql_statement;

  EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/

--------------------------------------------------------
--  DDL for Type ASSOC_ITEM_OBJ
--------------------------------------------------------

  CREATE OR REPLACE TYPE "ASSOC_ITEM_OBJ" AS OBJECT(
  "item" VARCHAR2(255)
);

/
--------------------------------------------------------
--  DDL for Type ASSOC_ITEMS_ARRAY
--------------------------------------------------------

  CREATE OR REPLACE TYPE "ASSOC_ITEMS_ARRAY" IS TABLE OF assoc_item_obj;

/
--------------------------------------------------------
--  DDL for Type RECIPIENT_OBJ
--------------------------------------------------------

  CREATE OR REPLACE TYPE "RECIPIENT_OBJ" FORCE AS OBJECT(
  "userId" VARCHAR2(255),
  "teamId" VARCHAR2(255),
  "teamType" VARCHAR2(255),
  "teamFocus" VARCHAR2(255),
  "teamRole" VARCHAR2(255),
  "patientId" VARCHAR2(255),
  "patientAssignment" NUMBER(1,0),
  "facility" VARCHAR2(255),
  "salience" NUMBER(3)
);

/
--------------------------------------------------------
--  DDL for Type RECIPIENTS_ARRAY
--------------------------------------------------------

  CREATE OR REPLACE TYPE "RECIPIENTS_ARRAY" IS TABLE OF recipient_obj;

/
--------------------------------------------------------
--  DDL for Type VARCHAR_ARRAY
--------------------------------------------------------

  CREATE OR REPLACE TYPE "VARCHAR_ARRAY" IS TABLE OF VARCHAR2(255);

/

--------------------------------------------------------
--  DDL for Table ASSOCIATEDITEMS
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='CREATE TABLE "NOTIFDB"."ASSOCIATEDITEMS" 
   (  "ID" NUMBER(19,0), 
  "NOTIFICATION_ID" RAW(16), 
  "ITEM" VARCHAR2(255)
   )';

   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Table HISTORY
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='CREATE TABLE "NOTIFDB"."HISTORY" 
   (  "ID" NUMBER(19,0), 
  "NOTIFICATION_ID" RAW(16), 
  "USER_ID" VARCHAR2(255), 
  "ACTION_TYPE" VARCHAR2(50), 
  "DATE_TIME" DATE
   )';
   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Table NOTIFICATION
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='
  CREATE TABLE "NOTIFDB"."NOTIFICATIONS" 
   (  "ID" RAW(16) DEFAULT SYS_GUID(), 
  "PRODUCER_ID" NUMBER(19,0), 
  "PATIENT_ID" VARCHAR2(255), 
  "MESSAGE_SUBJECT" NVARCHAR2(255), 
  "MESSAGE_BODY" NVARCHAR2(1000), 
  "RESOLUTION" VARCHAR2(255), 
  "RESOLUTION_STATE" NUMBER(3,0), 
  "EXPIRATION" DATE, 
  "EXT_REFID" VARCHAR2(255), 
  "NAV_CHANNEL" VARCHAR2(255), 
  "NAV_EVENT" VARCHAR2(255), 
  "NAV_PARAMETER" VARCHAR2(255)
   )';
   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/

DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='
  ALTER TABLE NOTIFICATIONS 
  ADD (PERMISSIONS VARCHAR2(2000) )';

   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/


--------------------------------------------------------
--  DDL for Table NOTIF_RECIP
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='
  CREATE TABLE "NOTIFDB"."NOTIF_RECIP" 
   (  "NOTIFICATION_ID" RAW(16), 
  "RECIPIENT_ID" NUMBER(19,0)
   )';
   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Table PRODUCERS
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

  sql_statement:='
  CREATE TABLE "NOTIFDB"."PRODUCERS" 
   (  "ID" NUMBER(19,0), 
  "USER_ID" VARCHAR2(255), 
  "DESCRIPTION" VARCHAR2(1000)
   )';
   execute immediate sql_statement;
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/
--------------------------------------------------------
--  DDL for Table RECIPIENTS
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
R_COUNT NUMBER;
P_COUNT NUMBER;
BEGIN
  SELECT COUNT(*) INTO R_COUNT FROM DBA_TABLES WHERE OWNER = 'NOTIFDB' AND TABLE_NAME = 'RECIPIENTS';
  IF R_COUNT = 0
  THEN
  sql_statement:='
  CREATE TABLE "NOTIFDB"."RECIPIENTS" 
   (  "ID" NUMBER(19,0), 
  "USER_ID" VARCHAR2(255), 
  "TEAM_ID" VARCHAR2(255), 
  "TEAM_TYPE" VARCHAR2(255), 
  "TEAM_FOCUS" VARCHAR2(255), 
  "TEAM_ROLE" VARCHAR2(255), 
  "PATIENT_ID" VARCHAR2(255), 
  "PATIENT_ASSIGNMENT" NUMBER(1,0), 
  "FACILITY" VARCHAR2(255), 
  "SALIENCE" NUMBER(3,0)
   )';
   execute immediate sql_statement;
   ELSE
    SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'NOTIFDB'
                              AND  TABLE_NAME = 'RECIPIENTS'
                              AND COLUMN_NAME = 'TEAM_FOCI';
      IF P_COUNT = 1
      THEN
        sql_statement:='ALTER TABLE "NOTIFDB"."RECIPIENTS"
              RENAME COLUMN TEAM_FOCI TO TEAM_FOCUS';

      execute immediate sql_statement;
      END IF;
    SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'NOTIFDB'
                              AND  TABLE_NAME = 'RECIPIENTS'
                              AND COLUMN_NAME = 'ROLE';
      IF P_COUNT = 1
      THEN
        sql_statement:='ALTER TABLE "NOTIFDB"."RECIPIENTS"
              RENAME COLUMN ROLE TO "TEAM_ROLE"';

      execute immediate sql_statement;
      END IF;
    SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'NOTIFDB'
                              AND  TABLE_NAME = 'RECIPIENTS'
                              AND COLUMN_NAME = 'TEAM_TYPE';
      IF P_COUNT = 0
      THEN
        sql_statement:='ALTER TABLE "NOTIFDB"."RECIPIENTS"
              ADD
              (
                "TEAM_TYPE" VARCHAR2(255)
              )';

      execute immediate sql_statement;
      END IF;
    SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'NOTIFDB'
                              AND  TABLE_NAME = 'RECIPIENTS'
                              AND COLUMN_NAME = 'PATIENT_ASSIGNMENT';
      IF P_COUNT = 0
      THEN
        sql_statement:='ALTER TABLE "NOTIFDB"."RECIPIENTS"
              ADD
              (
                "PATIENT_ASSIGNMENT" NUMBER(1, 0)
              )';

      execute immediate sql_statement;
      END IF;
    SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'NOTIFDB'
                              AND  TABLE_NAME = 'RECIPIENTS'
                              AND COLUMN_NAME = 'FACILITY';
      IF P_COUNT = 0
      THEN
        sql_statement:='ALTER TABLE "NOTIFDB"."RECIPIENTS"
              ADD
              (
                "FACILITY" VARCHAR2(255)
              )';

      execute immediate sql_statement;
      END IF;
  END IF;

    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
          NULL; -- suppresses ORA-00955 exception
        ELSE
           RAISE;
        END IF;
END;
/

--------------------------------------------------------
--  DDL for View NOTIFICATIONS_VIEW
--------------------------------------------------------

CREATE OR REPLACE FORCE VIEW "NOTIFDB"."NOTIFICATIONS_VIEW" ("PRODUCER_ID", "DESCRIPTION", "ID", "PATIENT_ID", "MESSAGE_SUBJECT", "MESSAGE_BODY", "RESOLUTION", "RESOLUTION_STATE", "EXPIRATION", "EXT_REFID", "NAV_EVENT", "NAV_CHANNEL", "NAV_PARAMETER", "PERMISSIONS", "REC_USER_ID", "TEAM_ID", "TEAM_ROLE", "REC_PATIENT_ID", "TEAM_FOCUS", "SALIENCE", "TEAM_TYPE", "PATIENT_ASSIGNMENT", "FACILITY", "ITEM", "CREATEDON", "HIST_USER_ID", "ACTION_TYPE") AS
  SELECT PRODUCERS.USER_ID AS PRODUCER_ID,
  PRODUCERS.DESCRIPTION,
  NOTIFICATIONS.ID,
  NOTIFICATIONS.PATIENT_ID,
  NOTIFICATIONS.MESSAGE_SUBJECT,
  NOTIFICATIONS.MESSAGE_BODY,
  NOTIFICATIONS.RESOLUTION,
  NOTIFICATIONS.RESOLUTION_STATE,
  NOTIFICATIONS.EXPIRATION,
  NOTIFICATIONS.EXT_REFID,
  NOTIFICATIONS.NAV_EVENT,
  NOTIFICATIONS.NAV_CHANNEL,
  NOTIFICATIONS.NAV_PARAMETER,
  NOTIFICATIONS.PERMISSIONS,
  RECIPIENTS.USER_ID AS REC_USER_ID,
  RECIPIENTS.TEAM_ID,
  RECIPIENTS.TEAM_ROLE,
  RECIPIENTS.PATIENT_ID AS REC_PATIENT_ID,
  RECIPIENTS.TEAM_FOCUS,
  RECIPIENTS.SALIENCE,
  RECIPIENTS.TEAM_TYPE,
  RECIPIENTS.PATIENT_ASSIGNMENT,
  RECIPIENTS.FACILITY,
  ASSOCIATEDITEMS.ITEM,
  H.DATE_TIME AS CREATEDON,
  HISTORY.USER_ID AS HIST_USER_ID,
  HISTORY.ACTION_TYPE
FROM NOTIFDB.NOTIFICATIONS
INNER JOIN NOTIFDB.PRODUCERS
ON PRODUCERS.ID = NOTIFICATIONS.PRODUCER_ID
INNER JOIN NOTIFDB.NOTIF_RECIP
ON NOTIFICATIONS.ID = NOTIF_RECIP.NOTIFICATION_ID
INNER JOIN NOTIFDB.RECIPIENTS
ON RECIPIENTS.ID = NOTIF_RECIP.RECIPIENT_ID
LEFT JOIN NOTIFDB.ASSOCIATEDITEMS
ON NOTIFICATIONS.ID = ASSOCIATEDITEMS.NOTIFICATION_ID
INNER JOIN NOTIFDB.HISTORY
ON NOTIFICATIONS.ID = HISTORY.NOTIFICATION_ID
LEFT JOIN
  (SELECT HISTORY.DATE_TIME, HISTORY.NOTIFICATION_ID FROM NOTIFDB.HISTORY WHERE LOWER(HISTORY.ACTION_TYPE) = 'created') H
ON NOTIFICATIONS.ID = H.NOTIFICATION_ID;
/

GRANT SELECT ON NOTIFDB.NOTIFICATIONS_VIEW TO ACTIVITYDBUSER ;

--------------------------------------------------------
--  DDL for Index NTF_NOTIFICATION_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "NTF_NOTIFICATION_PK" ON "NOTIFICATIONS" ("ID") 
  ;
--------------------------------------------------------
--  DDL for Index RECIPIENT_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "RECIPIENT_PK" ON "RECIPIENTS" ("ID") 
  ;
--------------------------------------------------------
--  DDL for Index PRODUCERS_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "PRODUCERS_PK" ON "PRODUCERS" ("ID") 
  ;
--------------------------------------------------------
--  DDL for Index NTF_HISTORY_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "NTF_HISTORY_PK" ON "HISTORY" ("ID", "NOTIFICATION_ID") 
  ;
--------------------------------------------------------
--  DDL for Index NOTIF_RECIP_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "NOTIF_RECIP_PK" ON "NOTIF_RECIP" ("NOTIFICATION_ID", "RECIPIENT_ID") 
  ;
--------------------------------------------------------
--  DDL for Index ASSOCIATEDITEMS_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "ASSOCIATEDITEMS_PK" ON "ASSOCIATEDITEMS" ("ID") 
  ;

--------------------------------------------------------
--  DDL for Index NTF_REFERENCE_ID
--------------------------------------------------------

  CREATE INDEX "NTF_REFERENCE_ID" ON "NOTIFICATIONS" ("EXT_REFID")
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SYSTEM" ;

--------------------------------------------------------
--  Constraints for Table NOTIFICATIONS
--------------------------------------------------------

  ALTER TABLE "NOTIFICATIONS" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "NOTIFICATIONS" MODIFY ("PRODUCER_ID" NOT NULL ENABLE);
  ALTER TABLE "NOTIFICATIONS" ADD CONSTRAINT "NTF_NOTIFICATION_PK" PRIMARY KEY ("ID") ENABLE;
--------------------------------------------------------
--  Constraints for Table NOTIF_RECIP
--------------------------------------------------------

  ALTER TABLE "NOTIF_RECIP" MODIFY ("NOTIFICATION_ID" NOT NULL ENABLE);
  ALTER TABLE "NOTIF_RECIP" MODIFY ("RECIPIENT_ID" NOT NULL ENABLE);
  ALTER TABLE "NOTIF_RECIP" ADD CONSTRAINT "NOTIF_RECIP_PK" PRIMARY KEY ("NOTIFICATION_ID", "RECIPIENT_ID") ENABLE;
--------------------------------------------------------
--  Constraints for Table PRODUCERS
--------------------------------------------------------

  ALTER TABLE "PRODUCERS" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "PRODUCERS" ADD CONSTRAINT "PRODUCERS_PK" PRIMARY KEY ("ID") ENABLE;
--------------------------------------------------------
--  Constraints for Table RECIPIENTS
--------------------------------------------------------

  ALTER TABLE "RECIPIENTS" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "RECIPIENTS" ADD CONSTRAINT "RECIPIENT_PK" PRIMARY KEY ("ID") ENABLE;
--------------------------------------------------------
--  Constraints for Table ASSOCIATEDITEMS
--------------------------------------------------------

  ALTER TABLE "ASSOCIATEDITEMS" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "ASSOCIATEDITEMS" MODIFY ("NOTIFICATION_ID" NOT NULL ENABLE);
  ALTER TABLE "ASSOCIATEDITEMS" MODIFY ("ITEM" NOT NULL ENABLE);
  ALTER TABLE "ASSOCIATEDITEMS" ADD CONSTRAINT "ASSOCIATEDITEMS_PK" PRIMARY KEY ("ID") ENABLE;
--------------------------------------------------------
--  Constraints for Table HISTORY
--------------------------------------------------------

  ALTER TABLE "HISTORY" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "HISTORY" ADD CONSTRAINT "NTF_HISTORY_PK" PRIMARY KEY ("ID", "NOTIFICATION_ID") ENABLE;
  ALTER TABLE "HISTORY" MODIFY ("NOTIFICATION_ID" NOT NULL ENABLE);
  ALTER TABLE "HISTORY" MODIFY ("ACTION_TYPE" NOT NULL ENABLE);
--------------------------------------------------------
--  Ref Constraints for Table ASSOCIATEDITEMS
--------------------------------------------------------

  ALTER TABLE "ASSOCIATEDITEMS" ADD CONSTRAINT "NOTIF_FK" FOREIGN KEY ("NOTIFICATION_ID")
    REFERENCES "NOTIFICATIONS" ("ID") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table HISTORY
--------------------------------------------------------

  ALTER TABLE "HISTORY" ADD CONSTRAINT "NTF_HISTORY_FK1" FOREIGN KEY ("NOTIFICATION_ID")
    REFERENCES "NOTIFICATIONS" ("ID") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table NOTIFICATIONS
--------------------------------------------------------

  ALTER TABLE "NOTIFICATIONS" ADD CONSTRAINT "NTF_PRODUCER_FK" FOREIGN KEY ("PRODUCER_ID")
    REFERENCES "PRODUCERS" ("ID") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table NOTIF_RECIP
--------------------------------------------------------

  ALTER TABLE "NOTIF_RECIP" ADD CONSTRAINT "NOTIF_RECIP_FK_NTF_ID" FOREIGN KEY ("NOTIFICATION_ID")
    REFERENCES "NOTIFICATIONS" ("ID") ENABLE;
  ALTER TABLE "NOTIF_RECIP" ADD CONSTRAINT "NOTIF_RECIP_FK_RCP_ID" FOREIGN KEY ("RECIPIENT_ID")
    REFERENCES "RECIPIENTS" ("ID") ENABLE;
--------------------------------------------------------
--  DDL for Trigger ASSOCIATEDITEMS_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "ASSOCIATEDITEMS_TRG" 
BEFORE INSERT ON "ASSOCIATEDITEMS" 
FOR EACH ROW 
BEGIN
  <<COLUMN_SEQUENCES>>
  BEGIN
    IF INSERTING AND :NEW.ID IS NULL THEN
      SELECT ASSOCIATEDITEMS_SEQ.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/
ALTER TRIGGER "ASSOCIATEDITEMS_TRG" ENABLE;
--------------------------------------------------------
--  DDL for Trigger HISTORY_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "HISTORY_TRG" 
BEFORE INSERT ON "HISTORY" 
FOR EACH ROW 
BEGIN
  <<COLUMN_SEQUENCES>>
  BEGIN
    IF INSERTING THEN
      SELECT HISTORY_SEQ.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/
ALTER TRIGGER "HISTORY_TRG" ENABLE;
--------------------------------------------------------
--  DDL for Trigger PRODUCERS_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "PRODUCERS_TRG" 
BEFORE INSERT ON "PRODUCERS" 
FOR EACH ROW 
BEGIN
  <<COLUMN_SEQUENCES>>
  BEGIN
    IF INSERTING THEN
      SELECT PRODUCERS_SEQ.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/
ALTER TRIGGER "PRODUCERS_TRG" ENABLE;
--------------------------------------------------------
--  DDL for Trigger RECIPIENTS_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "RECIPIENTS_TRG" 
BEFORE INSERT ON RECIPIENTS 
FOR EACH ROW 
BEGIN
  <<COLUMN_SEQUENCES>>
  BEGIN
    IF INSERTING AND :NEW.ID IS NULL THEN
      SELECT RECIPIENTS_SEQ.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/
ALTER TRIGGER "RECIPIENTS_TRG" ENABLE;

--------------------------------------------------------
--  DDL for Function SPLIT_STRING_BY_COMMA
--------------------------------------------------------

  CREATE OR REPLACE FUNCTION "SPLIT_STRING_BY_COMMA" (p_string IN VARCHAR2)
RETURN varchar_array IS
v_array varchar_array;
BEGIN
v_array := varchar_array();
IF p_string IS NOT NULL THEN
  FOR curs IN (
    SELECT REGEXP_SUBSTR(p_string, '[^,]+', 1, LEVEL) item FROM DUAL
    CONNECT BY REGEXP_SUBSTR(p_string, '[^,]+', 1, LEVEL) IS NOT NULL)
  LOOP
  v_array.extend;
  v_array(v_array.COUNT) := TRIM(curs.item);
  END LOOP;
END IF;
  RETURN v_array;
END;
/

--------------------------------------------------------
--  DDL for Package NOTIFS_PKG
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE "NOTIFS_PKG" IS
PROCEDURE ADD_NOTIFICATION (
  prd_user_id in varchar2,
  prd_desc in varchar2,
  ntf_patient_id in varchar2,
  ntf_message_subject in nvarchar2,
  ntf_message_body in nvarchar2,
  ntf_resolution in varchar2,
  ntf_resolution_state in number,
  ntf_expiration in varchar2,
  ntf_ext_refid in varchar2,
  nav_channel varchar2,
  nav_event varchar2,
  nav_parameter varchar2,
  permissions varchar2,
  n_ntfid OUT varchar2
);

PROCEDURE ADD_RECIPIENT (
  v_ntfid varchar2,
  v_user_id varchar2,
  v_team_id varchar2,
  v_team_type varchar2,
  v_team_focus varchar2,
  v_team_role varchar2,
  v_patient_id varchar2,
  v_patient_assignment number,
  v_facility varchar2,
  v_salience varchar2
);

PROCEDURE ADD_ASSOC_ITEM (
  v_ntfid IN VARCHAR2,
  v_item IN VARCHAR2
);

PROCEDURE COUNT_NOTIFS_BY_PARAMS(
p_user_id IN VARCHAR2,
p_patient_ids IN VARCHAR2,
p_recipient_filter IN VARCHAR2,
p_resolution_state IN NUMBER,
p_read_by_user IN NUMBER,
p_min_salience IN NUMBER,
p_max_salience IN NUMBER,
p_start_date IN VARCHAR2,
p_end_date IN VARCHAR2,
ntf_counter OUT NUMBER
);

PROCEDURE GET_NOTIFS_BY_PARAMS (
p_user_id IN VARCHAR2,
p_patient_ids IN VARCHAR2,
p_recipient_filter IN VARCHAR2,
p_resolution_state IN NUMBER,
p_read_by_user IN NUMBER,
p_min_salience IN NUMBER,
p_max_salience IN NUMBER,
p_start_date IN VARCHAR2,
p_end_date IN VARCHAR2,
ntf_recordset OUT SYS_REFCURSOR
);

FUNCTION GET_RECIPIENTS_BY_NOTIF (
p_ntf_id IN VARCHAR2
) RETURN recipients_array PIPELINED;

FUNCTION GET_ASSOC_ITEMS_BY_NOTIF (
p_ntf_id IN VARCHAR2
) RETURN assoc_items_array PIPELINED;

PROCEDURE GET_NOTIFS_BY_REF_ID (
p_ref_id IN VARCHAR2,
ntf_recordset OUT SYS_REFCURSOR
);

PROCEDURE RESOLVE_NOTIF_BY_ID (
  p_ntf_id VARCHAR2,
  p_user_id VARCHAR2
);

PROCEDURE RESOLVE_NOTIFS_BY_REF_ID (
  p_ref_id VARCHAR2,
  p_user_id VARCHAR2
);

PROCEDURE GET_NOTIF_ROUTE (
  p_team_id IN NUMBER,
  p_team_focus IN NUMBER,
  p_team_type IN NUMBER,
  p_team_role IN NUMBER,
  p_patient_id IN VARCHAR2,
  p_patient_assignment IN NUMBER,
  p_facility IN VARCHAR2,
  ntf_recordset OUT SYS_REFCURSOR
);

END notifs_pkg;
/

--------------------------------------------------------
--  DDL for Package Body NOTIFS_PKG
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE BODY "NOTIFS_PKG" IS

PROCEDURE ADD_NOTIFICATION (
  prd_user_id in varchar2,
  prd_desc in varchar2,
  ntf_patient_id in varchar2,
  ntf_message_subject in nvarchar2,
  ntf_message_body in nvarchar2,
  ntf_resolution in varchar2,
  ntf_resolution_state in number,
  ntf_expiration in varchar2,
  ntf_ext_refid in varchar2,
  nav_channel varchar2,
  nav_event varchar2,
  nav_parameter varchar2,
  permissions varchar2,
  n_ntfid OUT varchar2
)
AS
BEGIN
  DECLARE
   n_id number(19);
   d_createdate date;

  BEGIN
    INSERT INTO PRODUCERS (USER_ID,DESCRIPTION) values (prd_user_id,prd_desc) RETURNING ID INTO n_id ;
    INSERT INTO NOTIFICATIONS (PRODUCER_ID,PATIENT_ID,MESSAGE_SUBJECT,MESSAGE_BODY,RESOLUTION, RESOLUTION_STATE,EXPIRATION,EXT_REFID, NAV_CHANNEL,NAV_EVENT,NAV_PARAMETER,PERMISSIONS)
                VALUES (n_id,ntf_patient_id,ntf_message_subject,ntf_message_body,ntf_resolution,ntf_resolution_state,to_timestamp(ntf_expiration, 'YYYY-MM-DD"T"HH24:MI:SS.ff3"Z"'),ntf_ext_refid,nav_channel,nav_event,nav_parameter,permissions)
                RETURNING ID INTO n_ntfid;
    INSERT INTO HISTORY (NOTIFICATION_ID,USER_ID,ACTION_TYPE,DATE_TIME) select n_ntfid, prd_user_id,'created', to_date(to_char(sysdate,'dd/mm/yyyy hh24:mi:ss'),'dd/mm/yyyy hh24:mi:ss') from dual;
  END;
END;

PROCEDURE ADD_RECIPIENT (
  v_ntfid varchar2,
  v_user_id varchar2,
  v_team_id varchar2,
  v_team_type varchar2,
  v_team_focus varchar2,
  v_team_role varchar2,
  v_patient_id varchar2,
  v_patient_assignment number,
  v_facility varchar2,
  v_salience varchar2
)
AS
BEGIN
  declare
    n_rcp_id number(19);
  begin
    insert into recipients(USER_ID, TEAM_ID, TEAM_TYPE, TEAM_FOCUS, TEAM_ROLE, PATIENT_ID, PATIENT_ASSIGNMENT, FACILITY, SALIENCE)
      VALUES (v_user_id, v_team_id, v_team_type, v_team_focus, v_team_role, v_patient_id, v_patient_assignment, v_facility, v_salience)
        RETURNING ID INTO n_rcp_id;
    insert into NOTIF_RECIP(NOTIFICATION_ID,RECIPIENT_ID) VALUES(v_ntfid,n_rcp_id);
  end;
END;

PROCEDURE ADD_ASSOC_ITEM (
  v_ntfid IN VARCHAR2,
  v_item IN VARCHAR2
) AS
BEGIN
  insert into ASSOCIATEDITEMS(NOTIFICATION_ID,ITEM) VALUES(v_ntfid,v_item);
END;

PROCEDURE COUNT_NOTIFS_BY_PARAMS(
p_user_id IN VARCHAR2,
p_patient_ids IN VARCHAR2,
p_recipient_filter IN VARCHAR2,
p_resolution_state IN NUMBER,
p_read_by_user IN NUMBER,
p_min_salience IN NUMBER,
p_max_salience IN NUMBER,
p_start_date IN VARCHAR2,
p_end_date IN VARCHAR2,
ntf_counter OUT NUMBER
) AS
v_patient_ids varchar_array;
v_count number;
BEGIN
  v_patient_ids := SPLIT_STRING_BY_COMMA(p_patient_ids);
  v_count := v_patient_ids.COUNT;
  ntf_counter := 0;
  SELECT COUNT(ID) INTO ntf_counter FROM
    (SELECT DISTINCT ID
    FROM NOTIFICATIONS_VIEW
    WHERE (p_user_id IS NULL OR REC_USER_ID = p_user_id) AND
          (v_count = 0 OR PATIENT_ID IN (SELECT TO_CHAR(COLUMN_VALUE) FROM TABLE(v_patient_ids))) AND
          (p_recipient_filter IS NULL OR REC_USER_ID = p_recipient_filter) AND
          (p_resolution_state IS NULL OR RESOLUTION_STATE = p_resolution_state) AND
          (REC_USER_ID = p_user_id AND
            salience BETWEEN NVL(p_min_salience,1) AND NVL(p_max_salience,10)) AND
          ((p_start_date IS NULL AND p_end_date IS NULL) OR
              (to_char(CREATEDON, 'YYYYMMDDHHMISS') >= p_start_date AND
                to_char(CREATEDON, 'YYYYMMDDHHMISS') <= p_end_date)) AND
          (p_read_by_user IS NULL OR (p_read_by_user = 1 AND p_user_id IS NOT NULL AND
              HIST_USER_ID = p_user_id AND LOWER(ACTION_TYPE) = 'read') OR
              (p_read_by_user = 0 AND ID IN (SELECT DISTINCT v.ID FROM NOTIFICATIONS_VIEW v
                LEFT JOIN (SELECT NOTIFICATION_ID FROM HISTORY WHERE USER_ID = p_user_id AND LOWER(ACTION_TYPE) = 'read') s
                    ON s.NOTIFICATION_ID = v.ID WHERE s.NOTIFICATION_ID IS NULL))));

END;

PROCEDURE GET_NOTIFS_BY_PARAMS (
p_user_id IN VARCHAR2,
p_patient_ids IN VARCHAR2,
p_recipient_filter IN VARCHAR2,
p_resolution_state IN NUMBER,
p_read_by_user IN NUMBER,
p_min_salience IN NUMBER,
p_max_salience IN NUMBER,
p_start_date IN VARCHAR2,
p_end_date IN VARCHAR2,
ntf_recordset OUT SYS_REFCURSOR
) AS
v_patient_ids varchar_array;
v_count number;
BEGIN
  v_patient_ids := SPLIT_STRING_BY_COMMA(p_patient_ids);
  v_count := v_patient_ids.COUNT;
  OPEN ntf_recordset FOR
    SELECT DISTINCT CAST(ID AS VARCHAR2(255)) AS "notificationId",
           PRODUCER_ID AS "producerId",
           DESCRIPTION AS "producerDescription",
           PATIENT_ID AS "patientId",
           MESSAGE_SUBJECT AS "messageSubject",
           MESSAGE_BODY AS "messageBody",
           RESOLUTION AS "resolution",
           RESOLUTION_STATE AS "resolutionState",
           EXPIRATION AS "expiration",
           EXT_REFID AS "referenceId",
           NAV_CHANNEL AS "navChannel",
           NAV_EVENT AS "navEvent",
           NAV_PARAMETER AS "navParameter",
           PERMISSIONS AS "permissions",
           CREATEDON AS "createdOn"
    FROM NOTIFICATIONS_VIEW
    WHERE (p_user_id IS NULL OR REC_USER_ID = p_user_id) AND
          (v_count = 0 OR PATIENT_ID IN (SELECT TO_CHAR(COLUMN_VALUE) FROM TABLE(v_patient_ids))) AND
          (p_recipient_filter IS NULL OR REC_USER_ID = p_recipient_filter) AND
          (p_resolution_state IS NULL OR RESOLUTION_STATE = p_resolution_state) AND
          (REC_USER_ID = p_user_id AND
            salience BETWEEN NVL(p_min_salience,1) AND NVL(p_max_salience,10)) AND
          ((p_start_date IS NULL AND p_end_date IS NULL) OR
              (to_char(CREATEDON, 'YYYYMMDDHHMISS') >= p_start_date AND
                to_char(CREATEDON, 'YYYYMMDDHHMISS') <= p_end_date)) AND
          (p_read_by_user IS NULL OR (p_read_by_user = 1 AND p_user_id IS NOT NULL AND
              HIST_USER_ID = p_user_id AND LOWER(ACTION_TYPE) = 'read') OR
              (p_read_by_user = 0 AND ID IN (SELECT DISTINCT v.ID FROM NOTIFICATIONS_VIEW v
                LEFT JOIN (SELECT NOTIFICATION_ID FROM HISTORY WHERE USER_ID = p_user_id AND LOWER(ACTION_TYPE) = 'read') s
                    ON s.NOTIFICATION_ID = v.ID WHERE s.NOTIFICATION_ID IS NULL)));

END;

FUNCTION GET_RECIPIENTS_BY_NOTIF (
p_ntf_id IN VARCHAR2
) RETURN recipients_array PIPELINED IS
recipient recipient_obj;
BEGIN
  FOR rcp_cursor IN (
    SELECT r.USER_ID,
          r.TEAM_ID,
          r.TEAM_TYPE,
          r.TEAM_FOCUS,
          r.TEAM_ROLE,
          r.PATIENT_ID,
          r.PATIENT_ASSIGNMENT,
          r.FACILITY,
          r.SALIENCE
    FROM RECIPIENTS r
    INNER JOIN NOTIF_RECIP nr ON r.ID = nr.RECIPIENT_ID
    WHERE nr.NOTIFICATION_ID = p_ntf_id)
  LOOP
  recipient := recipient_obj(rcp_cursor.USER_ID, rcp_cursor.TEAM_ID, rcp_cursor.TEAM_TYPE, rcp_cursor.TEAM_FOCUS, rcp_cursor.TEAM_ROLE,
                  rcp_cursor.PATIENT_ID, rcp_cursor.PATIENT_ASSIGNMENT, rcp_cursor.FACILITY, rcp_cursor.SALIENCE);
  pipe ROW(recipient);
  END LOOP;
END;

FUNCTION GET_ASSOC_ITEMS_BY_NOTIF (
p_ntf_id IN VARCHAR2
) RETURN assoc_items_array PIPELINED IS
assoc_item assoc_item_obj;
BEGIN
  FOR itm_cursor IN (
    SELECT ITEM
    FROM ASSOCIATEDITEMS WHERE NOTIFICATION_ID = p_ntf_id)
  LOOP
  assoc_item := assoc_item_obj(itm_cursor.ITEM);
  pipe ROW(assoc_item);
  END LOOP;
END;

PROCEDURE GET_NOTIFS_BY_REF_ID (
p_ref_id IN VARCHAR2,
ntf_recordset OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN ntf_recordset FOR
    SELECT DISTINCT CAST(ID AS VARCHAR2(255)) AS "notificationId",
           PRODUCER_ID AS "producerId",
           DESCRIPTION AS "producerDescription",
           PATIENT_ID AS "patientId",
           MESSAGE_SUBJECT AS "messageSubject",
           MESSAGE_BODY AS "messageBody",
           RESOLUTION AS "resolution",
           RESOLUTION_STATE AS "resolutionState",
           EXPIRATION AS "expiration",
           EXT_REFID AS "referenceId",
           NAV_CHANNEL AS "navChannel",
           NAV_EVENT AS "navEvent",
           NAV_PARAMETER AS "navParameter",
           PERMISSIONS AS "permissions",
           CREATEDON AS "createdOn"
    FROM NOTIFICATIONS_VIEW
    WHERE (EXT_REFID = p_ref_id);
END;


PROCEDURE RESOLVE_NOTIF_BY_ID (
  p_ntf_id VARCHAR2,
  p_user_id VARCHAR2
) IS
v_resolved_notif NUMBER;
BEGIN
  v_resolved_notif := 0;
  SELECT COUNT(ID) INTO v_resolved_notif from NOTIFICATIONS WHERE ID = p_ntf_id AND RESOLUTION_STATE = 1;
  IF v_resolved_notif = 0
  THEN
    INSERT INTO HISTORY (NOTIFICATION_ID,USER_ID,ACTION_TYPE,DATE_TIME)
      SELECT p_ntf_id, p_user_id, 'resolved', to_date(to_char(sysdate,'dd/mm/yyyy hh24:mi:ss'),'dd/mm/yyyy hh24:mi:ss') from dual;

    UPDATE NOTIFICATIONS SET RESOLUTION_STATE = 1 WHERE ID = p_ntf_id;
  END IF;
END;


PROCEDURE RESOLVE_NOTIFS_BY_REF_ID (
  p_ref_id VARCHAR2,
  p_user_id VARCHAR2
) IS
BEGIN
  FOR ntf_cursor IN (
    SELECT ID FROM NOTIFICATIONS WHERE EXT_REFID = p_ref_id
  ) LOOP
  RESOLVE_NOTIF_BY_ID(ntf_cursor.ID, p_user_id);
  END LOOP;
END;

PROCEDURE GET_NOTIF_ROUTE (
  p_team_id IN NUMBER,
  p_team_focus IN NUMBER,
  p_team_type IN NUMBER,
  p_team_role IN NUMBER,
  p_patient_id IN VARCHAR2,
  p_patient_assignment IN NUMBER,
  p_facility IN VARCHAR2,
  ntf_recordset OUT SYS_REFCURSOR
) AS
  v_facilities varchar_array;
  v_count NUMBER;
  BEGIN
    v_facilities := SPLIT_STRING_BY_COMMA(p_facility);
    v_count := v_facilities.COUNT;
    OPEN ntf_recordset FOR
      SELECT s.STAFF_IEN AS "userId",
        t.TEAM_ID AS "teamId",
        t.PCM_STD_TEAM_FOCUS_ID AS "teamFocus",
        t.PCM_STD_TEAM_CARE_TYPE_ID AS "teamType",
        tm.PCM_STD_TEAM_ROLE_ID AS "teamRole",
        pas.ICN AS "patientId",
        si.STATIONNUMBER AS "division"
      FROM PCMM.STAFF s
      JOIN PCMM.TEAM_MEMBERSHIP tm ON tm.STAFF_ID = s.STAFF_ID
      JOIN PCMM.TEAM t ON t.TEAM_ID = tm.TEAM_ID
      LEFT JOIN sdsadm.STD_Institution si ON si.ID = t.VA_INSTITUTION_ID
      LEFT JOIN (SELECT pa.TEAM_ID, p.ICN FROM PCMM.TEAM_PATIENT_ASSIGN pa JOIN PCMM.PCMM_PATIENT p
            ON p.PCMM_PATIENT_ID = pa.PCMM_PATIENT_ID AND p.ICN IS NOT NULL) pas ON pas.TEAM_ID = t.TEAM_ID
      WHERE (p_team_id IS NULL OR t.TEAM_ID = p_team_id)
      AND (p_team_focus IS NULL OR t.PCM_STD_TEAM_FOCUS_ID = p_team_focus)
      AND (p_team_type IS NULL OR t.PCM_STD_TEAM_CARE_TYPE_ID = p_team_type)
      AND (p_team_role IS NULL OR tm.PCM_STD_TEAM_ROLE_ID = p_team_role)
      AND (p_patient_id IS NULL OR p_patient_assignment = 0 OR (p_patient_assignment = 1 AND pas.ICN = p_patient_id))
      AND (v_count = 0 OR si.STATIONNUMBER IN (SELECT TO_CHAR(COLUMN_VALUE) FROM TABLE(v_facilities)));
  END GET_NOTIF_ROUTE;

END notifs_pkg;
/