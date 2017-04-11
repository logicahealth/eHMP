package gov.va.jbpm.eventlisteners;

import java.util.Date;
import java.util.List;

import org.jbpm.services.task.commands.TaskContext;
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

/*
 * Custom task event listener
 * 
 * */
public class CustomTaskEventListener implements TaskLifeCycleEventListener {
	private RuntimeManager runtimeManager = null;

//-----------------------------------------------------------------------------
//------------------------Constructors-----------------------------------------
//-----------------------------------------------------------------------------

	public CustomTaskEventListener() {
	}

	public CustomTaskEventListener(RuntimeManager runtimeManager) {
		this.runtimeManager = runtimeManager;
	}

//-----------------------------------------------------------------------------
//--------------------------Unused Overrides-----------------------------------
//-----------------------------------------------------------------------------
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

//-----------------------------------------------------------------------------
//----------------------publishTaskStatusChange--------------------------------
//-----------------------------------------------------------------------------

	@Override
	public void afterTaskActivatedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskClaimedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskSkippedEvent(TaskEvent event) {
		publishTaskStatusChange (event);

	}

	@Override
	public void afterTaskStartedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskStoppedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskCompletedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskFailedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskExitedEvent (TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskReleasedEvent (TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskResumedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskSuspendedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskForwardedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskDelegatedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

	@Override
	public void afterTaskNominatedEvent(TaskEvent event) {
		publishTaskStatusChange (event);
	}

//-----------------------------------------------------------------------------
//-----------------------------afterTaskAddedEvent-----------------------------
//-----------------------------------------------------------------------------

	/*
	 * Handler for afterTaskAddedEvent event. This event is raised when new task added.
	 * Create a new task instance record in the database. Here state of the task is Ready.
	 * */
	@Override
	public void afterTaskAddedEvent(TaskEvent event) {
		if (runtimeManager == null) {
			return;
		}

		TaskPersistenceContext persistenceContext = ((TaskContext)event.getTaskContext()).getPersistenceContext();
		if (persistenceContext == null) {
			return;
		}

		persistenceContext.joinTransaction();

		TaskInstanceImpl taskInstanceImpl = TaskInstanceImplUtil.create(runtimeManager, event);
		persistenceContext.persist(taskInstanceImpl);
		
		List<TaskRouteImpl> routes = taskInstanceImpl.getRoutes();
		for (TaskRouteImpl taskRouteImpl : routes) {
			persistenceContext.persist(taskRouteImpl);
		}
	}

//-----------------------------------------------------------------------------
//------------------------private helper methods-------------------------------
//-----------------------------------------------------------------------------

	/*
	 * Publish task status change to database
	 * */
	private void publishTaskStatusChange (TaskEvent event) {
		if (runtimeManager == null) {
			return;
		}

		TaskPersistenceContext persistenceContext = ((TaskContext)event.getTaskContext()).getPersistenceContext();
		if (persistenceContext == null) {
			return;
		}
		persistenceContext.joinTransaction();

		Task task = event.getTask();
		TaskData taskData = task.getTaskData();
		User user = taskData.getActualOwner();

		Long taskId = task.getId();
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
	}
}
