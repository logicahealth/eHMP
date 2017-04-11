package gov.va.jbpm.tasksservice.bean;

import java.util.List;

public class Task {
	private List<TaskInfo> taskInfoList;

	/**
	 * @return the taskInfoList
	 */
	public List<TaskInfo> getTaskInfoList() {
		return taskInfoList;
	}

	/**
	 * @param taskInfoList the taskInfoList to set
	 */
	public void setTaskInfoList(List<TaskInfo> taskInfoList) {
		this.taskInfoList = taskInfoList;
	}
}
