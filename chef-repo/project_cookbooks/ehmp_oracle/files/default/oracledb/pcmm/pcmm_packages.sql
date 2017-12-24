--------------------------------------------------------
--  DDL for Package PCMM_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE "PCMM"."PCMM_API" AS

  FUNCTION get_base_icn(i_icn IN varchar2) RETURN varchar2;
  FUNCTION pipe_teams_by_facility(i_facility_id IN VARCHAR2) RETURN TEAMS_TAB PIPELINED;
  FUNCTION pipe_teams_by_facility_patient(i_facility_id IN varchar2, i_icn IN varchar2) RETURN TEAMS_TAB PIPELINED;
  FUNCTION pipe_teams_by_patient(i_icn IN varchar2) RETURN TEAMS_TAB PIPELINED;
  FUNCTION pipe_teams_by_staff_ien(i_staff_ien IN varchar2) RETURN TEAMS_TAB PIPELINED;
  FUNCTION pipe_roles_by_team(i_team_id IN number) RETURN ROLES_TAB PIPELINED;

  PROCEDURE get_roles_for_team(
      i_team_id IN number,
      o_cursor  OUT SYS_REFCURSOR);

  PROCEDURE get_teams_for_facility(
      i_facility_id IN varchar2,
      o_cursor      OUT SYS_REFCURSOR);

  PROCEDURE get_teams_for_facility_patient(
      i_facility_id IN varchar2,
      i_icn         IN varchar2,
      o_cursor      OUT SYS_REFCURSOR);

  PROCEDURE get_teams_for_patient(
      i_icn    IN varchar2,
      o_cursor OUT SYS_REFCURSOR);

  PROCEDURE get_teams_for_user(
      i_staff_ien  IN varchar2,
      i_staff_site IN varchar2,
      o_cursor OUT SYS_REFCURSOR);

  PROCEDURE get_teams_for_user(
      i_staff_ien  IN varchar2,
      i_staff_division IN varchar2,
      o_cursor OUT SYS_REFCURSOR);

  PROCEDURE load_patient_pcm;

  PROCEDURE load_team_staff_inst;

  PROCEDURE get_patient_primary_care(
    i_icn IN varchar2,
    i_site_code IN varchar2 DEFAULT NULL,
    i_station_number IN varchar2 DEFAULT NULL,
    o_team_id OUT number,
    o_team_name OUT varchar2,
    o_staff_last_name OUT varchar2,
    o_staff_first_name OUT varchar2,
    o_staff_middle_name OUT varchar2,
    o_staff_name OUT varchar2);

END PCMM_API;

/

--------------------------------------------------------
--  DDL for Package Body PCMM_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE BODY "PCMM"."PCMM_API"
AS

  FUNCTION get_base_icn(i_icn IN varchar2) RETURN varchar2 AS
  BEGIN
    RETURN REGEXP_SUBSTR(i_icn,'[^V]+',1,1);
  END;

  FUNCTION pipe_teams_by_facility(i_facility_id IN varchar2) RETURN TEAMS_TAB PIPELINED AS
  BEGIN
    FOR rec IN (
      SELECT DISTINCT T.TEAM_ID, T.TEAM_NAME, T.PCM_STD_TEAM_CARE_TYPE_ID, I.STATIONNUMBER, S.STAFF_IEN
      FROM PCMM.STAFF S
      JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
      JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
      JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
      WHERE I.STATIONNUMBER=i_facility_id)
    LOOP
      PIPE ROW(TEAMS_ROW(rec.team_id, rec.team_name, rec.pcm_std_team_care_type_id, rec.stationnumber, rec.staff_ien));
    END LOOP;
    RETURN;
  END;

  FUNCTION pipe_teams_by_facility_patient(i_facility_id IN varchar2, i_icn IN varchar2) RETURN TEAMS_TAB PIPELINED AS
    v_base_icn varchar2(50);
  BEGIN
    v_base_icn := get_base_icn(i_icn);
    FOR rec IN (
      SELECT DISTINCT T.TEAM_ID, T.TEAM_NAME, T.PCM_STD_TEAM_CARE_TYPE_ID, I.STATIONNUMBER, S.STAFF_IEN
      FROM PCMM.STAFF S
      JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
      JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
      JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
      JOIN PCMM.TEAM_PATIENT_ASSIGN TPA ON TPA.TEAM_ID = T.TEAM_ID
      JOIN PCMM.PCMM_PATIENT P ON P.PCMM_PATIENT_ID = TPA.PCMM_PATIENT_ID
      WHERE I.STATIONNUMBER=i_facility_id AND P.BASE_ICN = v_base_icn)
    LOOP
      PIPE ROW(TEAMS_ROW(rec.team_id, rec.team_name, rec.pcm_std_team_care_type_id, rec.stationnumber, rec.staff_ien));
    END LOOP;
    RETURN;
  END;

  FUNCTION pipe_teams_by_patient(i_icn IN varchar2) RETURN TEAMS_TAB PIPELINED AS
    v_base_icn varchar2(50);
  BEGIN
    v_base_icn := get_base_icn(i_icn);
    FOR rec IN (
      SELECT DISTINCT T.TEAM_ID, T.TEAM_NAME, T.PCM_STD_TEAM_CARE_TYPE_ID, I.STATIONNUMBER, S.STAFF_IEN
      FROM PCMM.STAFF S
      JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
      JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
      JOIN PCMM.TEAM_PATIENT_ASSIGN TPA ON T.TEAM_ID = TPA.TEAM_ID
      JOIN PCMM.PCMM_PATIENT P ON P.PCMM_PATIENT_ID = TPA.PCMM_PATIENT_ID
      JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
      WHERE P.BASE_ICN = v_base_icn)
    LOOP
      PIPE ROW(TEAMS_ROW(rec.team_id, rec.team_name, rec.pcm_std_team_care_type_id, rec.stationnumber, rec.staff_ien));
    END LOOP;
    RETURN;
  END;

  FUNCTION pipe_teams_by_staff_ien(i_staff_ien IN varchar2) RETURN TEAMS_TAB PIPELINED AS
  BEGIN
    FOR rec IN (
      SELECT DISTINCT T.TEAM_ID, T.TEAM_NAME, T.PCM_STD_TEAM_CARE_TYPE_ID, I.STATIONNUMBER, S.STAFF_IEN
      FROM PCMM.STAFF S
      JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
      JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
      JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
      WHERE S.STAFF_IEN=i_staff_ien)
    LOOP
      PIPE ROW(TEAMS_ROW(rec.team_id, rec.team_name, rec.pcm_std_team_care_type_id, rec.stationnumber, rec.staff_ien));
    END LOOP;
    RETURN;
  END;

  FUNCTION pipe_roles_by_team(i_team_id IN number) RETURN ROLES_TAB PIPELINED AS
  BEGIN
    FOR rec IN (
      SELECT DISTINCT TR.PCM_STD_TEAM_ROLE_ID, TR.NAME, S.STAFF_IEN, I.STATIONNUMBER
      FROM PCMM.STAFF S
      JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
      JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
      JOIN PCMM.PCM_STD_TEAM_ROLE TR ON TM.PCM_STD_TEAM_ROLE_ID = TR.PCM_STD_TEAM_ROLE_ID
      JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
      WHERE T.TEAM_ID=i_team_id)
    LOOP
      PIPE ROW(ROLES_ROW(rec.pcm_std_team_role_id, rec.name, rec.staff_ien, rec.stationnumber));
    END LOOP;
    RETURN;
  END;

  PROCEDURE get_roles_for_team(
      i_team_id IN number,
      o_cursor  OUT SYS_REFCURSOR)
  AS
  BEGIN
    OPEN o_cursor FOR
    SELECT DISTINCT PCM_STD_TEAM_ROLE_ID, NAME
    FROM TABLE(pipe_roles_by_team(i_team_id)) TEAM_ROLES
    JOIN EHMP.EHMP_DIVISIONS D ON D.DIVISION_ID = TEAM_ROLES.STATIONNUMBER
    WHERE EXISTS (SELECT null
                  FROM EHMP.EHMP_ROUTING_USERS U
                  WHERE U.USER_IEN = TEAM_ROLES.STAFF_IEN AND
                        U.USER_SITE = D.SITE_CODE);
  END;

  PROCEDURE get_teams_for_facility(
      i_facility_id IN varchar2,
      o_cursor      OUT SYS_REFCURSOR)
  AS
  BEGIN

    OPEN o_cursor FOR
    SELECT DISTINCT TEAM_ID, TEAM_NAME, PCM_STD_TEAM_CARE_TYPE_ID, STATIONNUMBER
    FROM TABLE(pipe_teams_by_facility(i_facility_id)) TEAMS
    WHERE EXISTS (SELECT null
                  FROM EHMP.EHMP_ROUTING_USERS U
                  WHERE U.USER_IEN = TEAMS.STAFF_IEN AND
                        U.USER_SITE = (SELECT SITE_CODE
                                       FROM EHMP.EHMP_DIVISIONS
                                       WHERE DIVISION_ID = i_facility_id));

  END;

  PROCEDURE get_teams_for_facility_patient(
      i_facility_id IN varchar2,
      i_icn         IN varchar2,
      o_cursor      OUT SYS_REFCURSOR)
  AS
  BEGIN
    OPEN o_cursor FOR
    SELECT DISTINCT TEAM_ID, TEAM_NAME, STATIONNUMBER
    FROM TABLE(pipe_teams_by_facility_patient(i_facility_id, i_icn)) TEAMS
    JOIN EHMP.EHMP_DIVISIONS D ON D.DIVISION_ID = TEAMS.STATIONNUMBER
    WHERE EXISTS (SELECT null 
                  FROM EHMP.EHMP_ROUTING_USERS U 
                  WHERE U.USER_IEN = TEAMS.STAFF_IEN AND
                        U.USER_SITE = D.SITE_CODE);
  END;

  PROCEDURE get_teams_for_patient(
      i_icn    IN varchar2,
      o_cursor OUT SYS_REFCURSOR)
  AS
  BEGIN
    OPEN o_cursor FOR
    SELECT DISTINCT TEAM_ID, TEAM_NAME, STATIONNUMBER
    FROM TABLE(pipe_teams_by_patient(i_icn)) TEAMS
    JOIN EHMP.EHMP_DIVISIONS D ON D.DIVISION_ID = TEAMS.STATIONNUMBER
    WHERE EXISTS (SELECT null 
                  FROM EHMP.EHMP_ROUTING_USERS U 
                  WHERE U.USER_IEN = TEAMS.STAFF_IEN AND
                        U.USER_SITE = D.SITE_CODE);

  END;

  PROCEDURE get_teams_for_user(
      i_staff_ien  IN varchar2,
      i_staff_site IN varchar2,
      o_cursor OUT SYS_REFCURSOR)
  AS
  BEGIN
    OPEN o_cursor FOR
    SELECT DISTINCT TEAM_ID, TEAM_NAME, PCM_STD_TEAM_CARE_TYPE_ID, STATIONNUMBER
    FROM TABLE(pipe_teams_by_staff_ien(i_staff_ien)) TEAMS
    WHERE STATIONNUMBER IN (SELECT D.DIVISION_ID
                            FROM EHMP.EHMP_DIVISIONS D
                            WHERE D.SITE_CODE = i_staff_site);
  END;

  PROCEDURE get_teams_for_user(
      i_staff_ien  IN varchar2,
      i_staff_division IN varchar2,
      o_cursor OUT SYS_REFCURSOR)
  AS
  BEGIN
    OPEN o_cursor FOR
    SELECT DISTINCT T.TEAM_ID, T.TEAM_NAME, T.PCM_STD_TEAM_CARE_TYPE_ID, I.STATIONNUMBER, S.STAFF_IEN
    FROM PCMM.STAFF S
    JOIN PCMM.TEAM_MEMBERSHIP TM ON S.STAFF_ID = TM.STAFF_ID
    JOIN PCMM.TEAM T ON T.TEAM_ID = TM.TEAM_ID
    JOIN SDSADM.STD_INSTITUTION I ON I.ID = T.VA_INSTITUTION_ID
    WHERE S.STAFF_IEN=i_staff_ien AND
          I.STATIONNUMBER = i_staff_division;
  END;

  PROCEDURE load_patient_pcm
  AS
  BEGIN
    DELETE FROM pcmm.patient_primary_care;
    INSERT /*+ APPEND */ INTO pcmm.patient_primary_care (ICN, BASE_ICN, TEAM_ID, TEAM_NAME, TEAM_STATION_NUMBER, STAFF_IEN, STAFF_LAST_NAME, STAFF_FIRST_NAME, STAFF_MIDDLE_NAME, TEAM_PATIENT_START_DATE, TEAM_STAFF_START_DATE)
    SELECT ICN, BASE_ICN, TEAM_ID, TEAM_NAME, TEAM_STATION_NUMBER, STAFF_IEN, STAFF_LAST_NAME, STAFF_FIRST_NAME, STAFF_MIDDLE_NAME, TEAM_PATIENT_START_DATE, TEAM_STAFF_START_DATE
    FROM pcmm.patient_primary_care_view;
    COMMIT;
    EXCEPTION
      WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
  END;

  PROCEDURE load_team_staff_inst
  AS
  BEGIN
    DELETE FROM pcmm.team_staff_inst;
    INSERT /*+ APPEND */ INTO pcmm.team_staff_inst
    (
      TEAM_ID,
      TEAM_POSITION_ID,
      PCM_STD_TEAM_ROLE_ID,
      STATIONNUMBER,
      STAFF_IEN,
      VA_INSTITUTION_ID,
      STAFF_ID,
      FIRST_NAME,
      MIDDLE_NAME,
      LAST_NAME,
      PCM_STD_TEAM_CARE_TYPE_ID,
      PCM_STD_TEAM_FOCUS_CODE
    )
    SELECT
      TEAM_ID,
      TEAM_POSITION_ID,
      PCM_STD_TEAM_ROLE_ID,
      STATIONNUMBER,
      STAFF_IEN,
      VA_INSTITUTION_ID,
      STAFF_ID,
      FIRST_NAME,
      MIDDLE_NAME,
      LAST_NAME,
      PCM_STD_TEAM_CARE_TYPE_ID,
      PCM_STD_TEAM_FOCUS_CODE
    FROM PCMM.TEAM_STAFF_INST_VIEW;
    COMMIT;
    EXCEPTION
      WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
  END;

  PROCEDURE get_patient_primary_care(
    i_icn IN varchar2,
    i_site_code IN varchar2 DEFAULT NULL,
    i_station_number IN varchar2 DEFAULT NULL,
    o_team_id OUT number,
    o_team_name OUT varchar2,
    o_staff_last_name OUT varchar2,
    o_staff_first_name OUT varchar2,
    o_staff_middle_name OUT varchar2,
    o_staff_name OUT varchar2)
  AS
    PROCEDURE query_patient_primary_care(
      i_icn IN varchar2,
      i_site_code IN varchar2 DEFAULT NULL,
      i_station_number IN varchar2 DEFAULT NULL,
      o_team_id OUT number,
      o_team_name OUT varchar2,
      o_staff_last_name OUT varchar2,
      o_staff_first_name OUT varchar2,
      o_staff_middle_name OUT varchar2,
      o_staff_name OUT varchar2)
    AS
      v_base_icn varchar2(50);
    BEGIN
      v_base_icn := get_base_icn(i_icn);
      SELECT team_id, team_name, staff_last_name, staff_first_name, staff_middle_name
      INTO o_team_id, o_team_name, o_staff_last_name, o_staff_first_name, o_staff_middle_name
      FROM
      (
        SELECT DISTINCT ppc.team_id, ppc.team_name, ppc.staff_last_name, ppc.staff_first_name, ppc.staff_middle_name, ppc.team_patient_start_date, ppc.team_staff_start_date
        FROM pcmm.patient_primary_care ppc
        LEFT JOIN ehmp.ehmp_divisions d ON d.division_id = ppc.team_station_number
        WHERE base_icn = v_base_icn and (i_site_code is null or d.site_code = i_site_code) and (i_station_number is null or ppc.team_station_number = i_station_number)
        ORDER BY ppc.team_patient_start_date DESC, ppc.team_staff_start_date DESC
      )
      WHERE ROWNUM = 1;

      EXCEPTION
        WHEN NO_DATA_FOUND THEN
          NULL;
    END;
  BEGIN

    IF i_site_code IS NULL and i_station_number IS NULL THEN
      query_patient_primary_care(i_icn, i_site_code, i_station_number, o_team_id, o_team_name, o_staff_last_name, o_staff_first_name, o_staff_middle_name, o_staff_name);
    ElSIF i_station_number IS NOT NULL THEN
      query_patient_primary_care(i_icn, NULL, i_station_number, o_team_id, o_team_name, o_staff_last_name, o_staff_first_name, o_staff_middle_name, o_staff_name);
    END IF;
    IF o_team_id IS NULL and i_site_code IS NOT NULL THEN
      query_patient_primary_care(i_icn, i_site_code, NULL, o_team_id, o_team_name, o_staff_last_name, o_staff_first_name, o_staff_middle_name, o_staff_name);
    END IF;

    IF o_staff_last_name IS NOT NULL THEN
      o_staff_name := o_staff_last_name;
    END IF;

    IF o_staff_first_name IS NOT NULL THEN
      o_staff_name := o_staff_name || ', ' || o_staff_first_name;
      IF o_staff_middle_name IS NOT NULL THEN
        o_staff_name := o_staff_name || ' ' || o_staff_middle_name;
      END IF;
    END IF;

  END;

END PCMM_API;
/