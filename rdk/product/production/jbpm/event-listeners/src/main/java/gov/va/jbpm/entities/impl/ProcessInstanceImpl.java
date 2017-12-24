package gov.va.jbpm.entities.impl;

import java.util.Date;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.Transient;

@Entity
@Table(name = "AM_PROCESSINSTANCE", schema = "ACTIVITYDB")
public class ProcessInstanceImpl {
	@Id
	private long processInstanceId;
	private String icn;
	private String facilityId;
	private String processName;
	private String processDefinitionId;
	private String deploymentId;
	private long statusId;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date statusTimeStamp;
	private String createdById;
	private String version;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date initiationDate;
	private Long parentInstanceId;
	private String instanceName;
	private String state;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date stateStartDate;
	@Temporal(javax.persistence.TemporalType.TIMESTAMP)
	private Date stateDueDate;
	private Long urgency;
	private String destinationFacilityId;
	private Long focusAreaId;
	private String assignedTo;
	private String clinicalObjectUid;
	private Boolean activityHealthy = true; //Default value
	private String activityHealthDescription;
	private String type;
	private String domain;
	private String description;
	private String pid;

	@Transient
	private List<ProcessRouteImpl> routes;

	@Transient
	private String activityJSON;

//-----------------------------------------------------------------------------
//-----------------------Constructors------------------------------------------
//-----------------------------------------------------------------------------

	public ProcessInstanceImpl() {
	}

	public ProcessInstanceImpl(long processInstanceId, String icn, String facilityId, String processName,
								   String processDefinitionId, String deploymentId, long statusId, Date statusTimeStamp, String createdById,
								   String version, Date initiationDate, Long parentInstanceId, String instanceName, String state,
								   Date stateStartDate, Date stateDueDate, Long urgency, String destinationFacilityId, Long focusAreaId,
								   String assignedTo, String clinicalObjectUid, Boolean activityHealthy, String activityHealthDescription,
								   String type, String domain, String description, List<ProcessRouteImpl> routes, String activityJSON, String pid) {
		this.processInstanceId = processInstanceId;
		this.icn = icn;
		this.facilityId = facilityId;
		this.processName = processName;
		this.processDefinitionId = processDefinitionId;
		this.deploymentId = deploymentId;
		this.statusId = statusId;
		this.statusTimeStamp = statusTimeStamp;
		this.createdById = createdById;
		this.version = version;
		this.initiationDate = initiationDate;
		this.parentInstanceId = parentInstanceId;
		this.instanceName = instanceName;
		this.state = state;
		this.stateStartDate = stateStartDate;
		this.stateDueDate = stateDueDate;
		this.urgency = urgency;
		this.destinationFacilityId = destinationFacilityId;
		this.focusAreaId = focusAreaId;
		this.assignedTo = assignedTo;
		this.clinicalObjectUid = clinicalObjectUid;
		this.activityHealthy = activityHealthy;
		this.activityHealthDescription = activityHealthDescription;
		this.type = type;
		this.domain = domain;
		this.description = description;
		this.routes = routes;
		this.activityJSON = activityJSON;
		this.pid = pid;

	}

//-----------------------------------------------------------------------------
//-----------------------Getters and Setters-----------------------------------
//-----------------------------------------------------------------------------

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

	public String getFacilityId() {
		return facilityId;
	}

	public void setFacilityId(String facilityId) {
		this.facilityId = facilityId;
	}

	public String getProcessName() {
		return processName;
	}

	public void setProcessName(String newProcessName) {
		this.processName = newProcessName;
	}

	public String getProcessDefinitionId() {
		return processDefinitionId;
	}

	public void setProcessDefinitionId(String newProcessDefinitionId) {
		this.processDefinitionId = newProcessDefinitionId;
	}

	public String getDeploymentId() {
		return deploymentId;
	}

	public void setDeploymentId(String newDeploymentId) {
		this.deploymentId = newDeploymentId;
	}

	public long getStatusId() {
		return statusId;
	}

	public void setStatusId(long newStatusId) {
		this.statusId = newStatusId;
		this.statusTimeStamp = new Date();
	}

	public Date getStatusTimeStamp() {
		return statusTimeStamp;
	}

	public void setStatusTimeStamp(Date statusTimeStamp) {
		this.statusTimeStamp = statusTimeStamp;
	}

	public String getCreatedById() {
		return createdById;
	}

	public void setCreatedById(String createdById) {
		this.createdById = createdById;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public Date getInitiationDate() {
		return initiationDate;
	}

	public void setInitiationDate(Date initiationDate) {
		this.initiationDate = initiationDate;
	}

	public Long getParentInstanceId() {
		return parentInstanceId;
	}

	public void setParentInstanceId(Long parentInstanceId) {
		this.parentInstanceId = parentInstanceId;
	}

	public String getInstanceName() {
		return instanceName;
	}

	public void setInstanceName(String instanceName) {
		this.instanceName = instanceName;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public Date getStateStartDate() {
		return stateStartDate;
	}

	public void setStateStartDate(Date stateStartDate) {
		this.stateStartDate = stateStartDate;
	}

	public Date getStateDueDate() {
		return stateDueDate;
	}

	public void setStateDueDate(Date stateDueDate) {
		this.stateDueDate = stateDueDate;
	}

	public Long getUrgency() {
		return urgency;
	}

	public void setUrgency(Long urgency) {
		this.urgency = urgency;
	}

	public String getDestinationFacilityId() {
		return destinationFacilityId;
	}

	public void setDestinationFacilityId(String destinationFacilityId) {
		this.destinationFacilityId = destinationFacilityId;
	}

	public Long getFocusAreaId() {
		return focusAreaId;
	}

	public void setFocusAreaId(Long focusAreaId) {
		this.focusAreaId = focusAreaId;
	}

	public String getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}

	/**
	 * @return the clinicalObjectUid
	 */
	public String getClinicalObjectUid() {
		return clinicalObjectUid;
	}

	/**
	 * @param clinicalObjectUid the clinicalObjectUid to set
	 */
	public void setClinicalObjectUid(String clinicalObjectUid) {
		this.clinicalObjectUid = clinicalObjectUid;
	}

	public Boolean getActivityHealthy() {
		return activityHealthy;
	}

	public void setActivityHealthy(Boolean activityHealthy) {
		this.activityHealthy = activityHealthy;
	}

	public String getActivityHealthDescription() {
		return activityHealthDescription;
	}

	public void setActivityHealthDescription(String activityHealthDescription) {
		this.activityHealthDescription = activityHealthDescription;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDomain() {
		return domain;
	}

	public void setDomain(String domain) {
		this.domain = domain;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the routes
	 */
	public List<ProcessRouteImpl> getRoutes() {
		return routes;
	}

	/**
	 * @param routes the routes to set
	 */
	public void setRoutes(List<ProcessRouteImpl> routes) {
		this.routes = routes;
	}

	public String getPid() {
		return pid;
	}

	public void setPid(String newPid) {
		this.pid = newPid;
	}


//-----------------------------------------------------------------------------
//-----------------------toString----------------------------------------------
//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "ProcessInstanceImpl [processInstanceId=" + processInstanceId + ", icn=" + icn + ", facilityId="
				+ facilityId + ", processName=" + processName + ", processDefinitionId=" + processDefinitionId
				+ ", deploymentId=" + deploymentId + ", statusId=" + statusId + ", statusTimeStamp=" + statusTimeStamp
				+ ", createdById=" + createdById + ", version=" + version + ", initiationDate=" + initiationDate
				+ ", parentInstanceId=" + parentInstanceId + ", instanceName=" + instanceName + ", state=" + state
				+ ", stateStartDate=" + stateStartDate + ", stateDueDate=" + stateDueDate + ", urgency=" + urgency
				+ ", destinationFacilityId=" + destinationFacilityId + ", focusAreaId=" + focusAreaId + ", assignedTo="
				+ assignedTo + ", clinicalObjectUid=" + clinicalObjectUid
				+ ", activityHealthy="+activityHealthy
				+ ", activityHealthDescription="+activityHealthDescription
				+ ", type="+type
				+ ", domain="+domain
				+ ", description="+description
				+ ", pid=" + pid
				+ "]";
	}


}
