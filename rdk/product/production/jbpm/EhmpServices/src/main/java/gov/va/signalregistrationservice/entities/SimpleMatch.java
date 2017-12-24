package gov.va.signalregistrationservice.entities;

import java.io.Serializable;
import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "SIMPLE_MATCH", schema = "ACTIVITYDB")
public class SimpleMatch implements Serializable {
	
	private static final long serialVersionUID = 1234567890;
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "simpleMatchId_seq")	
	@SequenceGenerator(name = "simpleMatchId_seq", sequenceName = "ACTIVITYDB.AM_SIMPLE_MATCH_ID_SEQ", allocationSize = 1)
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
	
	private String matchField; 

	/**
	 * @return the matchField
	 */
	public String getMatchField() {
		return matchField;
	}

	/**
	 * @param matchField the matchField to set
	 */
	public void setMatchField(String matchField) {
		this.matchField = matchField;
	}
	
	private String matchValue;

	/**
	 * @return the matchValue
	 */
	public String getMatchValue() {
		return matchValue;
	}

	/**
	 * @param matchValue the matchValue to set
	 */
	public void setMatchValue(String matchValue) {
		this.matchValue = matchValue;
	}
	
	@Column(name = "EVENT_MTCH_CRI_ID")
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

	public SimpleMatch() { }
	
	public SimpleMatch(String matchField, String matchValue, BigDecimal eventMatchCriteriaId) {
		this.matchField = matchField;
		this.matchValue = matchValue;
		this.eventMatchCriteriaId = eventMatchCriteriaId;
	}
}
