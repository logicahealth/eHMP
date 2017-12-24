--------------------------------------------------------
--  DDL for Package EHMP_ROUTING_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE "EHMP"."EHMP_ROUTING_API" AS
  PROCEDURE insert_user(
      i_user_uid    VARCHAR2,
      i_user_ien    VARCHAR2,
      i_user_site   VARCHAR2,
      i_active_flag VARCHAR2 DEFAULT 'Y',
      i_event_type  VARCHAR2 DEFAULT 'add',
      i_event_time  TIMESTAMP DEFAULT systimestamp,
      o_rowcount    OUT NUMBER);
  PROCEDURE delete_user(
      i_user_uid VARCHAR2,
      o_rowcount OUT NUMBER);
  PROCEDURE clear_user_staging;
  PROCEDURE load_users_from_staging;
  PROCEDURE stage_user(
      i_user_uid    VARCHAR2,
      i_user_ien    VARCHAR2,
      i_user_site   VARCHAR2,
      o_rowcount    OUT NUMBER);
END EHMP_ROUTING_API;

/

--------------------------------------------------------
--  DDL for Package Body EHMP_ROUTING_API
--------------------------------------------------------

CREATE OR REPLACE PACKAGE BODY "EHMP"."EHMP_ROUTING_API" 
AS
  PROCEDURE insert_user(
      i_user_uid    VARCHAR2,
      i_user_ien    VARCHAR2,
      i_user_site   VARCHAR2,
      i_active_flag VARCHAR2 DEFAULT 'Y',
      i_event_type  VARCHAR2 DEFAULT 'add',
      i_event_time  TIMESTAMP DEFAULT systimestamp,
      o_rowcount    OUT NUMBER)
  AS
  BEGIN
    MERGE INTO ehmp.ehmp_routing_users u USING dual ON (u.user_uid = i_user_uid)
    WHEN NOT MATCHED THEN
      INSERT (user_uid, user_ien, user_site, active_flag, event_type, event_time)
      VALUES (i_user_uid, i_user_ien, i_user_site, i_active_flag, i_event_type, i_event_time);
    o_rowcount := sql%rowcount;
  END;

  PROCEDURE delete_user(
    i_user_uid VARCHAR2,
    o_rowcount OUT NUMBER)
  AS
  BEGIN
    DELETE FROM ehmp.ehmp_routing_users WHERE user_uid = i_user_uid;
    o_rowcount := sql%rowcount;
  END delete_user;

  PROCEDURE clear_user_staging
  AS
  BEGIN
    EXECUTE IMMEDIATE 'TRUNCATE TABLE ehmp.ehmp_routing_users_tmp';
  END clear_user_staging;
  
  PROCEDURE stage_user(
      i_user_uid    VARCHAR2,
      i_user_ien    VARCHAR2,
      i_user_site   VARCHAR2,
      o_rowcount    OUT NUMBER)
  AS
  BEGIN
    MERGE INTO ehmp.ehmp_routing_users_tmp u USING dual ON (u.user_uid = i_user_uid)
    WHEN NOT MATCHED THEN
      INSERT (user_uid, user_ien, user_site)
      VALUES (i_user_uid, i_user_ien, i_user_site);
    o_rowcount := sql%rowcount;
  END stage_user;

  PROCEDURE load_users_from_staging
  AS
  BEGIN

    INSERT INTO ehmp.ehmp_routing_users (user_uid, user_ien, user_site)
    SELECT user_uid, user_ien, user_site
    FROM ehmp.ehmp_routing_users_tmp tmp
    WHERE NOT EXISTS (SELECT user_uid FROM ehmp.ehmp_routing_users u WHERE u.user_uid = tmp.user_uid);
    
    DELETE FROM ehmp.ehmp_routing_users u
    WHERE NOT EXISTS (SELECT user_uid FROM ehmp.ehmp_routing_users_tmp tmp WHERE u.user_uid = tmp.user_uid);
  
  END load_users_from_staging;

END EHMP_ROUTING_API;

/

--------------------------------------------------------
--  DDL for Package Grants
--------------------------------------------------------

GRANT EXECUTE ON EHMP.EHMP_ROUTING_API TO ehmp_rw_role;
/
