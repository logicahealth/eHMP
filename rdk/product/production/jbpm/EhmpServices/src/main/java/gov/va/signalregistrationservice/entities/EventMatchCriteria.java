package gov.va.signalregistrationservice.entities;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "EVENT_MATCH_CRITERIA", schema = "ACTIVITYDB")
public class EventMatchCriteria {

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

	public EventMatchCriteria() { }
	
	public EventMatchCriteria(BigDecimal id) {
		this.id = id;
	}
}
