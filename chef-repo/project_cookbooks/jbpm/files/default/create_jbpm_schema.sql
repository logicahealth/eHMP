DECLARE
        u_count number;
        user_name VARCHAR2 (50);
        password VARCHAR(32);

    BEGIN
        u_count :=0;
        user_name := 'JBPM';

        SELECT COUNT (1) INTO u_count FROM dba_users WHERE username = UPPER (user_name);

             IF u_count = 0
             THEN
                user_name := 'JBPM';
                password := 'jbpm';
                EXECUTE IMMEDIATE 'CREATE USER '||user_name||' IDENTIFIED BY '||password||' ';
                EXECUTE IMMEDIATE 'GRANT "DBA" TO '||user_name||'';
                EXECUTE IMMEDIATE 'GRANT "CONNECT" TO '||user_name||'';
                EXECUTE IMMEDIATE 'GRANT "RESOURCE" TO '||user_name||'' ;

              END IF;

              u_count := 0;

        EXCEPTION
           WHEN OTHERS
              THEN
                     DBMS_OUTPUT.put_line (SQLERRM);
                     DBMS_OUTPUT.put_line ('   ');

    END;

/
