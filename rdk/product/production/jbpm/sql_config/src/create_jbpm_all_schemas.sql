set serveroutput on
--
-- Drop the SDSADM tables if still in Oracle
--
DECLARE
   sql_statement VARCHAR2(1024);
   CURSOR pcmm_tables_cur
   IS
      SELECT table_name
      FROM DBA_TABLES
      WHERE OWNER = 'SDSADM';
BEGIN
   FOR table_rec
   IN pcmm_tables_cur
   LOOP
      sql_statement := 'DROP TABLE SDSADM.'||table_rec.table_name||' CASCADE CONSTRAINTS';
      DBMS_OUTPUT.put_line(sql_statement);
      EXECUTE IMMEDIATE sql_statement;
   END LOOP;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION DROPPING SDSADM TABLES '||SQLCODE||SQLERRM);
END;
/

--
-- Drop PCMM_EXT user
--
DECLARE
        U_COUNT NUMBER;
        user_name VARCHAR2 (50);

    BEGIN
        U_COUNT :=0;
        user_name := 'PCMM_EXT';

        SELECT COUNT (1) INTO U_COUNT FROM dba_users WHERE username = UPPER (user_name);

        IF U_COUNT > 0
          THEN
            EXECUTE IMMEDIATE 'DROP USER '||user_name||' CASCADE';
          END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING PCMM_EXT USER '||SQLCODE||SQLERRM);
END;
/

--
-- Drop CISS user
--
DECLARE
        U_COUNT NUMBER;
        user_name VARCHAR2 (50);
    BEGIN
        U_COUNT := 0;
        user_name := 'CISS';

        SELECT COUNT (1) INTO U_COUNT FROM dba_users WHERE username = UPPER (user_name);

        IF U_COUNT > 0
          THEN
            EXECUTE IMMEDIATE 'DROP USER '||user_name||' CASCADE';
          END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING CISS USER '||SQLCODE||SQLERRM);
END;
/

--
-- Drop CISS_EXT user
--
DECLARE
        U_COUNT NUMBER;
        user_name VARCHAR2 (50);
    BEGIN

        U_COUNT := 0;
        user_name := 'CISS_EXT';

        SELECT COUNT (1) INTO U_COUNT FROM dba_users WHERE username = UPPER (user_name);

        IF U_COUNT > 0
          THEN
            EXECUTE IMMEDIATE 'DROP USER '||user_name||' CASCADE';
          END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING CISS USER '||SQLCODE||SQLERRM);

  END;

/

--
-- Drop pcmm_replication user
--
DECLARE
        U_COUNT NUMBER;
        user_name VARCHAR2 (50);
    BEGIN

        U_COUNT := 0;
        user_name := 'PCMM_REPLICATION';

        SELECT COUNT (1) INTO U_COUNT FROM dba_users WHERE username = UPPER (user_name);

        IF U_COUNT > 0
          THEN
            EXECUTE IMMEDIATE 'DROP USER '||user_name||' CASCADE';
          END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING PCMM_REPLICATION USER '||SQLCODE||SQLERRM);

  END;

/

--
-- Create the Views of all avaialble MSSQL (SDSADM) tables
--
BEGIN

  EXECUTE IMMEDIATE 'CREATE OR REPLACE FORCE VIEW SDSADM.STD_INSTITUTION (ID, STATIONNUMBER) AS SELECT "id","stationNumber" FROM sdsadm.STD_INSTITUTION@EHMP';

  EXECUTE IMMEDIATE 'GRANT SELECT ON SDSADM.STD_INSTITUTION TO ACTIVITYDBUSER';
  EXECUTE IMMEDIATE 'GRANT SELECT ON SDSADM.STD_INSTITUTION TO NOTIFDB';

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('EXCEPTION CREATING SDSADM VIEWS '||SQLCODE||SQLERRM);
END;
/

--recompile notifdb package
alter package notifdb.notifs_pkg compile;
