DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE TABLE COMMUNICATION.CODES
    (
      TYPE   VARCHAR2(255) NOT NULL,
      SYSTEM VARCHAR2(255) NOT NULL,
      CODE   VARCHAR2(255) NOT NULL,
      CONSTRAINT CODES_PK PRIMARY KEY (TYPE, SYSTEM, CODE) USING INDEX TABLESPACE "COMM_X"
    )';
  EXECUTE IMMEDIATE sql_statement;

  EXECUTE IMMEDIATE 'INSERT INTO COMMUNICATION.CODES (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-promotions'')';
  EXECUTE IMMEDIATE 'INSERT INTO COMMUNICATION.CODES (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-system'')';
  EXECUTE IMMEDIATE 'INSERT INTO COMMUNICATION.CODES (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-terms'')';
  EXECUTE IMMEDIATE 'INSERT INTO COMMUNICATION.CODES (TYPE,SYSTEM,CODE) values (''message.status'',''http://ehmp.DNS   /messageStatus'',''deleted'')';
  EXECUTE IMMEDIATE 'INSERT INTO COMMUNICATION.CODES (TYPE,SYSTEM,CODE) values (''message.status'',''http://hl7.org/fhir/ValueSet/communication-status'',''completed'')';
  COMMIT;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/