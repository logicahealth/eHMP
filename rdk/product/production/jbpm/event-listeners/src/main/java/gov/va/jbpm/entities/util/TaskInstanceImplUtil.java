package gov.va.jbpm.entities.util;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeEngine;
import org.kie.api.runtime.manager.RuntimeManager;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.task.TaskEvent;
import org.kie.api.task.model.OrganizationalEntity;
import org.kie.api.task.model.Status;
import org.kie.api.task.model.Task;
import org.kie.api.task.model.TaskData;
import org.kie.api.task.model.User;

import gov.va.jbpm.entities.impl.TaskInstanceImpl;
import gov.va.jbpm.entities.impl.TaskRouteImpl;
import org.drools.core.process.instance.WorkItemManager;

public class TaskInstanceImplUtil {
	public static final String EARLIEST_DATE = "earliestDate";
	public static final String DEFINITION_ID = "definitionId";
	public static final String NAVIGATION = "navigation";
	public static final String PERMISSION = "permission";
	public static final String TASK_HISTORY = "taskHistory";

	public static TaskInstanceImpl create(RuntimeManager runtimeManager, TaskEvent event) {

		Task task = event.getTask();
		TaskData taskData = task.getTaskData();

		StringBuilder routes = new StringBuilder();
		User user = taskData.getActualOwner();

		for (OrganizationalEntity oe : event.getTask().getPeopleAssignments().getPotentialOwners()) {
			routes.append(oe.getId() + ",");
		}

		long id = task.getId();
		long processInstanceId = taskData.getProcessInstanceId();

		String taskName = task.getName();
		String actualOwner = user != null ? user.getId() : null;
		Date statusTimeStamp = new Date();
		int statusId = mapStatus(taskData.getStatus());
		String description = task.getDescription();
		int priority = task.getPriority();
		boolean skippable = taskData.isSkipable();
		Date dueDate = taskData.getExpirationTime();
		Date createdOn = new Date();
		List<TaskRouteImpl> routesList = TaskRouteImplUtil.create(id, routes.toString());

		WorkflowProcessInstanceImpl processInstance = getWorkflowProcessInstanceImpl(runtimeManager, processInstanceId);
		String icn = retrieveIcnFromSession(runtimeManager, processInstance);
		Date earliestDate = retrieveEarliestDate(runtimeManager, processInstance);
		String definitionId = getTaskVariable(processInstance, taskData.getWorkItemId(), DEFINITION_ID);
		String navigation = getTaskVariable(processInstance, taskData.getWorkItemId(), NAVIGATION);
		String permission = getTaskVariable(processInstance, taskData.getWorkItemId(), PERMISSION);
		
		TaskInstanceImpl taskInstanceImpl = new TaskInstanceImpl(id ,
				processInstanceId,
				icn,
				taskName ,
				description ,
				priority ,
				skippable ,
				createdOn ,
				statusId,
				statusTimeStamp,
				actualOwner ,
				dueDate,
				earliestDate,
				routesList, 
				definitionId,
				navigation,
				permission,
				routes.toString());
		return taskInstanceImpl;
	}

	private static String getTaskVariable(WorkflowProcessInstanceImpl processInstance, long workItemId, String variableName) {
		if (processInstance != null) {
			WorkItem workItem = ((WorkItemManager)processInstance.getKnowledgeRuntime().getWorkItemManager()).getWorkItem(workItemId);
			if (workItem != null) {
		        Map<String, Object> inputMappings = workItem.getParameters();
		        Object variableValue = inputMappings.get(variableName);
		        if (variableValue != null && variableValue instanceof String) {
		        	return (String)variableValue;
		        }
			}
		}
		
		return null;
	}

	private static WorkflowProcessInstanceImpl getWorkflowProcessInstanceImpl(RuntimeManager runtimeManager, long processInstanceId) {
		RuntimeEngine engine = runtimeManager.getRuntimeEngine(null);
		KieSession ksession = engine.getKieSession();
		return (WorkflowProcessInstanceImpl) ksession.getProcessInstance(processInstanceId);
	}

	private static Date retrieveEarliestDate(RuntimeManager runtimeManager, WorkflowProcessInstanceImpl processInstance) {
		Object procInstVar = retrieveProcessInstanceVariable(runtimeManager, processInstance, TaskInstanceImplUtil.EARLIEST_DATE);
		if (procInstVar == null)
			return new Date();
	
		Date earliestDate = null;
		try {
			DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
			earliestDate = formatter.parseDateTime((String)procInstVar).toDate();
		}
		catch(Exception e) {
			e.printStackTrace();
		}

		return earliestDate;
	}

	private static String retrieveIcnFromSession(RuntimeManager runtimeManager, WorkflowProcessInstanceImpl processInstance) {
		return (String)retrieveProcessInstanceVariable(runtimeManager, processInstance, ProcessInstanceImplUtil.PATIENT_ID);
	}

	private static Object retrieveProcessInstanceVariable(RuntimeManager runtimeManager, WorkflowProcessInstanceImpl processInstance, String variableName) {
		//Retrieve the icn from the session.
		Object retvalue = null;
		if (processInstance != null) {
			Object obj = processInstance.getVariable(variableName);
			if (obj != null) {
				retvalue = obj;
			}
		}
		return retvalue;
	}



	/*
	 * map BPMS taskstatus enum to number
	 * */
	//Possible task status: Created, Ready, Reserved, InProgress, Suspended, Completed, Failed, Error, Exited, Obsolete
	public static int mapStatus(Status taskStatus){

		switch(taskStatus){
			case Created:
				return 0;
			case Ready:
				return 1;
			case Reserved:
				return 2;
			case InProgress:
				return 3;
			case Suspended:
				return 4;
			case Completed:
				return 5;
			case Failed:
				return 6;
			case Error:
				return 7;
			case Exited:
				return 8;
			case Obsolete:
				return 9;
			default:
				return 999; //unknown
		}
	}
}
