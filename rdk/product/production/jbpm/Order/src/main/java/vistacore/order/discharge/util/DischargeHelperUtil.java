package vistacore.order.discharge.util;

import java.io.IOException;
import java.io.InputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import org.drools.core.util.KieFunctions;
import org.jboss.logging.Logger;
import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.joda.time.DateTimeZone;
import org.joda.time.Seconds;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.kie.api.runtime.process.ProcessInstance;
import org.kie.api.runtime.process.WorkflowProcessInstance;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import vistacore.order.discharge.ActivityJSON;
import vistacore.order.discharge.Diagnosis;
import vistacore.order.discharge.Discharge;
import vistacore.order.discharge.DischargeActivity;
import vistacore.order.discharge.DischargeContact;
import vistacore.order.discharge.DischargeData;
import vistacore.order.discharge.DischargeFollowup;
import vistacore.order.discharge.DischargeFollowupClinicalObject;
import vistacore.order.discharge.DischargeSignal;
import vistacore.order.discharge.DischargeSignalData;
import vistacore.order.discharge.DischargeSignalType;
import vistacore.order.discharge.DischargeUpdateSignalData;
import vistacore.order.discharge.DischargeVprData;
import vistacore.order.discharge.Followup;
import vistacore.order.discharge.Health;
import vistacore.order.discharge.Movement;
import vistacore.order.discharge.Stay;
import vistacore.order.discharge.util.StopCodeUtil;
import vistacore.order.kie.utils.WorkflowProcessInstanceUtil;

/**
 * Provides common utilities and script contents for the discharge activity
 *
 * @author madhavi.malipeddi
 */

public class DischargeHelperUtil {

    private static final Logger LOGGER = Logger.getLogger(DischargeHelperUtil.class);
    private static final String ROUTINE = "9";
    private static final String ACTIVE = "Active: Pending Follow-up";
    private static final String COMPLETED = "Completed: Successful";
    private static final String DISCONTINUED_UNABLE_TO_CONTACT = "Discontinued: Unable to Contact";

    private static final String FOLLOW_UP_ACTION_TEXT_SUCCESSFUL_CONTACT = "Successful Contact";
    private static final String FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT = "Unable to Contact";
    private static final String FOLLOW_UP_ACTION_TEXT_REASSIGN = "Reassign";

    private static final int FOLLOW_UP_ACTION_SUCCESSFUL_CONTACT = 1;
    private static final int FOLLOW_UP_ACTION_UNABLE_TO_CONTACT = 2;
    private static final int FOLLOW_UP_ACTION_FINAL_ATTEMPT = 3;
    private static final int FOLLOW_UP_ACTION_REASSIGN = 4;

    private static final String EHMP_STATE_ACTIVE = "active";

    private static final String ACTIVITY_TYPE = "Order";
    private static final String DESCRIPTION = "Discharge Follow-up is used to document the patient contact after discharge from the hospital.";
    private static final String FOLLOWUP_COMMENTS = "Use this form to record a follow-up contact.";
    private static final String ROUTINGCODE = "[TT:Primary Care(7)/TR:Registered Nurse(45)/PA:(1)],[TT:Primary Care(7)/TR:Advance Practice Nurse(75)/PA:(1)]";

    public static final String DISCHARGE_MOVEMENT = "DISCHARGE";
    public static final String MOVEMENT_SUBTYPE_REGULAR = "REGULAR";

    private static final String dischargeDateTimeFormat = "yyyyMMddHHmmss";

    private static final String DISCHARGE_DEFAULT_TIMEOUT = "30";
    protected static final String ACTIVITY_CONFIG = "dischargeconfig.properties";
    private static final String DISCHARGE_TIMEOUT_PROPERTY = "Discharge-Followup-Timeout";
    private static final String DISCHARGE_SYSTEM_EXECUTIONUSER = "ACTIVITY";
    private static final Integer IMPORTANCE_DEFAULT = 1;
    private static final Integer IMPORTANCE_UNHEALTHY = 5;
    private static final int DAYS_TO_DUEDATE = 2;

    private static final String PATIENT_CLASS_INPATIENT = "Inpatient";
    private static final String CATEGORY_ADMISSION = "Admission";
    private static final String ACTIVITY_STATE_DISCONTINUED_READMITTED = "Discontinued: Readmitted";
    private static final int DISCHARGE_ACTION_ID_READMISSION = 1;

    /**
     * Gets the Timeout from config.
     */
    protected static String getTimeout() {
        return DischargePropertiesLoaderInnerClass.getProperty(DISCHARGE_TIMEOUT_PROPERTY, DISCHARGE_DEFAULT_TIMEOUT);
    }


    /**
     * Creates the discharge clinical JSON object and saves it as a process variable to be used by the ClinicalObjectWriteHandler service
     * Called internally from multiple methods
     *
     * @param workflowProcessInstance the active workflowProcessInstance
     * @param dischargeClinicalObject dischargeClinicalObject that will be serialized to JSON
     */
    public static void prepareClinicalObject(WorkflowProcessInstance workflowProcessInstance, DischargeFollowupClinicalObject dischargeClinicalObject) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.prepareClinicalObject");
            Gson gson = new Gson();
            String dischargeClinicalObjectJSON = gson.toJson(dischargeClinicalObject);
            workflowProcessInstance.setVariable("dischargeClinicalObjectJSON", dischargeClinicalObjectJSON);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.prepareClinicalObject: An unexpected condition has happened: %s", e.getMessage()), e);
            throw e;
        }
    }

    /**
     * Sets the initial values of process variables
     * Called from: Instantiate Objects (script)
     *
     * @param: process        the current process instance
     */
    public static void instantiateObjects(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.instantiateObjects");
            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;

            DischargeFollowup dischargeFollowup = WorkflowProcessInstanceUtil.getRequiredDischargeFollowup(workflowProcessInstance, "dischargeFollowup");
            String pid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "pid");
            String icn = dischargeFollowup.getData().getIcn();
            if (KieFunctions.isEmpty(icn)) {
                throw new Exception("Required parameter ICN is missing in the discharge data");
            }
            workflowProcessInstance.setVariable("icn",  icn);

            if (!KieFunctions.isEmpty(pid) && pid.indexOf(';') > 0) {
                String siteCode = pid.substring(0, pid.indexOf(';'));
                workflowProcessInstance.setVariable("siteCode", siteCode);
            }


            String dischargeDate = dischargeFollowup.getData().getStay().getDischargeDateTime();

            String instanceName = "Inpatient Discharge - " + formatDateFromyyyyMMddHHmmssToMMddyyyy(dischargeDate);

            workflowProcessInstance.setVariable("initiator", dischargeFollowup.getAuthorUid());
            workflowProcessInstance.setVariable("domain", dischargeFollowup.getDomain());
            workflowProcessInstance.setVariable("subDomain", dischargeFollowup.getSubDomain());
            workflowProcessInstance.setVariable("type", ACTIVITY_TYPE);
            workflowProcessInstance.setVariable("instanceName", instanceName);
            workflowProcessInstance.setVariable("clinicalObjectUid", dischargeFollowup.getUid());
            workflowProcessInstance.setVariable("priority", ROUTINE);
            workflowProcessInstance.setVariable("urgency", ROUTINE);
            workflowProcessInstance.setVariable("referenceId", "");
            workflowProcessInstance.setVariable("description", DESCRIPTION);
            workflowProcessInstance.setVariable("facility", dischargeFollowup.getData().getFacilityCode());
            workflowProcessInstance.setVariable("state", ACTIVE);
            workflowProcessInstance.setVariable("groups", ROUTINGCODE);
            workflowProcessInstance.setVariable("assignedTo", ROUTINGCODE);

            workflowProcessInstance.setVariable("attempts", 0);
            int timeOutFromConfig = Integer.parseInt(getTimeout());
            workflowProcessInstance.setVariable("timeout", calculateTimeout(dischargeDate, timeOutFromConfig));
            workflowProcessInstance.setVariable("performanceIndicatorTimeout", calculateTimeout(dischargeDate, DAYS_TO_DUEDATE));


            DischargeData data = new DischargeData();

            //*********************
            //Setting Up Activity
            //*********************
            DischargeActivity activity = buildDischargeActivity(workflowProcessInstance, dischargeFollowup, instanceName);
            data.setActivity(activity);

            //*********************
            //Setting Up Discharge
            //*********************
            Discharge discharge = createDischargeFromVprData(dischargeFollowup.getData());
            data.setDischarge(discharge);

            //*********************
            //Setting Up Followup
            //*********************
            ArrayList<Followup> followupList = new ArrayList<Followup>();
            data.setFollowup(followupList);

            DischargeContact contact = new DischargeContact();

            DateTime dueDateTime = addDays(getDateFromString(dischargeDate, dischargeDateTimeFormat), DAYS_TO_DUEDATE);
            contact.setDueDateTime(convertDateTimeToString(dueDateTime, dischargeDateTimeFormat));
            contact.setAttempts("0");
            data.setContact(contact);

            //*********************
            //Setting Up ClinicalObject
            //*********************

            DischargeFollowupClinicalObject dischargeClinicalObject = new DischargeFollowupClinicalObject();
            dischargeClinicalObject.setDisplayName(instanceName);
            dischargeClinicalObject.setReferenceId("");
            dischargeClinicalObject.setDomain(dischargeFollowup.getDomain());
            dischargeClinicalObject.setSubDomain(dischargeFollowup.getSubDomain());
            dischargeClinicalObject.setEhmpState(EHMP_STATE_ACTIVE);
            dischargeClinicalObject.setData(data);
            dischargeClinicalObject.setPatientUid(dischargeFollowup.getPatientUid());
            dischargeClinicalObject.setUid(dischargeFollowup.getUid());
            dischargeClinicalObject.setAuthorUid(dischargeFollowup.getAuthorUid());
            dischargeClinicalObject.setVisit(dischargeFollowup.getVisit());
            dischargeClinicalObject.setCreatedDateTime(dischargeFollowup.getCreatedDateTime());

            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.instantiateObjects: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Called from: On Enter Action of followup manual task
     *
     * @param processInstance a reference to the running process instance
     */
    public static void onEnterFollowup(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.onEnterFollowup");
            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");

            workflowProcessInstance.setVariable("comments", FOLLOWUP_COMMENTS);

            DateTime dischargeDate = getDateFromString(dischargeClinicalObject.getData().getDischarge().getDateTime(), dischargeDateTimeFormat);
            DateTime latestDate = addDays(dischargeDate, DAYS_TO_DUEDATE);
            workflowProcessInstance.setVariable("earliestDate", dischargeDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

            workflowProcessInstance.setVariable("dueDate", latestDate.toString(ISODateTimeFormat.dateTimeNoMillis()));
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));

        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.onEnterFollowup: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Updates the clinicalObjectUid from the WIH serviceResponse
     * <p/>
     * Called from Store Clinical Object On Exit Action script
     *
     * @param processInstance a reference to the running process instance
     */
    public static void onExitSaveClinicalObject(ProcessInstance processInstance) throws Exception {
        try {
            JsonObject jsonObject = validateServiceResponse(processInstance, "ClinicalObjectWriteService");
            if (jsonObject == null) {
                throw new Exception("ClinicalObjectWriteService: validateServiceResponse returned a NULL JsonObject");
            }
            JsonElement dataElement = jsonObject.get("uid");
            if (dataElement == null) {
                throw new Exception("Invalid response received(uid is missing) from ClinicalObjectWriteService");
            }

            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            workflowProcessInstance.setVariable("clinicalObjectUid", dataElement.getAsString());

            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");

            dischargeClinicalObject.setUid(dataElement.getAsString());
            dischargeClinicalObject.getData().getActivity().setClinicalObjectUid(dataElement.getAsString());
            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));

            workflowProcessInstance.setVariable("dischargeClinicalObjectJSON", null);
        } catch (Exception e) {
            LOGGER.error("Discharge Follow-up Business Process: An unexpected condition has happened: " + e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Called from: after COMPLETE signal
     *
     * @param processInstance a reference to the running process instance
     */
    public static void processCompleteSignal(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.processCompleteSignal");

            String signalAction = DischargeSignalType.COMPLETE.getAction();
            String signalName = DischargeSignalType.COMPLETE.getName();
            String signalHistory = DischargeSignalType.COMPLETE.getHistory();
            String activityState = DischargeSignalType.COMPLETE.getState();

            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");
            DischargeSignal signal = WorkflowProcessInstanceUtil.getRequiredDischargeSignal(workflowProcessInstance, "signalData");

            signal.setExecutionDateTime(getCurrentDateString());
            signal.setName(signalName);
            signal.setActionText(signalAction);
            signal.setHistory(signalHistory);

            dischargeClinicalObject.getData().getSignals().add(signal);

            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("state", activityState);
            dischargeClinicalObject.getData().getActivity().setState(activityState);
            workflowProcessInstance.setVariable("signalName", signalName);
            workflowProcessInstance.setVariable("signalOwner", signal.getExecutionUserId());
            workflowProcessInstance.setVariable("signalAction", signalAction);
            workflowProcessInstance.setVariable("signalHistory", signalHistory);

            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));
            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.processCompleteSignal: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Called from: after END signal
     *
     * @param processInstance a reference to the running process instance
     */
    public static void processEndSignal(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.processEndSignal");

            String signalAction = DischargeSignalType.END.getAction();
            String signalName = DischargeSignalType.END.getName();
            String activityState = DischargeSignalType.END.getState();

            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");
            DischargeSignal signal = WorkflowProcessInstanceUtil.getRequiredDischargeSignal(workflowProcessInstance, "signalData");

            String actionText = getEndSignalActionTextFromId(signal.getActionId());
            activityState = activityState + ": " + (actionText.equals("Re-Admitted") ? "Readmitted" : actionText);
            String signalHistory = actionText + " : " + (signal.getData() != null ? signal.getData().getComment() : "");

            signal.setExecutionDateTime(getCurrentDateString());
            signal.setName(signalName);
            signal.setActionText(actionText);
            signal.setHistory(signalHistory);

            dischargeClinicalObject.getData().getSignals().add(signal);

            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("state", activityState);
            workflowProcessInstance.setVariable("signalName", signalName);
            workflowProcessInstance.setVariable("signalOwner", signal.getExecutionUserId());
            workflowProcessInstance.setVariable("signalAction", signalAction);
            workflowProcessInstance.setVariable("signalHistory", signalHistory);

            dischargeClinicalObject.getData().getActivity().setState(activityState);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));
            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.processEndSignal: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Called from: On Exit Action of followup manual task
     *
     * @param processInstance a reference to the running process instance
     */
    public static void onExitFollowup(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.onExitFollowup");
            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");

            Followup followup = WorkflowProcessInstanceUtil.getRequiredFollowup(workflowProcessInstance, "followup");
            Integer attempt = WorkflowProcessInstanceUtil.getRequiredInteger(workflowProcessInstance, "attempts");

            DischargeContact contact = dischargeClinicalObject.getData().getContact();
            processFollowupAction(followup, attempt, contact, workflowProcessInstance, dischargeClinicalObject);
            followup.setExecutionDateTime(getCurrentDateString());

            dischargeClinicalObject.getData().setContact(contact);
            dischargeClinicalObject.getData().getFollowup().add(followup);
            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));
            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);

        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.onEnterFollowup: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Called from: On Process Time Out from Follow-up manual task
     *
     * @param processInstance a reference to the running process instance
     */
    public static void onTimeout(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.onTimeout");

            String signalAction = DischargeSignalType.TIMEOUT.getAction() + " - " + getTimeout() + (getTimeout().equals("1") ? " Day" : " Days");
            String signalName = DischargeSignalType.TIMEOUT.getName();
            String signalHistory = DischargeSignalType.TIMEOUT.getHistory();
            String state = DischargeSignalType.TIMEOUT.getState();

            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");
            DischargeSignal signal = new DischargeSignal();

            signal.setExecutionDateTime(getCurrentDateString());
            signal.setName(signalName);
            signal.setActionText(signalAction);
            signal.setHistory(signalHistory);
            signal.setExecutionUserId(DISCHARGE_SYSTEM_EXECUTIONUSER);
            signal.setExecutionUserName(DISCHARGE_SYSTEM_EXECUTIONUSER);

            dischargeClinicalObject.getData().getSignals().add(signal);

            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("state", state);
            workflowProcessInstance.setVariable("signalName", signalName);
            workflowProcessInstance.setVariable("signalOwner", DISCHARGE_SYSTEM_EXECUTIONUSER);
            workflowProcessInstance.setVariable("signalAction", signalAction);
            workflowProcessInstance.setVariable("signalHistory", signalHistory);

            dischargeClinicalObject.getData().getActivity().setState(state);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));
            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.onTimeout: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Processes ServiceResponse received from calling a service Called from
     * service On Exit Action script
     *
     * @param processInstance a reference to the running process instance
     * @param taskName        the service name being called
     */
    public static JsonObject validateServiceResponse(ProcessInstance processInstance, String taskName) throws Exception {
        WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
        try {
            String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance,
                    "serviceResponse");
            LOGGER.debug("serviceResponse: " + serviceResponse);
            JsonParser parser = new JsonParser();
            JsonObject jsonObject = parser.parse(serviceResponse).getAsJsonObject();
            JsonElement dataElement = jsonObject.get("status");
            if (dataElement == null) {
                throw new Exception("Invalid response received(status is missing) from Task " + taskName);
            }
            if (dataElement.getAsInt() != 200) {
                dataElement = jsonObject.get("error");
                if (dataElement != null && !dataElement.getAsString().isEmpty()) {
                    throw new Exception(dataElement.getAsString());
                } else {
                    throw new Exception("UNKNOWN ERROR");
                }
            }
            return jsonObject;
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Processes ServiceResponse received from calling a patientpcmmteaminfo service
     *
     * @param processInstance a reference to the running process instance
     */
    public static void processPatientPcmmTeamInfo(ProcessInstance processInstance) throws Exception {
        LOGGER.debug("Entering DischargeHelperUtil.processPatientPcmmTeamInfo");

        WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
        try {
            String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance,
                    "serviceResponse");

            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance,
                    "dischargeClinicalObject");

            JsonParser parser = new JsonParser();
            JsonObject serviceResponseObject = parser.parse(serviceResponse).getAsJsonObject();

            if (serviceResponseObject != null) {
                if(!serviceResponseObject.has("patientName")) {
                    throw new Exception("DischargeHelperUtil.processPatientPcmmTeamInfo: Received NULL patientName value from PatientPcmmTeamInfo Service");
                }

                String patientName = serviceResponseObject.has("patientName") ? serviceResponseObject.get("patientName").getAsString() : null;
                String teamName = serviceResponseObject.has("teamName") ? serviceResponseObject.get("teamName").getAsString() : null;
                String pcpName = serviceResponseObject.has("pcpName") ? serviceResponseObject.get("pcpName").getAsString() : null;

                dischargeClinicalObject.getData().getActivity().setPatientName(patientName);
                dischargeClinicalObject.getData().getDischarge().setPrimaryCarePhysicianNameAtDischarge(pcpName);
                dischargeClinicalObject.getData().getDischarge().setPrimaryCareTeamAtDischarge(teamName);

                workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);

                workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));
                prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);

            } else {
                throw new Exception("DischargeHelperUtil.processPatientPcmmTeamInfo: NULL response received from PatientPcmmTeamInfoService");
            }
        } catch (Exception e) {
            throw new Exception(String.format("DischargeHelperUtil.processPatientPcmmTeamInfo: An unexpected condition has happened: %s", e.getMessage()));
        }
    }

    /**
     * Called from: process PI script
     *
     * @param processInstance a reference to the running process instance
     */
    public static void processPerformanceIndicator(ProcessInstance processInstance) throws Exception {
        try {
            LOGGER.debug("Entering DischargeHelperUtil.processPerformanceIndicator");
            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");

            List<Health> currentHealthArray = dischargeClinicalObject.getData().getActivity().getHealth();
            Integer id = Integer.parseInt(currentHealthArray.get(currentHealthArray.size() - 1).getId());

            String activityHealthDescription = "Follow-up not completed within 2 weekdays";
            Boolean activityHealthy = false;

            Health health = new Health();
            health.setId(String.valueOf(id + 1));
            health.setIsHealthy(activityHealthy);
            health.setDescription(activityHealthDescription);
            health.setImportance(IMPORTANCE_UNHEALTHY);

            currentHealthArray.add(health);
            dischargeClinicalObject.getData().getActivity().setHealth(currentHealthArray);

            dischargeClinicalObject.getData().getActivity().setActivityHealthy(activityHealthy);
            dischargeClinicalObject.getData().getActivity().setActivityHealthDescription(activityHealthDescription);

            workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
            workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);
            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));

            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);
        } catch (Exception e) {
            LOGGER.error(String.format("DischargeHelperUtil.processPerformanceIndicator: An unexpected condition has happened: %s", e.getMessage()));
            throw e;
        }
    }

    /**
     * Checks if the SignalRegistrationService/UnregistrationService returns a valid status.
     *
     * Called from Register/Unregister for Signal On Exit Action script
     * @param processInstance a reference to the running process instance
     */
    public static void exitSignalRegistrationService(ProcessInstance processInstance) {
        try {
            WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;

            String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance,
                    "serviceResponse");
            LOGGER.info("serviceResponse: " + serviceResponse);

            JsonParser parser = new JsonParser();
            JsonObject jsonObject = parser.parse(serviceResponse).getAsJsonObject();
            JsonElement status = jsonObject.get("status");

            if(jsonObject == null) {
                throw new Exception("SignalRegistationService: validateServiceResponse returned a NULL JsonObject");
            } else if (status.getAsInt() != 200) {
                throw new Exception("SignalRegistationService: validateServiceResponse, error from SignalRegistrationService with code " + status.getAsInt());
            }
        }
        catch (Exception e) {
            LOGGER.error("Follow-up Business Process: An unexpected condition has happened: " + e.getMessage(), e);
        }
    }

    /**
     * Processes the received signal from DISCHARGE.UPDATED
     *
     * @param processInstance a reference to the running process instance
     */
    public static void processDischargeUpdated(ProcessInstance processInstance) {
        LOGGER.debug("Entering DischargeHelperUtil.processDischargeUpdated");
        WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
        boolean doCompleteActivity = false;
        boolean doEndActivity = false;
        try {
            DischargeUpdateSignalData dischargeUpdateSignalData = WorkflowProcessInstanceUtil.getRequiredDischargeUpdateSignalData(workflowProcessInstance, "dischargeUpdateSignalData");

            DischargeFollowupClinicalObject dischargeClinicalObject = WorkflowProcessInstanceUtil.getRequiredDischargeFollowupClinicalObject(workflowProcessInstance, "dischargeClinicalObject");

            //TODO need to add error handling for when these strings aren't available, are in wrong format, etc
            //If unable to parse or compare date, should we default to discarding the visit to avoid incorrectly completing the discharge activity?
            DateTime dischargeDate = getDateFromString(dischargeClinicalObject.getData().getDischarge().getDateTime(), dischargeDateTimeFormat);
            DateTime visitDate = getDateFromString(dischargeUpdateSignalData.getDateTime(), dischargeDateTimeFormat);

            LOGGER.info("DischargeHelperUtil.processDischargeUpdated - checking visit date of: "
                    + visitDate + " against discharge date: " + dischargeDate);

            if (visitDate.isBefore(dischargeDate)) {
                LOGGER.info("DischargeHelperUtil.processDischargeUpdated - Old visit event received by discharge - ignoring");
                doCompleteActivity = false;
            } else {
                LOGGER.info("DischargeHelperUtil.processDischargeUpdated - Newer visit event received by discharge - processing");
                if (dischargeUpdateSignalData != null && !dischargeUpdateSignalData.getPatientClassName().isEmpty()) {
                    //check if category is inpatient
                    if (dischargeUpdateSignalData.getPatientClassName().equalsIgnoreCase(PATIENT_CLASS_INPATIENT)) {
                        if (dischargeUpdateSignalData.getCategoryName().equalsIgnoreCase(CATEGORY_ADMISSION)) {
                            LOGGER.info("DischargeHelperUtil.processDischargeUpdated - Inpatient admission found, attempting to complete activity");
                            doEndActivity = true;
                        }
                    } else {
                        //is outpatient
                        LOGGER.debug("DischargeHelperUtil.processDischargeUpdated - calling StopCodeUtil.isStopCodeTerminal with primary stop code: "
                                + dischargeUpdateSignalData.getPrimaryStopCode() + " and secondary stop code: " + dischargeUpdateSignalData.getSecondaryStopCode());
                        doCompleteActivity = StopCodeUtil.isStopCodeTerminal(dischargeUpdateSignalData.getPrimaryStopCode(), dischargeUpdateSignalData.getSecondaryStopCode());
                        LOGGER.info("DischargeHelperUtil.processDischargeUpdated - response from StopCodeUtil.isStopCodeTerminal: " + doCompleteActivity);
                    }
                }
            }

            //setup data for complete/end signal if doCompleteActivity
            if(doCompleteActivity || doEndActivity) {
                DischargeSignal signal = new DischargeSignal();
                signal.setExecutionUserId(DISCHARGE_SYSTEM_EXECUTIONUSER);
                signal.setExecutionUserName(DISCHARGE_SYSTEM_EXECUTIONUSER);

                if(doEndActivity) {
                    signal.setActionId(DISCHARGE_ACTION_ID_READMISSION);
                }

                DischargeSignalData data = new DischargeSignalData();
                data.setComment("Completing/Ending the activity due to visit event");
                signal.setData(data);

                workflowProcessInstance.setVariable("signalData", signal);
            }

            workflowProcessInstance.setVariable("dischargeClinicalObject", dischargeClinicalObject);
            workflowProcessInstance.setVariable("activityJSON", getActivityJSON(dischargeClinicalObject));

            prepareClinicalObject(workflowProcessInstance, dischargeClinicalObject);
        }
        catch(Exception e) {
            LOGGER.error("Follow-up Business Process: An unexpected condition has happened: " + e.getMessage(), e);
        }
        finally {
            // Return doCompleteActivity and doEndActivity
            workflowProcessInstance.setVariable("doCompleteActivity", doCompleteActivity);
            workflowProcessInstance.setVariable("doEndActivity", doEndActivity);
        }
    }

    private static void processFollowupAction(Followup followup, Integer attempt, DischargeContact contact, WorkflowProcessInstance workflowProcessInstance,
                                              DischargeFollowupClinicalObject dischargeClinicalObject) throws Exception {
        int actionId = Integer.parseInt(followup.getActionId());
        String activityState = dischargeClinicalObject.getData().getActivity().getState();
        String actionText = null;
        String taskHistoryAction = null;
        if (actionId == FOLLOW_UP_ACTION_SUCCESSFUL_CONTACT) {
            activityState = COMPLETED;
            actionText = FOLLOW_UP_ACTION_TEXT_SUCCESSFUL_CONTACT;
            taskHistoryAction = FOLLOW_UP_ACTION_TEXT_SUCCESSFUL_CONTACT;
        } else if (actionId == FOLLOW_UP_ACTION_UNABLE_TO_CONTACT) {
            actionText = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT;
            //increment the attempt and set it to followup and contact
            attempt = attempt + 1;
            if (attempt == 1) {
                activityState = "Active: 1 Attempt";
                taskHistoryAction = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT + " - 1 Attempt";
            } else {
                activityState = "Active: " + attempt + " Attempts";
                taskHistoryAction = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT + " - " + attempt + " Attempts";
            }
        } else if (actionId == FOLLOW_UP_ACTION_FINAL_ATTEMPT) {
            actionText = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT + " - Final Attempt";
            //increment the attempt and set it to followup and contact
            attempt = attempt + 1;

            activityState = DISCONTINUED_UNABLE_TO_CONTACT;
            if (attempt == 1) {
                taskHistoryAction = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT + " - 1 Attempt - Final Attempt";
            } else {
                taskHistoryAction = FOLLOW_UP_ACTION_TEXT_UNABLE_TO_CONTACT + " - " + attempt + " Attempts - Final Attempt";
            }
        } else if (actionId == FOLLOW_UP_ACTION_REASSIGN) {
            actionText = FOLLOW_UP_ACTION_TEXT_REASSIGN;
            taskHistoryAction = FOLLOW_UP_ACTION_TEXT_REASSIGN;

            String routingCode = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "routingCode");
            String assignmentType = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "assignmentType");
            if (assignmentType.equalsIgnoreCase("me") || assignmentType.equalsIgnoreCase("person")) {
                workflowProcessInstance.setVariable("actor", routingCode);
                workflowProcessInstance.setVariable("groups", null);
            } else {
                workflowProcessInstance.setVariable("groups", routingCode);
                workflowProcessInstance.setVariable("actor", null);
            }
            dischargeClinicalObject.getData().getActivity().setAssignedTo(routingCode);
            workflowProcessInstance.setVariable("assignedTo", routingCode);
        }

        dischargeClinicalObject.getData().getActivity().setState(activityState);
        followup.setActionText(actionText);
        followup.setAttempt(Integer.toString(attempt));
        contact.setAttempts(Integer.toString(attempt));

        workflowProcessInstance.setVariable("state", activityState);
        workflowProcessInstance.setVariable("attempts", attempt);
        workflowProcessInstance.setVariable("taskHistoryAction", taskHistoryAction);
        workflowProcessInstance.setVariable("taskHistory", followup.getComment());
    }

    private static String getEndSignalActionTextFromId(Integer actionId) throws Exception {
        String actionText;
        if (actionId == 1) {
            actionText = "Re-Admitted";
        } else if (actionId == 2) {
            actionText = "Deceased";
        } else if (actionId == 3) {
            actionText = "Administrative";
        } else {
            throw new Exception("UNKNOWN END SIGNAL ACTIONID " + actionId);
        }
        return actionText;
    }

    private static String getActivityJSON(DischargeFollowupClinicalObject dischargeClinicalObject) {
        ActivityJSON activityJSON = new ActivityJSON();
        activityJSON.setActivity(dischargeClinicalObject.getData().getActivity());
        activityJSON.setDischarge(dischargeClinicalObject.getData().getDischarge());
        activityJSON.setContact(dischargeClinicalObject.getData().getContact());
        activityJSON.setFollowup(dischargeClinicalObject.getData().getFollowup());
        activityJSON.setSignals(dischargeClinicalObject.getData().getSignals());
        Gson gson = new Gson();
        return gson.toJson(activityJSON);
    }


    private static String calculateTimeout(String date, int timeout) {
        DateTime currentDate = new DateTime(DateTimeZone.UTC);
        DateTimeFormatter formatter = DateTimeFormat.forPattern(dischargeDateTimeFormat).withZone(DateTimeZone.UTC);
        DateTime dischargeDate = formatter.parseDateTime(date);

        String timeoutInDays = "0";
        //adding 1 to the timeout here, since performance indicator/timeout needs to happen one day after the timeout
        int secsDiff = Seconds.secondsBetween(currentDate, addDays(dischargeDate, timeout + 1)).getSeconds();
        if (secsDiff > 0) {
            int days = secsDiff / (3600 * 24);
            int remSeconds = secsDiff - days * 3600 * 24;
            int hours = remSeconds / 3600;
            remSeconds = remSeconds - hours * 3600;
            int minutes = remSeconds / 60;
            remSeconds = remSeconds - minutes * 60;
            timeoutInDays = days + "d" + hours + "h" + minutes + "m" + remSeconds + "s";
        }
        return timeoutInDays;
    }

    private static DateTime addDays(DateTime dateTime, int days) {
        for (int i = 0; i < days; i++) {
            dateTime = dateTime.plusDays(1);
            if (dateTime.getDayOfWeek() == DateTimeConstants.SATURDAY) {
                dateTime = dateTime.plusDays(2);
            } else if (dateTime.getDayOfWeek() == DateTimeConstants.SUNDAY) {
                dateTime = dateTime.plusDays(1);
            }
        }
        return dateTime;
    }

    private static String getCurrentDateString() {
        return getCurrentDateString("YYYYMMddHHmmssZ");
    }

    private static String getCurrentDateString(String pattern) {
        DateTime currentDate = new DateTime(DateTimeZone.UTC);
        DateTimeFormatter dtformatter = DateTimeFormat.forPattern(pattern);

        String currentDateString = currentDate.toString(dtformatter);
        return currentDateString;
    }

    private static String formatDateFromyyyyMMddHHmmssToMMddyyyy(String date) throws Exception {
        DateFormat formatter = new SimpleDateFormat(dischargeDateTimeFormat);
        Date formattedDate = (Date) formatter.parse(date);
        SimpleDateFormat newFormat = new SimpleDateFormat("MM/dd/yyyy");
        return newFormat.format(formattedDate);
    }

    private static DateTime getDateFromString(String date, String pattern) {
        DateTimeFormatter formatter = DateTimeFormat.forPattern(pattern);
        DateTime dt = formatter.parseDateTime(date);
        return dt;
    }

    private static String convertDateTimeToString(DateTime date, String stringFormat) {
        DateTimeFormatter fmt = DateTimeFormat.forPattern(stringFormat);
        return fmt.print(date);
    }

    /**
     * @param data input DischargeVprData serialized from discharge job
     * @return Discharge object to be used for a clinical object
     */
    public static Discharge createDischargeFromVprData(DischargeVprData data) {
        Discharge discharge = new Discharge();

        Stay stay = data.getStay();
        if (stay != null) {
            discharge.setDateTime(stay.getDischargeDateTime());
            discharge.setAdmitDateTime(stay.getArrivalDateTime());
        }

        discharge.setFromFacilityId(data.getFacilityCode());
        discharge.setFromFacilityDescription(data.getFacilityName());
        discharge.setTimeout(getTimeout());

        //use the value of the latest (largest value for dateTime) movement object where movementType=DISCHARGE, and grab the movementSubType
        //discharge.disposition will be set to this value unless movementSubType=REGULAR, in which it should be set to empty
        ArrayList<Movement> movements = (ArrayList<Movement>) data.getMovements();
        if (movements != null && !movements.isEmpty()) {
            Movement mostRecentDischargeMovement = new Movement();

            //start at end, as we expect in most cases the most recent movement to be at the end of the array
            for (int i = movements.size() - 1; i >= 0; i--) {
                Movement movement = movements.get(i);
                if (movement != null && movement.getMovementType().equalsIgnoreCase(DISCHARGE_MOVEMENT)) {
                    String mostRecentDateTime = mostRecentDischargeMovement.getDateTime();

                    if (mostRecentDateTime != null && !mostRecentDateTime.isEmpty()) {
                        DateTime movementDateTime = getDateFromString(movement.getDateTime(), dischargeDateTimeFormat);
                        if (movementDateTime.isAfter(getDateFromString(mostRecentDateTime, dischargeDateTimeFormat))) {
                            //currently parsed dateTime is more recent, set it as the newest
                            mostRecentDischargeMovement = movement;
                        }
                    } else {
                        //no dateTime on existing most recent discharge, replace with current movement contents
                        mostRecentDischargeMovement = movement;
                    }
                }
            }

            String mostRecentSubtype = mostRecentDischargeMovement.getMovementSubType();
            if (mostRecentSubtype != null && !mostRecentSubtype.isEmpty()) {
                if (mostRecentSubtype.equalsIgnoreCase(MOVEMENT_SUBTYPE_REGULAR)) {
                    mostRecentSubtype = "";
                }

                discharge.setDisposition(mostRecentSubtype);
            }
        }

        //we need to get record.primaryDiagnosis and record.primaryDiagnosisCode and parse these into a {code:'', description:''} diagnosis object
        //Then, we should get the record.secondaryDiagnoses array and also add those objects to discharge.diagnosis[]
        ArrayList<Diagnosis> diagnosisList = new ArrayList<Diagnosis>();

        Diagnosis primaryDiagnosis = new Diagnosis();
        primaryDiagnosis.setCode(data.getPrimaryDiagnosisCode());
        primaryDiagnosis.setDescription(data.getPrimaryDiagnosis());

        if (primaryDiagnosis.getDescription() != null || primaryDiagnosis.getCode() != null) {
            diagnosisList.add(primaryDiagnosis);
        }

        List<Diagnosis> secondaryList = data.getSecondaryDiagnoses();
        if (secondaryList != null && !secondaryList.isEmpty()) {
            diagnosisList.addAll(secondaryList);
        }

        discharge.setDiagnosis(diagnosisList);

        return discharge;
    }

    private static DischargeActivity buildDischargeActivity (WorkflowProcessInstance workflowProcessInstance, DischargeFollowup dischargeFollowup,
                                                             String instanceName) throws Exception {

        String processInstanceId = Long.toString(workflowProcessInstance.getId());
        String processDefId = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "processDefId");
        String deploymentId = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "deploymentId");

        DischargeActivity activity = new DischargeActivity();
        activity.setDeploymentId(deploymentId);
        activity.setProcessDefinitionId(processDefId);
        activity.setType(ACTIVITY_TYPE);
        activity.setDomain(dischargeFollowup.getDomain());
        activity.setProcessInstanceId(processInstanceId);
        activity.setInstanceName(instanceName);
        activity.setPatientUid(dischargeFollowup.getPatientUid());
        activity.setSourceFacilityId(dischargeFollowup.getData().getFacilityCode());
        activity.setDestinationFacilityId("");
        activity.setInitiator(dischargeFollowup.getAuthorUid());
        activity.setTimeStamp(getCurrentDateString());
        activity.setAssignedTo(ROUTINGCODE);
        activity.setActivityHealthy(true);
        activity.setActivityHealthDescription("");
        activity.setUrgency(Integer.parseInt(ROUTINE));
        activity.setState(ACTIVE);

        Health health = new Health();
        health.setId("1");
        health.setIsHealthy(true);
        health.setDescription("");
        health.setImportance(IMPORTANCE_DEFAULT);

        List<Health> healthList = new ArrayList<Health>();
        healthList.add(health);
        activity.setHealth(healthList);

        workflowProcessInstance.setVariable("activityHealthy", true);
        workflowProcessInstance.setVariable("activityHealthDescription","");

        return activity;

    }

    /**
     * Inner class to remain static for dealing with the properties
     */
    private static final class DischargePropertiesLoaderInnerClass {
        private static final Properties activityProperties = new Properties();
        private static final Logger LOGGER = Logger.getLogger(DischargePropertiesLoaderInnerClass.class);
        static {
            try(InputStream in = DischargePropertiesLoaderInnerClass.class.getClassLoader().getResourceAsStream(ACTIVITY_CONFIG);) {
                if (in == null) {
                    LOGGER.debug(String.format("Property file not found; %s ", ACTIVITY_CONFIG));
                } else {
                    LOGGER.debug(String.format("Loading Properties files; %s ", ACTIVITY_CONFIG));
                    activityProperties.load(in);
                }
            } catch (IOException e) {
                LOGGER.error(String.format("Exception when Loading %s Properties files; %s ", ACTIVITY_CONFIG, e.getMessage()), e);
            }
        }

        /**
         * Pulls a property from the properties or returns the default value
         *
         * @return String
         */
        public static final String getProperty(String prop, String defaultValue) {
            return activityProperties.getProperty(prop, defaultValue);
        }
    }

}