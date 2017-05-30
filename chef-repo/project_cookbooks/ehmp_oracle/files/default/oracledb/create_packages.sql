--------------------------------------------------------
--  DDL for Package MESSAGE_API
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE "COMMUNICATION"."MESSAGE_API" 
AS
  TYPE VARCHAR2_ARRAY IS TABLE OF VARCHAR2(1000) INDEX BY BINARY_INTEGER;
  PROCEDURE fetch_messages(
      i_user_id              VARCHAR2,
      i_version              VARCHAR2,
      i_category             VARCHAR2_ARRAY,
      i_status               VARCHAR2 DEFAULT 'http://hl7.org/fhir/ValueSet/communication-status/completed',
      i_override_preferences VARCHAR2 DEFAULT 'N',
      o_messages OUT CLOB);
  PROCEDURE fetch_message_attachment(
      i_attachment_identifier VARCHAR2,
      o_attachment_contenttype OUT VARCHAR2,
      o_attachment OUT BLOB);
  PROCEDURE create_message(
      io_identifier             IN OUT VARCHAR2,
      i_category_system        IN VARCHAR2 DEFAULT 'http://ehmp.DNS   /messageCategories',
      i_category_code          IN VARCHAR2,
      i_sender                 IN VARCHAR2,
      i_recipient              IN VARCHAR2,
      i_payload_content        IN CLOB,
      i_payload_data           IN CLOB,
      i_payload_title          IN VARCHAR2,
      i_attachment_data        IN BLOB,
      i_attachment_contenttype IN VARCHAR2,
      i_sent                   IN TIMESTAMP DEFAULT SYSTIMESTAMP,
      i_status_system          IN VARCHAR2 DEFAULT 'http://hl7.org/fhir/ValueSet/communication-status',
      i_status_code            IN VARCHAR2 DEFAULT 'completed',
      o_rowcount OUT number);
  PROCEDURE delete_message(
      i_identifier VARCHAR2,
      o_rowcount OUT NUMBER);
  PROCEDURE activate_message(
      i_identifier VARCHAR2,
      o_rowcount OUT NUMBER);
  PROCEDURE update_user_preferences(
      i_user_id         VARCHAR2,
      i_category_system VARCHAR2,
      i_category_code   VARCHAR2,
      i_enabled         VARCHAR2,
      o_rowcount OUT NUMBER);
  PROCEDURE update_user_preferences(
      i_category_system VARCHAR2,
      i_category_code   VARCHAR2,
      i_enabled         VARCHAR2,
      o_rowcount OUT NUMBER);
  FUNCTION array_to_table(i_array VARCHAR2_ARRAY) RETURN VARCHAR2_LIST;
END MESSAGE_API;

/
--------------------------------------------------------
--  DDL for Package Body MESSAGE_API
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE BODY "COMMUNICATION"."MESSAGE_API" AS  
  PROCEDURE fetch_messages(i_user_id              VARCHAR2, 
                           i_version              VARCHAR2,
                           i_category             VARCHAR2_ARRAY,
                           i_status               VARCHAR2 DEFAULT 'http://hl7.org/fhir/ValueSet/communication-status/completed',
                           i_override_preferences VARCHAR2 DEFAULT 'N',
                           o_messages OUT CLOB) AS
    TYPE message_rec IS RECORD (identifier message.identifier%type, 
                                category_system message.category_system%type, 
                                category_code message.category_code%type, 
                                status_system message.status_system%type, 
                                status_code message.status_code%type, 
                                sender message.sender%type, 
                                recipient message.recipient%type, 
                                payload_title message.payload_title%type,
                                payload_content message.payload_content%type, 
                                payload_data message.payload_data%type, 
                                payload_attachment_contenttype message.payload_attachment_contenttype%type, 
                                sent message.sent%type);
    item message_rec;
    message_cursor SYS_REFCURSOR;
    v_sql varchar2(32767);
    j_contentdata apex_json.t_values;
  BEGIN
    v_sql := '
    SELECT identifier, category_system, category_code, status_system, status_code, sender, recipient, payload_title, payload_content, payload_data, payload_attachment_contenttype, sent
    FROM communication.message m
    WHERE m.category IN (SELECT column_value FROM TABLE(:i_category)) AND ';

    IF i_user_id IS NOT NULL AND i_override_preferences <> 'Y' THEN
      v_sql := CONCAT(v_sql,
            'NOT EXISTS (SELECT u.enabled 
                        FROM communication.user_preferences u 
                        WHERE u.user_id = :i_user_id and 
                              m.category_system = u.category_system and 
                              m.category_code = u.category_code and 
                              enabled = ''N'') AND ');
    ELSE
      v_sql := CONCAT(v_sql, '(1 = 1 OR :i_user_id IS NULL) AND ');
    END IF;

    v_sql := CONCAT(v_sql, '(m.recipient = :i_version OR m.recipient IS NULL) AND ');
    v_sql := CONCAT(v_sql, 'm.status = :i_status ');
    v_sql := CONCAT(v_sql, 'ORDER BY DECODE(m.category_code, ''announcements-terms'', 1, ''announcements-system'', 2, ''announcements-promotions'', 3), m.sent DESC');
    
    OPEN message_cursor 
    FOR v_sql
    USING array_to_table(i_category), i_user_id, i_version, i_status;
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;                  -- {
    APEX_JSON.open_array('communication');  -- communication [
  
    LOOP
      fetch message_cursor into item;
      exit when message_cursor%notfound;        
           
      APEX_JSON.open_object;                -- {
      
      APEX_JSON.open_array('identifier');   -- identifier [
      APEX_JSON.open_object;                -- {
      APEX_JSON.write('system', 'http://ehmp.DNS   /messageIdentifier');
      APEX_JSON.write('value', item.identifier);
      APEX_JSON.close_object;               -- }
      APEX_JSON.close_array;                -- ] identifier
  
      APEX_JSON.open_array('category');     -- category [
      APEX_JSON.open_object;
      APEX_JSON.write('system', item.category_system);
      APEX_JSON.write('code', item.category_code);
      APEX_JSON.close_object;
      APEX_JSON.close_array;                -- ] category
  
      APEX_JSON.open_object('sender');      -- sender {
      APEX_JSON.write('name', item.sender);
      APEX_JSON.close_object;               -- } sender
  
      APEX_JSON.open_array('recipient');    -- recipient [
      APEX_JSON.open_object;
      IF item.recipient IS NULL THEN
        APEX_JSON.write('all', 'true');
      ELSE
        APEX_JSON.write('ehmpAppVersion', item.recipient);
      END IF;
      APEX_JSON.close_object;
      APEX_JSON.close_array;                 -- ] recipient
                
      APEX_JSON.open_array('payload');       -- payload [
      APEX_JSON.open_object;                 -- {
      APEX_JSON.open_array('content');       -- content [
      APEX_JSON.open_object;                 -- {
      APEX_JSON.write('title', item.payload_title);
      APEX_JSON.write('contentString', item.payload_content);
      
      IF (item.payload_data IS NOT NULL) THEN
        BEGIN
          APEX_JSON.parse(j_contentdata, item.payload_data);
          APEX_JSON.write('contentData', j_contentdata);
          EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
      END IF;
  
      IF (item.payload_attachment_contenttype IS NOT NULL) THEN
        APEX_JSON.open_object('contentAttachment'); -- { contentAttachment
        APEX_JSON.write('contentAttachmentIdentifier', item.identifier);
        APEX_JSON.write('link', '/'||item.identifier||'/attachment/'||item.identifier);
        APEX_JSON.write('contentType', item.payload_attachment_contenttype);
        APEX_JSON.close_object;                -- } contentAttachment
      END IF;
      
      APEX_JSON.close_object;                -- }
      APEX_JSON.close_array;                 -- ] content
      APEX_JSON.close_object;                -- }
      APEX_JSON.close_array;                 -- ] payload
  
      APEX_JSON.open_array('medium');        -- medium [
      APEX_JSON.open_object;
      APEX_JSON.write('system', 'http://hl7.org/fhir/v3/ParticipationMode');
      APEX_JSON.write('code', '2.16.840.1.113883.5.1064');
      APEX_JSON.close_object;
      APEX_JSON.close_array;                 -- ] medium
  
      APEX_JSON.open_object('status');       -- status {
      APEX_JSON.write('system', item.status_system);
      APEX_JSON.write('code', item.status_code);
      APEX_JSON.close_object;                -- } status
  
      APEX_JSON.write('sent', TO_CHAR(item.sent, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM'));
      
      APEX_JSON.close_object;
  
    END LOOP;
    CLOSE message_cursor;
  
    APEX_JSON.close_array;  -- ] communication
    APEX_JSON.close_object; -- }
    o_messages := APEX_JSON.get_clob_output;
    DBMS_OUTPUT.PUT_LINE(o_messages);
    APEX_JSON.free_output;

  END fetch_messages;
  
  PROCEDURE fetch_message_attachment(
      i_attachment_identifier VARCHAR2,
      o_attachment_contenttype OUT VARCHAR2,
      o_attachment OUT BLOB) 
  AS
  BEGIN
    SELECT payload_attachment_contenttype, payload_attachment_data INTO o_attachment_contenttype, o_attachment
    FROM communication.message
    WHERE identifier = i_attachment_identifier;
  END fetch_message_attachment;
  
  PROCEDURE create_message(io_identifier IN OUT VARCHAR2, 
                           i_category_system IN VARCHAR2 DEFAULT 'http://ehmp.DNS   /messageCategories', 
                           i_category_code IN VARCHAR2, 
                           i_sender IN VARCHAR2, 
                           i_recipient IN VARCHAR2, 
                           i_payload_content IN CLOB,
                           i_payload_data IN CLOB,
                           i_payload_title IN VARCHAR2,
                           i_attachment_data IN BLOB,
                           i_attachment_contenttype IN VARCHAR2,
                           i_sent IN TIMESTAMP DEFAULT SYSTIMESTAMP,
                           i_status_system IN VARCHAR2 DEFAULT 'http://hl7.org/fhir/ValueSet/communication-status',
                           i_status_code IN VARCHAR2 DEFAULT 'completed',
                           o_rowcount OUT number)
  AS
  BEGIN
    SELECT NVL(io_identifier, SYS_GUID()) INTO io_identifier FROM dual;
    MERGE INTO communication.message m
      USING dual
        ON (m.identifier = io_identifier)
      WHEN MATCHED THEN
        UPDATE SET 
          category_system = i_category_system, 
          category_code = i_category_code, 
          sender = i_sender, 
          recipient = i_recipient, 
          payload_title = i_payload_title, 
          sent = i_sent, 
          status_system = i_status_system, 
          status_code = i_status_code,
          payload_attachment_contenttype = i_attachment_contenttype,
          payload_content = i_payload_content, 
          payload_data = i_payload_data,
          payload_attachment_data = i_attachment_data
        WHEN NOT MATCHED THEN
          INSERT (identifier, category_system, category_code, sender, recipient, payload_title, sent, status_system, status_code, payload_attachment_contenttype, payload_content, payload_data, payload_attachment_data)
          VALUES (io_identifier, i_category_system, i_category_code, i_sender, i_recipient, i_payload_title, i_sent, i_status_system, i_status_code, i_attachment_contenttype, i_payload_content, i_payload_data, i_attachment_data);
    o_rowcount := sql%rowcount;
  END create_message;

  PROCEDURE delete_message(i_identifier varchar2, o_rowcount OUT number) 
  AS
  BEGIN
    UPDATE communication.message 
    SET status_code = 'deleted', status_system = 'http://ehmp.DNS   /messageStatus'
    WHERE identifier = i_identifier;
    o_rowcount := sql%rowcount;
  END delete_message;

  PROCEDURE activate_message(i_identifier varchar2, o_rowcount OUT number) 
  AS
  BEGIN
    UPDATE communication.message 
    SET status_code = 'completed', status_system = 'http://hl7.org/fhir/ValueSet/communication-status'
    WHERE identifier = i_identifier;
    o_rowcount := sql%rowcount;
  END activate_message;
  
  PROCEDURE update_user_preferences(i_user_id varchar2, i_category_system varchar2, i_category_code varchar2, i_enabled varchar2, o_rowcount OUT number) 
  AS
  BEGIN
    IF i_user_id IS NULL THEN
      update_user_preferences(i_category_system, i_category_code, i_enabled, o_rowcount);
    ELSE
      MERGE INTO communication.user_preferences 
      USING dual ON (user_id = i_user_id and category_system = i_category_system and category_code = i_category_code)
      WHEN MATCHED THEN UPDATE SET enabled = i_enabled
      WHEN NOT MATCHED THEN INSERT (user_id, category_system, category_code, enabled) 
      VALUES (i_user_id, i_category_system, i_category_code, i_enabled);
      o_rowcount := sql%rowcount;
    END IF;
  END update_user_preferences;
  
  PROCEDURE update_user_preferences(i_category_system varchar2, i_category_code varchar2, i_enabled varchar2, o_rowcount OUT number) 
  AS
  BEGIN
    UPDATE user_preferences SET enabled = i_enabled WHERE category_system = i_category_system and category_code = i_category_code;
    o_rowcount := sql%rowcount;
  END update_user_preferences;
  
  FUNCTION array_to_table(i_array VARCHAR2_ARRAY) RETURN VARCHAR2_LIST as        
    l_index pls_integer := i_array.first;
    l_tab VARCHAR2_LIST := VARCHAR2_LIST();
  BEGIN
    WHILE l_index IS NOT NULL LOOP
            l_tab.extend;
            l_tab(l_tab.last) := i_array(l_index);
            l_index := i_array.next(l_index);
    END LOOP;
    RETURN l_tab;
  END;

END MESSAGE_API;

/

--------------------------------------------------------
--  DDL for Package Grants
--------------------------------------------------------

GRANT EXECUTE ON COMMUNICATION.MESSAGE_API TO COMMUNICATIONUSER;
/


