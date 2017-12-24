package gov.va.activitydb.entities;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "AM_SIGNALINSTANCE", schema = "ACTIVITYDB")
public class SignalInstance {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "signalInstanceIdId_seq")	
	@SequenceGenerator(name = "signalInstanceIdId_seq", sequenceName = "ACTIVITYDB.AM_SIGNAL_INSTANCE_ID_SEQ", allocationSize = 1)
	private BigDecimal id;
	private String name;
	private String action;
	private String owner;
	private Date statusTimeStamp;
	private String history;
	@Column(name = "PROCESSED_SIGNAL_ID")
	private long processedSignalId;
	

//-----------------------------------------------------------------------------
//-----------------------Constructors------------------------------------------
//-----------------------------------------------------------------------------

	public SignalInstance() {
	}
	
	public SignalInstance(BigDecimal id, String name, String action, String owner, Date statusTimeStamp, String history,
			long processedSignalId) {
		super();
		this.id = id;
		this.name = name;
		this.action = action;
		this.owner = owner;
		this.statusTimeStamp = statusTimeStamp;
		this.history = history;
		this.processedSignalId = processedSignalId;
	}

//-----------------------------------------------------------------------------
//-----------------------Getters and Setters-----------------------------------
//-----------------------------------------------------------------------------

	public BigDecimal getId() {
		return id;
	}

	public void setId(BigDecimal id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public Date getStatusTimeStamp() {
		return statusTimeStamp;
	}

	public void setStatusTimeStamp(Date statusTimeStamp) {
		this.statusTimeStamp = statusTimeStamp;
	}

	public String getHistory() {
		return history;
	}

	public void setHistory(String history) {
		this.history = history;
	}

	public long getProcessedSignalId() {
		return processedSignalId;
	}

	public void setProcessedSignalId(long processedSignalId) {
		this.processedSignalId = processedSignalId;
	}

//-----------------------------------------------------------------------------
//-----------------------toString----------------------------------------------
//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "SignalInstance [id=" + id + ", name=" + name + ", action=" + action + ", owner=" + owner
				+ ", statusTimeStamp=" + statusTimeStamp + ", history=" + history + ", processedSignalId="
				+ processedSignalId + "]";
	}
}
