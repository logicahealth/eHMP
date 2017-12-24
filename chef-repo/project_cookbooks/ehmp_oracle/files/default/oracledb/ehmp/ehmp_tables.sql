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
        DBMS_OUTPUT.put_line ('ERROR - EHMP_TABLES');
        DBMS_OUTPUT.put_line (SQLERRM);
        RAISE;
  END;

BEGIN

--------------------------------------------------------
--  DDL for Table EHMP_ROUTING_USERS
--------------------------------------------------------

  execute_ddl('
    CREATE TABLE EHMP.EHMP_ROUTING_USERS
    (
      USER_UID VARCHAR2(36) NOT NULL,
      USER_IEN VARCHAR2(50) NOT NULL,
      USER_SITE VARCHAR2(50) NOT NULL,
      ACTIVE_FLAG VARCHAR2(1) DEFAULT ''Y'',
      EVENT_TYPE VARCHAR2(50) DEFAULT ''add'' NOT NULL,
      EVENT_TIME TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
      CONSTRAINT ROUTING_USERS_PK PRIMARY KEY (USER_UID) USING INDEX TABLESPACE "EHMP_X",
      CONSTRAINT ROUTING_USERS_ACTIVE_CHK CHECK (ACTIVE_FLAG IN (''Y'', ''N''))
    )
  ');

--------------------------------------------------------
--  DDL for Index EHMP_ROUTING_USERS_I
--------------------------------------------------------
  execute_ddl('
    CREATE INDEX "EHMP"."EHMP_ROUTING_USERS_I" ON "EHMP"."EHMP_ROUTING_USERS" ("USER_IEN", "USER_SITE")
    TABLESPACE "EHMP_X"
    ');

--------------------------------------------------------
--  DDL for Table EHMP_ROUTING_USERS_TMP
--------------------------------------------------------
  execute_ddl('
    CREATE TABLE EHMP.EHMP_ROUTING_USERS_TMP
    (
      USER_UID VARCHAR2(36) NOT NULL,
      USER_IEN VARCHAR2(50) NOT NULL,
      USER_SITE VARCHAR2(50) NOT NULL,
      CONSTRAINT ROUTING_USERS_TMP_PK PRIMARY KEY (USER_UID) USING INDEX TABLESPACE "EHMP_X"
    )
  ');

-------------------------------------------------------
--  DDL for Table EHMP_DIVISIONS
--------------------------------------------------------

  execute_ddl('
    CREATE TABLE EHMP.EHMP_DIVISIONS
    (
      DIVISION_ID VARCHAR2(50) NOT NULL,
      DIVISION_NAME VARCHAR2(255),
      SITE_CODE VARCHAR2(50) NOT NULL,
      CONSTRAINT EHMP_DIVISIONS_PK PRIMARY KEY (DIVISION_ID) USING INDEX TABLESPACE "EHMP_X"
    )
  ');

--------------------------------------------------------
--  DDL for Index EHMP_DIVISIONS_SITE_CODE_I
--------------------------------------------------------

  execute_ddl('
    CREATE INDEX "EHMP"."EHMP_DIVISIONS_SITE_CODE_I" ON "EHMP"."EHMP_DIVISIONS" ("SITE_CODE")
    TABLESPACE "EHMP_X"
  ');

END;
/