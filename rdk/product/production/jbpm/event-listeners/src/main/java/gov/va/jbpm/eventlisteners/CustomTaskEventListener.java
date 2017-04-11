package gov.va.jbpm.eventlisteners;

import org.kie.api.task.TaskEvent;
import org.kie.api.task.TaskLifeCycleEventListener;
import org.kie.api.task.model.OrganizationalEntity;
import org.kie.api.task.model.Status;
import org.kie.api.task.model.Task;
import org.kie.api.task.model.TaskData;
import org.kie.api.task.model.User;

/*
 * Custom task event listener
 * 
 * */
public class CustomTaskEventListener implements TaskLifeCycleEventListener {

	@Override
	public void beforeTaskActivatedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskClaimedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskSkippedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskStartedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskStoppedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskCompletedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskFailedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskAddedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskExitedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskReleasedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskResumedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskSuspendedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskForwardedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskDelegatedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

	@Override
	public void beforeTaskNominatedEvent(TaskEvent event) {
		// TODO Auto-generated method stub

	}

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

	/*
	 * Handler for afterTaskAddedEvent event. This event is raised when new task added.
	 * Create a new task instance record in the database. Here state of the task is Ready.
	 * */
	@Override
	public void afterTaskAddedEvent(TaskEvent event) {
				
		Task task = event.getTask();
		TaskData taskData = task.getTaskData();
		
		StringBuilder routes = new StringBuilder();
		User user = taskData.getActualOwner();
				
		for (OrganizationalEntity oe : event.getTask().getPeopleAssignments().getPotentialOwners()) {
			routes.append(oe.getId() + ",");
		}
				
		DataAccessUtil.createTaskInstanceRecord (task.getId(), 
				taskData.getProcessInstanceId(),
				task.getName(),
				task.getDescription(),
				mapStatus(taskData.getStatus()),
				user != null ? user.getId() : null,
				task.getTaskData().getExpirationTime(),
				task.getPriority(),
				task.getTaskData().isSkipable(),
				routes.toString().replaceAll(",$", ""));
		
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

	/*
	 * Publish task status change to database
	 * */
	private void publishTaskStatusChange (TaskEvent event) {
		Task task = event.getTask();
		TaskData taskData = task.getTaskData();		
		
		User user = taskData.getActualOwner();
		
		DataAccessUtil.updateTaskInstanceRecord(task.getId(),
				mapStatus(taskData.getStatus()),
				user != null ? user.getId() : null);
	}
	
	/*
	 * map BPMS taskstatus enum to number
	 * */
	//Possible task status: Created, Ready, Reserved, InProgress, Suspended, Completed, Failed, Error, Exited, Obsolete	
	private int mapStatus(Status taskStatus){
		
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
