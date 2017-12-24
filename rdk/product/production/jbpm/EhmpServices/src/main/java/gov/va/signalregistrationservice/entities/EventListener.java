package gov.va.signalregistrationservice.entities;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "AM_EVENTLISTENER", schema = "ACTIVITYDB")
public class EventListener {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "eventListenerId_seq")	
	@SequenceGenerator(name = "eventListenerId_seq", sequenceName = "ACTIVITYDB.AM_EVENTLISTENER_ID_SEQ", allocationSize = 1)
	@Column(name = "LISTENER_ID")
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

	@Column(name = "EVENT_ACTION_SCOPE")
	private String eventActionScope;
	
	/**
	 * @return the eventActionScope
	 */
	public String getEventActionScope() {
		return eventActionScope;
	}

	/**
	 * @param eventActionScope the eventActionScope to set
	 */
	public void setEventActionScope(String eventActionScope) {
		this.eventActionScope = eventActionScope;
	}

	@Column(name = "API_VERSION")
	private String apiVersion;
	
	/**
	 * @return the apiVersion
	 */
	public String getApiVersion() {
		return apiVersion;
	}

	/**
	 * @param apiVersion the apiVersion to set
	 */
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}

	@Column(name = "DESCRIPTION_ITEM")
	private String descriptionItem;
	
	/**
	 * @return the descriptionItem
	 */
	public String getDescriptionItem() {
		return descriptionItem;
	}

	/**
	 * @param descriptionItem the descriptionItem to set
	 */
	public void setDescriptionItem(String descriptionItem) {
		this.descriptionItem = descriptionItem;
	}

	private String name;	
	
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

	@Column(name = "EVENT_MTCH_ACTION_ID")
	private BigDecimal eventMatchActionId;	
	
	/**
	 * @return the eventMatchActionId
	 */
	public BigDecimal getEventMatchActionId() {
		return eventMatchActionId;
	}

	/**
	 * @param eventMatchActionId the eventMatchActionId to set
	 */
	public void setEventMatchActionId(BigDecimal eventMatchActionId) {
		this.eventMatchActionId = eventMatchActionId;
	}

	@Column(name = "EVENT_MTCH_CRITERIA_ID")
	private BigDecimal eventMatchCriteriaId;
	
	/**
	 * @return the eventMatchCriteriaId
	 */
	public BigDecimal getEventMatchCriteriaId() {
		return eventMatchCriteriaId;
	}

	/**
	 * @param eventMatchCriteriaId the eventMatchCriteriaId to set
	 */
	public void setEventMatchCriteriaId(BigDecimal eventMatchCriteriaId) {
		this.eventMatchCriteriaId = eventMatchCriteriaId;
	}

	public EventListener() { }
	
	public EventListener(String eventActionScope, 
			String apiVersion, 
			String descriptionItem, 
			String name, 
			BigDecimal eventMatchActionId, 
			BigDecimal eventMatchCriteriaId) {
		this.eventActionScope = eventActionScope;
		this.apiVersion = apiVersion;
		this.descriptionItem = descriptionItem;
		this.name = name;
		this.eventMatchActionId = eventMatchActionId;
		this.eventMatchCriteriaId = eventMatchCriteriaId;		
	}
}
