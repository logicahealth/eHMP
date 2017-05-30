package gov.va.jbpm.tasksservice.bean;

import java.util.List;

public class TaskDetail {
	private List<TaskDetailInfo> taskInfoList;

	/**
	 * @return the taskInfoList
	 */
	public List<TaskDetailInfo> getTaskInfoList() {
		return taskInfoList;
	}

	/**
	 * @param taskInfoList the taskInfoList to set
	 */
	public void setTaskInfoList(List<TaskDetailInfo> taskInfoList) {
		this.taskInfoList = taskInfoList;
	}
}
