package gov.va.jbpm.entities.impl;

import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class DataModelDetailsImpl {
	protected Long processinstanceid;
	protected String processDefinitionId;
	protected java.sql.Clob activityJSON;
    
	public DataModelDetailsImpl() {
	}

	public Long getProcessinstanceid() {
		return processinstanceid;
	}
	public void setProcessinstanceid(Long processinstanceid) {
		this.processinstanceid = processinstanceid;
	}

	public String getProcessDefinitionId() {
		return processDefinitionId;
	}

	public void setProcessDefinitionId(String processDefinitionId) {
		this.processDefinitionId = processDefinitionId;
	}

	public java.sql.Clob getClobValue() {
		return activityJSON;
	}
	public void setClobValue(java.sql.Clob clobValue) {
		this.activityJSON = clobValue;
	}

	@Override
	public String toString() {
		return "DataModelDetailsImpl [processinstanceid=" + processinstanceid + ", processDefinitionId=" + processDefinitionId
				+ ", clobValue=" + activityJSON + "]";
	}
}
