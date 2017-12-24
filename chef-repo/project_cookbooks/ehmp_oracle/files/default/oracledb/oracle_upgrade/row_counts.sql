select owner, table_name, 
       to_number(extractvalue(xmltype(dbms_xmlgen.getxml('select count(*) c from '||owner||'.'||table_name)),'/ROWSET/ROW/C')) as count
from all_tables
where owner IN ('JBPM', 'NOTIFDB', 'ACTIVITYDB', 'COMMUNICATION')
order by owner, table_name;