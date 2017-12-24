package gov.va.jbpm.entities.util;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.jboss.logging.Logger;
import org.jbpm.workflow.instance.impl.WorkflowProcessInstanceImpl;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.event.process.ProcessEvent;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.manager.RuntimeManager;

import gov.va.jbpm.entities.impl.ProcessInstanceImpl;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;
import gov.va.jbpm.exception.EventListenerException;

public class ProcessInstanceImplUtil {
	public static final String PATIENT_ID = "icn";
	public static final String FACILITY_ID = "facility";
	public static final String DESTINATION_FACILITY_ID = "destinationFacility";
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
	public static final String ACTIVITYJSON = "activityJSON";
	public static final String PID = "pid";

	private static final Logger LOGGER = Logger.getLogger(ProcessInstanceImplUtil.class);


	public static ProcessInstanceImpl create(ProcessEvent event) throws EventListenerException {
		LOGGER.debug("Entering ProcessInstanceImplUtil.create");
		WorkflowProcessInstanceImpl processInstance = (WorkflowProcessInstanceImpl) event.getProcessInstance();
		Map<String,Object> processInstanceVariables = processInstance.getVariables();
		KieSession session = (KieSession) event.getKieRuntime();
		RuntimeManager manager = (RuntimeManager)session.getEnvironment().get("RuntimeManager");

		long processInstanceId = processInstance.getId();
		String processName  = processInstance.getProcessName();
		String processDefinitionId = processInstance.getProcessId();
		long statusId = processInstance.getState();
		String version = processInstance.getProcess().getVersion();
		String deploymentId = manager.getIdentifier();

		String icn = getProcInstVariableString(processInstanceVariables, PATIENT_ID);
		String facilityId = getProcInstVariableString(processInstanceVariables, FACILITY_ID);
		String destinationFacilityId = getProcInstVariableString(processInstanceVariables, DESTINATION_FACILITY_ID);
		String createdById = getProcInstVariableString(processInstanceVariables, INITIATOR);
		Long parentInstanceId = getProcInstVariableLong(processInstanceVariables, PARENT_INSTANCE_ID);
		String instanceName = getProcInstVariableString(processInstanceVariables, INSTANCE_NAME);
		String state = getProcInstVariableString(processInstanceVariables, STATE);
		Date stateDueDate = getProcInstVariableDate(processInstanceVariables, STATE_DUE_DATE);
		Long urgency = getProcInstVariableLong(processInstanceVariables, URGENCY);
		String assignedTo = getProcInstVariableString(processInstanceVariables, ASSIGNED_TO);
		String clinicalObjectUid = getProcInstVariableString(processInstanceVariables, CLINICAL_OBJECT_UID);
		Boolean activityHealthy = getProcInstVariableBoolean(processInstanceVariables, ACTIVITY_HEALTHY);
		String activityHealthDescription = getProcInstVariableString(processInstanceVariables, ACTIVITY_HEALTH_DESCRIPTION);
		String type = getProcInstVariableString(processInstanceVariables, TYPE);
		String domain = getProcInstVariableString(processInstanceVariables, SUBDOMAIN); // the subDomain field in the enterprise-orderable maps to the DOMAIN column in the activityDB
		String description = getProcInstVariableString(processInstanceVariables, DESCRIPTION);
		String activityJSON = getProcInstVariableString(processInstanceVariables, ACTIVITYJSON);
		String pid = getProcInstVariableString(processInstanceVariables, PID);

		if (icn == null)
			icn = "";
		if (createdById == null)
			createdById = "";
		if (activityHealthy == null)
			activityHealthy = new Boolean(true);

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
				destinationFacilityId,
				null, //focusAreaId,
				assignedTo,
				clinicalObjectUid,
				activityHealthy, // activityHealthy
				activityHealthDescription,  // activityHealthDescription
				type,
				domain,
				description,
				routesList,
				activityJSON,
				pid
		);
		return processInstanceImpl;
	}

	protected static Object getProcInstVariableObject(Map<String,Object> processInstanceVariables, String key) throws EventListenerException {
		if (key == null || key.isEmpty()) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "key was null or empty");
		}

		if (processInstanceVariables == null || processInstanceVariables.containsKey(key) == false)
			return null;

		Object obj = processInstanceVariables.get(key);
		return obj;
	}

	protected static String getProcInstVariableString(Map<String,Object> processInstanceVariables, String key) throws EventListenerException {
		Object obj = getProcInstVariableObject(processInstanceVariables, key);

		if (obj == null)
			return null;

		if (!(obj instanceof String)) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "processInstanceVariables '" +
					key + "' was not a String as expected.");
		}

		String retvalue = (String)obj;
		return retvalue;
	}

	protected static Long getProcInstVariableLong(Map<String,Object> processInstanceVariables, String key) throws EventListenerException {
		String str = getProcInstVariableString(processInstanceVariables, key);

		if (str == null || str.length() == 0)
			return null;

		Long retvalue = null;
		try {
			retvalue = Long.parseLong(str);
		} catch (NumberFormatException e) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "processInstanceVariables '" +
					key + "' was not a Long as expected.  Cannot convert '" + str + "' to a Long: " + e.getMessage(),e);
		}

		return retvalue;
	}

	protected static Boolean getProcInstVariableBoolean(Map<String,Object> processInstanceVariables, String key) throws EventListenerException {
		Object obj = getProcInstVariableObject(processInstanceVariables, key);

		if (obj == null)
			return null;

		if (!(obj instanceof Boolean)) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "processInstanceVariables '" +
					key + "' was not a Boolean as expected.");
		}

		Boolean retvalue = (Boolean)obj;
		return retvalue;
	}

	protected static Date getProcInstVariableDate(Map<String,Object> processInstanceVariables, String key) throws EventListenerException {
		String str = getProcInstVariableString(processInstanceVariables, key);

		if (str == null || str.length() == 0)
			return null;

		Date retvalue = null;
		try {
			DateTimeFormatter formatter = ISODateTimeFormat.dateTimeNoMillis();
			DateTime dtTime = formatter.parseDateTime(str);
			retvalue = dtTime.toDate();
		}
		catch(Exception e) {
			throw new EventListenerException(EventListenerException.BAD_REQUEST, "processInstanceVariables '" +
					key + "' was not a Date as expected.  Cannot convert '" + str + "' to a Date: " + e.getMessage(), e);
		}
		return retvalue;
	}
}
