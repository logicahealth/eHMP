package gov.va.jbpm.tasksservice.bean;

import java.util.List;

public class TasksDataResponse {
	private List<?> items;

	/**
	 * @return the items
	 */
	public List<?> getItems() {
		return items;
	}

	/**
	 * @param items the items to set
	 */
	public void setItems(List<?> items) {
		this.items = items;
	}
}
