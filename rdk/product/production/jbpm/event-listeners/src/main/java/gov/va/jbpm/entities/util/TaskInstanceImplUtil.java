package gov.va.jbpm.entities.util;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.drools.core.process.instance.WorkItemManager;
import org.jboss.logging.Logger;
import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
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
import gov.va.jbpm.exception.EventListenerException;

public class TaskInstanceImplUtil {
	public static final String EARLIEST_DATE = "earliestDate";
	public static final String DEFINITION_ID = "definitionId";
	public static final String NAVIGATION = "navigation";
	public static final String PERMISSION = "permission";
	public static final String TASK_HISTORY = "taskHistory";
	public static final String TASK_HISTORY_ACTION = "taskHistoryAction";
	public static final String BEFORE_EARLIEST_DATE = "beforeEarliestDate";
	private static final Logger LOGGER = Logger.getLogger(TaskInstanceImplUtil.class);
	public static TaskInstanceImpl create(RuntimeManager runtimeManager, TaskEvent event) throws EventListenerException {
		LOGGER.debug("Entering TaskInstanceImplUtil.create");
		if (event == null)
			throw new EventListenerException("Invalid state, event cannot be null");
		
		Task task = event.getTask();
		if (task == null)
			throw new EventListenerException("Invalid state, task cannot be null");
		
		TaskData taskData = task.getTaskData();
		if (taskData == null)
			throw new EventListenerException("Invalid state, taskData cannot be null");
		
		StringBuilder routes = new StringBuilder();
		
		validatePotentialOwnersExist(event);
		for (OrganizationalEntity oe : event.getTask().getPeopleAssignments().getPotentialOwners()) {
			routes.append(oe.getId() + ",");
		}

		long id = task.getId();
		long processInstanceId = taskData.getProcessInstanceId();

		String taskName = task.getName();
		User user = taskData.getActualOwner();
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
		if (processInstance == null) {
			throw new EventListenerException("Invalid state, processInstance cannot be null");
		}
		processInstance.setVariable("currentTaskInstanceId", id);
		
		Map<String,Object> processInstanceVariables = processInstance.getVariables();

		/*This needs to be cleanedup in future when all activities write ICN value in AM_PROCESSINTSNACE table. Until then, ICN column in AM_TASKINSTANCE will store PID.
		Consult activity writes PID in AM_PROCESSINTSNACE.ICN column and AM_PROCESSINTSNACE.PID will be null that's why added second line to copy patient_id*/
		String icn = ProcessInstanceImplUtil.getProcInstVariableString(processInstanceVariables, ProcessInstanceImplUtil.PID);
		if (icn == null || icn.isEmpty()) {
			icn = ProcessInstanceImplUtil.getProcInstVariableString(processInstanceVariables, ProcessInstanceImplUtil.PATIENT_ID);
		}
		Date earliestDate = ProcessInstanceImplUtil.getProcInstVariableDate(processInstanceVariables, TaskInstanceImplUtil.EARLIEST_DATE);
		WorkItem workItem = getWorkItem(processInstance, taskData.getWorkItemId());
		String definitionId = extractStringParam(workItem, DEFINITION_ID);
		String navigation = extractStringParam(workItem, NAVIGATION);
		String permission = extractStringParam(workItem, PERMISSION);
		boolean beforeEarliestDate = Boolean.parseBoolean(extractStringParam(workItem, BEFORE_EARLIEST_DATE));
		
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
				routes.toString(),
				beforeEarliestDate);

		LOGGER.debug("Creating TaskInstanceImpl " + id);
		LOGGER.debug(taskInstanceImpl);
		
		return taskInstanceImpl;
	}
	
	private static void validatePotentialOwnersExist(TaskEvent event) throws EventListenerException {
		if (event.getTask() == null)
			throw new EventListenerException("Invalid state, event.getTask() cannot be null");
		if (event.getTask().getPeopleAssignments() == null)
			throw new EventListenerException("Invalid state, event.getTask().getPeopleAssignments() cannot be null");
		if (event.getTask().getPeopleAssignments().getPotentialOwners() == null)
			throw new EventListenerException("Invalid state, event.getTask().getPeopleAssignments().getPotentialOwners() cannot be null");
	}

	private static WorkItem getWorkItem(WorkflowProcessInstanceImpl processInstance, long workItemId) {
		if (processInstance == null)
			return null;
		if (processInstance.getKnowledgeRuntime() == null)
			return null;
		if (processInstance.getKnowledgeRuntime().getWorkItemManager() == null)
			return null;
		if (((WorkItemManager)processInstance.getKnowledgeRuntime().getWorkItemManager()).getWorkItem(workItemId) == null)
			return null;
		
		WorkItem workItem = ((WorkItemManager)processInstance.getKnowledgeRuntime().getWorkItemManager()).getWorkItem(workItemId);
		return workItem;
	}
	
	/**
	 * Extracts the given parameter from the work item, validates it's of type String and then returns it.
	 * 
	 * @throws EhmpServicesException If workItem is null, the paramName is null or empty, the object returned is null, or if what is returned is not a String.
	 */
	private static String extractStringParam(WorkItem workItem, String paramName) throws EventListenerException {
		if (workItem == null) {
			return null;
		}
		if (paramName == null || paramName.isEmpty()) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "paramName was null or empty");
		}
		
		Object obj  = workItem.getParameter(paramName);
		if (obj == null) {
			return null;
		}
		if (!(obj instanceof java.lang.String)) {
			LOGGER.warn(String.format("paramName was not a String: %s", paramName));
		}
		
		String retvalue = (String)obj;
		return retvalue;
	}
	public static WorkflowProcessInstanceImpl getWorkflowProcessInstanceImpl(RuntimeManager runtimeManager, long processInstanceId) {
		RuntimeEngine engine = runtimeManager.getRuntimeEngine(null);
		KieSession ksession = engine.getKieSession();
		return (WorkflowProcessInstanceImpl) ksession.getProcessInstance(processInstanceId);
	}

	/*
	 * map BPMS taskstatus enum to number
	 * */
	//Possible task status: Created, Ready, Reserved, InProgress, Suspended, Completed, Failed, Error, Exited, Obsolete
	public static int mapStatus(Status taskStatus) {
		LOGGER.debug("Entering TaskInstanceImplUtil.mapStatus");

		switch (taskStatus) {
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
