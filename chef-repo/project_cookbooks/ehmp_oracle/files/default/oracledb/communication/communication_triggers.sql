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
--  DDL for Trigger USER_PREFERENCES_INTEGRITY_TRG
--------------------------------------------------------

CREATE OR REPLACE TRIGGER "COMMUNICATION"."USER_PREFERENCES_INTEGRITY_TRG" BEFORE
  INSERT OR
  UPDATE OF CATEGORY_CODE, CATEGORY_SYSTEM ON COMMUNICATION.MESSAGE 
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
ALTER TRIGGER "COMMUNICATION"."USER_PREFERENCES_INTEGRITY_TRG" ENABLE;
/
