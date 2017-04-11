package gov.va.eventstatewriteservice.entities;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "ACTIVITYDB.PROCESSED_EVENT_STATE")
public class ProcessedEventState {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "processedEventStateId_seq")	
	@SequenceGenerator(name = "processedEventStateId_seq", sequenceName = "ACTIVITYDB.AM_PRCSD_EVNT_STT_ID_SEQ", allocationSize = 1)
	private BigDecimal id;

	@Column(name = "DATA_LOCATION")
	private String dataLocation;

	@Column(name = "VALUE")
	private String value;

	@Column(name = "LISTENER_ID")
	private long listenerId;

	/**
	 * @return the dataLocation
	 */
	public String getDataLocation() {
		return dataLocation;
	}

	/**
	 * @param dataLocation the dataLocation to set
	 */
	public void setDataLocation(String dataLocation) {
		this.dataLocation = dataLocation;
	}

	/**
	 * @return the value
	 */
	public String getValue() {
		return value;
	}

	/**
	 * @param value the value to set
	 */
	public void setValue(String value) {
		this.value = value;
	}
	
	/**
	 * @return the listenerId
	 */
	public long getListenerId() {
		return listenerId;
	}

	/**
	 * @param listenerId the listenerId to set
	 */
	public void setListenerId(long listenerId) {
		this.listenerId = listenerId;
	}
	
	public ProcessedEventState(String value, long listenerId) {
		this.dataLocation = "uid"; //default the data location to uid
		this.value = value;
		this.listenerId = listenerId;
	}

	public ProcessedEventState(String dataLocation, String value, long listenerId) {
		this.dataLocation = dataLocation;
		this.value = value;
		this.listenerId = listenerId;
	}
	
}
