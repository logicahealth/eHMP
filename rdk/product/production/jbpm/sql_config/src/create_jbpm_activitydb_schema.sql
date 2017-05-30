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
    END IF;

	sql_statement:='ALTER TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE" MODIFY "ASSIGNEDTO" VARCHAR2(2000 CHAR)';
	execute immediate sql_statement;

	EXCEPTION
	    WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING TABLE ACTIVITYDB.AM_PROCESSINSTANCE '||SQLCODE||SQLERRM);
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

--------------------------------------------------------
--  DDL for Table SIMPLE_MATCH
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."SIMPLE_MATCH" 
				   (	
            			"ID" NUMBER(20,0) NOT NULL ENABLE, 
						"MATCHFIELD" VARCHAR2(255 CHAR), 
						"MATCHVALUE" VARCHAR2(255 CHAR), 
            			"EVENT_MTCH_CRI_ID" NUMBER(20,0), 
					 	CONSTRAINT "SIMPLE_MATCH_PK" PRIMARY KEY ("ID"),
            			CONSTRAINT "SIMPL_MTCH_EVNT_MATCH_CRI_0_FK" FOREIGN KEY ("EVENT_MTCH_CRI_ID")
            				REFERENCES "ACTIVITYDB"."EVENT_MATCH_CRITERIA" ("ID") ENABLE
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

-- Create a USER with only SELECT permissions for RDK.
DECLARE
    u_count number;
    user_name VARCHAR2 (50);

BEGIN
    u_count :=0;
    user_name := 'activitydbuser';

    SELECT COUNT (1) INTO u_count FROM dba_users WHERE username = UPPER (user_name);

    IF u_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER '||user_name||' IDENTIFIED BY activitydb$11';
    END IF;

 	u_count := 0;

    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO '||user_name||' ';
    EXECUTE IMMEDIATE 'GRANT CREATE PROCEDURE TO '||user_name||' ';
    EXECUTE IMMEDIATE 'GRANT CREATE TYPE TO '||user_name||' ';
    EXECUTE IMMEDIATE 'GRANT EXECUTE ON SYS.DBMS_LOB TO '||user_name||' ';

    FOR tName IN (SELECT TABLE_NAME FROM dba_tables WHERE OWNER = 'ACTIVITYDB')
    LOOP
    	EXECUTE IMMEDIATE 'GRANT SELECT ON ACTIVITYDB.' || tName.TABLE_NAME || ' TO '||user_name||' ';
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

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSROUTE.USERID IS 'Identifies the user the process instance is routed to. This a string "Site;IEN" like this 9E7A;10000000270'
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

COMMENT ON COLUMN ACTIVITYDB.AM_PROCESSINSTANCE.ICN IS 'The patient identifier'
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

DECLARE matchCriteriaId NUMBER(20,0);
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
-- DDL for Index IDX_TASKINSTANCE_STATUSID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_STATUSID ON ACTIVITYDB.Am_TaskInstance (STATUSID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKINST_PROCESSINSTANCEID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKINST_PROCESSINSTANCEID ON ACTIVITYDB.Am_TaskInstance (PROCESSINSTANCEID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKINSTANCE_ICN
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_ICN ON ACTIVITYDB.Am_TaskInstance (ICN)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKINSTANCE_EARLIESTDATE
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKINSTANCE_EARLIESTDATE ON ACTIVITYDB.AM_TASKINSTANCE (EARLIESTDATE)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKROUTE_TASKINSTANCEID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKROUTE_TASKINSTANCEID ON ACTIVITYDB.Am_TaskRoute (TASKINSTANCEID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKROUTE_TEAM
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKROUTE_TEAM ON ACTIVITYDB.AM_TASKROUTE (TEAM)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_TASKROUTE_FACILITY
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_TASKROUTE_FACILITY ON ACTIVITYDB.AM_TASKROUTE (FACILITY)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_EL_EVENT_MTCH_CRITERIA_ID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_EL_EVENT_MTCH_CRITERIA_ID ON ACTIVITYDB.AM_EVENTLISTENER (EVENT_MTCH_CRITERIA_ID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_EMA_EVENT_MTCH_INST_ID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_EMA_EVENT_MTCH_INST_ID ON ACTIVITYDB.EVENT_MATCH_ACTION (EVENT_MTCH_INST_ID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_SM_EVENT_MTCH_CRI_ID
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_SM_EVENT_MTCH_CRI_ID ON ACTIVITYDB.SIMPLE_MATCH (EVENT_MTCH_CRI_ID)';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL for Index IDX_SM_LOWER_MATCHFIELD
-------------------------------------------------------------------
DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := 'CREATE INDEX ACTIVITYDB.IDX_SM_LOWER_MATCHFIELD ON ACTIVITYDB.SIMPLE_MATCH (LOWER(MATCHFIELD))';
  EXECUTE IMMEDIATE sql_statement;

  EXCEPTION
	WHEN OTHERS THEN
	  IF SQLCODE = -955 THEN
	    NULL; -- suppresses ORA-00955 exception
	  ELSE
	    RAISE;
	  END IF;
END;
/
-------------------------------------------------------------------
-- DDL to drop Index IDX_MATCH_VALUE
-------------------------------------------------------------------
BEGIN
  FOR idx IN (SELECT INDEX_NAME, OWNER FROM ALL_INDEXES WHERE TABLE_OWNER = 'ACTIVITYDB' and INDEX_NAME = 'IDX_SIMPLE_MATCH')
  LOOP
    EXECUTE IMMEDIATE 'DROP INDEX ' || idx.OWNER || '.' || idx.INDEX_NAME;
  END LOOP;

  EXCEPTION
  	WHEN OTHERS THEN
    IF SQLCODE = -955 THEN
      NULL; -- suppresses ORA-00955 exception
    ELSE
      RAISE;
    END IF;
END;
/
