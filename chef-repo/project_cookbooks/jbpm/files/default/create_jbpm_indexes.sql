DECLARE
	object_exists EXCEPTION;
	PRAGMA exception_init( object_exists, -955 );
	PROCEDURE execute_sql_statement(sql_statement VARCHAR)
	IS
	BEGIN
		EXECUTE IMMEDIATE sql_statement;
		DBMS_OUTPUT.PUT_LINE(sql_statement || ' executed');
	EXCEPTION WHEN object_exists
	THEN
		DBMS_OUTPUT.PUT_LINE(sql_statement || ' skipped');
  	END;

	BEGIN
  		-- The following commands were extracted from oracle-jbpm-schema.sql within
		-- Red Hat jboss-brms-bpmsuite-6.4-supplementary-tools
		-- See /jbpm/files/oracle-jbpm-schema.sql
		-- the following were extracted from 6.1 supplementary tools
		execute_sql_statement('create index JBPM.IDX_Attachment_Id ON JBPM.Attachment(attachedBy_id)');
		execute_sql_statement('create index JBPM.IDX_Attachment_DataId ON JBPM.Attachment(TaskData_Attachments_Id)');
		execute_sql_statement('create index JBPM.IDX_BoolExpr_Id ON JBPM.BooleanExpression(Escalation_Constraints_Id)');
		execute_sql_statement('create index JBPM.IDX_CorrPropInfo_Id ON JBPM.CorrelationPropertyInfo(correlationKey_keyId)');
		execute_sql_statement('create index JBPM.IDX_Deadline_StartId ON JBPM.Deadline(Deadlines_StartDeadLine_Id)');
		execute_sql_statement('create index JBPM.IDX_Deadline_EndId ON JBPM.Deadline(Deadlines_EndDeadLine_Id)');
		execute_sql_statement('create index JBPM.IDX_Delegation_EntityId ON JBPM.Delegation_delegates(entity_id)');
		execute_sql_statement('create index JBPM.IDX_Delegation_TaskId ON JBPM.Delegation_delegates(task_id)');
		execute_sql_statement('create index JBPM.IDX_ErrorInfo_Id ON JBPM.ErrorInfo(REQUEST_ID)');
		execute_sql_statement('create index JBPM.IDX_Escalation_Id ON JBPM.Escalation(Deadline_Escalation_Id)');
		execute_sql_statement('create index JBPM.IDX_EventTypes_Id ON JBPM.EventTypes(InstanceId)');
		execute_sql_statement('create index JBPM.IDX_I18NText_SubjId ON JBPM.I18NText(Task_Subjects_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_NameId ON JBPM.I18NText(Task_Names_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_DescrId ON JBPM.I18NText(Task_Descriptions_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_ReassignId ON JBPM.I18NText(Reassignment_Documentation_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_NotSubjId ON JBPM.I18NText(Notification_Subjects_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_NotDocId ON JBPM.I18NText(Notification_Documentation_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_NotDescrId ON JBPM.I18NText(Notification_Descriptions_Id)');
		execute_sql_statement('create index JBPM.IDX_I18NText_DeadDocId ON JBPM.I18NText(Deadline_Documentation_Id)');
		execute_sql_statement('create index JBPM.IDX_Not_EscId ON JBPM.Notification(Escalation_Notifications_Id)');
		execute_sql_statement('create index JBPM.IDX_NotBAs_Entity ON JBPM.Notification_BAs(entity_id)');
		execute_sql_statement('create index JBPM.IDX_NotBAs_Task ON JBPM.Notification_BAs(task_id)');
		execute_sql_statement('create index JBPM.IDX_NotRec_Entity ON JBPM.Notification_Recipients(entity_id)');
		execute_sql_statement('create index JBPM.IDX_NotRec_Task ON JBPM.Notification_Recipients(task_id)');
		execute_sql_statement('create index JBPM.IDX_NotEmail_Not ON JBPM.Notification_email_header(Notification_id)');
		execute_sql_statement('create index JBPM.IDX_PAsBAs_Entity ON JBPM.PeopleAssignments_BAs(entity_id)');
		execute_sql_statement('create index JBPM.IDX_PAsBAs_Task ON JBPM.PeopleAssignments_BAs(task_id)');
		execute_sql_statement('create index JBPM.IDX_PAsExcl_Entity ON JBPM.PeopleAssignments_ExclOwners(entity_id)');
		execute_sql_statement('create index JBPM.IDX_PAsExcl_Task ON JBPM.PeopleAssignments_ExclOwners(task_id)');
		execute_sql_statement('create index JBPM.IDX_PAsPot_Entity ON JBPM.PeopleAssignments_PotOwners(entity_id)');
		execute_sql_statement('create index JBPM.IDX_PAsPot_Task ON JBPM.PeopleAssignments_PotOwners(task_id)');
		execute_sql_statement('create index JBPM.IDX_PAsRecip_Entity ON JBPM.PeopleAssignments_Recipients(entity_id)');
		execute_sql_statement('create index JBPM.IDX_PAsRecip_Task ON JBPM.PeopleAssignments_Recipients(task_id)');
		execute_sql_statement('create index JBPM.IDX_PAsStake_Entity ON JBPM.PeopleAssignments_Stakeholders(entity_id)');
		execute_sql_statement('create index JBPM.IDX_PAsStake_Task ON JBPM.PeopleAssignments_Stakeholders(task_id)');
		execute_sql_statement('create index JBPM.IDX_Reassign_Esc ON JBPM.Reassignment(Escalation_Reassignments_Id)');
		execute_sql_statement('create index JBPM.IDX_ReassignPO_Entity ON JBPM.Reassignment_potentialOwners(entity_id)');
		execute_sql_statement('create index JBPM.IDX_ReassignPO_Task ON JBPM.Reassignment_potentialOwners(task_id)');
		execute_sql_statement('create index JBPM.IDX_Task_Initiator ON JBPM.Task(taskInitiator_id)');
		execute_sql_statement('create index JBPM.IDX_Task_ActualOwner ON JBPM.Task(actualOwner_id)');
		execute_sql_statement('create index JBPM.IDX_Task_createdBy ON JBPM.Task(createdBy_id)');
		execute_sql_statement('create index JBPM.IDX_TaskComments_createdBy ON JBPM.task_comment(addedBy_id)');
		execute_sql_statement('create index JBPM.IDX_TaskComments_Id ON JBPM.task_comment(TaskData_Comments_Id)');
		execute_sql_statement('create index JBPM.IDX_Task_processInstanceId ON JBPM.Task(processInstanceId)');
		execute_sql_statement('create index JBPM.IDX_Task_processId ON JBPM.Task(processId)');
		execute_sql_statement('create index JBPM.IDX_Task_status ON JBPM.Task(status)');
		execute_sql_statement('create index JBPM.IDX_Task_archived ON JBPM.Task(archived)');
		execute_sql_statement('create index JBPM.IDX_Task_workItemId ON JBPM.Task(workItemId)');
		execute_sql_statement('create index JBPM.IDX_EventTypes_element ON JBPM.EventTypes(element)');
		execute_sql_statement('create index JBPM.IDX_CMI_Context ON JBPM.ContextMappingInfo(CONTEXT_ID)');
		execute_sql_statement('create index JBPM.IDX_CMI_KSession ON JBPM.ContextMappingInfo(KSESSION_ID)');
		execute_sql_statement('create index JBPM.IDX_CMI_Owner ON JBPM.ContextMappingInfo(OWNER_ID)');
		execute_sql_statement('create index JBPM.IDX_RequestInfo_status ON JBPM.RequestInfo(status)');
		execute_sql_statement('create index JBPM.IDX_RequestInfo_timestamp ON JBPM.RequestInfo(timestamp)');
		execute_sql_statement('create index JBPM.IDX_RequestInfo_owner ON JBPM.RequestInfo(owner)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_createdDate ON JBPM.BAMTaskSummary(createdDate)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_duration ON JBPM.BAMTaskSummary(duration)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_endDate ON JBPM.BAMTaskSummary(endDate)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_pInstId ON JBPM.BAMTaskSummary(processInstanceId)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_startDate ON JBPM.BAMTaskSummary(startDate)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_status ON JBPM.BAMTaskSummary(status)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_taskId ON JBPM.BAMTaskSummary(taskId)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_taskName ON JBPM.BAMTaskSummary(taskName)');
		execute_sql_statement('create index JBPM.IDX_BAMTaskSumm_userId ON JBPM.BAMTaskSummary(userId)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_duration ON JBPM.ProcessInstanceLog(duration)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_end_date ON JBPM.ProcessInstanceLog(end_date)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_extId ON JBPM.ProcessInstanceLog(externalId)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_user_identity ON JBPM.ProcessInstanceLog(user_identity)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_outcome ON JBPM.ProcessInstanceLog(outcome)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_parentPInstId ON JBPM.ProcessInstanceLog(parentProcessInstanceId)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_pId ON JBPM.ProcessInstanceLog(processId)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_pInsteDescr ON JBPM.ProcessInstanceLog(processInstanceDescription)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_pInstId ON JBPM.ProcessInstanceLog(processInstanceId)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_pName ON JBPM.ProcessInstanceLog(processName)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_pVersion ON JBPM.ProcessInstanceLog(processVersion)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_start_date ON JBPM.ProcessInstanceLog(start_date)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_status ON JBPM.ProcessInstanceLog(status)');

		--- the following were extracted from 6.4 supplementary tools
		execute_sql_statement('create index JBPM.IDX_I18NText_NotNamId ON JBPM.I18NText(Notification_Names_Id)');
		execute_sql_statement('create index JBPM.IDX_PInstLog_correlation ON JBPM.ProcessInstanceLog(correlationKey)');
		execute_sql_statement('create index JBPM.IDX_VInstLog_pInstId ON JBPM.VariableInstanceLog(processInstanceId)');
		execute_sql_statement('create index JBPM.IDX_VInstLog_varId ON JBPM.VariableInstanceLog(variableId)');
		execute_sql_statement('create index JBPM.IDX_VInstLog_pId ON JBPM.VariableInstanceLog(processId)');
		execute_sql_statement('create index JBPM.IDX_NInstLog_pInstId ON JBPM.NodeInstanceLog(processInstanceId)');
		execute_sql_statement('create index JBPM.IDX_NInstLog_nodeType ON JBPM.NodeInstanceLog(nodeType)');
		execute_sql_statement('create index JBPM.IDX_NInstLog_pId ON JBPM.NodeInstanceLog(processId)');

	END;
/

