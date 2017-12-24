SET SERVEROUTPUT ON
BEGIN
  -- truncate tables
  FOR table_rec IN (SELECT table_name, owner FROM DBA_TABLES WHERE owner IN ('ACTIVITYDB', 'JBPM', 'COMMUNICATION', 'NOTIFDB') AND table_name NOT IN ('SIMPLE_MATCH_VALUE'))
  LOOP
    EXECUTE IMMEDIATE 'TRUNCATE TABLE ' || table_rec.owner || '.' || table_rec.table_name;
  END LOOP table_rec;
  DBMS_OUTPUT.PUT_LINE('TABLES TRUNCATED');
END;
/
