DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE TABLE COMMUNICATION.MESSAGE
    (
      IDENTIFIER VARCHAR2(36) NOT NULL,
      CATEGORY_SYSTEM VARCHAR2(255) NOT NULL,
      CATEGORY_CODE VARCHAR2(255) NOT NULL,
      SENDER VARCHAR2(255) NOT NULL,
      RECIPIENT VARCHAR2(255),
      PAYLOAD_CONTENT CLOB NOT NULL,
      PAYLOAD_DATA CLOB,
      PAYLOAD_TITLE VARCHAR2(255) NOT NULL,
      PAYLOAD_ATTACHMENT_DATA BLOB,
      PAYLOAD_ATTACHMENT_CONTENTTYPE VARCHAR2(255),
      SENT TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
      STATUS_SYSTEM VARCHAR2(255) NOT NULL,
      STATUS_CODE VARCHAR2(255) NOT NULL,
      CATEGORY AS (CATEGORY_SYSTEM||''/''||CATEGORY_CODE),
      STATUS AS (STATUS_SYSTEM||''/''||STATUS_CODE),
      CONSTRAINT MESSAGE_PK PRIMARY KEY (IDENTIFIER) USING INDEX TABLESPACE "COMM_X"
    )';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

--------------------------------------------------------
--  DDL for Index MESSAGE_CATEGORY_I
--------------------------------------------------------

DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE INDEX "COMMUNICATION"."MESSAGE_CATEGORY_I" ON "COMMUNICATION"."MESSAGE" ("CATEGORY_SYSTEM", "CATEGORY_CODE") 
    TABLESPACE "COMM_X"';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

-------------------------------------------------------
--  DDL for Index MESSAGE_STATUS_I
--------------------------------------------------------

DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE INDEX "COMMUNICATION"."MESSAGE_STATUS_I" ON "COMMUNICATION"."MESSAGE" ("STATUS_SYSTEM", "STATUS_CODE") 
    TABLESPACE "COMM_X"';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

-------------------------------------------------------
--  DDL for Index MESSAGE_CATEGORY_VIRTUAL_I
--------------------------------------------------------

DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE INDEX "COMMUNICATION"."MESSAGE_CATEGORY_VIRTUAL_I" ON "COMMUNICATION"."MESSAGE" ("CATEGORY") 
    TABLESPACE "COMM_X"';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

-------------------------------------------------------
--  DDL for Index MESSAGE_STATUS_VIRTUAL_I
--------------------------------------------------------

DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE INDEX "COMMUNICATION"."MESSAGE_STATUS_VIRTUAL_I" ON "COMMUNICATION"."MESSAGE" ("STATUS") 
    TABLESPACE "COMM_X"';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/



