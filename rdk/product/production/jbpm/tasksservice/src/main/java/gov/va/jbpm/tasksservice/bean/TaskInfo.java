package gov.va.jbpm.tasksservice.bean;

import java.util.List;

public class TaskInfo {
	private long processInstanceId;
	private List<TaskSummary> taskSummaries;
	private List<Variable> variables;
	/**
	 * @return the processInstanceId
	 */
	public long getProcessInstanceId() {
		return processInstanceId;
	}
	/**
	 * @param processInstanceId the processInstanceId to set
	 */
	public void setProcessInstanceId(long processInstanceId) {
		this.processInstanceId = processInstanceId;
	}
	/**
	 * @return the taskSummaries
	 */
	public List<TaskSummary> getTaskSummaries() {
		return taskSummaries;
	}
	/**
	 * @param taskSummaries the taskSummaries to set
	 */
	public void setTaskSummaries(List<TaskSummary> taskSummaries) {
		this.taskSummaries = taskSummaries;
	}
	/**
	 * @return the variables
	 */
	public List<Variable> getVariables() {
		return variables;
	}
	/**
	 * @param variables the variables to set
	 */
	public void setVariables(List<Variable> variables) {
		this.variables = variables;
	}
}
