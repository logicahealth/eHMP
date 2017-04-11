package gov.va.signalregistrationservice.entities;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ACTIVITYDB.EVENT_MATCH_ACTION")
public class EventMatchAction {

	@Id
	private BigDecimal id;
	
	/**
	 * @return the id
	 */
	public BigDecimal getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(BigDecimal id) {
		this.id = id;
	}

	@Column(name = "SIGNAL_CONTENT")
	private String signalContent;
	
	/**
	 * @return the signalContent
	 */
	public String getSignalContent() {
		return signalContent;
	}

	/**
	 * @param signalContent the signalContent to set
	 */
	public void setSignalContent(String signalContent) {
		this.signalContent = signalContent;
	}

	@Column(name = "SIGNAL_NAME")
	private String signalName;
	
	/**
	 * @return the signalName
	 */
	public String getSignalName() {
		return signalName;
	}

	/**
	 * @param signalName the signalName to set
	 */
	public void setSignalName(String signalName) {
		this.signalName = signalName;
	}

	@Column(name = "EVENT_MTCH_DEF_ID")
	private String eventMatchDefinitionId;

	/**
	 * @return the eventMatchDefinitionId
	 */
	public String getEventMatchDefinitionId() {
		return eventMatchDefinitionId;
	}

	/**
	 * @param eventMatchDefinitionId the eventMatchDefinitionId to set
	 */
	public void setEventMatchDefinitionId(String eventMatchDefinitionId) {
		this.eventMatchDefinitionId = eventMatchDefinitionId;
	}

	@Column(name = "EVENT_MTCH_VERSION")
	private String eventMatchVersion;
	
	/**
	 * @return the eventMatchVersion
	 */
	public String getEventMatchVersion() {
		return eventMatchVersion;
	}

	/**
	 * @param eventMatchVersion the eventMatchVersion to set
	 */
	public void setEventMatchVersion(String eventMatchVersion) {
		this.eventMatchVersion = eventMatchVersion;
	}

	@Column(name = "EVENT_MTCH_INST_ID")
	private long eventMatchInstanceId;	
	
	/**
	 * @return the eventMatchInstanceId
	 */
	public long getEventMatchInstanceId() {
		return eventMatchInstanceId;
	}

	/**
	 * @param eventMatchInstanceId the eventMatchInstanceId to set
	 */
	public void setEventMatchInstanceId(long eventMatchInstanceId) {
		this.eventMatchInstanceId = eventMatchInstanceId;
	}	
	
	public EventMatchAction(BigDecimal id, String signalContent, String signalName, String eventMatchDefinitionId, 
			String eventMatchVersion, long eventMatchInstanceId) {
		this.id = id;
		this.signalContent = signalContent;
		this.signalName = signalName;
		this.eventMatchDefinitionId = eventMatchDefinitionId;
		this.eventMatchVersion = eventMatchVersion;
		this.eventMatchInstanceId = eventMatchInstanceId;
	}
}
