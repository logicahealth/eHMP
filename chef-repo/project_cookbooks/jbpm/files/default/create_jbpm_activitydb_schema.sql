DECLARE
        u_count number;
        user_name VARCHAR2 (50);
        password VARCHAR(32);

    BEGIN
        u_count :=0;
        user_name := 'ACTIVITYDB';

        SELECT COUNT (1) INTO u_count FROM dba_users WHERE username = UPPER (user_name);

         IF u_count = 0
         THEN
            password := 'activitydb';
            EXECUTE IMMEDIATE 'CREATE USER '||user_name||' IDENTIFIED BY '||password||' ';
            EXECUTE IMMEDIATE 'GRANT "DBA" TO '||user_name||'';
            EXECUTE IMMEDIATE 'GRANT "CONNECT" TO '||user_name||'';
            EXECUTE IMMEDIATE 'GRANT "RESOURCE" TO '||user_name||'' ;

          END IF;

          u_count := 0;

        EXCEPTION
           WHEN OTHERS
              THEN
                     DBMS_OUTPUT.put_line (SQLERRM);
                     DBMS_OUTPUT.put_line ('   ');

    END;

/

--------------------------------------------------------
--  DDL for Sequence AM_TASKROUTE_ID_SEQ
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(512);
BEGIN

	sql_statement:='CREATE SEQUENCE  "ACTIVITYDB"."AM_TASKROUTE_ID_SEQ"  MINVALUE 1 MAXVALUE 999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE';
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
DECLARE sql_statement VARCHAR2(1024);
T_COUNT NUMBER;
C_COUNT NUMBER;
BEGIN
	SELECT COUNT(*) INTO T_COUNT FROM DBA_TABLES WHERE OWNER = 'ACTIVITYDB' AND TABLE_NAME = 'AM_PROCESSINSTANCE' ;
	IF T_COUNT = 0
    THEN
		sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_PROCESSINSTANCE"
					(
						"ID" NUMBER(19,0) NOT NULL ENABLE,
						"ICN" VARCHAR2(40 CHAR) NOT NULL ENABLE,
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
						CONSTRAINT "AM_PROCESSINSTANCE_PK" PRIMARY KEY ("ID") ENABLE,
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
						"URGENCY" NUMBER(2,0)
					)';

		execute immediate sql_statement;
		END IF;

    END IF;
	EXCEPTION
	    WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING TABLE ACTIVITYDB.AM_PROCESSINSTANCE '||SQLCODE||SQLERRM);
END;
/

--------------------------------------------------------
--  DDL for Table AM_PROCESSDEFINITION
--------------------------------------------------------
DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_PROCESSDEFINITION"
   					(
   						"PROCESSDEFINITIONID" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"PROCESSNAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"TYPE" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"DOMAIN" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"DEPLOYMENTID" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"PERMISSION" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"ACTIVITYDESCRIPTION" VARCHAR2(1500 CHAR) NOT NULL ENABLE,
						"VERSION" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"RELEASESTATE" VARCHAR2(32 CHAR) NOT NULL ENABLE,
						"APPROVEDBYID" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						CONSTRAINT "AM_PROCESSDEFINITION_PK" PRIMARY KEY ("PROCESSDEFINITIONID", "VERSION")
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

DECLARE sql_statement VARCHAR2(1024);
BEGIN

	sql_statement:='CREATE TABLE "ACTIVITYDB"."AM_TASKINSTANCE"
					(
						"ID" NUMBER(19,0) NOT NULL ENABLE,
						"PROCESSINSTANCEID" NUMBER(19,0) NOT NULL ENABLE,
						"ICN" VARCHAR2(40 CHAR) NOT NULL ENABLE,
						"TASKNAME" VARCHAR2(255 CHAR) NOT NULL ENABLE,
						"DESCRIPTION" VARCHAR2(255 CHAR),
						"PRIORITY" NUMBER(10,0),
						"SKIPPABLE" NUMBER(1,0),
						"CREATEDON" DATE,
						"STATUSID" NUMBER(10,0) NOT NULL ENABLE,
						"STATUSTIMESTAMP" DATE NOT NULL ENABLE,
						"ACTUALOWNER" VARCHAR2(255 CHAR),
						"DUEDATE" DATE,
						CONSTRAINT "AM_TASKINSTANCE_PK" PRIMARY KEY ("ID") ENABLE,
						CONSTRAINT "FK_TSKINST_TSKINSSTAT_LKP_IDX" FOREIGN KEY ("STATUSID")
							REFERENCES "ACTIVITYDB"."AM_TASKSTATUSLOOKUP" ("ID") ENABLE,
						CONSTRAINT "FK_TSKINS_PROCINS_ID" FOREIGN KEY ("PROCESSINSTANCEID")
							REFERENCES "ACTIVITYDB"."AM_PROCESSINSTANCE" ("ID") ENABLE
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
--  DDL for Table AM_TASKROUTE
--------------------------------------------------------

DECLARE sql_statement VARCHAR2(1024);
BEGIN

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
						CONSTRAINT "AM_TASKROUTE_PK" PRIMARY KEY ("ID") ENABLE,
						CONSTRAINT "TSKRT_TSKINS_ID" FOREIGN KEY ("TASKINSTANCEID")
							REFERENCES "ACTIVITYDB"."AM_TASKINSTANCE" ("ID") ENABLE
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
--  DDL for Procedure AM_CREATEPROCESSINSTANCE
--------------------------------------------------------
CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_CREATEPROCESSINSTANCE"
(
	processInstanceId IN NUMBER,
	icn IN VARCHAR2,
	facilityId IN VARCHAR2,
	processName IN VARCHAR2,
	processDefinitionId IN VARCHAR2,
	deploymentId IN VARCHAR2,
	statusId IN NUMBER,
	createdById IN VARCHAR2,
	version IN VARCHAR2,
	parentInstanceId IN NUMBER,
	instanceName IN VARCHAR2,
	state IN VARCHAR2,
	stateDueDate IN DATE,
	urgency IN NUMBER
) AS
BEGIN
	INSERT INTO Am_ProcessInstance
	(
		id,
		icn,
		facilityId,
		processName,
		processDefinitionId,
		deploymentId,
		statusId,
		statusTimestamp,
		createdById,
	    VERSION,
	    INITIATIONDATE,
	    PARENTINSTANCEID,
	    INSTANCENAME,
	    STATE,
		STATESTARTDATE,
	    STATEDUEDATE,
	    URGENCY
	)
	VALUES
	(
		processInstanceId,
		icn,
		facilityId,
		processName,
		processDefinitionId,
		deploymentId,
		statusId,
		SYSDATE,
	    createdById,
	    version,
	    SYSDATE,
	    parentInstanceId,
	    instanceName,
	    state,
		SYSDATE,
	    stateDueDate,
	    urgency
	);
END;
/

--------------------------------------------------------
--  DDL for Procedure AM_CREATEROUTES
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_CREATEROUTES" (taskInstanceId NUMBER, routes VARCHAR2)
AS
	ind INT;
	routeInd INT;
	route VARCHAR2(255 CHAR);
	subRoute VARCHAR2(255 CHAR);
	category VARCHAR2(2 CHAR);
	facility INT;
	team INT;
	teamFocus INT;
	teamType INT;
	teamRole INT;
	userId VARCHAR(255 CHAR);
	subRouteCode INT;
	subRouteCodeBegin INT;
	subRouteCodeEnd INT;
	lRoutes VARCHAR2(2048 CHAR) := routes;
BEGIN

	lRoutes := TRIM(BOTH ',' FROM lRoutes);
	WHILE(LENGTH(lRoutes) > 0) LOOP
		ind := INSTR(lRoutes, ',');
		IF (ind > 0) THEN
			route := SUBSTR(lRoutes, 1, ind - 1);
			lRoutes := SUBSTR(lRoutes, ind + 1);
		ELSE
			route := lRoutes;
			lRoutes := '';
	    END IF;

	    route := TRIM(route);
	    route := TRIM('[' FROM route);
	    route := TRIM(']' FROM route);

		facility := NULL;
		team := NULL;
		teamFocus := NULL;
		teamType := NULL;
		teamRole := NULL;
		userId := NULL;
	    subRouteCode := NULL;

		IF NOT (REGEXP_LIKE (ROUTE, '\w\w:\w*(\s*\w*)*\(\d+\)')) THEN
			userId := route;
		ELSE
			WHILE(LENGTH(route) > 0) LOOP
				routeInd := INSTR(route, '/');
				IF (routeInd > 0) THEN
					subRoute := SUBSTR(route, 1, routeInd - 1);
					route := SUBSTR(route, routeInd + 1);
				ELSE
					subRoute := route;
					route := '';
				END IF;

				subRoute := TRIM(subRoute);
				IF (LENGTH(subRoute) > 2) THEN

					category := SUBSTR(subRoute,1,2);
          			subRouteCodeBegin := INSTR(subRoute, '(');
          			subRouteCodeEnd := INSTR(subRoute, ')');
					subRouteCode := CAST(SUBSTR(subRoute, subRouteCodeBegin + 1, subRouteCodeEnd - subRouteCodeBegin - 1) AS INT);
					CASE category
						WHEN 'FC' THEN facility := subRouteCode;
						WHEN 'TM' THEN team := subRouteCode;
						WHEN 'TF' THEN teamFocus := subRouteCode;
						WHEN 'TT' THEN teamType := subRouteCode;
						WHEN 'TR' THEN teamRole := subRouteCode;
					END CASE;
				END IF;

			END LOOP;
		END IF;

        IF (facility IS NOT NULL OR
			team IS NOT NULL OR
			teamFocus IS NOT NULL OR
			teamType IS NOT NULL OR
			teamRole IS NOT NULL OR
			userId IS NOT NULL) THEN

			INSERT INTO Am_TaskRoute
			(
				ID,
	      		taskInstanceId,
				facility,
				team,
				teamFocus,
				teamType,
				teamRole,
				userId
			)
			VALUES
			(
				Am_TaskRoute_id_SEQ.nextval,
	      		taskInstanceId,
				facility,
				team,
				teamFocus,
				teamType,
				teamRole,
				userId
			);
		END IF;
	END LOOP;

END;
/
--------------------------------------------------------
--  DDL for Procedure AM_CREATETASKINSTANCE
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_CREATETASKINSTANCE" (taskInstanceId INT,
	processInstanceId INT,
	taskName VARCHAR2,
	description VARCHAR2,
	statusId INT,
	actualOwner VARCHAR2,
	dueDate DATE,
	priority INT,
	skippable NUMBER,
	routes VARCHAR2
)
AS
	icnLocal VARCHAR2(40 CHAR);
BEGIN
	SELECT icn INTO icnLocal
	FROM activitydb.Am_ProcessInstance
	WHERE id = processInstanceId;

	INSERT INTO Am_TaskInstance
	(
	    id,
	    processInstanceId,
	    icn,
	    taskName,
	    description,
	    priority,
	    skippable,
	    createdOn,
	    statusId,
	    statusTimestamp,
	    actualOwner,
	    dueDate
	)
	VALUES
	(
	    taskInstanceId,
	    processInstanceId,
	    icnLocal,
	    taskName,
	    description,
	    priority,
	    skippable,
	    SYSDATE,
	    statusId,
	    SYSDATE,
	    actualOwner,
	    dueDate
	);

	Am_CreateRoutes(taskInstanceId, routes);
END;
/
--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCESSINSTANCESTATUS
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCESSINSTANCESTATUS" (processInstanceId NUMBER,
    newStatusId NUMBER
)
AS
BEGIN
	UPDATE Am_ProcessInstance
	SET statusId = newStatusId,
	statusTimestamp = sysdate
	WHERE id = processInstanceId;
END;
/
--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCESSINSTANCESTATE
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCESSINSTANCESTATE" (processInstanceId NUMBER,
    state IN VARCHAR2
)
AS
BEGIN
	UPDATE Am_ProcessInstance
	SET state = state,
	stateStartDate = sysdate
	WHERE id = processInstanceId;
END;
/
--------------------------------------------------------
--  DDL for Procedure AM_UPDATEPROCINSSTATEDUEDATE
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_UPDATEPROCINSSTATEDUEDATE" (processInstanceId NUMBER,
    stateDueDate IN DATE
)
AS
BEGIN
	UPDATE Am_ProcessInstance
	SET STATEDUEDATE = stateDueDate
	WHERE id = processInstanceId;
END;
/
--------------------------------------------------------
--  DDL for Procedure AM_UPDATETASKINSTANCESTATUS
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE "ACTIVITYDB"."AM_UPDATETASKINSTANCESTATUS" (taskInstanceId NUMBER,
    newStatusId NUMBER,
    newOwner VARCHAR2
)
AS
BEGIN
	UPDATE Am_TaskInstance
	SET statusId = newStatusId,
	actualOwner = newOwner,
	statusTimestamp = sysdate
	WHERE id = taskInstanceId;
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
