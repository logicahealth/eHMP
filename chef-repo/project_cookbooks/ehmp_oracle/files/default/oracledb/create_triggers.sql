--------------------------------------------------------
--  DDL for Trigger MESSAGE_INTEGRITY_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "COMMUNICATION"."MESSAGE_INTEGRITY_TRG" BEFORE
  INSERT OR
  UPDATE OF STATUS_CODE, STATUS_SYSTEM, CATEGORY_CODE, CATEGORY_SYSTEM ON COMMUNICATION.MESSAGE 
  FOR EACH ROW 
  DECLARE v_count NUMBER;
  BEGIN
  
    SELECT COUNT(*) INTO v_count
    FROM COMMUNICATION.CODES C
    WHERE C.SYSTEM = :NEW.STATUS_SYSTEM AND C.CODE = :NEW.STATUS_CODE AND C.TYPE = 'message.status';
    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20000, 'Invalid status. Reference communication.codes table for valid values.');
    END IF;

    SELECT COUNT(*)INTO v_count
    FROM COMMUNICATION.CODES C
    WHERE C.SYSTEM = :NEW.CATEGORY_SYSTEM AND C.CODE = :NEW.CATEGORY_CODE AND C.TYPE = 'message.category';
    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20000, 'Invalid category. Reference communication.codes table for valid values.');
    END IF;
  END;
/
ALTER TRIGGER "COMMUNICATION"."MESSAGE_INTEGRITY_TRG" ENABLE;
/
--------------------------------------------------------
--  DDL to drop removed Trigger USER_PREFERENCES_INTEGRITY_TRG
--------------------------------------------------------

DECLARE
  l_count integer;
BEGIN

  SELECT count(*)
  INTO l_count
  FROM dba_triggers
  WHERE owner = 'COMMUNICATION' and trigger_name = 'MESSAGE_INTEGRITY_TRG';

  if l_count > 0 then 
     execute immediate 'DROP TRIGGER COMMUNICATION.MESSAGE_INTEGRITY_TRG';
  end if;

EXCEPTION
       WHEN OTHERS
          THEN
                 DBMS_OUTPUT.put_line (SQLERRM);
                 DBMS_OUTPUT.put_line ('   ');
                 RAISE;

END;
/

--------------------------------------------------------
--  DDL for Trigger USER_PREFERENCES_CATEGORY_TRG
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "COMMUNICATION"."USER_PREFERENCES_CATEGORY_TRG" BEFORE
  INSERT OR
  UPDATE OF CATEGORY_CODE, CATEGORY_SYSTEM ON COMMUNICATION.USER_PREFERENCES 
  FOR EACH ROW 
  DECLARE v_count NUMBER;
  BEGIN

    SELECT COUNT(*)INTO v_count
    FROM COMMUNICATION.CODES C
    WHERE C.SYSTEM = :NEW.CATEGORY_SYSTEM AND C.CODE = :NEW.CATEGORY_CODE AND C.TYPE = 'message.category';
    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20000, 'Invalid category. Reference communication.codes table for valid values.');
    END IF;
  END;
/
ALTER TRIGGER "COMMUNICATION"."USER_PREFERENCES_CATEGORY_TRG" ENABLE;
