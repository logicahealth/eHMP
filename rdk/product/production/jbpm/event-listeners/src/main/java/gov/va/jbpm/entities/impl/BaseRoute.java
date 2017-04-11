package gov.va.jbpm.entities.impl;

import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class BaseRoute {

	protected String facility;
	protected Integer team;
	protected Integer teamFocus;
	protected Integer teamType;
	protected Integer teamRole;
	protected String userId;
	protected boolean patientAssignment;

	//JPA Entities are required to have a default (empty) constructor.
	public BaseRoute() {
	}

	//Constructor
	public BaseRoute(String facility, Integer team, Integer teamFocus, Integer teamType, 
			Integer teamRole, String userId, boolean patientAssignment) {
			
		this.facility = facility; 
		this.team = team; 
		this.teamFocus = teamFocus; 
		this.teamType = teamType; 
		this.teamRole = teamRole; 
		this.userId = userId; 
		this.patientAssignment = patientAssignment;		
	}
	
	/**
	 * @return the facility
	 */
	public String getFacility() {
		return facility;
	}

	/**
	 * @param facility the facility to set
	 */
	public void setFacility(String facility) {
		this.facility = facility;
	}

	/**
	 * @return the team
	 */
	public int getTeam() {
		return team;
	}

	/**
	 * @param team the team to set
	 */
	public void setTeam(int team) {
		this.team = team;
	}

	/**
	 * @return the teamFocus
	 */
	public int getTeamFocus() {
		return teamFocus;
	}

	/**
	 * @param teamFocus the teamFocus to set
	 */
	public void setTeamFocus(int teamFocus) {
		this.teamFocus = teamFocus;
	}

	/**
	 * @return the teamType
	 */
	public int getTeamType() {
		return teamType;
	}

	/**
	 * @param teamType the teamType to set
	 */
	public void setTeamType(int teamType) {
		this.teamType = teamType;
	}

	/**
	 * @return the teamRole
	 */
	public int getTeamRole() {
		return teamRole;
	}

	/**
	 * @param teamRole the teamRole to set
	 */
	public void setTeamRole(int teamRole) {
		this.teamRole = teamRole;
	}

	/**
	 * @return the userId
	 */
	public String getUserId() {
		return userId;
	}

	/**
	 * @param userId the userId to set
	 */
	public void setUserId(String userId) {
		this.userId = userId;
	}

	/**
	 * @return the patientAssignment
	 */
	public boolean getPatientAssignment() {
		return patientAssignment;
	}

	/**
	 * @param patientAssignment the patientAssignment to set
	 */
	public void setPatientAssignment(boolean patientAssignment) {
		this.patientAssignment = patientAssignment;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------toString----------------------------------------------
	//-----------------------------------------------------------------------------

	@Override
	public String toString() {
		return "facility=" + facility + ", team=" + team + ", teamFocus=" + teamFocus + ", teamType=" 
				+ teamType + ", teamRole=" + teamRole + ", userId=" + userId + ", patientAssignment=" + patientAssignment;
	}
}