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
        DBMS_OUTPUT.put_line ('ERROR - COMMUNICATION_TABLES');
        DBMS_OUTPUT.put_line (SQLERRM);
        RAISE;
  END;

BEGIN

--------------------------------------------------------
--  DDL for Table CODES
--------------------------------------------------------

  execute_ddl('
    CREATE TABLE COMMUNICATION.CODES
    (
      TYPE   VARCHAR2(255) NOT NULL,
      SYSTEM VARCHAR2(255) NOT NULL,
      CODE   VARCHAR2(255) NOT NULL,
      CONSTRAINT CODES_PK PRIMARY KEY (TYPE, SYSTEM, CODE) USING INDEX TABLESPACE "COMM_X"
    )
  ');

  EXECUTE IMMEDIATE 'MERGE INTO COMMUNICATION.CODES USING DUAL ON (TYPE = ''message.category'' and SYSTEM = ''http://ehmp.DNS   /messageCategories'' and CODE = ''announcements-promotions'') WHEN NOT MATCHED THEN INSERT (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-promotions'')';
  EXECUTE IMMEDIATE 'MERGE INTO COMMUNICATION.CODES USING DUAL ON (TYPE = ''message.category'' and SYSTEM = ''http://ehmp.DNS   /messageCategories'' and CODE = ''announcements-system'') WHEN NOT MATCHED THEN INSERT (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-system'')';
  EXECUTE IMMEDIATE 'MERGE INTO COMMUNICATION.CODES USING DUAL ON (TYPE = ''message.category'' and SYSTEM = ''http://ehmp.DNS   /messageCategories'' and CODE = ''announcements-terms'') WHEN NOT MATCHED THEN INSERT (TYPE,SYSTEM,CODE) values (''message.category'',''http://ehmp.DNS   /messageCategories'',''announcements-terms'')';
  EXECUTE IMMEDIATE 'MERGE INTO COMMUNICATION.CODES USING DUAL ON (TYPE = ''message.status'' and SYSTEM = ''http://ehmp.DNS   /messageStatus'' and CODE = ''deleted'') WHEN NOT MATCHED THEN INSERT (TYPE,SYSTEM,CODE) values (''message.status'',''http://ehmp.DNS   /messageStatus'',''deleted'')';
  EXECUTE IMMEDIATE 'MERGE INTO COMMUNICATION.CODES USING DUAL ON (TYPE = ''message.status'' and SYSTEM = ''http://hl7.org/fhir/ValueSet/communication-status'' and CODE = ''completed'') WHEN NOT MATCHED THEN INSERT (TYPE,SYSTEM,CODE) values (''message.status'',''http://hl7.org/fhir/ValueSet/communication-status'',''completed'')';
  COMMIT;

--------------------------------------------------------
--  DDL for Table MESSAGE
--------------------------------------------------------

  execute_ddl('
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
    )
  ');

--------------------------------------------------------
--  DDL for Index MESSAGE_CATEGORY_I
--------------------------------------------------------

  execute_ddl('
    CREATE INDEX "COMMUNICATION"."MESSAGE_CATEGORY_I" ON "COMMUNICATION"."MESSAGE" ("CATEGORY_SYSTEM", "CATEGORY_CODE")
    TABLESPACE "COMM_X"
  ');

-------------------------------------------------------
--  DDL for Index MESSAGE_STATUS_I
--------------------------------------------------------

  execute_ddl('
    CREATE INDEX "COMMUNICATION"."MESSAGE_STATUS_I" ON "COMMUNICATION"."MESSAGE" ("STATUS_SYSTEM", "STATUS_CODE")
    TABLESPACE "COMM_X"
  ');

-------------------------------------------------------
--  DDL for Index MESSAGE_CATEGORY_VIRTUAL_I
--------------------------------------------------------

  execute_ddl('
    CREATE INDEX "COMMUNICATION"."MESSAGE_CATEGORY_VIRTUAL_I" ON "COMMUNICATION"."MESSAGE" ("CATEGORY")
    TABLESPACE "COMM_X"
  ');

-------------------------------------------------------
--  DDL for Index MESSAGE_STATUS_VIRTUAL_I
-------------------------------------------------------

  execute_ddl('
    CREATE INDEX "COMMUNICATION"."MESSAGE_STATUS_VIRTUAL_I" ON "COMMUNICATION"."MESSAGE" ("STATUS")
    TABLESPACE "COMM_X"
  ');

-------------------------------------------------------
--  DDL for Table USER_PREFERENCES
-------------------------------------------------------

  execute_ddl('
    CREATE TABLE COMMUNICATION.USER_PREFERENCES
    (
      USER_ID         VARCHAR2(36) NOT NULL,
      CATEGORY_SYSTEM VARCHAR2(255) NOT NULL,
      CATEGORY_CODE   VARCHAR2(255) NOT NULL,
      ENABLED         VARCHAR2(1) NOT NULL,
      CONSTRAINT USER_PREFERENCES_PK PRIMARY KEY (USER_ID, CATEGORY_SYSTEM, CATEGORY_CODE) USING INDEX TABLESPACE "COMM_X",
      CONSTRAINT ENABLED_CHK CHECK (ENABLED IN (''Y'', ''N''))
    )
  ');

--------------------------------------------------------
--  DDL for Index USER_PREFERENCES_CATEGORY_I
--------------------------------------------------------

  execute_ddl('
    CREATE INDEX "COMMUNICATION"."USER_PREFERENCES_CATEGORY_I" ON "COMMUNICATION"."USER_PREFERENCES" ("CATEGORY_SYSTEM", "CATEGORY_CODE")
    TABLESPACE "COMM_X"
  ');

END;
/
