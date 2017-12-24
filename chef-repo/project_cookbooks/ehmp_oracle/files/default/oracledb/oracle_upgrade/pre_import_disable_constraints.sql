SET SERVEROUTPUT ON
BEGIN
  -- disable foreign key constraints
  FOR constraint_rec IN (SELECT table_name, constraint_name, owner FROM all_constraints WHERE owner IN ('ACTIVITYDB', 'JBPM', 'COMMUNICATION', 'NOTIFDB') AND constraint_type ='R' AND status = 'ENABLED')
  LOOP
    EXECUTE IMMEDIATE 'alter table ' || constraint_rec.owner || '.' || constraint_rec.table_name || ' disable constraint ' || constraint_rec.constraint_name;
  END LOOP constraint_rec;
  DBMS_OUTPUT.PUT_LINE('CONSTRAINTS DISABLED');
END;
/
BEGIN
  -- disable triggers
  FOR trigger_rec IN (SELECT owner, trigger_name FROM all_triggers WHERE owner IN ('ACTIVITYDB', 'JBPM', 'COMMUNICATION', 'NOTIFDB') AND status = 'ENABLED')
  LOOP
    EXECUTE IMMEDIATE 'alter trigger ' || trigger_rec.owner || '.' || trigger_rec.trigger_name || ' disable';
  END LOOP trigger_rec;
  DBMS_OUTPUT.PUT_LINE('TRIGGERS DISABLED');
END;
/
