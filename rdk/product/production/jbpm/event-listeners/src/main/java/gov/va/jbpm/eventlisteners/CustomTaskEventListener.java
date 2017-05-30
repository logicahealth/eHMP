package gov.va.jbpm.eventlisteners;

import java.util.Date;
import java.util.List;

import org.jboss.logging.Logger;
import org.jbpm.services.task.commands.TaskContext;
import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
import org.kie.api.runtime.manager.RuntimeManager;
import org.kie.api.task.TaskEvent;
import org.kie.api.task.TaskLifeCycleEventListener;
import org.kie.api.task.model.Task;
import org.kie.api.task.model.TaskData;
import org.kie.api.task.model.User;
import org.kie.internal.task.api.TaskPersistenceContext;

import gov.va.jbpm.entities.impl.TaskInstanceImpl;
import gov.va.jbpm.entities.impl.TaskRouteImpl;
import gov.va.jbpm.entities.util.TaskInstanceImplUtil;
import gov.va.jbpm.exception.EventListenerException;
/*
 * Custom task event listener
 * 
 * */
public class CustomTaskEventListener implements TaskLifeCycleEventListener {
	private static final Logger LOGGER = Logger.getLogger(CustomTaskEventListener.class);
	private RuntimeManager runtimeManager = null;
	private static final String SIGNAL_TASKCREATED = "TaskCreated"; //this signal name should not be changed because it is referenced in the activity workflows
// -----------------------------------------------------------------------------
// ------------------------Constructors-----------------------------------------
// -----------------------------------------------------------------------------

	public CustomTaskEventListener() {
	}

	public CustomTaskEventListener(RuntimeManager runtimeManager) {
		this.runtimeManager = runtimeManager;
	}

// -----------------------------------------------------------------------------
// --------------------------Unused Overrides-----------------------------------
// -----------------------------------------------------------------------------
	@Override
	public void beforeTaskActivatedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskClaimedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskSkippedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskStartedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskStoppedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskCompletedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskFailedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskAddedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskExitedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskReleasedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskResumedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskSuspendedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskForwardedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskDelegatedEvent(TaskEvent event) {
	}

	@Override
	public void beforeTaskNominatedEvent(TaskEvent event) {
	}

// -----------------------------------------------------------------------------
// ----------------------publishTaskStatusChange--------------------------------
// -----------------------------------------------------------------------------

	@Override
	public void afterTaskActivatedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskActivatedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskClaimedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskClaimedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskSkippedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskSkippedEvent");
		publishTaskStatusChange(event);

	}

	@Override
	public void afterTaskStartedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskStartedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskStoppedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskStoppedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskCompletedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskCompletedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskFailedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskFailedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskExitedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskExitedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskReleasedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskReleasedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskResumedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskResumedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskSuspendedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskSuspendedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskForwardedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskForwardedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskDelegatedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskDelegatedEvent");
		publishTaskStatusChange(event);
	}

	@Override
	public void afterTaskNominatedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskNominatedEvent");
		publishTaskStatusChange(event);
	}

// -----------------------------------------------------------------------------
// -----------------------------afterTaskAddedEvent-----------------------------
// -----------------------------------------------------------------------------

	/*
	 * Handler for afterTaskAddedEvent event. This event is raised when new task
	 * added. Create a new task instance record in the database. Here state of
	 * the task is Ready.
	 */
	@Override
	public void afterTaskAddedEvent(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.afterTaskAddedEvent");
		try {
			TaskPersistenceContext persistenceContext = getPersistenceContext(event);

			TaskInstanceImpl taskInstanceImpl = TaskInstanceImplUtil.create(runtimeManager, event);
			persistenceContext.persist(taskInstanceImpl);

			List<TaskRouteImpl> routes = taskInstanceImpl.getRoutes();
			if (routes != null) {
				for (TaskRouteImpl taskRouteImpl : routes) {
					persistenceContext.persist(taskRouteImpl);
				}
			}
			WorkflowProcessInstanceImpl processInstance = TaskInstanceImplUtil.getWorkflowProcessInstanceImpl(runtimeManager, event.getTask().getTaskData().getProcessInstanceId());
			if (processInstance == null)
				throw new EventListenerException("Invalid state, processInstance cannot be null");
			processInstance.signalEvent(SIGNAL_TASKCREATED, null); //send a signal to notify the process that the task has been created.
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error("CustomTaskEventListener.afterTaskAddedEvent: An unexpected condition has happened: " + e.getMessage(), e);
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

// -----------------------------------------------------------------------------
// ------------------------private helper methods-------------------------------
// -----------------------------------------------------------------------------

	/*
	 * Publish task status change to database
	 */
	private void publishTaskStatusChange(TaskEvent event) {
		LOGGER.debug("Entering CustomTaskEventListener.publishTaskStatusChange");
		try {
			TaskPersistenceContext persistenceContext = getPersistenceContext(event);

			Task task = event.getTask();
			if (task == null)
				throw new EventListenerException("CustomTaskEventListener.publishTaskStatusChange task was null");
			TaskData taskData = task.getTaskData();
			if (taskData == null)
				throw new EventListenerException("CustomTaskEventListener.publishTaskStatusChange taskData was null");
			User user = taskData.getActualOwner();
			
			Long taskId = task.getId();
			if (taskId == null)
				throw new EventListenerException("CustomTaskEventListener.publishTaskStatusChange taskId was null");
			
			TaskInstanceImpl taskInstanceImpl = persistenceContext.find(TaskInstanceImpl.class, taskId);
			if (taskInstanceImpl == null) {
				return;
			}

			if (user != null)
				taskInstanceImpl.setActualOwner(user.getId());
			else
				taskInstanceImpl.setActualOwner(null);

			int newStatusId = TaskInstanceImplUtil.mapStatus(taskData.getStatus());
			taskInstanceImpl.setStatusId(newStatusId);
			taskInstanceImpl.setStatusTimeStamp(new Date());

			persistenceContext.merge(taskInstanceImpl);
		} catch (EventListenerException e) {
			//Error was already logged
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error("ConsultHelperUtil.buildConsultOrder: An unexpected condition has happened: " + e.getMessage(), e);
			//Re-throw the Exception to avoid any inconsistencies between JBPM and our internal database (let them bubble up to the main transaction so it can rollback).
			throw new RuntimeException (e.getMessage(), e);
		}
	}

	/**
	 * Retrieves the persistenceContext and joins the transaction.
	 */
	private TaskPersistenceContext getPersistenceContext(TaskEvent event) throws EventListenerException {
		LOGGER.debug("Entering CustomTaskEventListener.getPersistenceContext");
		
		if (runtimeManager == null)
			throw new EventListenerException("CustomTaskEventListener...runtimeManager was null");
		if (event == null)
			throw new EventListenerException("CustomTaskEventListener...event was null");
		if (event.getTaskContext() == null)
			throw new EventListenerException("CustomTaskEventListener...event.getTaskContext() was null");
	
		TaskPersistenceContext persistenceContext = ((TaskContext) event.getTaskContext()).getPersistenceContext();
		if (persistenceContext == null)
			throw new EventListenerException("CustomTaskEventListener...persistenceContext was null");
		
		persistenceContext.joinTransaction();
		
		return persistenceContext;
	}
}
