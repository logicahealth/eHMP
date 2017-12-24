--------------------------------------------------------
--  DDL for Sequence AM_TASKROUTE_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_TASKROUTE_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_SIMPLE_MATCH_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_SIMPLE_MATCH_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_EVENTLISTENER_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_EVENTLISTENER_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_EVENT_MATCH_CRITERIA_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_EVENT_MATCH_CRITERIA_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_EVENT_MATCH_ACTION_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_EVENT_MATCH_ACTION_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_PRCSD_EVNT_STT_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_PRCSD_EVNT_STT_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_SIGNAL_INSTANCE_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_SIGNAL_INSTANCE_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_PROCESSROUTE_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_PROCESSROUTE_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Sequence AM_HISTORICALTASKDATA_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_HISTORICALTASKDATA_ID_SEQ"  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
--  DDL for Table AM_PROCESSSTATUSLOOKUP
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_PROCESSSTATUSLOOKUP"
					(
						"ID" NUMBER(10,0) NOT NULL ENABLE,
						"STATUS" VARCHAR2(16 CHAR) NOT NULL ENABLE,
						CONSTRAINT "AM_PROCESSSTATUSLOOKUP_PK" PRIMARY KEY ("ID") ENABLE
					)';

	execute immediate sql_statement;

	execute immediate 'Insert into ACTIVITYDB.AM_PROCESSSTATUSLOOKUP (ID,STATUS) values (0,''Pending'')';
	execute immediate 'Insert into ACTIVITYDB.AM_PROCESSSTATUSLOOKUP (ID,STATUS) values (1,''Active'')';
	execute immediate 'Insert into ACTIVITYDB.AM_PROCESSSTATUSLOOKUP (ID,STATUS) values (2,''Completed'')';
	execute immediate 'Insert into ACTIVITYDB.AM_PROCESSSTATUSLOOKUP (ID,STATUS) values (3,''Aborted'')';
	execute immediate 'Insert into ACTIVITYDB.AM_PROCESSSTATUSLOOKUP (ID,STATUS) values (4,''Suspended'')';

	EXCEPTION
	    WHEN OTHERS THEN
	      IF SQLCODE = -955 THEN
	        NULL; -- suppresses ORA-00955 exception
	      ELSE
	         RAISE;
	      END IF;
END;
/

BEGIN
	execute immediate 'ALTER TABLE ACTIVITYDB.AM_PROCESSSTATUSLOOKUP ADD (STATUS_MODE VARCHAR2(20))';
	EXCEPTION
		WHEN OTHERS THEN
			NULL;
END;
/

BEGIN

	UPDATE ACTIVITYDB.AM_PROCESSSTATUSLOOKUP
	SET status_mode = 'closed'
	WHERE id IN (2, 3);

	UPDATE ACTIVITYDB.AM_PROCESSSTATUSLOOKUP
	SET status_mode = 'open'
	WHERE id IN (1, 4);

	COMMIT;

END;
/

--------------------------------------------------------
--  DDL for Table AM_PROCESSINSTANCE
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(2000);
T_COUNT NUMBER;
C_COUNT NUMBER;
lv_data LONG;
BEGIN
	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_PROCESSINSTANCE' ;
	IF T_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
					(
						"PROCESSINSTANCEID" NUMBER(19,0) NOT NULL ENABLE,
						"ICN" VARCHAR2(40 CHAR),
						"FACILITYID" VARCHAR2(255 CHAR),
						"PROCESSNAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"PROCESSDEFINITIONID" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"DEPLOYMENTID" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"STATUSID" NUMBER(10,0) NOT NULL ENABLE,
						"STATUSTIMESTAMP" DATE NOT NULL ENABLE,
						"CREATEDBYID" VARCHAR2(255 CHAR),
						"VERSION" VARCHAR2(255 CHAR),
						"INITIATIONDATE" DATE,
						"PARENTINSTANCEID" NUMBER(19,0),
						"INSTANCENAME" VARCHAR2(255 CHAR),
						"STATE" VARCHAR2(255 CHAR),
						"STATESTARTDATE" DATE,
						"STATEDUEDATE" DATE,
						"URGENCY" NUMBER(2,0),
						"DESTINATIONFACILITYID" VARCHAR2(255 CHAR),
						"FOCUSAREAID" NUMBER(19,0),
						"ASSIGNEDTO" VARCHAR2(255 CHAR),
						"ACTIVITYHEALTHY" NUMBER(1, 0),
						"ACTIVITYHEALTHDESCRIPTION" VARCHAR2(1500 CHAR),
						"CLINICALOBJECTUID" VARCHAR2(255 CHAR),
						"TYPE" VARCHAR2(255 CHAR),
						"DOMAIN" VARCHAR2(255 CHAR),
						"DESCRIPTION" VARCHAR2(1500 CHAR),
						"PID" VARCHAR2(255 CHAR),
						CONSTRAINT "AM_PROCESSINSTANCE_PK" PRIMARY KEY ("PROCESSINSTANCEID") ENABLE,
						CONSTRAINT "FK_PROCINST_PROCSTATLKUP_IDX" FOREIGN KEY ("STATUSID")
							REFERENCES "ACTIVITYDB"."AM_PROCESSSTATUSLOOKUP" ("ID") ENABLE
					)';

		execute immediate sql_statement;
	ELSE
		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
															AND  TABLE_NAME = 'AM_PROCESSINSTANCE'
															AND COLUMN_NAME = 'VERSION';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
						ADD
						(
							"VERSION" VARCHAR2(255 CHAR),
							"INITIATIONDATE" DATE,
							"PARENTINSTANCEID" NUMBER(19,0),
							"INSTANCENAME" VARCHAR2(255 CHAR),
							"STATE" VARCHAR2(255 CHAR),
							"STATESTARTDATE" DATE,
							"STATEDUEDATE" DATE,
							"URGENCY" NUMBER(2,0),
							"DESTINATIONFACILITYID" VARCHAR2(255 CHAR),
							"FOCUSAREAID" NUMBER(19,0),
							"ASSIGNEDTO" VARCHAR2(255 CHAR)
						)';

			execute immediate sql_statement;

			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
						RENAME COLUMN "ID" to "PROCESSINSTANCEID"';

			execute immediate sql_statement;
		ELSE
			SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
																AND  TABLE_NAME = 'AM_PROCESSINSTANCE'
																AND COLUMN_NAME = 'DESTINATIONFACILITYID';
			IF C_COUNT = 0
			THEN
				sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
							ADD
							(
								"DESTINATIONFACILITYID" VARCHAR2(255 CHAR),
								"FOCUSAREAID" NUMBER(19,0),
								"ASSIGNEDTO" VARCHAR2(255 CHAR)
							)';

				execute immediate sql_statement;

				sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
							RENAME COLUMN "ID" to "PROCESSINSTANCEID"';

				execute immediate sql_statement;
			END IF;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
														AND  TABLE_NAME = 'AM_PROCESSINSTANCE'
													AND COLUMN_NAME = 'ACTIVITYHEALTHY';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
						ADD
						(
							"ACTIVITYHEALTHY" NUMBER(1, 0),
							"ACTIVITYHEALTHDESCRIPTION" VARCHAR2(1500 CHAR)
						)';

			execute immediate sql_statement;
		END IF;

		--------------------------------------------------------------------------------------------------
		-- This column is added to expose the clinical object uid for an activity within the activityDB
		--------------------------------------------------------------------------------------------------

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
														AND  TABLE_NAME = 'AM_PROCESSINSTANCE'
													AND COLUMN_NAME = 'CLINICALOBJECTUID';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
						ADD
						(
							"CLINICALOBJECTUID" VARCHAR2(255 CHAR)
						)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
														AND  TABLE_NAME = 'AM_PROCESSINSTANCE'
													AND COLUMN_NAME = 'TYPE';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
						ADD
						(
							"TYPE" VARCHAR2(255 CHAR),
							"DOMAIN" VARCHAR2(255 CHAR),
							"DESCRIPTION" VARCHAR2(1500 CHAR)
						)';

			execute immediate sql_statement;
		END IF;

		FOR c1 IN ( SELECT constraint_name, search_condition
		  	FROM dba_constraints
		  	WHERE table_name = 'AM_PROCESSINSTANCE' AND owner = 'ACTIVITYDB' AND constraint_type = 'C' ) LOOP

		  lv_data := c1.search_condition;
		  IF ( 0 < INSTR( lv_data, '"ICN" IS NOT NULL' ) ) THEN
		  	lv_data := 'ALTER TABLE ACTIVITYDB.AM_PROCESSINSTANCE
		  	 	DROP CONSTRAINT ' || c1.constraint_name ;
		    EXECUTE IMMEDIATE lv_data;
		  END IF;
		END LOOP;

		SELECT COUNT(*) INTO C_COUNT
		FROM DBA_TAB_COLS
		WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_PROCESSINSTANCE' AND COLUMN_NAME = 'PID';
		IF C_COUNT = 0 THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE" ADD ("PID" VARCHAR2(255 CHAR))';
			execute immediate sql_statement;
		END IF;

    END IF;

	sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE" MODIFY "ASSIGNEDTO" VARCHAR2(2000 CHAR)';
	execute immediate sql_statement;

	EXCEPTION
	    WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING TABLE ACTIVITYDB.AM_PROCESSINSTANCE '||SQLCODE||SQLERRM);
END;
/

--------------------------------------------------------
--  Migrate ICN to PID, PID was being stored in ICN
--------------------------------------------------------

DECLARE
	v_count number;
BEGIN
	SELECT count(*) INTO v_count FROM activitydb.am_processinstance
	WHERE pid IS NOT NULL and processinstanceid > 0 and processdefinitionid = 'Order.DischargeFollowup';
	IF v_count = 0 THEN
		UPDATE activitydb.am_processinstance
		SET pid = icn WHERE pid IS NULL;
		COMMIT;
	END IF;
END;
/

--------------------------------------------------------
--  DDL for Table AM_TASKSTATUSLOOKUP
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_TASKSTATUSLOOKUP"
					(
						"ID" NUMBER(10,0) NOT NULL ENABLE,
						"STATUS" VARCHAR2(16 CHAR) NOT NULL ENABLE,
						CONSTRAINT "AM_TASKSTATUSLOOKUP_PK" PRIMARY KEY ("ID") ENABLE
					)';

	execute immediate sql_statement;

	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (0,''Created'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (1,''Ready'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (2,''Reserved'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (3,''InProgress'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (4,''Suspended'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (5,''Completed'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (6,''Failed'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (7,''Error'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (8,''Exited'')';
	execute immediate 'Insert into ACTIVITYDB.AM_TASKSTATUSLOOKUP (ID,STATUS) values (9,''Obsolete'')';

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
--  DDL for Table AM_TASKINSTANCE
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(2048);
R_COUNT NUMBER;
C_COUNT NUMBER;
lv_data LONG;
BEGIN

	SELECT COUNT(*) INTO R_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_TASKINSTANCE' ;
	IF R_COUNT = 0
	THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
						(
							"ID" NUMBER(19,0) NOT NULL ENABLE,
							"PROCESSINSTANCEID" NUMBER(19,0) NOT NULL ENABLE,
							"ICN" VARCHAR2(40 CHAR),
							"TASKNAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
							"DESCRIPTION" VARCHAR2(255 CHAR),
							"PRIORITY" NUMBER(10,0),
							"SKIPPABLE" NUMBER(1,0),
							"CREATEDON" DATE,
							"STATUSID" NUMBER(10,0) NOT NULL ENABLE,
							"STATUSTIMESTAMP" DATE NOT NULL ENABLE,
							"ACTUALOWNER" VARCHAR2(255 CHAR),
							"DUEDATE" DATE,
							"EARLIESTDATE" DATE,
							"NAVIGATION" VARCHAR2(1000 CHAR),
							"PERMISSION" VARCHAR2(1000 CHAR),
							"HISTORY" VARCHAR2(200 CHAR),
							"DEFINITIONID" VARCHAR2(255 CHAR),
							"HISTORYACTION" VARCHAR2(200 CHAR),
							"ASSIGNEDTO" VARCHAR2(255 CHAR),
							"BEFORE_EARLIEST_DATE" NUMBER(1, 0) DEFAULT 0,
							CONSTRAINT "AM_TASKINSTANCE_PK" PRIMARY KEY ("ID") ENABLE,
							CONSTRAINT "FK_TSKINST_TSKINSSTAT_LKP_IDX" FOREIGN KEY ("STATUSID")
								REFERENCES "ACTIVITYDB"."AM_TASKSTATUSLOOKUP" ("ID") ENABLE,
							CONSTRAINT "FK_TSKINS_PROCINS_ID" FOREIGN KEY ("PROCESSINSTANCEID")
								REFERENCES "ACTIVITYDB"."AM_PROCESSINSTANCE" ("PROCESSINSTANCEID") ENABLE
					)';
		execute immediate sql_statement;
	ELSE
		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'EARLIESTDATE';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"EARLIESTDATE" DATE
					)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'NAVIGATION';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"NAVIGATION" VARCHAR2(1000 CHAR)
					)';

			execute immediate sql_statement;
		END IF;

		-- Added a "HISTORY" column to the Am_TaskInstance table to support activity/task history.
		-- Added a "DEFINITIONID" column for taks definition Id's

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'HISTORY';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"HISTORY" VARCHAR2(200 CHAR),
						"DEFINITIONID" VARCHAR2(255 CHAR)
					)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'PERMISSION';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"PERMISSION" VARCHAR2(1000 CHAR)
					)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'HISTORYACTION';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"HISTORYACTION" VARCHAR2(200 CHAR)
					)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'ASSIGNEDTO';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"ASSIGNEDTO" VARCHAR2(255 CHAR)
					)';

			execute immediate sql_statement;
		END IF;

		FOR c1 IN ( SELECT constraint_name, search_condition
		  	FROM dba_constraints
		  	WHERE table_name = 'AM_TASKINSTANCE' AND owner = 'ACTIVITYDB' AND constraint_type = 'C' ) LOOP

		  lv_data := c1.search_condition;
		  IF ( 0 < INSTR( lv_data, '"ICN" IS NOT NULL' ) ) THEN
		  	lv_data := 'ALTER TABLE ACTIVITYDB.AM_TASKINSTANCE
		  		DROP CONSTRAINT ' || c1.constraint_name ;
		    EXECUTE IMMEDIATE lv_data;
		  END IF;
		END LOOP;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'AM_TASKINSTANCE'
							AND COLUMN_NAME = 'BEFORE_EARLIEST_DATE';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					ADD
					(
						"BEFORE_EARLIEST_DATE" NUMBER(1, 0) DEFAULT 0
					)';

			execute immediate sql_statement;
		END IF;

	END IF;

	sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE" MODIFY "HISTORY" VARCHAR2(2000 CHAR)';
	execute immediate sql_statement;

	sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKINSTANCE" MODIFY "ASSIGNEDTO" VARCHAR2(2000 CHAR)';
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
--  DDL for Table AM_TASKROUTE
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
R_COUNT NUMBER;
P_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO R_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_TASKROUTE' ;
	IF R_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_TASKROUTE"
						(
							"ID" NUMBER(24,0) NOT NULL ENABLE,
							"TASKINSTANCEID" NUMBER(19,0) NOT NULL ENABLE,
							"FACILITY" NUMBER(10,0),
							"TEAM" NUMBER(10,0),
							"TEAMFOCUS" NUMBER(10,0),
							"TEAMTYPE" NUMBER(10,0),
							"TEAMROLE" NUMBER(10,0),
							"USERID" VARCHAR2(255 CHAR),
							"PATIENTASSIGNMENT" NUMBER(1, 0),
							CONSTRAINT "AM_TASKROUTE_PK" PRIMARY KEY ("ID") ENABLE,
							CONSTRAINT "TSKRT_TSKINS_ID" FOREIGN KEY ("TASKINSTANCEID")
								REFERENCES "ACTIVITYDB"."AM_TASKINSTANCE" ("ID") ENABLE

						)';

		execute immediate sql_statement;
	ELSE
		SELECT COUNT(*) INTO P_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
															AND  TABLE_NAME = 'AM_TASKROUTE'
															AND COLUMN_NAME = 'PATIENTASSIGNMENT';
		IF P_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKROUTE"
						ADD
						(
							"PATIENTASSIGNMENT" NUMBER(1, 0)
						)';

			execute immediate sql_statement;
		END IF;

	END IF;

	sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_TASKROUTE" MODIFY "FACILITY" VARCHAR2(7 CHAR)';
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
--  DDL for Table EVENT_MATCH_ACTION
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
C_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'EVENT_MATCH_ACTION' ;
	IF T_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."EVENT_MATCH_ACTION"
						(
							"ID" NUMBER(20,0) NOT NULL ENABLE,
							"SIGNAL_CONTENT" CLOB,
							"SIGNAL_NAME" VARCHAR2(255 CHAR),
							"EVENT_MTCH_DEF_ID" VARCHAR2(255 CHAR),
							"EVENT_MTCH_VERSION" VARCHAR2(255 CHAR),
							"EVENT_MTCH_INST_ID" NUMBER(20,0),
		 					CONSTRAINT "EVENT_MATCH_ACTION_PK" PRIMARY KEY ("ID"),
							CONSTRAINT "INSTANC_EVNT_MATCH_ACTION_0_FK" FOREIGN KEY ("EVENT_MTCH_INST_ID")
						  		REFERENCES "ACTIVITYDB"."AM_PROCESSINSTANCE" ("PROCESSINSTANCEID") ENABLE
						)';

		execute immediate sql_statement;
	ELSE

		SELECT COUNT(*) INTO C_COUNT FROM DBA_CONSTRAINTS WHERE OWNER = 'ACTIVITYDB' AND CONSTRAINT_NAME ='DEFNITN_EVNT_MATCH_ACTION_0_FK';

	  	IF C_COUNT > 0 THEN

	    	sql_statement:='ALTER TABLE "ACTIVITYDB"."EVENT_MATCH_ACTION" DROP CONSTRAINT "DEFNITN_EVNT_MATCH_ACTION_0_FK"';

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
--  DROP Table AM_PROCESSDEFINITION - No longer needed
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_PROCESSDEFINITION' ;
	IF T_COUNT > 0
    THEN

		sql_statement:='DROP TABLE "ACTIVITYDB"."AM_PROCESSDEFINITION"';

		execute immediate sql_statement;
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
--  DDL for Table EVENT_MATCH_CRITERIA
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."EVENT_MATCH_CRITERIA" 
				   	(	
            			"ID" NUMBER(20,0) NOT NULL ENABLE,
	 					CONSTRAINT "EVENT_MATCH_CRITERIA_PK" PRIMARY KEY ("ID")
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

-------------------------------------------------------------------------
--  DDL for Table AM_EVENTLISTENER
--  Updated this table primary key's data type from VARCHAR2 to NUMBER
--  Also dropped table PROCESSED_EVENT_STATE since it has a foreign key
--  that's pointing to this talbe; will be recreated down below
-------------------------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
C_TYPE VARCHAR2(2000);
T_COUNT NUMBER;
BEGIN

SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_EVENTLISTENER' ;
	IF T_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_EVENTLISTENER" 
					   (	
					   		"LISTENER_ID" NUMBER(20, 0) NOT NULL ENABLE, 
							"EVENT_ACTION_SCOPE" VARCHAR2(32 CHAR), 
							"API_VERSION" VARCHAR2(255 CHAR), 
							"DESCRIPTION_ITEM" VARCHAR2(255 CHAR), 
							"NAME" VARCHAR2(255 CHAR), 
							"EVENT_MTCH_ACTION_ID" NUMBER(20,0), 
							"EVENT_MTCH_CRITERIA_ID" NUMBER(20,0), 
		 					CONSTRAINT "AM_EVENTLISTENER_PK" PRIMARY KEY ("LISTENER_ID"),
							CONSTRAINT "EVNT_MTCH_ACTION_ACTIVITY_0_FK" FOREIGN KEY ("EVENT_MTCH_ACTION_ID")
		  						REFERENCES "ACTIVITYDB"."EVENT_MATCH_ACTION" ("ID") ENABLE,
							CONSTRAINT "EVNT_MTCH_CRITERIA_0_FK" FOREIGN KEY ("EVENT_MTCH_CRITERIA_ID")
		  						REFERENCES "ACTIVITYDB"."EVENT_MATCH_CRITERIA" ("ID") ENABLE,
	            			CONSTRAINT CONST_ENUM_EVENT_ACTION_SCOPE CHECK ("EVENT_ACTION_SCOPE" IN (''Instantiation'', ''Signaling'', ''ALL''))
						)';
		execute immediate sql_statement;
	ELSE
		SELECT DATA_TYPE INTO C_TYPE FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
																	AND  TABLE_NAME = 'AM_EVENTLISTENER'
																	AND COLUMN_NAME = 'LISTENER_ID';
		IF C_TYPE = 'VARCHAR2'
		THEN
		    sql_statement:='DROP TABLE "ACTIVITYDB"."PROCESSED_EVENT_STATE"';
				execute immediate sql_statement;

		    execute immediate 'DELETE FROM "ACTIVITYDB"."AM_EVENTLISTENER"';

		    sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_EVENTLISTENER" drop CONSTRAINT "AM_EVENTLISTENER_PK"';
				execute immediate sql_statement;


		    sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_EVENTLISTENER"
								MODIFY
								(
									"LISTENER_ID" NUMBER(20, 0)
								)';
			execute immediate sql_statement;

			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_EVENTLISTENER"
						ADD
						(
							CONSTRAINT "AM_EVENTLISTENER_PK" PRIMARY KEY ("LISTENER_ID")
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

DECLARE
  object_exists EXCEPTION;
  constraint_exists EXCEPTION;
  PRAGMA exception_init( object_exists, -955 );
  PRAGMA exception_init( constraint_exists, -2275);
  PROCEDURE execute_ddl(ddl VARCHAR)
  IS
  BEGIN
    EXECUTE IMMEDIATE ddl;
    EXCEPTION
      WHEN object_exists THEN
        NULL;
      WHEN constraint_exists THEN
      	NULL;
      WHEN OTHERS THEN
        DBMS_OUTPUT.put_line ('ERROR - SIMPLE_MATCH');
        DBMS_OUTPUT.put_line (SQLERRM);
        RAISE;
  END;

BEGIN

	execute_ddl('
		CREATE TABLE ACTIVITYDB.SIMPLE_MATCH
		(
			"ID" NUMBER(20,0) NOT NULL ENABLE,
			"MATCHFIELD" VARCHAR2(255 CHAR),
			"MATCHVALUE" VARCHAR2(255 CHAR),
			"EVENT_MTCH_CRI_ID" NUMBER(20,0),
		 	CONSTRAINT "SIMPLE_MATCH_PK" PRIMARY KEY ("ID"),
			CONSTRAINT "SIMPL_MTCH_EVNT_MATCH_CRI_0_FK" FOREIGN KEY ("EVENT_MTCH_CRI_ID")
				REFERENCES "ACTIVITYDB"."EVENT_MATCH_CRITERIA" ("ID") ENABLE
		)
	');

	execute_ddl('
		CREATE TABLE ACTIVITYDB.SIMPLE_MATCH_VALUE AS
		SELECT ID SIMPLE_MATCH_ID, LOWER(REGEXP_SUBSTR(MATCHVALUE, ''[^,]+'', 1, LEVEL)) MATCHVALUE
		FROM ACTIVITYDB.SIMPLE_MATCH
		CONNECT BY LEVEL <= REGEXP_COUNT(MATCHVALUE, '','') + 1 AND
        PRIOR ID = ID AND
        PRIOR SYS_GUID() IS NOT NULL
	');

	execute_ddl('
		ALTER TABLE ACTIVITYDB.SIMPLE_MATCH_VALUE
		ADD CONSTRAINT FK_SIMPLE_MATCH_VALUE_ID
	  	FOREIGN KEY (SIMPLE_MATCH_ID)
	  	REFERENCES ACTIVITYDB.SIMPLE_MATCH(ID)
	  	ON DELETE CASCADE
  	');

	execute_ddl('
		CREATE OR REPLACE TRIGGER ACTIVITYDB.SIMPLE_MATCH_AFTER_INSERT
		AFTER INSERT
		ON ACTIVITYDB.SIMPLE_MATCH
		FOR EACH ROW
		BEGIN
			INSERT INTO ACTIVITYDB.SIMPLE_MATCH_VALUE
			(SIMPLE_MATCH_ID, MATCHVALUE)
			SELECT :new.ID, LOWER(TRIM(regexp_substr(:new.MATCHVALUE,''[^,]+'', 1, level))) MATCHVALUE
			FROM dual
			CONNECT BY regexp_substr(:new.MATCHVALUE,''[^,]+'', 1, level) IS NOT NULL;
		END;
	');

	execute_ddl('
		CREATE OR REPLACE TRIGGER ACTIVITYDB.SIMPLE_MATCH_AFTER_UPDATE
		AFTER UPDATE OF MATCHVALUE
		ON ACTIVITYDB.SIMPLE_MATCH
		FOR EACH ROW
		BEGIN
			IF UPDATING(''MATCHVALUE'') THEN
				DELETE FROM ACTIVITYDB.SIMPLE_MATCH_VALUE WHERE SIMPLE_MATCH_ID = :new.ID;
				INSERT INTO ACTIVITYDB.SIMPLE_MATCH_VALUE
				(SIMPLE_MATCH_ID, MATCHVALUE)
				SELECT :new.ID, LOWER(TRIM(regexp_substr(:new.MATCHVALUE,''[^,]+'', 1, level))) MATCHVALUE
				FROM dual
				CONNECT BY regexp_substr(:new.MATCHVALUE,''[^,]+'', 1, level) IS NOT NULL;
			END IF;
		END;
	');

END;
/

-------------------------------------------------------------------
--  DDL for Table PROCESSED_EVENT_STATE
-------------------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
C_COUNT VARCHAR2(2000);
U_COUNT NUMBER;
I_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'PROCESSED_EVENT_STATE' ;
	IF T_COUNT = 0
    THEN
    	sql_statement:='CREATE TABLE "ACTIVITYDB"."PROCESSED_EVENT_STATE"
						   (
						   		"ID" NUMBER(20,0) NOT NULL ENABLE,
		              			"DATA_LOCATION" VARCHAR2(255 CHAR),
		              			"VALUE" VARCHAR2(2000 CHAR),
		              			"LISTENER_ID" NUMBER(20, 0),
		              			CONSTRAINT "PROCESSED_EVENT_STATE_PK" PRIMARY KEY ("ID"),
		              			CONSTRAINT "LISTNER_PRCESSED_EVNT_STA_0_FK" FOREIGN KEY ("LISTENER_ID")
			  					REFERENCES "ACTIVITYDB"."AM_EVENTLISTENER" ("LISTENER_ID") ENABLE,
		              			CONSTRAINT "PROCESSED_EVENT_STATE_UK" UNIQUE ("DATA_LOCATION", "VALUE", "LISTENER_ID")
							)';

		execute immediate sql_statement;

    ELSE
    	SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
							AND  TABLE_NAME = 'PROCESSED_EVENT_STATE'
							AND COLUMN_NAME = 'DATA_LOCATION';
		IF C_COUNT = 0
		THEN
	    	SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
								AND  TABLE_NAME = 'PROCESSED_EVENT_STATE'
								AND COLUMN_NAME = 'CLINICALOBJECTUID';
			IF C_COUNT > 0
			THEN
	    		sql_statement:='ALTER TABLE "ACTIVITYDB"."PROCESSED_EVENT_STATE"
								RENAME COLUMN "CLINICALOBJECTUID" to "VALUE"';

				execute immediate sql_statement;
			END IF;

			sql_statement:='ALTER TABLE "ACTIVITYDB"."PROCESSED_EVENT_STATE"
							ADD
							(
								"DATA_LOCATION" VARCHAR2(255 CHAR)
							)';

			execute immediate sql_statement;

			sql_statement:='UPDATE "ACTIVITYDB"."PROCESSED_EVENT_STATE" set DATA_LOCATION = (''uid'')';

			execute immediate sql_statement;

			sql_statement:='CREATE INDEX IDX_DATA_LOCATION_VALUE on ACTIVITYDB.PROCESSED_EVENT_STATE (DATA_LOCATION, VALUE)';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO U_COUNT FROM DBA_CONSTRAINTS WHERE TABLE_NAME='PROCESSED_EVENT_STATE' AND CONSTRAINT_NAME='PROCESSED_EVENT_STATE_UK';
		IF U_COUNT = 0
		THEN

			-- Remove duplicate entries in PROCESSED_EVENT_STATE table (keeping the first id that was inserted) before applying unique constraint
			-- note that this is the same as the content of '@utilities/delete_duplicate_processedeventstate.sql'
			sql_statement:='DELETE FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE" WHERE ID IN
							(SELECT ID FROM
								(SELECT ID, DATA_LOCATION, VALUE, LISTENER_ID, row_number()
									over (partition BY DATA_LOCATION, VALUE, LISTENER_ID order by ID)
								AS dup_cnt FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE") WHERE dup_cnt > 1
							)';

			execute immediate sql_statement;

			sql_statement:='ALTER TABLE "ACTIVITYDB"."PROCESSED_EVENT_STATE" ADD CONSTRAINT "PROCESSED_EVENT_STATE_UK" UNIQUE ("DATA_LOCATION", "VALUE", "LISTENER_ID")';

			execute immediate sql_statement;
		END IF;

		SELECT COUNT(*) INTO I_COUNT FROM DBA_INDEXES WHERE TABLE_NAME='PROCESSED_EVENT_STATE' AND INDEX_NAME='IDX_DATA_LOCATION_VALUE';
		IF I_COUNT > 0
		THEN
			sql_statement:='DROP INDEX IDX_DATA_LOCATION_VALUE';

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
--  DDL for Table AM_SIGNALINSTANCE
--  The structure of the table is comleted changed
--  Updating talbe with new column names
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
C_COUNT NUMBER;
BEGIN

	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_SIGNAL_INSTANCE';
	IF T_COUNT > 0
    THEN
		sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_SIGNAL_INSTANCE" RENAME TO "AM_SIGNALINSTANCE"';

		execute immediate sql_statement;

		SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
															AND  TABLE_NAME = 'AM_SIGNALINSTANCE'
															AND COLUMN_NAME = 'ID';
		IF C_COUNT = 0
		THEN
			sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_SIGNALINSTANCE"
						ADD
						(
							"ID" NUMBER(20,0) NOT NULL ENABLE
						)';

			execute immediate sql_statement;
		END IF;

	ELSE
		SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_SIGNALINSTANCE';
		IF T_COUNT = 0
		THEN
			sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_SIGNALINSTANCE"
							(
								"ID" NUMBER(20,0) NOT NULL ENABLE,
								"NAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
								"ACTION" VARCHAR2(255 CHAR) NOT NULL ENABLE,
								"OWNER" VARCHAR2(255 CHAR) NOT NULL ENABLE,
								"STATUSTIMESTAMP" DATE NOT NULL ENABLE,
								"HISTORY" VARCHAR2(512 CHAR),
								"PROCESSED_SIGNAL_ID" NUMBER(19,0),
								CONSTRAINT "PROCESSED_SIGNL_HISTRY_FK" FOREIGN KEY ("PROCESSED_SIGNAL_ID")
									REFERENCES "ACTIVITYDB"."AM_PROCESSINSTANCE" ("PROCESSINSTANCEID") ENABLE
							)';

			execute immediate sql_statement;
		END IF;
	END IF;

	SELECT COUNT(*) INTO C_COUNT FROM DBA_TAB_COLS WHERE OWNER = 'ACTIVITYDB'
                            AND  TABLE_NAME = 'AM_SIGNALINSTANCE'
                            AND COLUMN_NAME = 'HISTORY';

	IF C_COUNT > 0
	THEN
	    sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_SIGNALINSTANCE"
	                  MODIFY
	                  (
	                    "HISTORY" VARCHAR2(512 CHAR)
	                  )';

	    execute immediate sql_statement;
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
--  DDL for Table AM_HISTORICALTASKDATA
--  The idea behind this table is: when a task gets completed, we will dump the variable data
--  that BPM normally stores for in-progress tasks into the Am_HistoricalTaskData table, one record per variable that is set.  
--  A future story will cover updating the BPM event listeners to populate this table.
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
BEGIN
SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_HISTORICALTASKDATA' ;
	IF T_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_HISTORICALTASKDATA"
						(
							"ID" NUMBER(24,0) NOT NULL ENABLE,
							"VARIABLENAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
							"VALUE" VARCHAR2(4000 CHAR) NOT NULL ENABLE,
							"TASKINSTANCE_ID" NUMBER(19,0) NOT NULL ENABLE,
							CONSTRAINT "AM_HISTORICALTASKDATA_PK" PRIMARY KEY ("ID") ENABLE,
							CONSTRAINT "TASKINSTANCE_ID_FK" FOREIGN KEY ("TASKINSTANCE_ID")
								REFERENCES "ACTIVITYDB"."AM_TASKINSTANCE" ("ID") ENABLE
						)';

		execute immediate sql_statement;

	ELSE
		sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_HISTORICALTASKDATA"
									MODIFY
									(
										"ID" NUMBER(24,0)
									)';

		execute immediate sql_statement;
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
--  DDL for Table AM_PROCESSROUTE
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_PROCESSROUTE"
					(
						"ID" NUMBER(24,0) NOT NULL ENABLE,
						"PROCESSINSTANCEID" NUMBER(19,0) NOT NULL ENABLE,
						"FACILITY" VARCHAR2(7 CHAR),
						"TEAM" NUMBER(10,0),
						"TEAMFOCUS" NUMBER(10,0),
						"TEAMTYPE" NUMBER(10,0),
						"TEAMROLE" NUMBER(10,0),
						"USERID" VARCHAR2(255 CHAR),
						"PATIENTASSIGNMENT" NUMBER(1,0),
						CONSTRAINT "AM_PROCESSROUTE_PK" PRIMARY KEY ("ID") ENABLE,
						CONSTRAINT "PROCESSINSTANCE_ID_FK" FOREIGN KEY ("PROCESSINSTANCEID")
							REFERENCES "ACTIVITYDB"."AM_PROCESSINSTANCE" ("PROCESSINSTANCEID") ENABLE
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
P_COUNT NUMBER;
BEGIN

--------------------------------------------------------
--  DDL to drop procedure AM_CREATEPROCESSINSTANCE
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_CREATEPROCESSINSTANCE';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_CREATEPROCESSINSTANCE"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL to drop procedure AM_CREATEROUTES
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_CREATEROUTES';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_CREATEROUTES"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL for Procedure AM_CREATETASKINSTANCE
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_CREATETASKINSTANCE';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_CREATETASKINSTANCE"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCESSINSTANCESTATUS
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_UPDATEPROCESSINSTANCESTATUS';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCESSINSTANCESTATUS"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCESSINSTANCESTATE
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_UPDATEPROCESSINSTANCESTATE';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCESSINSTANCESTATE"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCINSSTATEDUEDATE
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_UPDATEPROCINSSTATEDUEDATE';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCINSSTATEDUEDATE"';
		execute immediate sql_statement;
    END IF;

--------------------------------------------------------
--  DDL for Procedure AM_UPDATETASKINSTANCESTATUS
--------------------------------------------------------
	SELECT COUNT(*) INTO P_COUNT FROM DBA_OBJECTS WHERE OWNER = 'ACTIVITYDB'
													AND OBJECT_TYPE = 'PROCEDURE'
													AND OBJECT_NAME = 'AM_UPDATETASKINSTANCESTATUS';
	IF P_COUNT <> 0
    THEN
    	sql_statement:='DROP PROCEDURE "ACTIVITYDB"."AM_UPDATETASKINSTANCESTATUS"';
		execute immediate sql_statement;
    END IF;

END;
/

-- Grant activitydb read to ehmp_rw_role
BEGIN

    FOR tName IN (SELECT TABLE_NAME FROM dba_tables WHERE OWNER = 'ACTIVITYDB')
    LOOP
    	EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ACTIVITYDB.' || tName.TABLE_NAME || ' TO ehmp_rw_role';
    END LOOP;

    EXCEPTION
       WHEN OTHERS
          THEN
                 DBMS_OUTPUT.put_line (SQLERRM);
                 DBMS_OUTPUT.put_line ('   ');
END;
/

BEGIN

    FOR sName IN (SELECT SEQUENCE_NAME FROM DBA_SEQUENCES WHERE SEQUENCE_OWNER = 'ACTIVITYDB')
    LOOP
    	EXECUTE IMMEDIATE 'GRANT SELECT ON ACTIVITYDB.' || sName.SEQUENCE_NAME || ' TO ehmp_rw_role';
    END LOOP;

    EXCEPTION
       WHEN OTHERS
          THEN
                 DBMS_OUTPUT.put_line (SQLERRM);
                 DBMS_OUTPUT.put_line ('   ');
END;
/

--------------------------------------------------------
--  DDL for Altering Sequence AM_SIMPLE_MATCH_ID_SEQ

--  This incrementing of the sequences is done to give more room for inserting 
--  test data before we start using the sequences

--  The idea is to change the "INCREMENT BY" to 100 and advance the count over 100
--  and change the "INCREMENT BY" back to 1 so that everytime the sequence is used
--  in the future, it will increment by only 1
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(2000);
T_COUNT NUMBER;
BEGIN
	T_COUNT := "ACTIVITYDB"."AM_SIMPLE_MATCH_ID_SEQ".nextval;
    
    IF T_COUNT < 100
    THEN
      	sql_statement:='ALTER SEQUENCE "ACTIVITYDB"."AM_SIMPLE_MATCH_ID_SEQ" INCREMENT BY 100';

      	execute immediate sql_statement;
        
		T_COUNT := "ACTIVITYDB"."AM_SIMPLE_MATCH_ID_SEQ".nextval;
    
    END IF;
	EXCEPTION
	    WHEN OTHERS THEN
	      IF SQLCODE = -1 THEN
	        NULL; -- suppresses ORA-00955 exception
	      ELSE
	         RAISE;
	      END IF;
END;
/

BEGIN
	execute immediate 'ALTER SEQUENCE "ACTIVITYDB"."AM_SIMPLE_MATCH_ID_SEQ" INCREMENT BY 1';
END;
/

--------------------------------------------------------
--  DDL for Altering Sequence AM_EVENTLISTENER_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(2000);
T_COUNT NUMBER;
BEGIN
	T_COUNT := "ACTIVITYDB"."AM_EVENTLISTENER_ID_SEQ".nextval;
  
  	IF T_COUNT < 100
    THEN
      	sql_statement:='ALTER SEQUENCE "ACTIVITYDB"."AM_EVENTLISTENER_ID_SEQ" INCREMENT BY 100';

      	execute immediate sql_statement;
        
		T_COUNT := "ACTIVITYDB"."AM_EVENTLISTENER_ID_SEQ".nextval;
    
    END IF;
	EXCEPTION
	    WHEN OTHERS THEN
	      IF SQLCODE = -1 THEN
	        NULL; -- suppresses ORA-00955 exception
	      ELSE
	         RAISE;
	      END IF;
END;
/

BEGIN
	execute immediate 'ALTER SEQUENCE "ACTIVITYDB"."AM_EVENTLISTENER_ID_SEQ" INCREMENT BY 1';
END;
/

--------------------------------------------------------
--  DDL for Altering Sequence AM_EVENT_MATCH_CRITERIA_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(2000);
T_COUNT NUMBER;
BEGIN
	T_COUNT := "ACTIVITYDB"."AM_EVENT_MATCH_CRITERIA_ID_SEQ".nextval;
    
    IF T_COUNT < 100
    THEN
      	sql_statement:='ALTER SEQUENCE "ACTIVITYDB"."AM_EVENT_MATCH_CRITERIA_ID_SEQ" INCREMENT BY 100';

      	execute immediate sql_statement;
        
		T_COUNT := "ACTIVITYDB"."AM_EVENT_MATCH_CRITERIA_ID_SEQ".nextval;
    
    END IF;
	EXCEPTION
	    WHEN OTHERS THEN
	      IF SQLCODE = -1 THEN
	        NULL; -- suppresses ORA-00955 exception
	      ELSE
	         RAISE;
	      END IF;
END;
/

BEGIN
	execute immediate 'ALTER SEQUENCE "ACTIVITYDB"."AM_EVENT_MATCH_CRITERIA_ID_SEQ" INCREMENT BY 1';
END;
/

--------------------------------------------------------
--  DDL for Altering Sequence AM_EVENT_MATCH_ACTION_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(2000);
T_COUNT NUMBER;
BEGIN
	T_COUNT := "ACTIVITYDB"."AM_EVENT_MATCH_ACTION_ID_SEQ".nextval;
    
    IF T_COUNT < 100
    THEN
      	sql_statement:='ALTER SEQUENCE "ACTIVITYDB"."AM_EVENT_MATCH_ACTION_ID_SEQ" INCREMENT BY 100';

      	execute immediate sql_statement;
        
		T_COUNT := "ACTIVITYDB"."AM_EVENT_MATCH_ACTION_ID_SEQ".nextval;
    
    END IF;
	EXCEPTION
	    WHEN OTHERS THEN
	      IF SQLCODE = -1 THEN
	        NULL; -- suppresses ORA-00955 exception
	      ELSE
	         RAISE;
	      END IF;
END;
/

BEGIN
	execute immediate 'ALTER SEQUENCE "ACTIVITYDB"."AM_EVENT_MATCH_ACTION_ID_SEQ" INCREMENT BY 1';
END;
/

COMMENT ON TABLE ACTIVITYDB.AM_PROCESSROUTE IS 'This table tracks process instance routing to users and teams'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.PROCESSINSTANCEID IS 'Identifies the process instance being routed. Link to AM_PROCESSINSTANCE table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.FACILITY IS 'Identifies the facility the process instance is routed to'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.TEAM IS 'Identifies the team the process instance is routed to. Link to PCMM.TEAM table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.TEAMFOCUS IS 'Identifies the team focus the process instance is routed to. Link to PCMM.TEAM table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.TEAMROLE IS 'Identifies the team role the process instance is routed to. Link to PCMM.TEAM table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.USERID IS 'Identifies the user the process instance is routed to. This a string "Site;IEN" like this SITE;10000000270'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.PATIENTASSIGNMENT IS 'Flag of 1 or 0 values where 1 indicates "true" that this process is routed to a team where the patient is assigned to, and 0 indicates "false" that patient and team do not have to be related'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.ID IS 'Unique identifier for the records in this table. Generated via ACTIVITYDB.AM_PROCESSROUTE_ID_SEQ'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.ID IS 'Unique identifier for the records in this table. Generated via sequence AM_SIGNAL_INSTANCE_ID_SEQ'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.NAME IS 'The name of the signal (e.g. "END")'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.ACTION IS 'The action of the signal (e.g. "Discontinue" or "Delete")'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.OWNER IS 'The id for the actual owner that completed the task'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.STATUSTIMESTAMP IS 'The time at which this signal was processed'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.HISTORY IS 'Text overview of what the signal did'
/

COMMENT ON COLUMN ACTIVITYDB.AM_SIGNALINSTANCE.PROCESSED_SIGNAL_ID IS 'Reference to PROCESSINSTANCEID in Am_ProcessInstance table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_TASKINSTANCE.PERMISSION IS 'Add task-level permissions (if they apply) to each task definition that dictates what ehmp permission set(s) are required'
/

COMMENT ON COLUMN ACTIVITYDB.AM_TASKINSTANCE.HISTORYACTION IS 'The action taken to complete this task'
/

COMMENT ON COLUMN ACTIVITYDB.PROCESSED_EVENT_STATE.ID IS 'Unique identifier for the records in this table. Generated via sequence AM_PRCSD_EVNT_STT_ID_SEQ'
/

COMMENT ON COLUMN ACTIVITYDB.PROCESSED_EVENT_STATE.DATA_LOCATION IS 'The matching field location'
/

COMMENT ON COLUMN ACTIVITYDB.PROCESSED_EVENT_STATE.VALUE IS 'The field value to match'
/

COMMENT ON COLUMN ACTIVITYDB.PROCESSED_EVENT_STATE.LISTENER_ID IS 'A foreign key to AM_EVENTLISTENER table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.PROCESSINSTANCEID IS 'The process instance id for the activity'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.ICN IS 'The patient icn identifier'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.PID IS 'The patient pid identifier'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.FACILITYID IS 'The facility identifier'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.PROCESSNAME IS 'The name of the process, eg. Order.Consult'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.DEPLOYMENTID IS 'The JBPM deployment Id for that process at the time the process intance was created'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.STATUSID IS 'The current status of the process instance, declared in AM_PROCESSSTATUSLOOKUP table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.STATUSTIMESTAMP IS 'The time stamp when the status was last updated'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.CREATEDBYID IS 'The id of the process creator'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.CLINICALOBJECTUID IS 'The unique identifier of this clinical object in JDS'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.ACTIVITYHEALTHY IS 'A flag of 0 or 1 that that shows if the activity is unhealthy or healthy respectively'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.ACTIVITYHEALTHDESCRIPTION IS 'A description of why the activity became unhealthy'
/

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.ASSIGNEDTO IS 'The user to whom this activity is assigned'
/

COMMENT ON COLUMN ACTIVITYDB.AM_EVENTLISTENER.EVENT_MTCH_ACTION_ID IS 'A foreign key reference to the EVENT_MTCH_ACTION table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_EVENTLISTENER.EVENT_MTCH_CRITERIA_ID IS 'A foreign key reference to the EVENT_MTCH_CRITERIA table'
/

COMMENT ON COLUMN ACTIVITYDB.AM_EVENTLISTENER.LISTENER_ID IS 'Unique identifier for the records in this table. Generated via sequence AM_PRCSD_EVNT_STT_ID_SEQ'
/

COMMENT ON COLUMN ACTIVITYDB.AM_EVENTLISTENER.EVENT_ACTION_SCOPE IS 'The scope of this event: "Instantiation" or "Signaling"'
/

COMMENT ON COLUMN ACTIVITYDB.AM_EVENTLISTENER.DESCRIPTION_ITEM IS 'Description of the event action'
/

COMMENT ON COLUMN ACTIVITYDB.AM_TASKINSTANCE.BEFORE_EARLIEST_DATE IS 'Flag of 1 or 0 values where 1 indicates "true" that the user can start the task before its earliest date, and 0 indicates "false" that the user can only start the task on or after its earliest date'
/

DECLARE
	matchCriteriaId NUMBER(20,0);
	matchActionId NUMBER(20,0);
	listenerId NUMBER(20,0);
	R_COUNT NUMBER;
	signalContent VARCHAR(2048);
	statusCode VARCHAR(2048);
BEGIN
  	signalContent := '{"param":{"objectType":"signalData", "message":"{{{objAsStr RAW_REQUEST}}}", "clinicalObjectUid":"{{uid}}", "referenceId":"{{referenceId}}", "ehmpState":"{{ehmpState}}", "authorUid":"{{authorUid}}", "orderStatusCode":"{{data.statusCode}}", "noResultNotificationDate":"{{ehmpData.pastDueDate}}", "pid":"{{data.pid}}", "facilityCode":"{{data.facilityCode}}", "providerUid":"{{data.providerUid}}", "labTestText":"{{ehmpData.labTestText}}", "name":"{{data.name}}", "urgency":"{{ehmpData.urgency}}"}}';
  	statusCode := 'urn:va:order-status:unr,urn:va:order-status:pend,urn:va:order-status:schd,urn:va:order-status:actv,urn:va:order-status:part';
  	SELECT COUNT(*) INTO R_COUNT FROM ACTIVITYDB.AM_EVENTLISTENER WHERE EVENT_ACTION_SCOPE = 'Instantiation' AND NAME = 'Lab Order Initiation';
  	IF R_COUNT = 0 THEN
		matchCriteriaId := ACTIVITYDB.AM_EVENT_MATCH_CRITERIA_ID_SEQ.NEXTVAL;
		INSERT INTO ACTIVITYDB.EVENT_MATCH_CRITERIA(ID) VALUES(matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'domain', 'ehmp-order', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'subDomain', 'laboratory', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'data.statusCode', statusCode, matchCriteriaId);

		matchActionId := ACTIVITYDB.AM_EVENT_MATCH_ACTION_ID_SEQ.NEXTVAL;

		INSERT INTO ACTIVITYDB.EVENT_MATCH_ACTION VALUES(matchActionId, signalContent, 'ORDER.INITIATED', 'Order.Lab', '1.0', NULL);
		INSERT INTO ACTIVITYDB.AM_EVENTLISTENER VALUES(ACTIVITYDB.AM_EVENTLISTENER_ID_SEQ.NEXTVAL, 'Instantiation', '1.0', 'Lab Order Management Signal - initiation signal', 'Lab Order Initiation', matchActionId, matchCriteriaId);
  	ELSE
	    SELECT LISTENER_ID INTO listenerId FROM ACTIVITYDB.AM_EVENTLISTENER WHERE EVENT_ACTION_SCOPE = 'Instantiation' AND NAME = 'Lab Order Initiation';
	    SELECT EVENT_MTCH_CRITERIA_ID INTO matchCriteriaId FROM ACTIVITYDB.AM_EVENTLISTENER WHERE LISTENER_ID = listenerId;

	    SELECT EVENT_MTCH_ACTION_ID INTO matchActionId FROM ACTIVITYDB.AM_EVENTLISTENER WHERE LISTENER_ID = listenerId;
	    UPDATE ACTIVITYDB.EVENT_MATCH_ACTION
	    	SET SIGNAL_CONTENT = signalContent
	    WHERE ID = matchActionId;

	    SELECT COUNT(*) INTO R_COUNT FROM ACTIVITYDB.SIMPLE_MATCH WHERE EVENT_MTCH_CRI_ID = matchCriteriaId AND MATCHFIELD = 'data.statusCode';
	    IF R_COUNT = 0 THEN
			INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'data.statusCode', statusCode, matchCriteriaId);
	    END IF;
	END IF;
END;
/

-------------------------------------------------------------------
-- Insert initial discharge follow-up activity match criteria and match action
-------------------------------------------------------------------
DECLARE matchCriteriaId NUMBER(20,0);
matchActionId NUMBER(20,0);
listenerId NUMBER(20,0);
D_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO D_COUNT FROM ACTIVITYDB.AM_EVENTLISTENER WHERE EVENT_ACTION_SCOPE = 'Instantiation' AND NAME = 'Discharge Follow Up Instantiation';
	IF D_COUNT = 0 THEN
		matchCriteriaId := ACTIVITYDB.AM_EVENT_MATCH_CRITERIA_ID_SEQ.NEXTVAL;
		INSERT INTO ACTIVITYDB.EVENT_MATCH_CRITERIA(ID) VALUES(matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'domain', 'ehmp-activity', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'subDomain', 'discharge', matchCriteriaId);
		INSERT INTO ACTIVITYDB.SIMPLE_MATCH(ID, MATCHFIELD, MATCHVALUE, EVENT_MTCH_CRI_ID) VALUES(ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ.NEXTVAL,'data.deceased', 'false', matchCriteriaId);

		matchActionId := ACTIVITYDB.AM_EVENT_MATCH_ACTION_ID_SEQ.NEXTVAL;

		INSERT INTO ACTIVITYDB.EVENT_MATCH_ACTION VALUES(matchActionId, NULL, NULL, 'Order.DischargeFollowup', '1.0', NULL);
		INSERT INTO ACTIVITYDB.AM_EVENTLISTENER VALUES(ACTIVITYDB.AM_EVENTLISTENER_ID_SEQ.NEXTVAL, 'Instantiation', '1.0', 'Discharge Follow Up Instantiation', 'Discharge Follow Up Instantiation', matchActionId, matchCriteriaId);
	END IF;
END;
/

DECLARE
  object_exists EXCEPTION;
  index_does_not_exist EXCEPTION;
  PRAGMA exception_init( object_exists, -955 );
  PRAGMA exception_init( index_does_not_exist, -1418 );
  PROCEDURE execute_ddl(ddl VARCHAR)
  IS
  BEGIN
    EXECUTE IMMEDIATE ddl;
    EXCEPTION
      WHEN object_exists THEN
        NULL;
      WHEN index_does_not_exist THEN
        NULL;
      WHEN OTHERS THEN
        DBMS_OUTPUT.put_line ('ERROR - ACTIVITYDB INDEXES');
        DBMS_OUTPUT.put_line (SQLERRM);
        RAISE;
  END;

BEGIN

	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_EL_EVENT_MTCH_CRITERIA_ID ON ACTIVITYDB.AM_EVENTLISTENER (EVENT_MTCH_CRITERIA_ID) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_EMA_EVENT_MTCH_INST_ID ON ACTIVITYDB.EVENT_MATCH_ACTION (EVENT_MTCH_INST_ID) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_SM_EVENT_MTCH_CRI_ID ON ACTIVITYDB.SIMPLE_MATCH (EVENT_MTCH_CRI_ID) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_SM_LOWER_MATCHFIELD ON ACTIVITYDB.SIMPLE_MATCH (LOWER(MATCHFIELD)) TABLESPACE "ACTIVITY_X"');
	execute_ddl('DROP INDEX ACTIVITYDB.IDX_SIMPLE_MATCH');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_SIMPLE_MATCHVALUE ON ACTIVITYDB.SIMPLE_MATCH_VALUE (MATCHVALUE) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_SIMPLE_MATCH_VALUE_ID ON ACTIVITYDB.SIMPLE_MATCH_VALUE (SIMPLE_MATCH_ID) TABLESPACE "ACTIVITY_X"');

	-------------------------------------------------------------------
	-- AM_PROCESSINTANCE INDEXES
	-------------------------------------------------------------------
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSINSTANCE_STATUSID ON ACTIVITYDB.AM_PROCESSINSTANCE (STATUSID) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSINSTANCE_DEFID ON ACTIVITYDB.AM_PROCESSINSTANCE (PROCESSDEFINITIONID) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSINSTANCE_CREATEDBY ON ACTIVITYDB.AM_PROCESSINSTANCE (CREATEDBYID) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSINSTANCE_ICN ON ACTIVITYDB.AM_PROCESSINSTANCE (ICN) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSINSTANCE_PID ON ACTIVITYDB.AM_PROCESSINSTANCE (PID) TABLESPACE ACTIVITY_X');
	-------------------------------------------------------------------
	-- AM_PROCESSROUTE INDEXES
	-------------------------------------------------------------------
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSROUTE_INSTANCEID ON ACTIVITYDB.AM_PROCESSROUTE (PROCESSINSTANCEID) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSROUTE_FACILITY ON ACTIVITYDB.AM_PROCESSROUTE (FACILITY) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSROUTE_TEAM ON ACTIVITYDB.AM_PROCESSROUTE (TEAM) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSROUTE_TEAMFOCUS ON ACTIVITYDB.AM_PROCESSROUTE (TEAMFOCUS) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_PROCESSROUTE_USERID ON ACTIVITYDB.AM_PROCESSROUTE (USERID) TABLESPACE ACTIVITY_X');
	-------------------------------------------------------------------
	-- AM_TASKINSTANCE INDEXES
	-------------------------------------------------------------------
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_ITEM ON ACTIVITYDB.AM_TASKINSTANCE (CONCAT(''ehmp:task:'', ID)) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_STATUSID ON ACTIVITYDB.Am_TaskInstance (STATUSID) TABLESPACE ACTIVITY_X');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINST_PROCESSINSTANCEID ON ACTIVITYDB.Am_TaskInstance (PROCESSINSTANCEID) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_ICN ON ACTIVITYDB.Am_TaskInstance (ICN) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_EARLIESTDATE ON ACTIVITYDB.AM_TASKINSTANCE (EARLIESTDATE) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_ACTUALOWNER ON ACTIVITYDB.AM_TASKINSTANCE (ACTUALOWNER, 1) TABLESPACE "ACTIVITY_X"');
	-------------------------------------------------------------------
	-- AM_TASKROUTE INDEXES
	-------------------------------------------------------------------
	execute_ddl('DROP INDEX ACTIVITYDB.IDX_TASKROUTE_TEAM');
	execute_ddl('DROP INDEX ACTIVITYDB.IDX_TASKROUTE_FACILITY');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_TASKROUTE_TASKINSTANCEID ON ACTIVITYDB.Am_TaskRoute (TASKINSTANCEID) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_TEAM ON ACTIVITYDB.AM_TASKROUTE (TEAM, 1) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_FACILITY ON ACTIVITYDB.AM_TASKROUTE (FACILITY, 1) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_TEAMFOCUS ON ACTIVITYDB.AM_TASKROUTE (TEAMFOCUS, 1) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_TEAMTYPE ON ACTIVITYDB.AM_TASKROUTE (TEAMTYPE, 1) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_TEAMROLE ON ACTIVITYDB.AM_TASKROUTE (TEAMROLE, 1) TABLESPACE "ACTIVITY_X"');
	execute_ddl('CREATE INDEX ACTIVITYDB.IDX_AM_TASKROUTE_USERID ON ACTIVITYDB.AM_TASKROUTE (USERID, 1) TABLESPACE "ACTIVITY_X"');

END;
/

DECLARE
  object_exists EXCEPTION;
  PRAGMA exception_init( object_exists, -955 );
  PROCEDURE execute_ddl(ddl VARCHAR)
  IS
  BEGIN
    EXECUTE IMMEDIATE ddl;
    EXCEPTION
      WHEN object_exists THEN
        NULL;
      WHEN OTHERS THEN
        DBMS_OUTPUT.put_line ('ERROR - ACTIVITYDB DATAMODEL OBJECTS');
        DBMS_OUTPUT.put_line (SQLERRM);
        RAISE;
  END;

BEGIN

  execute_ddl('
  	CREATE SEQUENCE ACTIVITYDB.DATA_MODEL_INSTANCE_SEQ  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER NOCYCLE
  ');

  execute_ddl('
  	CREATE SEQUENCE ACTIVITYDB.DATA_MODEL_OBJECT_SEQ  MINVALUE 1 NOMAXVALUE INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER NOCYCLE
  ');

  execute_ddl('
    CREATE TABLE ACTIVITYDB.DATA_MODEL_INSTANCE
	(
		DATA_MODEL_INSTANCE_ID NUMBER(19,0) NOT NULL,
		PROCESSINSTANCEID NUMBER(19,0) NOT NULL,
		KEY VARCHAR2(255) NOT NULL,
		VALUE VARCHAR2(4000),
		CONSTRAINT DATA_MODEL_INSTANCE_PK PRIMARY KEY (DATA_MODEL_INSTANCE_ID) USING INDEX TABLESPACE "ACTIVITY_X",
		CONSTRAINT DATA_MODEL_INST_PROCESSINST_FK FOREIGN KEY (PROCESSINSTANCEID)
		REFERENCES ACTIVITYDB.AM_PROCESSINSTANCE (PROCESSINSTANCEID)
	)
  ');

  execute_ddl('
    CREATE INDEX ACTIVITYDB.DATA_MODEL_INST_PROCINSTID_I ON ACTIVITYDB.DATA_MODEL_INSTANCE ("PROCESSINSTANCEID")
    TABLESPACE "ACTIVITY_X"
  ');

  execute_ddl('
    CREATE INDEX ACTIVITYDB.DATA_MODEL_INST_KEY_I ON ACTIVITYDB.DATA_MODEL_INSTANCE ("KEY")
    TABLESPACE "ACTIVITY_X"
  ');

  execute_ddl('
    CREATE INDEX ACTIVITYDB.DATA_MODEL_INST_VALUE_I ON ACTIVITYDB.DATA_MODEL_INSTANCE ("VALUE")
    TABLESPACE "ACTIVITY_X"
  ');

  execute_ddl('
    CREATE TABLE ACTIVITYDB.DATA_MODEL_OBJECT
	(	DATA_MODEL_OBJECT_ID NUMBER(19,0) NOT NULL,
		PROCESSINSTANCEID NUMBER(19,0) NOT NULL,
		DATA_MODEL_OBJECT CLOB NOT NULL,
		CONSTRAINT DATA_MODEL_OBJECT_PK PRIMARY KEY (DATA_MODEL_OBJECT_ID) USING INDEX TABLESPACE "ACTIVITY_X",
		CONSTRAINT DATA_MODEL_OBJ_PROCESSINST_FK FOREIGN KEY (PROCESSINSTANCEID)
		REFERENCES ACTIVITYDB.AM_PROCESSINSTANCE (PROCESSINSTANCEID)
	)
  ');

  execute_ddl('
    CREATE INDEX ACTIVITYDB.DATA_MODEL_OBJ_PROCINSTID_I ON ACTIVITYDB.DATA_MODEL_OBJECT ("PROCESSINSTANCEID")
    TABLESPACE "ACTIVITY_X"
  ');

  execute_ddl('
    CREATE TABLE ACTIVITYDB.DATA_MODEL_KEYS
	(
		PROCESS_DEFINITION_ID VARCHAR2(255) NOT NULL,
		KEY VARCHAR2(255) NOT NULL,
		CONSTRAINT DATA_MODEL_KEYS_PK PRIMARY KEY (KEY, PROCESS_DEFINITION_ID) USING INDEX TABLESPACE "ACTIVITY_X"
	)
  ');

END;
/

COMMENT ON TABLE ACTIVITYDB.DATA_MODEL_INSTANCE IS 'This table tracks indexed keys from the activity json for filtering and sorting.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_INSTANCE.DATA_MODEL_INSTANCE_ID IS 'Unique identifier for the records in this table. Generated via ACTIVITYDB.DATA_MODEL_INSTANCE_SEQ.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_INSTANCE.PROCESSINSTANCEID IS 'Identifies the process instance of the indexed activity data. Link to AM_PROCESSINSTANCE table'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_INSTANCE.KEY IS 'Key of the indexed activity data field.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_INSTANCE.VALUE IS 'Value of the indexed activity data field.'
/

COMMENT ON TABLE ACTIVITYDB.DATA_MODEL_OBJECT IS 'This table tracks the latest activity json of a process instance.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_OBJECT.DATA_MODEL_OBJECT_ID IS 'Unique identifier for the records in this table. Generated via ACTIVITYDB.DATA_MODEL_OBJECT_SEQ.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_OBJECT.PROCESSINSTANCEID IS 'Identifies the process instance of the activity data. Link to AM_PROCESSINSTANCE table'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_OBJECT.DATA_MODEL_OBJECT IS 'Value of the latest activity json of the process instance.'
/

COMMENT ON TABLE ACTIVITYDB.DATA_MODEL_KEYS IS 'This table tracks the keys to be indexed by process definition id.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_KEYS.PROCESS_DEFINITION_ID IS 'Identifies the process definition id of the index key.'
/

COMMENT ON COLUMN ACTIVITYDB.DATA_MODEL_KEYS.KEY IS 'Key to be indexed for the process definition id.'
/

CREATE OR REPLACE TYPE "ACTIVITYDB"."VARCHAR2_LIST" AS TABLE OF VARCHAR2(32767);
/

--------------------------------------------------------
--  Define index keys for each process definition
--------------------------------------------------------

DECLARE
  TYPE KEYS_ARRAY IS TABLE OF VARCHAR2(100);
  TYPE DEFINITION_ARRAY IS TABLE OF KEYS_ARRAY INDEX BY VARCHAR2(100);
  a_definitions DEFINITION_ARRAY;
  i_definition VARCHAR2(100);
BEGIN

  a_definitions('Order.DischargeFollowup') := KEYS_ARRAY(
  	'activity.state',
  	'activity.patientName',
  	'activity.activityHealthy',
  	'contact.attempts',
  	'discharge.date',
  	'discharge.dateTime',
  	'discharge.disposition',
  	'discharge.primaryCarePhysicianNameAtDischarge',
  	'discharge.primaryCareTeamAtDischarge',
  	'discharge.fromFacilityId',
  	'discharge.fromFacilityDescription'
  );

  i_definition := a_definitions.first;

  WHILE i_definition IS NOT NULL LOOP
  	DELETE FROM activitydb.data_model_keys WHERE process_definition_id = i_definition;
  	FOR i_key IN a_definitions(i_definition).FIRST..a_definitions(i_definition).LAST LOOP
  		INSERT INTO activitydb.data_model_keys VALUES (i_definition, a_definitions(i_definition)(i_key));
	END LOOP;
    i_definition := a_definitions.next(i_definition);
  END LOOP;
  COMMIT;
END;
/

--------------------------------------------------------
--  Populate new date field from dateTime
--------------------------------------------------------
BEGIN
    INSERT INTO activitydb.data_model_instance (data_model_instance_id, processinstanceid, key, value)
    SELECT activitydb.data_model_instance_seq.nextval, dmi.processinstanceid, 'discharge.date', substr(dmi.value, 1, 8)
    FROM activitydb.data_model_instance dmi
    WHERE key = 'discharge.dateTime' and NOT EXISTS (
        SELECT null FROM activitydb.data_model_instance dmidate WHERE dmidate.processinstanceid = dmi.processinstanceid and dmidate.key = 'discharge.date'
        );
    COMMIT;
END;
/

--------------------------------------------------------
--  DDL for Package DATA_MODEL_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE ACTIVITYDB.DATA_MODEL_API AS
  TYPE VARCHAR2_ARRAY IS TABLE OF VARCHAR2(1000) INDEX BY BINARY_INTEGER;
  PROCEDURE insert_key_value(
  	  i_processinstanceid NUMBER,
  	  i_key VARCHAR2,
  	  i_value VARCHAR2
  );
  PROCEDURE clear_data_model_instance(
  	  i_processinstanceid NUMBER
  );
  PROCEDURE save_data_model(
      i_process_instance_id     NUMBER,
      i_process_definition_id	VARCHAR2,
      i_data_model_object     	CLOB
  );
  PROCEDURE fetch_data_model(
  	  i_processinstanceid 	  NUMBER DEFAULT NULL,
  	  i_mode 			      VARCHAR2,
      i_initiated_by	      VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_facility_route        VARCHAR2 DEFAULT NULL,
      i_team_routes			  VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_pid                   VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_start			      NUMBER DEFAULT 1,
      i_limit			      NUMBER DEFAULT 100,
      i_primary_sort_by	      VARCHAR2 DEFAULT NULL,
      i_primary_sort_dir	  VARCHAR2 DEFAULT 'ASC',
      i_secondary_sort_by     VARCHAR2 DEFAULT NULL,
      i_secondary_sort_dir	  VARCHAR2 DEFAULT 'ASC',
      i_filter_text		      VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_process_definition_id VARCHAR2 DEFAULT NULL,
      i_flagged				  VARCHAR2 DEFAULT 'N',
      i_return_activity_json  VARCHAR2 DEFAULT 'N',
      i_route_type			  VARCHAR2 DEFAULT 'PCMM', --PCMM or PROCESS
      o_exception			  OUT VARCHAR2,
  	  o_recordset             OUT SYS_REFCURSOR
  );
  PROCEDURE fetch_data_model_keys(
  	i_process_definition_id VARCHAR2 DEFAULT NULL,
  	o_recordset				OUT SYS_REFCURSOR);
  FUNCTION array_to_table(i_array VARCHAR2_ARRAY) RETURN VARCHAR2_LIST;
END DATA_MODEL_API;
/

--------------------------------------------------------
--  DDL for Package Body DATA_MODEL_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE BODY ACTIVITYDB.DATA_MODEL_API
AS

  PROCEDURE insert_key_value(
  	  i_processinstanceid NUMBER,
  	  i_key VARCHAR2,
  	  i_value VARCHAR2
  )
  AS
  BEGIN
  	IF i_value IS NOT NULL THEN
      INSERT INTO activitydb.data_model_instance (data_model_instance_id, processinstanceid, key, value)
      VALUES (data_model_instance_seq.nextval, i_processinstanceid, i_key, i_value);
    END IF;
  END;

  PROCEDURE clear_data_model_instance(
  	  i_processinstanceid NUMBER
  )
  AS
  BEGIN
      DELETE FROM activitydb.data_model_instance
      WHERE processinstanceid = i_processinstanceid;
  END;

  PROCEDURE save_data_model(
      i_process_instance_id     NUMBER,
      i_process_definition_id	VARCHAR2,
      i_data_model_object     	CLOB
  )
  AS
      v_key varchar2(1000);
      v_key_value varchar2(4000);
  BEGIN

  	MERGE INTO activitydb.data_model_object o USING dual ON (o.processinstanceid = i_process_instance_id)
  	WHEN MATCHED THEN
  		UPDATE SET data_model_object = i_data_model_object
  	WHEN NOT MATCHED THEN
  		INSERT (processinstanceid, data_model_object_id, data_model_object)
  		VALUES (i_process_instance_id, activitydb.data_model_object_seq.nextval, i_data_model_object);

 	clear_data_model_instance(i_process_instance_id);

 	APEX_JSON.parse(i_data_model_object);

 	FOR keys IN (SELECT key FROM activitydb.data_model_keys WHERE process_definition_id = i_process_definition_id)
  	LOOP
  		v_key := keys.key;
    	v_key_value := APEX_JSON.get_varchar2(p_path => v_key);
		insert_key_value(i_process_instance_id, v_key, v_key_value);
  	END LOOP keys;

  END;

  PROCEDURE fetch_data_model(
  	  i_processinstanceid 	  NUMBER DEFAULT NULL,
  	  i_mode 			      VARCHAR2,
      i_initiated_by	      VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_facility_route        VARCHAR2 DEFAULT NULL,
      i_team_routes        	  VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_pid                   VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_start			      NUMBER DEFAULT 1,
      i_limit			      NUMBER DEFAULT 100,
      i_primary_sort_by	      VARCHAR2 DEFAULT NULL,
      i_primary_sort_dir	  VARCHAR2 DEFAULT 'ASC',
      i_secondary_sort_by     VARCHAR2 DEFAULT NULL,
      i_secondary_sort_dir	  VARCHAR2 DEFAULT 'ASC',
      i_filter_text		      VARCHAR2_ARRAY DEFAULT CAST(null as VARCHAR2_ARRAY),
      i_process_definition_id VARCHAR2 DEFAULT NULL,
      i_flagged				  VARCHAR2 DEFAULT 'N',
      i_return_activity_json  VARCHAR2 DEFAULT 'N',
      i_route_type			  VARCHAR2 DEFAULT 'PCMM', --PCMM or PROCESS
      o_exception			  OUT VARCHAR2,
  	  o_recordset             OUT SYS_REFCURSOR
  )
  AS
  	v_sql 			varchar2(32767);
  	v_max_rownum 	number := i_start + i_limit - 1;
  	v_filter_idx    varchar2(4000);
  	v_filter_term	varchar2(4000);
  	v_key_count		number;
  	v_sort_dir		varchar2(50);
  BEGIN

  	  IF i_primary_sort_by IS NOT NULL THEN
  	  	SELECT count(*) INTO v_key_count
  	  	FROM activitydb.data_model_keys
  	  	WHERE process_definition_id = i_process_definition_id and key = i_primary_sort_by;
  	  	IF v_key_count = 0 THEN
  	  	  o_exception := 'INVALID_PRIMARY_SORT_KEY';
  	  	END IF;
  	  END IF;

  	  IF i_secondary_sort_by IS NOT NULL THEN
  	  	SELECT count(*) INTO v_key_count
  	  	FROM activitydb.data_model_keys
  	  	WHERE process_definition_id = i_process_definition_id and key = i_secondary_sort_by;
  	  	IF v_key_count = 0 THEN
  	  	  o_exception := 'INVALID_SECONDARY_SORT_KEY';
  	  	END IF;
  	  END IF;

      IF o_exception IS NOT NULL THEN
        OPEN o_recordset FOR
        SELECT * FROM dual WHERE 1 = 2;
        return;
      END IF;

  	  v_sql := 'SELECT * FROM
      (
	      SELECT activityresult.*, rownum rn
	      FROM
	      (
	      	  SELECT
	      	  pi.activityhealthdescription as "activityhealthdescription",
	      	  pi.destinationfacilityid as "assignedtofacilityid",
	      	  pi.assignedto as "assignedtoid",
	      	  pi.facilityid as "createdatid",
	      	  pi.createdbyid as "createdbyid",
	      	  pi.initiationdate as "createdon",
	      	  TO_CHAR(pi.INITIATIONDATE, ''yyyymmddhhmi'') as "createdonformatted",
	      	  pi.deploymentid as "deploymentid",
	      	  pi.domain as "domain",
	      	  pi.instancename "instancename",
	      	  NULL as "intendedfor",
	      	  pi.activityhealthy as "isactivityhealthy",
	      	  INITCAP(psl.status_mode) "mode",
	      	  pi.processname as "name",
	      	  nvl(pi.pid, pi.icn) as "pid",
	      	  pi.icn as "icn",
	      	  pi.processinstanceid as "processid",
	      	  pi.statusid as "status",
	      	  pi.state as "activitystate",
	      	  pi.assignedto as "routingcode",
	      	  pi.urgency as "urgency",
	      	  ppc.staff_ien as "pcpid",
	      	  ppc.staff_last_name as "staff_last_name",
	      	  ppc.staff_first_name as "staff_first_name",
	      	  ppc.staff_middle_name as "staff_middle_name",
	      	  ppc.team_name as "pcteam"';
	      	  IF i_return_activity_json = 'Y' THEN
	      	  	v_sql := CONCAT(v_sql,',
	      	  	dmo.data_model_object as "activityjson"');
	      	  ELSE
	      	  	v_sql := CONCAT(v_sql,',
	      	  	NULL as "activityjson"');
	      	  END IF;
	      	  v_sql := CONCAT(v_sql,'
	       	  FROM activitydb.am_processinstance pi
              JOIN activitydb.am_processstatuslookup psl ON pi.statusid = psl.id ');

			  IF i_primary_sort_by IS NOT NULL THEN
			  	v_sql := CONCAT(v_sql, 'LEFT JOIN activitydb.data_model_instance primarysort ON primarysort.processinstanceid = pi.processinstanceid and primarysort.key = ' || SYS.DBMS_ASSERT.enquote_literal(i_primary_sort_by) || ' ');
			  END IF;

			  IF i_secondary_sort_by IS NOT NULL THEN
			  	v_sql := CONCAT(v_sql, 'LEFT JOIN activitydb.data_model_instance secondarysort ON secondarysort.processinstanceid = pi.processinstanceid and secondarysort.key = ' || SYS.DBMS_ASSERT.enquote_literal(i_secondary_sort_by) || ' ');
			  END IF;

			  IF i_return_activity_json = 'Y' THEN
				v_sql := CONCAT(v_sql, 'LEFT JOIN activitydb.data_model_object dmo ON dmo.processinstanceid = pi.processinstanceid ');
			  END IF;

			  IF i_route_type != 'PCMM' THEN
			  	v_sql := CONCAT(v_sql, 'LEFT ');
			  END IF;
			  v_sql := CONCAT(v_sql, 'JOIN pcmm.patient_primary_care ppc ON pi.icn LIKE ppc.base_icn || ''%'' ');

			  v_sql := CONCAT(v_sql, '
              WHERE (pi.STATE != ''Draft'' OR pi.STATE IS NULL) AND ');

              IF i_processinstanceid IS NOT NULL THEN
              	v_sql := CONCAT(v_sql, 'pi.processinstanceid = :i_processinstanceid AND ');
              ELSE
              	v_sql := CONCAT(v_sql, '(1 = 1 OR :i_processinstanceid IS NULL) AND ');
              END IF;

		      IF nvl(lower(i_mode), 'all') != 'all' THEN
		        v_sql := CONCAT(v_sql, 'psl.status_mode = lower(:i_mode) AND ');
		      ELSE
		        v_sql := CONCAT(v_sql, '(1 = 1 OR :i_mode IS NULL) AND ');
		      END IF;

		      IF i_initiated_by.count > 0 THEN
		      	v_sql := CONCAT(v_sql, 'pi.createdbyid IN (SELECT column_value FROM TABLE(:i_initiated_by)) AND ');
		      ELSE
		      	v_sql := CONCAT(v_sql, '(1 = 1 OR (SELECT count(*) FROM TABLE(:i_initiated_by)) = 0) AND ');
		      END IF;

		      IF i_pid.count > 0 THEN
		      	v_sql := CONCAT(v_sql, 'pi.pid IN (SELECT column_value FROM TABLE(:i_pid)) AND ');
		      ELSE
		      	v_sql := CONCAT(v_sql, '(1 = 1 OR (SELECT count(*) FROM TABLE(:i_pid)) = 0) AND ');
		      END IF;

		      IF nvl(i_process_definition_id, 'none') != 'none' THEN
		        v_sql := CONCAT(v_sql, 'pi.processdefinitionid = :i_process_definition_id AND ');
		      ELSE
		        v_sql := CONCAT(v_sql, '(1 = 1 OR :i_process_definition_id IS NULL) AND ');
		      END IF;

		      IF i_flagged = 'Y' THEN
		        v_sql := CONCAT(v_sql, 'pi.activityhealthy = ''0'' AND ');
		      END IF;

		      IF i_facility_route IS NOT NULL OR i_team_routes.count > 0 THEN

		      	IF i_route_type = 'PCMM' THEN
			      	IF i_facility_route IS NOT NULL THEN
			      		v_sql := CONCAT(v_sql, 'ppc.team_station_number IN (SELECT division_id FROM ehmp.ehmp_divisions WHERE site_code = :i_facility_route) AND ');
			      	ELSE
			      		v_sql := CONCAT(v_sql, '(1 = 1 OR :i_facility_route IS NULL) AND ');
			      	END IF;

			      	IF i_team_routes.count > 0 THEN
			      		v_sql := CONCAT(v_sql, 'ppc.team_id IN (SELECT column_value FROM TABLE(:i_team_routes)) AND ');
			      	ELSE
			      		v_sql := CONCAT(v_sql, '(1 = 1 OR (SELECT count(*) FROM TABLE(:i_team_routes)) = 0) AND ');
			      	END IF;
			    ELSE
			      	v_sql := CONCAT(v_sql, 'EXISTS (SELECT 1
			      									FROM activitydb.am_processroute pr
			      									WHERE pr.processinstanceid = pi.processinstanceid AND ');
			      	IF i_facility_route IS NOT NULL THEN
			      		v_sql := CONCAT(v_sql, 'pr.facility = :i_facility_route AND ');
			      	ELSE
			      		v_sql := CONCAT(v_sql, '(1 = 1 OR :i_facility_route IS NULL) AND ');
			      	END IF;

			      	IF i_team_routes.count > 0 THEN
			      		v_sql := CONCAT(v_sql, 'pr.team IN (SELECT column_value FROM TABLE(:i_team_routes))');
			      	ELSE
			      		v_sql := CONCAT(v_sql, '(1 = 1 OR (SELECT count(*) FROM TABLE(:i_team_routes)) = 0)');
			      	END IF;

			      	v_sql := CONCAT(v_sql, ') AND ');
			    END IF;

		      ELSE
		      	v_sql := CONCAT(v_sql, '(1 = 1 OR :i_facility_route IS NULL OR (SELECT count(*) FROM TABLE(:i_team_routes)) = 0) AND ');
		      END IF;

		      IF i_filter_text.count > 0 THEN
		      	v_sql := CONCAT(v_sql, 'EXISTS(SELECT null 
		      								   FROM activitydb.data_model_instance dmi 
		      								   WHERE dmi.processinstanceid = pi.processinstanceid AND 
		      								   EXISTS (SELECT null FROM TABLE(:i_filter_text) f
		      								   		   WHERE dmi.value LIKE concat(concat(''%'', f.column_value), ''%'')
		      								  		  )
		      								  ) ');
			  ELSE
			  	v_sql := CONCAT(v_sql, '(1 = 1 OR (SELECT count(*) FROM TABLE(:i_filter_text)) = 0) ');
		      END IF;

		      v_sql := CONCAT(v_sql, 'ORDER BY ');

		      IF i_primary_sort_by IS NOT NULL THEN
		      	SELECT DECODE(UPPER(i_primary_sort_dir), 'DESC', 'DESC NULLS LAST', 'ASC NULLS FIRST') INTO v_sort_dir FROM dual;
		      	v_sql := CONCAT(v_sql, 'upper(primarysort.value) ' || v_sort_dir || ', ');
		      END IF;

		      IF i_secondary_sort_by IS NOT NULL THEN
		      	SELECT DECODE(UPPER(i_secondary_sort_dir), 'DESC', 'DESC NULLS LAST', 'ASC NULLS FIRST') INTO v_sort_dir FROM dual;
		      	v_sql := CONCAT(v_sql, 'upper(secondarysort.value) ' || v_sort_dir || ', ');
		      END IF;

              v_sql := CONCAT(v_sql, '"createdon"');

          v_sql := CONCAT(v_sql, '
	      ) activityresult
	      WHERE rownum <= :v_max_rownum
	  )
	  WHERE rn >= :i_start');

      OPEN o_recordset FOR
      v_sql
      USING i_processinstanceid, i_mode, array_to_table(i_initiated_by), array_to_table(i_pid), i_process_definition_id, i_facility_route, array_to_table(i_team_routes), array_to_table(i_filter_text), v_max_rownum, i_start;

  END;

  PROCEDURE fetch_data_model_keys(
  	i_process_definition_id VARCHAR2 DEFAULT NULL,
  	o_recordset				OUT SYS_REFCURSOR)
  AS
  BEGIN
  	OPEN o_recordset FOR
  	SELECT key FROM activitydb.data_model_keys
  	WHERE process_definition_id = i_process_definition_id;
  END;
  /* NOTE: This PL/SQL type to SQL type conversion is no longer needed in 12c.  
  		   12c supports TABLE() functions on PL/SQL type associative arrays. 
  */
  FUNCTION array_to_table(i_array VARCHAR2_ARRAY) RETURN VARCHAR2_LIST as
    l_index pls_integer := i_array.first;
    l_tab VARCHAR2_LIST := VARCHAR2_LIST();
  BEGIN
    WHILE l_index IS NOT NULL LOOP
            l_tab.extend;
            l_tab(l_tab.last) := i_array(l_index);
            l_index := i_array.next(l_index);
    END LOOP;
    RETURN l_tab;
  END;

END DATA_MODEL_API;
/

--------------------------------------------------------
--  DDL for Package Grants
--------------------------------------------------------

GRANT EXECUTE ON ACTIVITYDB.DATA_MODEL_API TO ehmp_rw_role;
/
