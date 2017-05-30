SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
alter table jbpm.ProcessInstanceLog add correlationKey varchar2(255 char);
/
alter table jbpm.TaskEvent add message varchar2(255 char);
/
alter table jbpm.AuditTaskImpl add workItemId number(19,0);
/
update jbpm.AuditTaskImpl a set workItemId = (select workItemId from jbpm.Task where id = a.taskId);
/
create index jbpm.IDX_PInstLog_correlation on jbpm.ProcessInstanceLog(correlationKey);
/
create table jbpm.TaskVariableImpl (id number(19,0) not null,modificationDate timestamp,name varchar2(255 char),processId varchar2(255 char),processInstanceId number(19,0),taskId number(19,0),type number(10,0),value varchar2(4000 char),primary key (id));
/
create sequence jbpm.TASK_VAR_ID_SEQ;
/
create table jbpm.QueryDefinitionStore (id number(19,0) not null,qExpression clob,qName varchar2(255 char),qSource varchar2(255 char),qTarget varchar2(255 char),primary key (id));
/
alter table jbpm.QueryDefinitionStore add constraint UK_4ry5gt77jvq0orfttsoghta2j unique (qName);
/