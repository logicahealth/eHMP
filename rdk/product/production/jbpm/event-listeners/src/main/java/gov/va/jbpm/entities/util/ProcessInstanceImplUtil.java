package gov.va.jbpm.entities.util;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.event.process.ProcessEvent;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeManager;

import gov.va.jbpm.entities.impl.ProcessInstanceImpl;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;

public class ProcessInstanceImplUtil {
	public static final String PATIENT_ID = "icn";
	public static final String FACILITY_ID = "facility";
	public static final String INITIATOR = "initiator";
	public static final String PARENT_INSTANCE_ID = "parentInstanceId";
	public static final String INSTANCE_NAME = "instanceName";
	public static final String STATE = "state";
	public static final String STATE_DUE_DATE = "stateDueDate";
	public static final String URGENCY = "urgency";
	public static final String ASSIGNED_TO = "assignedTo";
	public static final String CLINICAL_OBJECT_UID = "clinicalObjectUid";
	public static final String ACTIVITY_HEALTHY = "activityHealthy";
	public static final String ACTIVITY_HEALTH_DESCRIPTION = "activityHealthDescription";
	public static final String TYPE = "type";
	public static final String SUBDOMAIN = "subDomain";
	public static final String DESCRIPTION = "description";

	public static ProcessInstanceImpl create(ProcessEvent event) {
		WorkflowProcessInstanceImpl processInstance = (WorkflowProcessInstanceImpl) event.getProcessInstance();
		Map<String,Object> procInstVariables = processInstance.getVariables();
		KieSession session = (KieSession) event.getKieRuntime();
		RuntimeManager manager = (RuntimeManager)session.getEnvironment().get("RuntimeManager");

		long processInstanceId = processInstance.getId();
		String icn = "";
		String facilityId = null;
		String processName  = processInstance.getProcessName();
		String processDefinitionId = processInstance.getProcessId();
		String deploymentId = manager.getIdentifier();
		long statusId = processInstance.getState();
		String createdById = "";

		String version = processInstance.getProcess().getVersion();
		Long parentInstanceId = null;
		String instanceName = null;
		String state = null;
		Date stateDueDate = null;
		Long urgency = null;
		String assignedTo = null;
		String clinicalObjectUid = null;
		Boolean activityHealthy = true; //Default value
		String activityHealthDescription = null;
		String type = null;
		String domain = null;
		String description = null;

		if (procInstVariables != null) {
			if (procInstVariables.containsKey(PATIENT_ID)){
				icn = (String)procInstVariables.get(PATIENT_ID);
			}

			if (procInstVariables.containsKey(FACILITY_ID)) {
				facilityId = (String)procInstVariables.get(FACILITY_ID);
			}

			if (procInstVariables.containsKey(INITIATOR)) {
				createdById = (String)procInstVariables.get(INITIATOR);
			}

			if (procInstVariables.containsKey(PARENT_INSTANCE_ID)) {
				parentInstanceId = Long.parseLong((String)procInstVariables.get(PARENT_INSTANCE_ID));
			}

			if (procInstVariables.containsKey(INSTANCE_NAME)) {
				instanceName = (String)procInstVariables.get(INSTANCE_NAME);
			}

			if (procInstVariables.containsKey(STATE)) {
				state = (String)procInstVariables.get(STATE);
			}

			if (procInstVariables.containsKey(STATE_DUE_DATE)) {
				try {
					DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
					stateDueDate = formatter.parseDateTime((String)procInstVariables.get(STATE_DUE_DATE)).toDate();
				}
				catch(Exception e) {
					e.printStackTrace();
				}
			}

			if (procInstVariables.containsKey(URGENCY)) {
				urgency = Long.parseLong((String)procInstVariables.get(URGENCY));
			}

			if (procInstVariables.containsKey(ASSIGNED_TO)) {
				assignedTo = (String)procInstVariables.get(ASSIGNED_TO);
			}

			if (procInstVariables.containsKey(CLINICAL_OBJECT_UID)) {
				clinicalObjectUid = (String)procInstVariables.get(CLINICAL_OBJECT_UID);
			}			

			if (procInstVariables.containsKey(ACTIVITY_HEALTHY)) {
				activityHealthy = (Boolean)procInstVariables.get(ACTIVITY_HEALTHY);
			}			

			if (procInstVariables.containsKey(ACTIVITY_HEALTH_DESCRIPTION)) {
				activityHealthDescription = (String)procInstVariables.get(ACTIVITY_HEALTH_DESCRIPTION);
			}	
			if (procInstVariables.containsKey(TYPE)) {
				type = (String)procInstVariables.get(TYPE);
			}	
			// the subDomain field in the enterprise-orderable maps to the DOMAIN column in the activityDB
			if (procInstVariables.containsKey(SUBDOMAIN)) {
				domain = (String)procInstVariables.get(SUBDOMAIN);
			}	
			if (procInstVariables.containsKey(DESCRIPTION)) {
				description = (String)procInstVariables.get(DESCRIPTION);
			}			
			
		}

		List<ProcessRouteImpl> routesList = ProcessRouteImplUtil.create(processInstanceId, assignedTo);

		ProcessInstanceImpl processInstanceImpl = new ProcessInstanceImpl(processInstanceId,
				icn,
				facilityId,
				processName,
				processDefinitionId,
				deploymentId,
				statusId,
				new Date(),//statusTimeStamp,
				createdById,
				version,
				new Date(),//initiationDate,
				parentInstanceId,
				instanceName,
				state,
				new Date(),//stateStartDate,
				stateDueDate,
				urgency,
				null, //destinationFacilityId,
				null, //focusAreaId,
				assignedTo,
				clinicalObjectUid,
				activityHealthy, // activityHealthy
				activityHealthDescription,  // activityHealthDescription
				type,
				domain,
				description,
				routesList
				);
		return processInstanceImpl;
	}
}
