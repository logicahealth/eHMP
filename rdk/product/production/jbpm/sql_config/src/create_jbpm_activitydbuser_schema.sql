CREATE OR REPLACE TYPE ACTIVITYDBUSER.LONGARRAY IS TABLE OF NUMBER(19,0);
/
CREATE OR REPLACE TYPE ACTIVITYDBUSER.VARCHARARRAY IS TABLE OF VARCHAR(255);
/

--------------------------------------------------------
--  DDL for Function SPLIT_STRING_BY_COMMA
--------------------------------------------------------

CREATE OR REPLACE FUNCTION ACTIVITYDBUSER."SPLIT_STRING_BY_COMMA" (p_string IN VARCHAR2)
RETURN ACTIVITYDBUSER.VARCHARARRAY IS
v_array ACTIVITYDBUSER.VARCHARARRAY;
BEGIN
  v_array := ACTIVITYDBUSER.VARCHARARRAY();
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
--  DDL for Function SPLIT_NUM_STRING_BY_COMMA
--------------------------------------------------------
CREATE OR REPLACE FUNCTION ACTIVITYDBUSER."SPLIT_NUM_STRING_BY_COMMA" (p_string IN VARCHAR2)
RETURN ACTIVITYDBUSER.LONGARRAY IS
v_array ACTIVITYDBUSER.LONGARRAY;
BEGIN
  v_array := ACTIVITYDBUSER.LONGARRAY();
  IF p_string IS NOT NULL THEN
    FOR curs IN (
      select to_number(column_value) as item from xmltable(p_string))
    LOOP
      v_array.extend;
      v_array(v_array.COUNT) := TO_NUMBER(TRIM(curs.item));
    END LOOP;
  END IF;
  RETURN v_array;
END;
/

--------------------------------------------------------
--  DDL for Function SPLIT_STRING_BY_PIPE
--------------------------------------------------------

CREATE OR REPLACE FUNCTION ACTIVITYDBUSER."SPLIT_STRING_BY_PIPE" (p_string IN VARCHAR2)
RETURN ACTIVITYDBUSER.VARCHARARRAY IS
v_array ACTIVITYDBUSER.VARCHARARRAY;
BEGIN
  v_array := ACTIVITYDBUSER.VARCHARARRAY();
  IF p_string IS NOT NULL THEN
    FOR curs IN (
      SELECT REGEXP_SUBSTR(p_string, '[^|]+', 1, LEVEL) item FROM DUAL
      CONNECT BY REGEXP_SUBSTR(p_string, '[^|]+', 1, LEVEL) IS NOT NULL)
    LOOP
      v_array.extend;
      v_array(v_array.COUNT) := TRIM(curs.item);
    END LOOP;
  END IF;
  RETURN v_array;
END;
/

--------------------------------------------------------
--  DDL for Function PARSE_PRIORITY
--------------------------------------------------------
CREATE OR REPLACE FUNCTION ACTIVITYDBUSER."PARSE_PRIORITY" (p_priority IN VARCHAR2)
RETURN ACTIVITYDBUSER.LONGARRAY IS
v_array ACTIVITYDBUSER.LONGARRAY;
v_min_priority NUMBER := -1;
v_max_priority NUMBER := -1;
v_temp NUMBER;
BEGIN
  v_array := ACTIVITYDBUSER.LONGARRAY();
  IF p_priority IS NOT NULL AND REGEXP_LIKE(p_priority, '^\d+\s*(-\s*\d+)??$') THEN
    v_min_priority := TO_NUMBER(REGEXP_SUBSTR(p_priority, '(\d+)'));
    v_max_priority := TO_NUMBER(REGEXP_SUBSTR(p_priority, '(\d+)$'));
    IF (v_min_priority > v_max_priority) THEN
      v_temp := v_min_priority;
      v_min_priority := v_max_priority;
      v_max_priority := v_temp;
    END IF;

    v_array.extend;
    v_array(v_array.COUNT) := v_min_priority;
    v_array.extend;
    v_array(v_array.COUNT) := v_max_priority;
  END IF;
  RETURN v_array;
END;
/

--------------------------------------------------------
--  DDL for package TASKS
--------------------------------------------------------
CREATE OR REPLACE PACKAGE ACTIVITYDBUSER.TASKS IS
  PROCEDURE getTaskRoutes (
    p_task_instance_ids VARCHAR2,
    recordset OUT SYS_REFCURSOR);
  PROCEDURE getTasksForTeams (
    p_staff_id IN VARCHAR2,
    p_station_number IN VARCHAR2,
    p_task_statuses IN VARCHAR2,
    p_process_instance_id IN NUMBER,
    p_priority IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_patient_identifiers IN VARCHAR2,
    p_resolution_state IN NUMBER,
    p_max_salience IN NUMBER,
    p_ntf_user_id IN VARCHAR2,
    recordset OUT SYS_REFCURSOR,
    recordset2 OUT SYS_REFCURSOR);
  PROCEDURE getTasksForTeamRoles (
    p_user_id IN VARCHAR2,
    p_staff_id IN VARCHAR2,
    p_station_number IN VARCHAR2,
    p_facility IN VARCHAR2,
    p_task_statuses IN VARCHAR2,
    p_process_instance_id IN NUMBER,
    p_priority IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_patient_identifiers IN VARCHAR2,
    p_resolution_state IN NUMBER,
    p_max_salience IN NUMBER,
    p_ntf_user_id IN VARCHAR2,
    recordset OUT SYS_REFCURSOR,
    recordset2 OUT SYS_REFCURSOR);
  PROCEDURE getAllTasks (
    p_task_statuses IN VARCHAR2,
    p_process_instance_id IN NUMBER,
    p_priority IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_patient_identifiers IN VARCHAR2,
    p_resolution_state IN NUMBER,
    p_max_salience IN NUMBER,
    p_ntf_user_id IN VARCHAR2,
    recordset OUT SYS_REFCURSOR,
    recordset2 OUT SYS_REFCURSOR);
  PROCEDURE getTasksByIds (
    p_task_definition_id IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_patient_identifiers IN VARCHAR2,
    p_task_statuses IN VARCHAR2,
    recordset OUT SYS_REFCURSOR);
  PROCEDURE getTasksByState (
    p_patient_identifiers IN VARCHAR2,
    p_activity_states IN VARCHAR2,
    p_process_definition IN VARCHAR2,
    recordset OUT SYS_REFCURSOR);
END TASKS;
/

--------------------------------------------------------
--  DDL for TASKS package body
--------------------------------------------------------
CREATE OR REPLACE PACKAGE BODY ACTIVITYDBUSER.TASKS IS
--------------------------------------------------------
--  DDL for Procedure getTaskRoutes
--  Purpose: Get routes for given task instance ids
--  Parameters:
--    p_task_instance_ids:    Comma separated task instance ids
--    recordset:              output result set
--------------------------------------------------------
  PROCEDURE getTaskRoutes (
  p_task_instance_ids VARCHAR2,
  recordset OUT SYS_REFCURSOR) AS
    v_task_instance_ids LONGARRAY;
  BEGIN
    v_task_instance_ids := ACTIVITYDBUSER.SPLIT_NUM_STRING_BY_COMMA(p_task_instance_ids);
    OPEN recordset FOR
      SELECT * FROM ACTIVITYDB.Am_TaskRoute WHERE taskInstanceId IN (SELECT column_value FROM TABLE(v_task_instance_ids)) order by taskInstanceId,id;
  END getTaskRoutes;


--------------------------------------------------------
--  DDL for Procedure getTasksForTeams
--  Purpose: Get tasks for user teams
--  Parameters:
--    p_staff_id:             staff id of the user
--    p_station_number:       station number of the user
--    p_task_statuses:        null or comma separated task statues
--    p_process_instance_id:  null or process instance id of the tasks
--    p_priority:             null or priority/priority range, exp: 1) 4-6 , 2) 2
--    p_task_instance_id:     null or task instance id
--    p_resolution_state      null or notification resolution state
--    p_max_salience          null or max notification salience
--    p_ntf_user_id           null or notification user id
--    recordset:              output result set (tasks)
--    recordset2:             output result set (task routes)
--------------------------------------------------------
  PROCEDURE getTasksForTeams(
  p_staff_id IN VARCHAR2,
  p_station_number IN VARCHAR2,
  p_task_statuses IN VARCHAR2,
  p_process_instance_id IN NUMBER,
  p_priority IN VARCHAR2,
  p_task_instance_id IN NUMBER,
  p_start_date IN DATE,
  p_end_date IN DATE,
  p_patient_identifiers IN VARCHAR2,
  p_resolution_state IN NUMBER,
  p_max_salience IN NUMBER,
  p_ntf_user_id IN VARCHAR2,
  recordset OUT SYS_REFCURSOR,
  recordset2 OUT SYS_REFCURSOR)  AS
    v_min_priority NUMBER := -1;
    v_max_priority NUMBER := -1;
    v_task_statuses VARCHARARRAY;
    v_patient_identifiers VARCHARARRAY;
    v_priority_array LONGARRAY;
    v_station_number_prefix VARCHAR2(64);
  BEGIN
    v_task_statuses := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_task_statuses);
    v_patient_identifiers := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_identifiers);
    v_priority_array := ACTIVITYDBUSER.PARSE_PRIORITY(p_priority);

    IF v_priority_array.COUNT = 2 THEN
      v_min_priority := v_priority_array(1);
      v_max_priority := v_priority_array(2);
    END IF;

    IF LENGTH(p_station_number) > 3 THEN
      v_station_number_prefix := SUBSTR(p_station_number,1,3);
    ELSE
      v_station_number_prefix := p_station_number;
    END IF;

    v_station_number_prefix := v_station_number_prefix || '%';

    OPEN recordset FOR
      SELECT DISTINCT ti.id as taskId,
            ti.taskName,
            ti.description,
            tsl.status,
            ti.priority,
            ti.definitionId,
            ti.history,
            ti.navigation,
            ti.permission,
            ti.actualOwner as actualOwnerId,
            ti.actualOwner as actualOwnerName,
            pi.createdById,
            ti.createdOn as taskCreatedOn,
            pi.clinicalObjectUid,
            pi.createdById as createdByName,
            ti.dueDate as expirationTime,
            ti.statusTimeStamp as statusTimeStamp,
            pi.processInstanceId as processInstanceId,
            pi.processDefinitionId as processId,
            pi.processName,
            pi.deploymentId,
            pi.assignedTo as activityAssignedTo,
            pi.domain as activityDomain,
            pi.processName as activityName,
            pi.instanceName as instanceName,
            ti.dueDate as pastDue,
            ti.earliestDate as due,
            ti.icn as patientICN,
            ti.assignedTo as assignedTo,
            NVL2(ntf.id,1,0) as notification,
            ntf.message_subject as notificationtitle
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            INNER JOIN ACTIVITYDB.Am_TaskRoute tr ON ti.id = tr.taskInstanceId
            left join NOTIFDB.NOTIFICATIONS_VIEW ntf ON (CONCAT('ehmp:task:',ti.id) = ntf.item AND ntf.REC_USER_ID = p_ntf_user_id AND ntf.salience >= p_max_salience AND ntf.RESOLUTION_STATE = p_resolution_state)
            WHERE ( tr.team IN (SELECT UNIQUE T.team_id
                                FROM pcmm.team T
                                JOIN pcmm.team_membership TM ON TM.team_id = T.team_id
                                JOIN pcmm.staff S ON S.staff_id = TM.staff_id
                                WHERE S.VA_INSTITUTION_ID IN (  select ID
                                    FROM SDSADM.STD_INSTITUTION
                                    WHERE STATIONNUMBER like v_station_number_prefix)
                                  AND S.staff_ien = p_staff_id))
                AND (( tr.facility IS NULL )
                        OR ( tr.facility IS NOT NULL AND tr.facility = p_station_number)
                ) AND ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                ) AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));


      --get the routes
      --to do: reuse the previous select
      OPEN recordset2 FOR
      SELECT DISTINCT tr.*
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            INNER JOIN ACTIVITYDB.Am_TaskRoute tr ON ti.id = tr.taskInstanceId
            WHERE ( tr.team IN (SELECT UNIQUE T.team_id
                                FROM pcmm.team T
                                JOIN pcmm.team_membership TM ON TM.team_id = T.team_id
                                JOIN pcmm.staff S ON S.staff_id = TM.staff_id
                                WHERE S.VA_INSTITUTION_ID IN (  select ID
                                    FROM SDSADM.STD_INSTITUTION
                                    WHERE STATIONNUMBER like v_station_number_prefix)
                                  AND S.staff_ien = p_staff_id))
                AND (( tr.facility IS NULL )
                        OR ( tr.facility IS NOT NULL AND tr.facility = p_station_number)
                ) AND ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                ) AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));

  END getTasksForTeams;

--------------------------------------------------------
--  DDL for Procedure getTasksForTeamRoles
--  Purpose: Get tasks for user team roles
--  Parameters:
--    p_user_id:              user id
--    p_staff_id:             staff id of the user
--    p_station_number:       station number of the user
--    p_facility:             null or facility
--    p_task_statuses:        null or comma separated task statues
--    p_process_instance_id:  null or process instance id of the tasks
--    p_priority:             null or priority/priority range, exp: 1) 4-6 , 2) 2
--    p_task_instance_id:     null or task instance id
--    p_start_date:           null or terminated tasks 'earliestDate' start date range
--    p_end_date:             null or terminated tasks 'earliestDate' end date range
--    p_patient_identifiers:  null or comma separated patient identifiers
--    p_resolution_state      null or notification resolution state
--    p_max_salience          null or max notification salience
--    p_ntf_user_id           null or notification user id
--    recordset:              output result set (tasks)
--    recordset2:             output result set (task routes)
--------------------------------------------------------
  PROCEDURE getTasksForTeamRoles(
  p_user_id IN VARCHAR2,
  p_staff_id IN VARCHAR2,
  p_station_number IN VARCHAR2,
  p_facility IN VARCHAR2,
  p_task_statuses IN VARCHAR2,
  p_process_instance_id IN NUMBER,
  p_priority IN VARCHAR2,
  p_task_instance_id IN NUMBER,
  p_start_date IN DATE,
  p_end_date IN DATE,
  p_patient_identifiers IN VARCHAR2,
  p_resolution_state IN NUMBER,
  p_max_salience IN NUMBER,
  p_ntf_user_id IN VARCHAR2,
  recordset OUT SYS_REFCURSOR,
  recordset2 OUT SYS_REFCURSOR)  AS
    v_min_priority NUMBER := -1;
    v_max_priority NUMBER := -1;
    v_task_statuses VARCHARARRAY;
    v_patient_identifiers VARCHARARRAY;
    v_priority_array LONGARRAY;
    v_station_number_prefix VARCHAR2(64);
    begin
    v_task_statuses := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_task_statuses);
    v_patient_identifiers := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_identifiers);
    v_priority_array := ACTIVITYDBUSER.PARSE_PRIORITY(p_priority);

    IF v_priority_array.COUNT = 2 THEN
      v_min_priority := v_priority_array(1);
      v_max_priority := v_priority_array(2);
    END IF;

    IF LENGTH(p_station_number) > 3 THEN
      v_station_number_prefix := SUBSTR(p_station_number,1,3);
    ELSE
      v_station_number_prefix := p_station_number;
    END IF;

    v_station_number_prefix := v_station_number_prefix || '%';

  open recordset for
      WITH tmp_TEAM_MEMBERSHIP AS (
      SELECT TM.TEAM_ID,TM.team_position_id
      FROM PCMM.TEAM_MEMBERSHIP TM
      JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID
      WHERE S.VA_INSTITUTION_ID IN (  select ID
            FROM SDSADM.STD_INSTITUTION
            WHERE STATIONNUMBER like v_station_number_prefix)
        AND S.STAFF_IEN= p_staff_id)
      SELECT DISTINCT ti.id as taskId,
            ti.taskName,
            ti.description,
            tsl.status,
            ti.priority,
            ti.definitionId,
            ti.history,
            ti.navigation,
            ti.permission,
            ti.actualOwner as actualOwnerId,
            ti.actualOwner as actualOwnerName,
            pi.createdById,
            ti.createdOn as taskCreatedOn,
            pi.clinicalObjectUid,
            pi.createdById as createdByName,
            ti.dueDate as expirationTime,
            ti.statusTimeStamp as statusTimeStamp,
            pi.processInstanceId as processInstanceId,
            pi.processDefinitionId as processId,
            pi.processName,
            pi.deploymentId,
            pi.assignedTo as activityAssignedTo,
            pi.domain as activityDomain,
            pi.processName as activityName,
            pi.instanceName as instanceName,
            ti.dueDate as pastDue,
            ti.earliestDate as due,
            ti.icn as patientICN,
            ti.assignedTo as assignedTo,
            NVL2(ntf.id,1,0) as notification,
            ntf.message_subject as notificationtitle
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            INNER JOIN ACTIVITYDB.Am_TaskRoute tr ON ti.id = tr.taskInstanceId
            LEFT JOIN NOTIFDB.NOTIFICATIONS_VIEW ntf ON (CONCAT('ehmp:task:',ti.id) = ntf.item AND ntf.REC_USER_ID = p_ntf_user_id AND ntf.salience >= p_max_salience AND ntf.RESOLUTION_STATE = p_resolution_state) 
            WHERE 
             ((tr.userid = p_user_id   -- routed directly to me
                    OR (ti.actualOwner = p_user_id) --claimed/owned by me
                    OR (tr.userid IS NULL  --not routed to another user
                      AND (ti.actualOwner IS NULL) -- and is not claimed
                      AND ((tr.team IS NULL) OR (tr.team IN  (SELECT unique T.TEAM_ID FROM PCMM.TEAM T
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID)))
                      AND ((tr.facility IS NULL) OR (tr.facility IS NOT NULL AND tr.facility = p_station_number))
                      AND ((tr.teamfocus IS NULL) OR (tr.teamfocus in (
                        SELECT UNIQUE TF.CODE
                        FROM PCMM.TEAM T
                        JOIN PCMM.PCM_STD_TEAM_FOCUS TF ON T.PCM_STD_TEAM_FOCUS_ID=TF.PCM_STD_TEAM_FOCUS_ID
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID))
                      )
                      AND ((tr.TEAMTYPE IS NULL) OR (tr.TEAMTYPE in (
                        SELECT UNIQUE t.PCM_STD_TEAM_CARE_TYPE_ID from pcmm.team t
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID))
                      )
                      AND ((tr.TEAMROLE is null) OR (tr.TEAMROLE in (
                        select unique tp.pcm_std_team_role_id  from tmp_TEAM_MEMBERSHIP tm
                        join pcmm.team_position tp on tp.team_position_id = tm.team_position_id))
                      )
                    ))
                    OR (p_facility IS NOT NULL AND tr.facility = p_facility)
                  )
                  AND ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                  )
                  AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                  AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                  AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                  AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                  AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));

  --get the routes
  --to do: reuse the select from previous resultset
  open recordset2 for
      WITH tmp_TEAM_MEMBERSHIP AS (
      SELECT TM.TEAM_ID,TM.team_position_id
      FROM PCMM.TEAM_MEMBERSHIP TM
      JOIN PCMM.STAFF S ON S.STAFF_ID=TM.STAFF_ID
      WHERE S.VA_INSTITUTION_ID IN (  select ID
            FROM SDSADM.STD_INSTITUTION
            WHERE STATIONNUMBER like v_station_number_prefix)
        AND S.STAFF_IEN= p_staff_id)
      SELECT DISTINCT tr.*
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            INNER JOIN ACTIVITYDB.Am_TaskRoute tr ON ti.id = tr.taskInstanceId
            WHERE 
             ((tr.userid = p_user_id   -- routed directly to me
                    OR (ti.actualOwner = p_user_id) --claimed/owned by me
                    OR (tr.userid IS NULL  --not routed to another user
                      AND (ti.actualOwner IS NULL) -- and is not claimed
                      AND ((tr.team IS NULL) OR (tr.team IN  (SELECT unique T.TEAM_ID FROM PCMM.TEAM T
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID)))
                      AND ((tr.facility IS NULL) OR (tr.facility IS NOT NULL AND tr.facility = p_station_number))
                      AND ((tr.teamfocus IS NULL) OR (tr.teamfocus in (
                        SELECT UNIQUE TF.CODE
                        FROM PCMM.TEAM T
                        JOIN PCMM.PCM_STD_TEAM_FOCUS TF ON T.PCM_STD_TEAM_FOCUS_ID=TF.PCM_STD_TEAM_FOCUS_ID
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID))
                      )
                      AND ((tr.TEAMTYPE IS NULL) OR (tr.TEAMTYPE in (
                        SELECT UNIQUE t.PCM_STD_TEAM_CARE_TYPE_ID from pcmm.team t
                        JOIN tmp_TEAM_MEMBERSHIP TM ON TM.TEAM_ID=T.TEAM_ID))
                      )
                      AND ((tr.TEAMROLE is null) OR (tr.TEAMROLE in (
                        select unique tp.pcm_std_team_role_id  from tmp_TEAM_MEMBERSHIP tm
                        join pcmm.team_position tp on tp.team_position_id = tm.team_position_id))
                      )
                    ))
                    OR (p_facility IS NOT NULL AND tr.facility = p_facility)
                  )
                  AND ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                  )
                  AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                  AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                  AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                  AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                  AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));

  END getTasksForTeamRoles;

--------------------------------------------------------
--  DDL for Procedure getAllTasks
--  Purpose: Get all tasks with given input matching criteria
--  Parameters:
--    p_task_statuses:        null or comma separated task statues
--    p_process_instance_id:  null or process instance id of the tasks
--    p_priority:             null or priority/priority range, exp: 1) 4-6 , 2) 2
--    p_task_instance_id:     null or task instance id
--    p_start_date:           null or terminated tasks 'earliestDate' start date range
--    p_end_date:             null or terminated tasks 'earliestDate' end date range
--    p_patient_identifiers:  null or comma separated patient identifiers
--    p_resolution_state      null or notification resolution state
--    p_max_salience          null or max notification salience
--    p_ntf_user_id           null or notification user id
--    recordset:              output result set (tasks)
--    recordset2:             output result set (task routes)
--------------------------------------------------------
  PROCEDURE getAllTasks (
    p_task_statuses IN VARCHAR2,
    p_process_instance_id IN NUMBER,
    p_priority IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_patient_identifiers IN VARCHAR2,
    p_resolution_state IN NUMBER,
    p_max_salience IN NUMBER,
    p_ntf_user_id IN VARCHAR2,
    recordset OUT SYS_REFCURSOR,
    recordset2 OUT SYS_REFCURSOR) AS
    v_min_priority NUMBER := -1;
    v_max_priority NUMBER := -1;
    v_task_statuses VARCHARARRAY;
    v_patient_identifiers VARCHARARRAY;
    v_priority_array LONGARRAY;
  BEGIN
    v_task_statuses := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_task_statuses);
    v_patient_identifiers := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_identifiers);
    v_priority_array := ACTIVITYDBUSER.PARSE_PRIORITY(p_priority);

    IF v_priority_array.COUNT = 2 THEN
      v_min_priority := v_priority_array(1);
      v_max_priority := v_priority_array(2);
    END IF;

    OPEN recordset FOR
      SELECT DISTINCT ti.id as taskId,
            ti.taskName,
            ti.description,
            tsl.status,
            ti.priority,
            ti.definitionId,
            ti.history,
            ti.navigation,
            ti.permission,
            ti.actualOwner as actualOwnerId,
            ti.actualOwner as actualOwnerName,
            pi.createdById,
            ti.createdOn as taskCreatedOn,
            pi.clinicalObjectUid,
            pi.createdById as createdByName,
            ti.dueDate as expirationTime,
            ti.statusTimeStamp as statusTimeStamp,
            pi.processInstanceId as processInstanceId,
            pi.processDefinitionId as processId,
            pi.processName,
            pi.deploymentId,
            pi.assignedTo as activityAssignedTo,
            pi.domain as activityDomain,
            pi.processName as activityName,
            pi.instanceName as instanceName,
            ti.dueDate as pastDue,
            ti.earliestDate as due,
            ti.icn as patientICN,
            ti.assignedTo as assignedTo,
            NVL2(ntf.id,1,0) as notification,
            ntf.message_subject as notificationtitle
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            left join NOTIFDB.NOTIFICATIONS_VIEW ntf ON (CONCAT('ehmp:task:',ti.id) = ntf.item AND ntf.REC_USER_ID = p_ntf_user_id AND ntf.salience >= p_max_salience AND ntf.RESOLUTION_STATE = p_resolution_state)
            WHERE ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                  )
                  AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                  AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                  AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                  AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                  AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));
    OPEN recordset2 FOR
      SELECT DISTINCT tr.*
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            INNER JOIN ACTIVITYDB.Am_TaskRoute tr ON ti.id = tr.taskInstanceId
            WHERE ((p_task_statuses IS NULL AND ti.statusId in (1,2,3))
                      OR (p_task_statuses IS NOT NULL AND
                          (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR (tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses)))))
                  )
                  AND (p_process_instance_id IS NULL OR ti.processInstanceId = p_process_instance_id)
                  AND (v_min_priority = -1 OR (v_min_priority = v_max_priority and ti.priority = v_min_priority) OR (v_min_priority <> v_max_priority and ti.priority BETWEEN v_min_priority AND v_max_priority))
                  AND (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                  AND ((p_start_date IS NULL OR p_end_date IS NULL) OR ((ti.earliestDate BETWEEN p_start_date AND p_end_date AND ti.statusId IN (4,5,6,8))  OR ti.statusId IN (0,1,2,3)))
                  AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));

  END getAllTasks;

--------------------------------------------------------
--  DDL for Procedure getTasksByIds
--  Purpose: Get tasks with given input matching criteria
--  Parameters:
--    p_task_definition_id:   null or definition id of the tasks to be returned
--    p_task_instance_id:     null or task instance id
--    p_patient_identifiers:  null or comma separated patient identifiers
--    p_task_statuses:        null or comma separated task statues
--    recordset:              output result set
--------------------------------------------------------
  PROCEDURE getTasksByIds (
    p_task_definition_id IN VARCHAR2,
    p_task_instance_id IN NUMBER,
    p_patient_identifiers IN VARCHAR2,
    p_task_statuses IN VARCHAR2,
    recordset OUT SYS_REFCURSOR) AS
    v_task_statuses VARCHARARRAY;
    v_patient_identifiers VARCHARARRAY;
  BEGIN
    v_task_statuses := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_task_statuses);
    v_patient_identifiers := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_identifiers);

    OPEN recordset FOR
      SELECT DISTINCT ti.id as taskId,
            ti.taskName,
            ti.description,
            tsl.status,
            ti.priority,
            ti.definitionId,
            ti.history,
            ti.navigation,
            ti.permission,
            ti.actualOwner as actualOwnerId,
            ti.actualOwner as actualOwnerName,
            pi.createdById,
            ti.createdOn,
            pi.clinicalObjectUid,
            pi.createdById as createdByName,
            ti.dueDate as expirationTime,
            ti.statusTimeStamp as statusTimeStamp,
            pi.processInstanceId as processInstanceId,
            pi.processDefinitionId as processId,
            pi.processName,
            pi.deploymentId,
            pi.assignedTo as activityAssignedTo,
            pi.domain as activityDomain,
            pi.processName as activityName,
            pi.instanceName as instanceName,
            ti.dueDate as pastDue,
            ti.earliestDate as due,
            ti.icn as patientICN,
            ti.assignedTo as assignedTo
            FROM ACTIVITYDB.Am_TaskInstance ti INNER JOIN ACTIVITYDB.Am_TaskStatusLookup tsl ON ti.statusId = tsl.id
            INNER JOIN ACTIVITYDB.Am_ProcessInstance pi ON ti.processInstanceId = pi.processInstanceId
            WHERE (p_task_instance_id IS NULL OR ti.id = p_task_instance_id)
                  AND (p_task_statuses IS NULL OR (EXISTS (select column_value from TABLE(v_task_statuses) where column_value = 'All') OR tsl.status in (SELECT TO_CHAR(column_value) FROM TABLE(v_task_statuses))))
                  AND (p_task_definition_id IS NULL OR ti.definitionid = p_task_definition_id)
                  AND (p_patient_identifiers IS NULL OR ti.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)));

  END getTasksByIds;

--------------------------------------------------------
--  DDL for Procedure getTasksByState
--  Purpose: Get unique processes and their most recent taskId of given activity definition id and activity states
--  Parameters:
--    p_patient_identifiers:  comma separated patient identifiers
--    p_activity_states:      null or process instance states of tasks to be returned, seperated by a pipe (|)
--    p_process_definition:   processDefinitionId of process types to return
--    recordset:              output result set
--------------------------------------------------------
  PROCEDURE getTasksByState (
    p_patient_identifiers IN VARCHAR2,
    p_activity_states IN VARCHAR2,
    p_process_definition IN VARCHAR2,
    recordset OUT SYS_REFCURSOR) AS
    v_patient_identifiers VARCHARARRAY;
    v_activity_states VARCHARARRAY;
  BEGIN
    v_patient_identifiers := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_identifiers);
    v_activity_states := ACTIVITYDBUSER.SPLIT_STRING_BY_PIPE(p_activity_states);

    OPEN recordset FOR
      SELECT lti.latestTask as taskId,
            pi.stateStartDate as createdOn,
            pi.processInstanceId,
            pi.deploymentId
            FROM ACTIVITYDB.Am_ProcessInstance pi INNER JOIN ACTIVITYDB.Am_ProcessStatusLookup psl ON pi.statusId = psl.id
            INNER JOIN (SELECT processInstanceId, MAX(id) AS latestTask FROM ACTIVITYDB.Am_TaskInstance GROUP BY processInstanceId) lti ON pi.processInstanceId = lti.processInstanceId
            WHERE psl.status = 'Active'
                  AND pi.PROCESSDEFINITIONID = p_process_definition
                  AND (pi.icn in (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_identifiers)))
                  AND (p_activity_states IS NULL OR pi.state in (SELECT TO_CHAR(column_value) FROM TABLE(v_activity_states)));

  END getTasksByState;

END TASKS;
/

DECLARE
  p_count number;

BEGIN
  p_count :=0;

  SELECT COUNT (1) INTO p_count FROM SYS.DBA_PROCEDUREs WHERE OBJECT_TYPE = 'PACKAGE' AND OWNER = 'ACTIVITYDBUSER' AND OBJECT_NAME = 'PCMM';

  IF p_count > 0
  THEN
    EXECUTE IMMEDIATE 'DROP PACKAGE ACTIVITYDBUSER.PCMM';
  END IF;

  EXCEPTION
    WHEN OTHERS
      THEN
        DBMS_OUTPUT.put_line (SQLERRM);
        DBMS_OUTPUT.put_line ('   ');
END;
/

--------------------------------------------------------
--  DDL for package PCMMDATA
--------------------------------------------------------
CREATE OR REPLACE PACKAGE ACTIVITYDBUSER.PCMMDATA IS
  PROCEDURE getFacilityCorrespondingToTeam(
  p_team_id IN NUMBER,
  recordset OUT SYS_REFCURSOR);
END PCMMDATA;
/

--------------------------------------------------------
--  DDL for PCMMDATA package body
--------------------------------------------------------
CREATE OR REPLACE PACKAGE BODY ACTIVITYDBUSER.PCMMDATA IS
--------------------------------------------------------
--  DDL for Procedure getFacilityCorrespondingToTeam
--  Purpose: Get facility corresponding to a givem team
--  Parameters:
--    p_team_id:   team id
--------------------------------------------------------
  PROCEDURE getFacilityCorrespondingToTeam(
  p_team_id IN NUMBER,
  recordset OUT SYS_REFCURSOR) AS
  BEGIN
    OPEN recordset FOR
      SELECT DISTINCT SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.TEAM
      INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID
      WHERE PCMM.TEAM.TEAM_ID=p_team_id;
  END getFacilityCorrespondingToTeam;
END PCMMDATA;
/

--------------------------------------------------------
--  DDL for package ACTIVITIES
--------------------------------------------------------
CREATE OR REPLACE PACKAGE ACTIVITYDBUSER.ACTIVITIES IS
  PROCEDURE getActivityHistory (
      p_process_instance_id IN NUMBER,
      recordset OUT SYS_REFCURSOR
  );
  PROCEDURE getInstance (
      p_process_instance_id IN NUMBER,
      recordset OUT SYS_REFCURSOR
  );
  PROCEDURE getTeamsForUser (
      p_user_duz IN VARCHAR2,
      p_station_number IN VARCHAR2,
      recordset OUT SYS_REFCURSOR
  );
  PROCEDURE getMembersForTeam (
      p_team_ids IN VARCHAR2,
      recordset OUT SYS_REFCURSOR
  );
  PROCEDURE getActivites (
      p_created_by_me IN NUMBER,
      p_intended_for_me IN NUMBER,
      p_user_id IN VARCHAR2,
      p_patient_ids IN VARCHAR2,
      p_team_ids IN VARCHAR2,
      p_team_focus_ids IN VARCHAR2,
      p_mode IN VARCHAR2,
      p_start_date IN VARCHAR2,
      p_end_date IN VARCHAR2,
      recordset OUT SYS_REFCURSOR
  );
END ACTIVITIES;
/

--------------------------------------------------------
--  DDL for ACTIVITIES package body
--------------------------------------------------------
CREATE OR REPLACE PACKAGE BODY ACTIVITYDBUSER.ACTIVITIES IS

--------------------------------------------------------
--  DDL for Procedure getActivityHistory
--  Purpose: Get history data for supplied process instance
--  Parameters:
--    p_process_instance_id:  the id of the processs instance
--    recordset:              output result set
--------------------------------------------------------
    PROCEDURE getActivityHistory (
        p_process_instance_id IN NUMBER,
        recordset OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN recordset FOR
            SELECT ti.TASKNAME as TASKNAME,
            ti.HISTORYACTION as SIGNALACTION,
            ti.HISTORY as SIGNALHISTORY,
            ti.ACTUALOWNER as SIGNALOWNERNAME,
            ti.STATUSTIMESTAMP as STATUSTIMESTAMP
            FROM ACTIVITYDB.AM_TASKINSTANCE ti
            WHERE ti.PROCESSINSTANCEID = p_process_instance_id  AND
            (ti.HISTORY IS NOT NULL OR ti.HISTORYACTION IS NOT NULL)
            UNION
            SELECT NULL as TASKNAME,
            si.ACTION as SIGNALACTION,
            si.HISTORY as SIGNALHISTORY,
            si.OWNER as SIGNALOWNERNAME,
            si.STATUSTIMESTAMP as STATUSTIMESTAMP
            FROM ACTIVITYDB.AM_SIGNALINSTANCE si
            WHERE si.PROCESSED_SIGNAL_ID = p_process_instance_id  AND
            (si.HISTORY IS NOT NULL OR si.ACTION IS NOT NULL)
            ORDER BY STATUSTIMESTAMP DESC;
    END getActivityHistory;

--------------------------------------------------------
--  DDL for Procedure getInstance
--  Purpose: Get info for requested process instance
--  Parameters:
--    p_process_instance_id:  the id of the processs instance
--    recordset:              output result set
--------------------------------------------------------
    PROCEDURE getInstance (
        p_process_instance_id IN NUMBER,
        recordset OUT SYS_REFCURSOR
    ) AS
    BEGIN
        OPEN recordset FOR
            SELECT TO_CHAR(AM_PROCESSINSTANCE.STATESTARTDATE, 'YYYYMMDDhhmiss') as startedDateTime,
            AM_PROCESSINSTANCE.PROCESSNAME as activityName,
            AM_PROCESSINSTANCE.PROCESSDEFINITIONID as processDefinitionId,
            AM_PROCESSINSTANCE.DESCRIPTION as activityDescription,
            AM_PROCESSINSTANCE.DOMAIN as domain,
            AM_PROCESSINSTANCE.DEPLOYMENTID as deploymentId,
            AM_PROCESSINSTANCE.ICN as pid,
            AM_PROCESSINSTANCE.CREATEDBYID as userID,
            AM_PROCESSINSTANCE.ACTIVITYHEALTHY as activityHealthy,
            AM_PROCESSINSTANCE.ACTIVITYHEALTHDESCRIPTION as activityHealthDescription,
            AM_PROCESSINSTANCE.CLINICALOBJECTUID as clinicalObjectUID,
            AM_PROCESSINSTANCE.STATE as state,
            AM_PROCESSINSTANCE.URGENCY,
            AM_PROCESSINSTANCE.INSTANCENAME,
            AM_PROCESSINSTANCE.FACILITYID,
            TO_CHAR(AM_PROCESSINSTANCE.INITIATIONDATE, 'YYYYMMDD') as initiationDate
            FROM ACTIVITYDB.AM_PROCESSINSTANCE
            WHERE
            ACTIVITYDB.AM_PROCESSINSTANCE.PROCESSINSTANCEID = p_process_instance_id;
    END getInstance;

--------------------------------------------------------
--  DDL for Procedure getTeamsForUser
--  Purpose: Get all teams for the given user
--  Parameters:
--    p_user_duz:             the local id for the user
--    p_station_number:       station number/division id of the vista site
--    recordset:              output result set
--------------------------------------------------------
    PROCEDURE getTeamsForUser (
        p_user_duz IN VARCHAR2,
        p_station_number IN VARCHAR2,
        recordset OUT SYS_REFCURSOR
    ) AS
    v_station_number_prefix VARCHAR2(64);
    BEGIN
      IF LENGTH(p_station_number) > 3 THEN
        v_station_number_prefix := SUBSTR(p_station_number,1,3);
      ELSE
        v_station_number_prefix := p_station_number;
      END IF;

      v_station_number_prefix := v_station_number_prefix || '%';

        OPEN recordset FOR
            SELECT DISTINCT PCMM.TEAM.TEAM_ID, PCMM.TEAM.PCM_STD_TEAM_FOCUS_ID, PCMM.TEAM.PCM_STD_TEAM_FOCUS2_ID, PCMM.TEAM.TEAM_NAME, SDSADM.STD_INSTITUTION.STATIONNUMBER FROM PCMM.STAFF
            INNER JOIN PCMM.TEAM_MEMBERSHIP ON PCMM.STAFF.STAFF_ID = PCMM.TEAM_MEMBERSHIP.STAFF_ID
            INNER JOIN PCMM.TEAM_POSITION ON PCMM.TEAM_MEMBERSHIP.TEAM_POSITION_ID = PCMM.TEAM_POSITION.TEAM_POSITION_ID
            INNER JOIN PCMM.TEAM ON PCMM.TEAM_POSITION.TEAM_ID = PCMM.TEAM.TEAM_ID
            INNER JOIN SDSADM.STD_INSTITUTION ON SDSADM.STD_INSTITUTION.ID = PCMM.TEAM.VA_INSTITUTION_ID
            WHERE PCMM.STAFF.STAFF_IEN = p_user_duz AND
            SDSADM.STD_INSTITUTION.STATIONNUMBER LIKE v_station_number_prefix;
    END getTeamsForUser;

--------------------------------------------------------
--  DDL for Procedure getMembersForTeam
--  Purpose: Get all members for the list of teams
--  Parameters:
--    p_team_ids:             null or commna separated list of team ids
--    recordset:              output result set
--------------------------------------------------------
    PROCEDURE getMembersForTeam (
        p_team_ids IN VARCHAR2,
        recordset OUT SYS_REFCURSOR
    ) AS
    v_team_ids VARCHARARRAY;
    BEGIN
        v_team_ids := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_team_ids);
        OPEN recordset FOR
            SELECT DISTINCT PCMM.TEAM_MEMBERSHIP.STAFF_ID FROM PCMM.TEAM_MEMBERSHIP
            INNER JOIN PCMM.TEAM ON PCMM.TEAM.TEAM_ID = PCMM.TEAM_MEMBERSHIP.TEAM_ID
            WHERE PCMM.TEAM.TEAM_ID IN (SELECT column_value FROM TABLE(v_team_ids))
            ORDER BY PCMM.TEAM_MEMBERSHIP.STAFF_ID ASC;
    END getMembersForTeam;

--------------------------------------------------------
--  DDL for Procedure getActivites
--  Purpose: Get all activities for patient and staff view matching input parameters
--  Parameters:
--    p_created_by_me         1 to filter on activities created by the user; 0 to ignore
--    p_intended_for_me       1 to filter on activities related to me by team; 0 to ignore
--    p_user_id               the pid for the user
--    p_team_ids              null or commna separated list of team ids
--    p_team_focus_ids        null or commna separated list of team focus ids
--    p_mode
--    p_start_date            the begin date when filtering by a date range (closed activities only)
--    p_end_date              the end date when filtering by a date range (closed activities only)
--    recordset:              output result set
--------------------------------------------------------
    PROCEDURE getActivites (
        p_created_by_me IN NUMBER,
        p_intended_for_me IN NUMBER,
        p_user_id IN VARCHAR2,
        p_patient_ids IN VARCHAR2,
        p_team_ids IN VARCHAR2,
        p_team_focus_ids IN VARCHAR2,
        p_mode IN VARCHAR2,
        p_start_date IN VARCHAR2,
        p_end_date IN VARCHAR2,
        recordset OUT SYS_REFCURSOR
    ) AS
    v_patient_ids VARCHARARRAY;
    v_team_ids VARCHARARRAY;
    v_team_focus_ids VARCHARARRAY;
    BEGIN
        v_patient_ids := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_patient_ids);
        v_team_ids := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_team_ids);
        v_team_focus_ids := ACTIVITYDBUSER.SPLIT_STRING_BY_COMMA(p_team_focus_ids);
        OPEN recordset FOR
            SELECT pi.PROCESSINSTANCEID as processId,
            pi.PROCESSNAME as name,
            pi.ICN as pid,
            pi.CREATEDBYID as createdById,
            pi.URGENCY as urgency,
            pi.STATE as taskState,
            pi.ASSIGNEDTO as assignedToId,
            pi.INSTANCENAME as instanceName,
            pi.DESTINATIONFACILITYID as assignedToFacilityId,
            pi.FACILITYID as createdAtId,
            pi.INITIATIONDATE as createdOn,
            TO_CHAR(pi.INITIATIONDATE, 'yyyymmddhhmi') as createdOnFormatted,
            CASE psl.ID WHEN 1 THEN 'Open' WHEN 4 THEN 'Open' WHEN 2 THEN 'Closed' WHEN 3 THEN 'Closed' ELSE '' END as "MODE",
            pi.DOMAIN as domain,
            pi.DEPLOYMENTID as deploymentId,
            pi.ACTIVITYHEALTHY as isActivityHealthy,
            pi.ACTIVITYHEALTHDESCRIPTION as activityHealthDescription
            FROM ACTIVITYDB.AM_PROCESSINSTANCE pi
            INNER JOIN ACTIVITYDB.Am_PROCESSSTATUSLOOKUP psl
            ON pi.statusId = psl.id
            WHERE (pi.STATE <> 'Draft' OR pi.STATE IS NULL) AND
            (
                p_patient_ids IS NULL
                OR
                (
                    p_patient_ids IS NOT NULL
                    AND
                    pi.ICN IN (SELECT TO_CHAR(column_value) FROM TABLE(v_patient_ids))
                )
            )
            AND
            (
                p_mode IS NULL
                OR
                CASE psl.ID WHEN 1 THEN 'open' WHEN 4 THEN 'open' WHEN 2 THEN 'closed' WHEN 3 THEN 'closed' ELSE '' END = p_mode
            )
            AND
            (
                (
                    p_start_date IS NULL OR p_end_date IS NULL
                )
                OR
                (
                    (
                        (
                            CASE psl.ID WHEN 1 THEN 'Open' WHEN 4 THEN 'Open' WHEN 2 THEN 'Closed' WHEN 3 THEN 'Closed' ELSE '' END = 'Closed'
                        )
                        AND
                        (
                            pi.INITIATIONDATE BETWEEN TO_DATE (p_start_date, 'yyyymmddhhmi') AND TO_DATE (p_end_date, 'yyyymmddhhmi')
                        )
                    )
                    OR
                    (
                        CASE psl.ID WHEN 1 THEN 'Open' WHEN 4 THEN 'Open' WHEN 2 THEN 'Closed' WHEN 3 THEN 'Closed' ELSE '' END = 'Open'
                    )
                )
            )
            AND
            (
                (
                    p_created_by_me = 0
                    AND
                    p_intended_for_me = 0
                )
                OR
                (
                    (
                        p_created_by_me = 1
                        AND
                        pi.CREATEDBYID = p_user_id
                    )
                    OR
                    (
                        p_intended_for_me = 1
                        AND
                        pi.PROCESSINSTANCEID IN
                        (
                            SELECT p.PROCESSINSTANCEID
                            FROM ACTIVITYDB.AM_PROCESSROUTE p
                            LEFT OUTER JOIN PCMM.PCM_STD_TEAM_FOCUS tf on p.TEAMFOCUS = tf.CODE
                            WHERE USERID = p_user_id OR
                            (
                                p.TEAM IN (SELECT TO_NUMBER(column_value) FROM TABLE(v_team_ids))
                                OR
                                tf.PCM_STD_TEAM_FOCUS_ID IN (SELECT TO_NUMBER(column_value) FROM TABLE(v_team_focus_ids))
                            )
                        )
                    )
                )
            )
            ORDER BY CASE psl.ID WHEN 1 THEN 'Open' WHEN 4 THEN 'Open' WHEN 2 THEN 'Closed' WHEN 3 THEN 'Closed' ELSE '' END DESC, pi.URGENCY ASC, pi.INSTANCENAME ASC, pi.PROCESSINSTANCEID ASC;
    END getActivites;
END ACTIVITIES;
/
