package gov.va.jbpm.entities.impl;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "ACTIVITYDB.AM_PROCESSROUTE")
public class ProcessRouteImpl extends BaseRoute {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "processRoute_seq")	
	@SequenceGenerator(name = "processRoute_seq", sequenceName = "ACTIVITYDB.AM_PROCESSROUTE_ID_SEQ", allocationSize = 1)
	private long id;
	private Long processInstanceId; 
	
	//Constructors
	public ProcessRouteImpl(Long processInstanceId, String facility, Integer team, Integer teamFocus, Integer teamType, 
			Integer teamRole, String userId, boolean patientAssignment) {
			
		super(facility, team, teamFocus, teamType, teamRole, userId, patientAssignment);
		this.processInstanceId = processInstanceId;
	}
	
	public ProcessRouteImpl(Long taskInstanceId, BaseRoute baseRoute) {
		
		this(taskInstanceId, baseRoute.facility, baseRoute.team, baseRoute.teamFocus, baseRoute.teamType, baseRoute.teamRole, baseRoute.userId, baseRoute.patientAssignment);	
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

	
	
//-----------------------------------------------------------------------------
//-----------------------toString----------------------------------------------
//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "ProcessRouteImpl [id=" + id + ", processInstanceId=" + processInstanceId + ", " + super.toString() + "]";
	}

}
