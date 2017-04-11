package vistacore.order.consult;

import java.util.Map;
/**
 * 
 * Set activity state:substate standard values into a map of name/value strings
 * The sorting order is currently as they appear on the specs wiki page
 */
public class StatesMap implements java.io.Serializable {
	private static final long serialVersionUID = 1L;
	
	private static final Map<String, String> activityState;
	static {
		Map<String, String> workState = new java.util.HashMap<String, String>();
		workState.put("Draft","Draft");
		workState.put("Workup","Unreleased:Pre-order Workup");
		workState.put("WorkupComplete", "Unreleased:Pre-order Workup Complete");
		workState.put("Unreleased", "Unreleased:Pending Signature");
		workState.put("Pending", "Pending");
		workState.put("UnderReview", "Active:Under Review");
		workState.put("Assigned", "Active:Assigned to Triage Member");
		workState.put("Clarification","Active:Clarification Requested");
		workState.put("NoResponse","Active:Patient Did Not Respond");
		workState.put("PatientCanceled","Active:Patient Canceled Previous Appt.");
		workState.put("NoShow","Active:Patient No-showed Previous Appt.");
		workState.put("NotSeen","Active:Patient Left Without Being Seen");
		workState.put("ClinicCanceled","Active:Clinic Canceled Previous Appt.");
		workState.put("eConsult","Active:eConsult");
		workState.put("eConsultComplete","Active:eConsult, Provider Completing");
		workState.put("Scheduling","Scheduling:Underway");
		workState.put("FirstAttempt","Scheduling:1st Attempt");
		workState.put("SecondAttempt","Scheduling:2nd Attempt");
		workState.put("ThirdAttempt","Scheduling:3rd Attempt");
		workState.put("CompleteScheduling","Scheduling:Provider Completing");
		workState.put("EWL","Scheduling:EWL");
		workState.put("ApptBooked","Scheduled:Appt. Booked");
		workState.put("ApptInPast","Scheduled:Appt. in Past");
		workState.put("CheckedOut","Scheduled:Appt. in Past, Checked Out");
		workState.put("ActionRequired","Scheduled:Appt. in Past, Action Required");
		workState.put("CompleteScheduled","Scheduled:Provider Completing");
		workState.put("CommCarePending","Community Care:Pending");
		workState.put("CommCareScheduled","Community Care:Scheduled");
		workState.put("CompleteNote","Completed:Note");
		workState.put("CompleteAdmin","Completed:Administrative");
		workState.put("CompleteEConsult","Completed:eConsult");
		workState.put("CompleteCommCare","Completed:Community Care");
		workState.put("DiscByProvider","Discontinued:By Ordering Provider");
		
		activityState = java.util.Collections.unmodifiableMap(workState);
	}
	
	public StatesMap() {	
	
	}

	public static Map<String, String> getActivitystate() {
		return activityState;
	}
	
}
