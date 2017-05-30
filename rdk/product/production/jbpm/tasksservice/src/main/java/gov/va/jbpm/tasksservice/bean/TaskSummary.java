package gov.va.jbpm.tasksservice.bean;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TaskSummary {
	private long id;
    private String name;
    private String subject;
    private String description;
    private String status;
    private int priority;
    private boolean skipable;
    
    @JsonProperty("actual-owner")
    private String actualOwnerId;
    
    @JsonProperty("created-by")
    private String createdById;
    
    @JsonProperty("created-on")
    private long createdOn;
    
    @JsonProperty("activation-time")
    private long activationTime;
    
    @JsonProperty("expiration-time")
    private long expirationTime;
    
    @JsonProperty("process-instance-id")
    private long processInstanceId;
    
    @JsonProperty("process-id")
	private String processId;
    
    @JsonProperty("process-session-id")
    private long processSessionId;
    
    @JsonProperty("deployment-id")
    private String deploymentId;
    
    @JsonProperty("quick-task-summary")
    private boolean quickTaskSummary;
    
    @JsonProperty("parent-id")
    private long parentId;
    
    private String potentialOwners;
	private String content;
	private List<Variable> variables;
	
	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}
	/**
	 * @param id the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}
	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * @return the subject
	 */
	public String getSubject() {
		return subject;
	}
	/**
	 * @param subject the subject to set
	 */
	public void setSubject(String subject) {
		this.subject = subject;
	}
	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}
	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}
	/**
	 * @return the status
	 */
	public String getStatus() {
		return status;
	}
	/**
	 * @param status the status to set
	 */
	public void setStatus(String status) {
		this.status = status;
	}
	/**
	 * @return the priority
	 */
	public int getPriority() {
		return priority;
	}
	/**
	 * @param priority the priority to set
	 */
	public void setPriority(int priority) {
		this.priority = priority;
	}
	/**
	 * @return the skipable
	 */
	public boolean isSkipable() {
		return skipable;
	}
	/**
	 * @param skipable the skipable to set
	 */
	public void setSkipable(boolean skipable) {
		this.skipable = skipable;
	}
	/**
	 * @return the actualOwnerId
	 */
	public String getActualOwnerId() {
		return actualOwnerId;
	}
	/**
	 * @param actualOwnerId the actualOwnerId to set
	 */
	public void setActualOwnerId(String actualOwnerId) {
		this.actualOwnerId = actualOwnerId;
	}
	/**
	 * @return the createdById
	 */
	public String getCreatedById() {
		return createdById;
	}
	/**
	 * @param createdById the createdById to set
	 */
	public void setCreatedById(String createdById) {
		this.createdById = createdById;
	}
	/**
	 * @return the createdOn
	 */
	public long getCreatedOn() {
		return createdOn;
	}
	/**
	 * @param createdOn the createdOn to set
	 */
	public void setCreatedOn(long createdOn) {
		this.createdOn = createdOn;
	}
	/**
	 * @return the activationTime
	 */
	public long getActivationTime() {
		return activationTime;
	}
	/**
	 * @param activationTime the activationTime to set
	 */
	public void setActivationTime(long activationTime) {
		this.activationTime = activationTime;
	}
	/**
	 * @return the expirationTime
	 */
	public long getExpirationTime() {
		return expirationTime;
	}
	/**
	 * @param expirationTime the expirationTime to set
	 */
	public void setExpirationTime(long expirationTime) {
		this.expirationTime = expirationTime;
	}
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
	 * @return the processId
	 */
	public String getProcessId() {
		return processId;
	}
	/**
	 * @param processId the processId to set
	 */
	public void setProcessId(String processId) {
		this.processId = processId;
	}
	/**
	 * @return the processSessionId
	 */
	public long getProcessSessionId() {
		return processSessionId;
	}
	/**
	 * @param processSessionId the processSessionId to set
	 */
	public void setProcessSessionId(long processSessionId) {
		this.processSessionId = processSessionId;
	}
	/**
	 * @return the deploymentId
	 */
	public String getDeploymentId() {
		return deploymentId;
	}
	/**
	 * @param deploymentId the deploymentId to set
	 */
	public void setDeploymentId(String deploymentId) {
		this.deploymentId = deploymentId;
	}
	/**
	 * @return the quickTaskSummary
	 */
	public boolean isQuickTaskSummary() {
		return quickTaskSummary;
	}
	/**
	 * @param quickTaskSummary the quickTaskSummary to set
	 */
	public void setQuickTaskSummary(boolean quickTaskSummary) {
		this.quickTaskSummary = quickTaskSummary;
	}
	/**
	 * @return the parentId
	 */
	public long getParentId() {
		return parentId;
	}
	/**
	 * @param parentId the parentId to set
	 */
	public void setParentId(long parentId) {
		this.parentId = parentId;
	}
	/**
	 * @return the potentialOwners
	 */
	public String getPotentialOwners() {
		return potentialOwners;
	}
	/**
	 * @param potentialOwners the potentialOwners to set
	 */
	public void setPotentialOwners(String potentialOwners) {
		this.potentialOwners = potentialOwners;
	}
	/**
	 * @return the content
	 */
	public String getContent() {
		return content;
	}
	/**
	 * @param content the content to set
	 */
	public void setContent(String content) {
		this.content = content;
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
