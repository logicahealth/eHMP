package gov.va.jbpm.entities.impl;

import java.util.Date;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.Transient;

@Entity
@Table(name = "ACTIVITYDB.AM_TASKINSTANCE")
public class TaskInstanceImpl {
	@Id
	private long id;
	private long processInstanceId;
	private String icn;
	private String taskName;
	private String description;
	private int priority;
	private boolean skippable;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date createdOn;
	private int statusId;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date statusTimeStamp;
	private String actualOwner;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date dueDate;
	private Date earliestDate;
	private String definitionId;
	private String navigation;
	private String permission;
	private String history;
	private String historyAction;
	private String assignedTo;

	@Transient
	private List<TaskRouteImpl> routes;
	
//-----------------------------------------------------------------------------
//-----------------------Constructors------------------------------------------
//-----------------------------------------------------------------------------

	public TaskInstanceImpl() {

	}

	public TaskInstanceImpl(long id, long processInstanceId, String icn, String taskName, String description,
			int priority, boolean skippable, Date createdOn, int statusId, Date statusTimeStamp, String actualOwner,
			Date dueDate, Date earliestDate, List<TaskRouteImpl> routes, String definitionId, String navigation, 
			String permission, String assignedTo) {
		this.id = id;
		this.processInstanceId = processInstanceId;
		this.icn = icn;
		this.taskName = taskName;
		this.description = description;
		this.priority = priority;
		this.skippable = skippable;
		this.createdOn = createdOn;
		this.statusId = statusId;
		this.statusTimeStamp = new Date();
		this.actualOwner = actualOwner;
		this.dueDate = dueDate;
		this.earliestDate = earliestDate;
		this.routes = routes;
		this.definitionId = definitionId;
		this.navigation = navigation;
		this.permission = permission;
		this.assignedTo = assignedTo;
	}

//-----------------------------------------------------------------------------
//-----------------------Getters and Setters-----------------------------------
//-----------------------------------------------------------------------------

	public long getId() {
		return id;
	}

	public void setId(long newId) {
		this.id = newId;
	}

	public long getProcessInstanceId() {
		return processInstanceId;
	}

	public void setProcessInstanceId(long newProcessInstanceId) {
		this.processInstanceId = newProcessInstanceId;
	}

	public String getIcn() {
		return icn;
	}

	public void setIcn(String newIcn) {
		this.icn = newIcn;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String newTaskName) {
		this.taskName = newTaskName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getPriority() {
		return priority;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}

	public boolean getSkippable() {
		return skippable;
	}

	public void setSkippable(boolean skippable) {
		this.skippable = skippable;
	}

	public Date getCreatedOn() {
		return createdOn;
	}

	public void setCreatedOn(Date createdOn) {
		this.createdOn = createdOn;
	}

	public int getStatusId() {
		return statusId;
	}

	public void setStatusId(int newStatusId) {
		this.statusId = newStatusId;
		this.statusTimeStamp = new Date();
	}

	public Date getStatusTimeStamp() {
		return statusTimeStamp;
	}

	public void setStatusTimeStamp(Date statusTimeStamp) {
		this.statusTimeStamp = statusTimeStamp;
	}

	public String getActualOwner() {
		return actualOwner;
	}

	public void setActualOwner(String newActualOwner) {
		this.actualOwner = newActualOwner;
	}

	public Date getDueDate() {
		return dueDate;
	}

	public void setDueDate(Date dueDate) {
		this.dueDate = dueDate;
	}
	
	public Date getEarliestDate() {
		return earliestDate;
	}

	public void setEarliestDate(Date earliestDate) {
		this.earliestDate = earliestDate;
	}

	/**
	 * @return the routes
	 */
	public List<TaskRouteImpl> getRoutes() {
		return routes;
	}

	/**
	 * @param routes the routes to set
	 */
	public void setRoutes(List<TaskRouteImpl> routes) {
		this.routes = routes;
	}

	/**
	 * @return the definitionId
	 */
	public String getDefinitionId() {
		return definitionId;
	}

	/**
	 * @param definitionId the definitionId to set
	 */
	public void setDefinitionId(String definitionId) {
		this.definitionId = definitionId;
	}

	/**
	 * @return the navigation
	 */
	public String getNavigation() {
		return navigation;
	}

	/**
	 * @param navigation the navigation to set
	 */
	public void setNavigation(String navigation) {
		this.navigation = navigation;
	}

	/**
	 * @return the permission
	 */
	public String getPermission() {
		return permission;
	}

	/**
	 * @param permission the permission to set
	 */
	public void setPermission(String permission) {
		if((permission != null) && (permission.trim().length() > 0)) {
			this.permission = permission;
		} else {
			this.permission = "permission: { ehmp: [],pcmm: [],user: []}";
		}
	}
	
	/**
	 * @return the history
	 */
	public String getHistory() {
		return history;
	}

	/**
	 * @param history the history to set
	 */
	public void setHistory(String history) {
		this.history = history;
	}
	
	/**
	 * @return the historyAction
	 */
	public String getHistoryAction() {
		return historyAction;
	}

	/**
	 * @param historyAction the historyAction to set
	 */
	public void setHistoryAction(String historyAction) {
		this.historyAction = historyAction;
	}

	/**
	 * @return the assignedTo
	 */
	public String getAssignedTo() {
		return assignedTo;
	}

	/**
	 * @param assignedTo the assignedTo to set
	 */
	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}
	
//-----------------------------------------------------------------------------
//-----------------------toString----------------------------------------------
//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "TaskInstanceImpl [id=" + id + ", processInstanceId=" + processInstanceId + ", icn=" + icn
				+ ", taskName=" + taskName + ", description=" + description + ", priority=" + priority + ", skippable="
				+ skippable + ", createdOn=" + createdOn + ", statusId=" + statusId + ", statusTimeStamp="
				+ statusTimeStamp + ", actualOwner=" + actualOwner + ", dueDate=" + dueDate + ", earliestDate="
				+ earliestDate + ", definitionId=" + definitionId + ", navigation=" + navigation + ", permission="
				+ permission + ", history=" + history + ", historyAction=" + historyAction + ", assignedTo="
				+ assignedTo + ", routes=" + routes + "]";
	}
}
