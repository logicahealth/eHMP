package vistacore.order.consult;

import vistacore.order.consult.ConsultOrderData;
import vistacore.order.exception.OrderException;
import vistacore.order.kie.utils.WorkflowProcessInstanceUtil;
import vistacore.order.Facility;
import vistacore.order.utils.GenericUtils;
import vistacore.order.utils.Logging;
import vistacore.order.Provider;
import vistacore.order.consult.ConsultOrder;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.joda.time.Days;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.google.gson.JsonElement;
import java.util.List;
import java.util.ArrayList;
import com.google.gson.Gson;
import org.kie.api.runtime.process.ProcessInstance; 
import org.kie.api.runtime.process.WorkflowProcessInstance;

/**
 * Provides common utilities and script contents for the consult activity
 * @author sam.amer
 */

public class ConsultHelperUtil implements java.io.Serializable {
	private static final long serialVersionUID = -9042492411972383382L;
	private static final String noTaskHistoryText = " "; //for tasks without a history, use a space instead of null
	private static final String noTaskHistoryActionText = " "; //for tasks without a history action, use a space instead of null
	
	public ConsultHelperUtil() {
	}

	protected static String getCurrentDateString() {
		String currentDateString = getCurrentDateString("YYYYMMddHHmmssZ");
		return currentDateString;
	}
	protected static String getCurrentDateString(String pattern) {
		DateTime currentDate = new DateTime(DateTimeZone.UTC);
		DateTimeFormatter dtformatter = DateTimeFormat.forPattern(pattern);
		
		String currentDateString = currentDate.toString(dtformatter);
		return currentDateString;
	}

	/**
	 * Creates the ConsultOrderData object used as part of the consult ClinicalObject to meet the technical specification
	 * Called from: Internal functions whenever the consultOrder changes are received from the UI - i.e. until the order is Accepted
	 * @param	consultOrder			the consult order object as received from the UI
	 * @param	orderableString			the orderable JSON object as received from the UI in a string format
	 * @param	cdsIntentResultString	the cdsIntentResult JSON object as received from the UI in a string format
	 * @param	userId					the consult order ExecutionUserId as received from the UI
	 * @param	userName				the consult order ExecutionUserName as received from the UI
	 * @return 	the consultOrderData object
	 */
	public static ConsultOrderData buildConsultOrder(ConsultClinicalObject consultClinicalObject, ConsultOrder consultOrder, String orderableString, String cdsIntentResultString, String userId, String userName) {
		ConsultOrderData consultOrderData = new ConsultOrderData();
		try {
			Logging.debug("Entering ConsultHelperUtil.buildConsultOrder");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
	
			if (orderableString != null && !orderableString.isEmpty()) {
				consultOrderData.setOrderable(orderableString);
			} else {
				Gson gson = new Gson();
				String consultClinicalObjectJSON = gson.toJson(consultClinicalObject);
				JSONObject clinicalObjectJson = null;
				try {
					clinicalObjectJson = new JSONObject(consultClinicalObjectJSON);
					JSONObject dataElement = clinicalObjectJson.getJSONObject("data");
					JSONArray consultOrdersJson = dataElement.getJSONArray("consultOrders");
					int consultOrdersJsonSize = consultOrdersJson.length();
					if (consultOrdersJsonSize > 0) {
						JSONObject consultOrderObject = consultOrdersJson.getJSONObject(0);
						orderableString = consultOrderObject.getString("orderable");
						consultOrderData.setOrderable(orderableString);
					}
				} catch (JSONException e) {
					// ignore
				}
			}
			if (cdsIntentResultString != null && !cdsIntentResultString.isEmpty()) {
				consultOrderData.setCdsIntentResult(cdsIntentResultString);
			} else {
				Gson gson = new Gson();
				String consultClinicalObjectJSON = gson.toJson(consultClinicalObject);
				JSONObject clinicalObjectJson = null;
				try {
					clinicalObjectJson = new JSONObject(consultClinicalObjectJSON);
					JSONObject dataElement = clinicalObjectJson.getJSONObject("data");
					JSONArray consultOrdersJson = dataElement.getJSONArray("consultOrders");
					int consultOrdersJsonSize = consultOrdersJson.length();
					if (consultOrdersJsonSize > 0) {
						JSONObject consultOrderObject = consultOrdersJson.getJSONObject(0);
						cdsIntentResultString = consultOrderObject.getString("cdsIntentResult");
						consultOrderData.setCdsIntentResult(cdsIntentResultString);
					}
				} catch (JSONException e) {
					// ignore
				}
			}
	
			if (consultOrder.getUrgency() != null && !consultOrder.getUrgency().isEmpty()) {
				try {
					//try to set Urgency
					consultOrderData.setUrgency(Integer.parseInt(consultOrder.getUrgency()));
				}
				catch(NumberFormatException ex) {
					// ignore
				}
			}
			consultOrderData.setAcceptingProvider(consultOrder.getAcceptingProvider());
			consultOrderData.setEarliestDate(consultOrder.getEarliestDate());
			consultOrderData.setLatestDate(consultOrder.getLatestDate());
			consultOrderData.setFacility(consultOrder.getDestinationFacility());
			consultOrderData.setConditions(consultOrder.getConditions());
			consultOrderData.setRequest(consultOrder.getRequestReason());
			if (consultOrder.getFormComment() != null && !consultOrder.getFormComment().isEmpty()) {
				consultOrderData.setComment(consultOrder.getFormComment());
			} else if (consultOrder.getRequestComment() != null && !consultOrder.getRequestComment().isEmpty()) {
				consultOrderData.setComment(consultOrder.getRequestComment());
			}
			consultOrderData.setExecutionUserId(userId);
			consultOrderData.setExecutionUserName(userName);
			consultOrderData.setExecutionDateTime(currentDateString);
			consultOrderData.setOverrideReason(consultOrder.getOverrideReason());
	
			consultOrderData.setQuestions(consultOrder.getPreReqQuestions());
			consultOrderData.setOrderResults(consultOrder.getPreReqOrders());
			consultOrderData.setAction(consultOrder.getFormAction());
			consultOrderData.setVisit(consultOrder.getVisit());
			consultOrderData.setOrderResultComment(consultOrder.getOrderResultComment());
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.buildConsultOrder: An unexpected condition has happened: " + e.getMessage());
		}
		
		return consultOrderData;
	}

	/**
	 * Creates the consult clinical JSON object and saves it as a process variable to be used by the ClinicalObjectWriteHandler service
	 * Called internally from multiple methods
	 * @param workflowProcessInstance	the active workflowProcessInstance 
	 * @param consultClinicalObject	 	consultClinicalObject that will be serialized to JSON
	 */
	public static void saveClinicalObject(WorkflowProcessInstance workflowProcessInstance, ConsultClinicalObject consultClinicalObject) {
		try {
			Logging.debug("Entering ConsultHelperUtil.saveClinicalObject");
			workflowProcessInstance.setVariable("consultClinicalObject",consultClinicalObject);
			Gson gson = new Gson();
			String consultClinicalObjectJSON = gson.toJson(consultClinicalObject);
			JSONObject clinicalObjectJson = null;
			
			try {
				clinicalObjectJson = new JSONObject(consultClinicalObjectJSON);
				//Convert cdsResultInent and orderable strings into the json objects and add replace their entries in each consultOrderObject object entry
				JSONObject dataElement = clinicalObjectJson.getJSONObject("data");
				JSONArray consultOrdersJson = dataElement.getJSONArray("consultOrders");
				int consultOrdersJsonSize = consultOrdersJson.length();
				for (int i=0; i<consultOrdersJsonSize; i++) {
					JSONObject consultOrderObject = consultOrdersJson.getJSONObject(i);
					try {
						String cdsIntentResultString = consultOrderObject.getString("cdsIntentResult");
						JSONObject cdsIntentResult = new JSONObject(cdsIntentResultString);
						consultOrderObject.put("cdsIntentResult", cdsIntentResult);
					} catch (JSONException e) {
						// ignore, cdsIntentResult may not exists
					}
					try {
						String orderableString = consultOrderObject.getString("orderable");
						Logging.debug("ConsultHelperUtil.saveClinicalObject: orderableString: " + orderableString);
						JSONObject orderable = new JSONObject(orderableString);
						consultOrderObject.put("orderable", orderable);
					} catch (JSONException e) {
						// ignore, orderable may not exists
					}
				}
			}
			catch (JSONException e) {
				// ignore
			}
				 
			if (clinicalObjectJson != null) {
				workflowProcessInstance.setVariable("consultClinicalObjectJSON", clinicalObjectJson.toString());
			} else {
				workflowProcessInstance.setVariable("consultClinicalObjectJSON", consultClinicalObjectJSON);
			}
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.saveClinicalObject: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets triage and scheduling task routes
	 * @param:	process		the current process instance
	 *
	 */
	public static void setTriageAndSchedulingTaskRoutes(ProcessInstance processInstance) {
		try {
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			
			String assignedTo = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "assignedTo");
			TeamFocus teamFocus = WorkflowProcessInstanceUtil.getRequiredTeamFocus(workflowProcessInstance, "tmp_teamFocus");
			String TFcode = "";
			String TFname = "";
			if (teamFocus != null) {
				TFcode = teamFocus.getCode();
				TFname = teamFocus.getName();
			} else {
				Logging.error("TeamFocus was not found. Triage & Scheduling tasks will not be assigned");
			}
	
			String facilityRoute = null;
			String facilityCode = null;
			String assignmentContent = "";
			Facility facility = consultOrder.getDestinationFacility();
			if (facility != null) {
				facilityCode = facility.getCode();
				if (facilityCode != null && !facilityCode.isEmpty()) {
					facilityRoute = facility.getName() + "("+ facilityCode + ")";
					assignedTo = "[FC:" + facilityRoute + assignedTo.substring(assignedTo.indexOf("/"));
					workflowProcessInstance.setVariable("destinationFacility", facilityCode);
					workflowProcessInstance.setVariable("assignedTo", assignedTo);
				}
			}
			else {
				facilityRoute = getFacilityRoute(assignedTo);
				facilityCode = getFacilityCode(facilityRoute);
			}
			
			if (facilityCode != null && !facilityCode.isEmpty()) {
				assignmentContent = "FC:" + facilityRoute + "/";
			}
			if (TFcode != null && !TFcode.isEmpty()) {
				assignmentContent += "TF:" + TFname + "(" + TFcode + ")/";
			}
			String triageAssignment = "[" + assignmentContent + "TR:Triage Specialist(100)]";
			String schedulingAssignment = "[" + assignmentContent + "TR:Scheduler(101)]";
			workflowProcessInstance.setVariable("triageAssignment", triageAssignment);
			workflowProcessInstance.setVariable("tmp_triageGroups", triageAssignment);
			workflowProcessInstance.setVariable("tmp_triageAssignee", "");		
			workflowProcessInstance.setVariable("schedulingAssignment", schedulingAssignment);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.setTriageAndSchedulingTaskRoutes: An unexpected condition has happened: " + e.getMessage());
		}
	}

	private static String getFacilityCode(String facilityRoute) throws OrderException {
		int indexOfLeftParen = facilityRoute.indexOf("(");
		if (indexOfLeftParen == -1)
			throw new OrderException("\"(\" was not found in the String: " + facilityRoute);
		
		int indexOfRightParen = facilityRoute.indexOf(")");
		if (indexOfRightParen == -1)
			throw new OrderException("\")\" was not found in the String: " + facilityRoute);
		
		if (indexOfRightParen < indexOfLeftParen)
			throw new OrderException("\")\" was found in the String before \"(\": " + facilityRoute);
		
		String facilityCode = facilityRoute.substring(indexOfLeftParen+1, indexOfRightParen);
		return facilityCode;
	}

	private static String getFacilityRoute(String assignedTo) throws OrderException {
		int indexOfFC = assignedTo.indexOf("FC:");
		if (indexOfFC == -1)
			throw new OrderException("\"FC:\" was not found in the String: " + assignedTo);
		
		int indexOfForwardSlash = assignedTo.indexOf("/");
		if (indexOfForwardSlash == -1)
			throw new OrderException("\"/\" was not found in the String: " + assignedTo);
		
		if (indexOfForwardSlash < indexOfFC)
			throw new OrderException("\"/\" was found in the String before \"FC:\": " + assignedTo);
		
		String facilityRoute = assignedTo.substring(indexOfFC+3, indexOfForwardSlash);
		return facilityRoute;
	}

	/**
	 * Sets the initial values of process variables
	 * Called from: Instantiate Objects (script)
	 * @param:	process		the current process instance
	 *
	 */
	public static void instantiateObjects(ProcessInstance processInstance) throws OrderException {
		Logging.debug("Entering ConsultHelperUtil.instantiateObjects");
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		String currentDateString = ConsultHelperUtil.getCurrentDateString();
		vistacore.order.Visit visit = new vistacore.order.Visit();
		ConsultOrder consultOrder;
			
		workflowProcessInstance.setVariable("uidSaved",false);
		consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");

		//**********************
		//Set Task Routes
		//**********************
		String assignedTo = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "assignedTo");
		TeamFocus teamFocus = consultOrder.getTeamFocus();
		if (teamFocus != null) {
			workflowProcessInstance.setVariable("tmp_teamFocus", teamFocus);
		} else {
			Logging.debug("ConsultHelperUtil.instantiateObjects: TeamFocus was not found. Triage & Scheduling tasks are not assigned");
		}
		setTriageAndSchedulingTaskRoutes(processInstance);
		workflowProcessInstance.setVariable("discontinuedBy", consultOrder.getOrderingProvider().getDisplayName());
		workflowProcessInstance.setVariable("discontinuedByInitiator", true);
		workflowProcessInstance.setVariable("acceptAssignment", workflowProcessInstance.getVariable("initiator"));
		workflowProcessInstance.setVariable("signAssignment", workflowProcessInstance.getVariable("initiator"));
		String reviewAssignment = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "initiator");
		workflowProcessInstance.setVariable("reviewAssignment", reviewAssignment);
		workflowProcessInstance.setVariable("tmp_reviewPermission","{ \"ehmp\": [\"review-result-consult-order\"],\"pcmm\": [],\"user\": [\""+ reviewAssignment  +"\"]}");
		workflowProcessInstance.setVariable("completeAssignment", WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "initiator"));
		
		ConsultClinicalObject consultClinicalObject = new ConsultClinicalObject();
		ConsultClinicalObjectData ccData = new ConsultClinicalObjectData();
		vistacore.order.Order order = new vistacore.order.Order();
		vistacore.order.Activity activity = new vistacore.order.Activity();


		setUrgency(workflowProcessInstance, consultOrder, null);

		String author = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator");
		String[] authorsplit = author.split(";");
		if (authorsplit.length < 2)
			throw new OrderException("author didn't contain a semi-colon: " + author);
		
		String initiatorUid = "urn:va:user:" + authorsplit[0] + ":" + authorsplit[1];
		String providerUid = consultOrder.getOrderingProvider().getUid();
		if (providerUid.indexOf("urn:va:user") == -1) {
			providerUid = initiatorUid;
		}
		String providerName = consultOrder.getOrderingProvider().getDisplayName();
		String processInstanceId = Long.toString(workflowProcessInstance.getId());
		String icn = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "icn");
		String site = icn.split(";")[0];
		String dfn = icn.split(";")[1];
		String patientUid = "urn:va:patient:" + site + ":" + dfn + ":" + dfn;
		workflowProcessInstance.setVariable("patientUid", patientUid);
		workflowProcessInstance.setVariable("providerUid",providerUid);
		workflowProcessInstance.setVariable("providerName",providerName);
		workflowProcessInstance.setVariable("processInstanceId", processInstanceId);
		workflowProcessInstance.setVariable("facility", consultOrder.getOrderingFacility().getCode());
		String domain = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "domain");
		String subDomain = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "subDomain");
		String type = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "type");
		String instanceName = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "instanceName");
		String deploymentId = consultOrder.getDeploymentId();
		String processDefId = consultOrder.getProcessDefId();
		workflowProcessInstance.setVariable("description","Allows authorized users to create, modify, save, sign, delete/discontinue, triage, schedule and complete outpatient Consult orders. Improve coordination between eHMP users throughout a Consult process.");
		workflowProcessInstance.setVariable("deploymentId", deploymentId);
		workflowProcessInstance.setVariable("processDefId",processDefId);
		workflowProcessInstance.setVariable("changedToEmergent",false);
		
		visit = consultOrder.getVisit();
		consultClinicalObject.setPatientUid(patientUid);
		consultClinicalObject.setAuthorUid(initiatorUid);
		consultClinicalObject.setDomain(domain);
		consultClinicalObject.setSubDomain(subDomain);
		consultClinicalObject.setVisit(visit);
		consultClinicalObject.setDisplayName(instanceName);
		consultClinicalObject.setReferenceId("");
		
		//*********************
		//Setting Up Activity
		//*********************
		activity.setDeploymentId(deploymentId);
		activity.setProcessDefinitionId(processDefId);
		activity.setType(type);
		activity.setDomain(domain);
		activity.setProcessInstanceId(processInstanceId);
		activity.setInstanceName(instanceName);
		activity.setPatientUid(patientUid);
		activity.setSourceFacilityId(consultOrder.getOrderingFacility().getCode());
		activity.setInitiator(initiatorUid);
		activity.setTimeStamp(currentDateString);
		activity.setAssignedTo(assignedTo);
		activity.setActivityHealthy(true);
		activity.setActivityHealthDescription("");
		ccData.setActivity(activity);

		//*******************
		// Setting Up order
		//*******************
		order.setOrderName(instanceName);
		order.setFlag(false);
		order.setProvider(consultOrder.getOrderingProvider());
		order.setType("Consult-eHMP");
		order.setStartDate(currentDateString);
		order.setFacility(consultOrder.getDestinationFacility());
		ccData.setOrder(order);

		consultClinicalObject.setData(ccData);
		workflowProcessInstance.setVariable("consultClinicalObject", consultClinicalObject);
		workflowProcessInstance.setVariable("tmp_triageStarted", false);
	}

	/**
	 * Sets the consult Clinical Object and process the received formAcrion
	 * Called from: Prepare ClinicalObject (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void prepareClinicalObject(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.prepareClinicalObject");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			
			//instantiate process objects
			ConsultOrderData consultOrderData;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			String ehmpState = "draft";
			String providerUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerUid");
			String providerName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerName");

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			vistacore.order.Order order = ccData.getOrder();
			if (order == null)
				throw new OrderException("order was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			
			List<ConsultOrderData> consultOrders;
			if (ccData.getConsultOrders() != null)
				consultOrders = ccData.getConsultOrders();
			else
				consultOrders = new ArrayList<ConsultOrderData>();

			setUrgency(workflowProcessInstance, consultOrder, activity);
			
			String formAction = consultOrder.getFormAction();
			String state = "";
			if (formAction == null || formAction.equalsIgnoreCase("saved")) {
				Logging.debug("ConsultHelperUtil.prepareClinicalObject: SAVED");
				formAction = "saved";
				state = StatesMap.getActivitystate().get("Draft");
				ehmpState = "draft";
			} else if (formAction.equalsIgnoreCase("accepted")) {
				Logging.debug("ConsultHelperUtil.prepareClinicalObject: ACCEPTED");
				ehmpState = "active";
				order.setOrderDate(currentDateString);
				state = "Unreleased:Pending Signature";
				//***************************
				// save Order Date Milestone
				//***************************
				Milestone milestone = new Milestone();
				List<Milestone> newMilestones = new ArrayList<Milestone>();
				milestone.setName("Order Date");
				milestone.setStartDateTime(currentDateString);
				newMilestones.add(milestone);
				ccData.setMilestones(newMilestones);
			} else if (formAction.equalsIgnoreCase("workup")) {
				Logging.debug("ConsultHelperUtil.prepareClinicalObject: BEGIN WORKUP");
				ehmpState = "active";
				state = "Unreleased:Pre-order Workup";
			} else if (formAction.equalsIgnoreCase("deleted") || formAction.equalsIgnoreCase("discontinued")) {
				Logging.debug("ConsultHelperUtil.prepareClinicalObject: DELETED");
				vistacore.order.Completion completion = new vistacore.order.Completion();
				ehmpState = "deleted";
				state = StatesMap.getActivitystate().get("Draft");
				order.setStopDate(currentDateString);
				completion.setActionText("Delete");
				completion.setComment(consultOrder.getFormComment());
				completion.setExecutionUserId(providerUid);
				completion.setExecutionUserName(providerName);
				completion.setExecutionDateTime(currentDateString);
				ccData.setCompletion(completion);
			}
			consultClinicalObject.setEhmpState(ehmpState);
			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("formAction",formAction);
			String clinicalObjectUid = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "clinicalObjectUid");
			if (clinicalObjectUid != null) {
				activity.setClinicalObjectUid(clinicalObjectUid);
				consultClinicalObject.setUid(clinicalObjectUid);
				workflowProcessInstance.setVariable("uidSaved",true);
			}
			activity.setDestinationFacilityId(consultOrder.getDestinationFacility().getCode());
			activity.setState(state);
			ccData.setActivity(activity);

			order.setStatus(getStatusFromState(state));
			order.setFacility(consultOrder.getDestinationFacility());
			ccData.setOrder(order);
			String orderable = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "orderable");
			String cdsIntentResult = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "cdsIntentResult");

			consultClinicalObject.setData(ccData);
			consultOrderData = ConsultHelperUtil.buildConsultOrder(consultClinicalObject, consultOrder, orderable, cdsIntentResult, providerUid, providerName);
			//The following 2 variables are only needed at the start of the activity and will be reset to blank after the first save.
			//JBPM truncates them to 255 characters before persisting them which causes the users to receive them back as malformatted JSON.
			//they will be restored from the first consultOrder saved in the consultOrders array in buildConsultOrder funtion.
			workflowProcessInstance.setVariable("orderable","");
			workflowProcessInstance.setVariable("cdsIntentResult","");

			if (formAction.equalsIgnoreCase("accepted") || formAction.equalsIgnoreCase("workup") || consultOrders.size() == 0) {
				consultOrders.add(consultOrderData);
			} else {
				consultOrders.set(0,consultOrderData);
			}
			ccData.setConsultOrders(consultOrders);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.prepareClinicalObject: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets the creationDateTime and clinicalObjectUid in the consultClinicalObject
	 * Called from: Update ClinicalObject (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void updateClinicalObject(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.updateClinicalObject");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "serviceResponse");
			String clinicalObjectUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "clinicalObjectUid");
			Logging.debug("******************************************");
			Logging.debug("clinicalObjectUid: " + clinicalObjectUid);
			Logging.debug("******************************************");
			JsonParser parser = new JsonParser();
			JsonObject serviceResponseObject = parser.parse(serviceResponse).getAsJsonObject();
			JsonElement dataElement = serviceResponseObject.get("data");
			if (dataElement != null) {
				if (!dataElement.isJsonObject())
					throw new OrderException("dataElement is not a JsonObject");
				JsonObject dataElementJsonObject = dataElement.getAsJsonObject();
				JsonElement creationDateTime = dataElementJsonObject.get("creationDateTime");
				if (creationDateTime == null)
					throw new OrderException("creationDateTime was null");
				String createDateTime = creationDateTime.getAsString();
				consultClinicalObject.setCreationDateTime(createDateTime);
			}

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			
			activity.setClinicalObjectUid(clinicalObjectUid);
			consultClinicalObject.setUid(clinicalObjectUid);
			workflowProcessInstance.setVariable("uidSaved",true);

			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (JsonSyntaxException e) {
			Logging.error("ConsultHelperUtil.updateClinicalObject: An unexpected condition has happened with json: " + e.getMessage());
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.updateClinicalObject: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Checks if there are Lab orders placed and sets the state:substate accordingly
	 * Called from: Check Prerequisites (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void checkPrerequisites(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.checkPrerequisites");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");

			String formAction = consultOrder.getFormAction();
			workflowProcessInstance.setVariable("formAction",formAction);
			List<ConsultPreReqOrder> preReqOrders = consultOrder.getPreReqOrders();
			boolean completed = true;
			if (preReqOrders !=null && preReqOrders.size() > 0) {
				for (ConsultPreReqOrder t_order : preReqOrders) {
					if (OrderStatus.ORDER_STATUS_ORDER.equalsIgnoreCase(t_order.getStatus())) {
						completed = false;
					}
				}
			}
			workflowProcessInstance.setVariable("preRequisitesComplete", completed);
			workflowProcessInstance.setVariable("waitOnLabs", !completed);
			if (formAction != null && formAction.equals("workup") ) {
				if (completed) {
					workflowProcessInstance.setVariable("state",StatesMap.getActivitystate().get("WorkupComplete"));
				} else {
					workflowProcessInstance.setVariable("state",StatesMap.getActivitystate().get("Workup"));
				}
			}
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.checkPrerequisites: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets listeners for Lab result signals
	 * Called from: Prepare Lab Result Listeners (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void prepareLabResultListeners(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.prepareLabResultListeners");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");

			List<ConsultPreReqOrder> preReqOrders = consultOrder.getPreReqOrders();
			boolean completed = true;
			if (preReqOrders !=null && preReqOrders.size() > 0) {
			  for (ConsultPreReqOrder t_order : preReqOrders) {
			   	if (((t_order.getSignalRegistered() != null && !t_order.getSignalRegistered()) || t_order.getSignalRegistered() == null) && OrderStatus.ORDER_STATUS_ORDER.equalsIgnoreCase(t_order.getStatus()) && !isEmptyString(t_order.getUid())) {
			      Logging.debug("ConsultHelperUtil.prepareLabResultListeners: Registering Lab Results Signal for: " + t_order.getOrderName());
			      t_order.setSignalRegistered(true);
			      completed = false;
			      String content = "{\"s_preReqOrders\":{\"objectType\":\"consultPreReqOrder\", \"uid\":\"{{uid}}\", \"status\":\"{{data.statusCode}}\"}}";
			      String match = "{\"uid\": \"" +t_order.getUid()+ "\"}";
			      workflowProcessInstance.setVariable("eventName","ConsultLabResultSignal");
			      workflowProcessInstance.setVariable("eventDescription","Signal the Consult activity instance when lab results are received");
			      workflowProcessInstance.setVariable("signalName","PREREQ.ORDER.UPDATE");
			      workflowProcessInstance.setVariable("signalContent",content);
			      workflowProcessInstance.setVariable("matchObject",match);
			      break;
			    }
			  }
			}
			workflowProcessInstance.setVariable("signalsRegistered", completed);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.prepareLabResultListeners: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Saves Pending Milestone
	 * Called from: Save pendingMilestone (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void savePendingMilestone(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.savePendingMilestone");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			
			List<Sign> newSigns;
			Sign sign = new Sign();
			vistacore.order.Visit visit = new vistacore.order.Visit();
			Milestone milestone = new Milestone();
			List<Milestone> newMilestones = new ArrayList<Milestone>();

			Long taskId = WorkflowProcessInstanceUtil.getRequiredLong(workflowProcessInstance, "currentTaskInstanceId");
			String notificationTaskId = Long.toString(taskId);
			workflowProcessInstance.setVariable("notificationTaskId",notificationTaskId);
			workflowProcessInstance.setVariable("pendingMilestone", currentDateString);
			
			//Set the performance indicator timers.
			String tmp_lateCompletionActivityHealthTimer = PropertiesLoader.getConsultTimersProperty("tmp_lateCompletionActivityHealthTimer", "90d");
			String tmp_lateSchedulingActivityHealthTimer = PropertiesLoader.getConsultTimersProperty("tmp_lateSchedulingActivityHealthTimer", "30d");
			String tmp_lateTriageActivityHealthTimer = PropertiesLoader.getConsultTimersProperty("tmp_lateTriageActivityHealthTimer", "7d");
			workflowProcessInstance.setVariable("tmp_lateCompletionActivityHealthTimer", tmp_lateCompletionActivityHealthTimer);
			workflowProcessInstance.setVariable("tmp_lateSchedulingActivityHealthTimer", tmp_lateSchedulingActivityHealthTimer);
			workflowProcessInstance.setVariable("tmp_lateTriageActivityHealthTimer", tmp_lateTriageActivityHealthTimer);

			if (ccData.getSigns() != null) {
				newSigns = ccData.getSigns();
			} else {
				newSigns = new ArrayList<Sign>();
			}

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			order.setStatus(getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getMilestones() != null) {
				newMilestones = ccData.getMilestones();
			}

			milestone.setName("Pending State");
			milestone.setStartDateTime(currentDateString);
			newMilestones.add(milestone);
			ccData.setMilestones(newMilestones);

			if (consultOrder != null) {
				visit = consultOrder.getVisit();
				sign.setVisit(visit);
				Provider orderingProvider = consultOrder.getOrderingProvider();
				if (orderingProvider == null)
					throw new OrderException("orderingProvider was null");
				sign.setExecutionUserId(orderingProvider.getUid());
				sign.setExecutionUserName(orderingProvider.getDisplayName());
			}

			sign.setExecutionDateTime(currentDateString);
			newSigns.add(sign);
			ccData.setSigns(newSigns);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.savePendingMilestone: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Processes formAction received from the Triage form
	 * Called from: Triage Completed (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void triageCompleted(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.triageCompleted");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			//set the triage object
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			List<Triage> newTriages = new ArrayList<Triage>();
			if (ccData.getTriages() != null) {
				newTriages = ccData.getTriages();
			}

			List<vistacore.order.Appointment> newAppointments = new ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
			}

			Triage triage = new Triage();
			vistacore.order.AppointmentType apptType = new vistacore.order.AppointmentType();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();
			String trgAction = "";
			String trgActionId = "";
			String commCareType = consultOrder.getCommunityCareType();
			String statusStr = "";
			String formAction = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "formAction");
			String state = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "state");
			workflowProcessInstance.setVariable("tmp_triageGroups", WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "triageAssignment"));
			workflowProcessInstance.setVariable("tmp_triageAssignee", "");		
			if (formAction.equalsIgnoreCase("assigned")) {
				trgAction = "Assign to Triage Member";
				trgActionId = "4";
				vistacore.order.Provider attentionProvider = consultOrder.getAcceptingProvider();
				triage.setAttentionProvider(attentionProvider);			
				state = StatesMap.getActivitystate().get("Assigned");
				String assigneeUid = attentionProvider.getUid();
				if (assigneeUid != null && !assigneeUid.trim().isEmpty()) {
					String [] uidParts = assigneeUid.trim().split(":");
					if (uidParts.length == 5) {
						workflowProcessInstance.setVariable("tmp_triageAssignee", uidParts[3] + ";" + uidParts[4]);					
						workflowProcessInstance.setVariable("tmp_triageGroups", "");
					}
				}
			} else if (formAction.equalsIgnoreCase("triaged")) {
				trgAction = "Send to Scheduling";
				trgActionId = "1";
				state = StatesMap.getActivitystate().get("Scheduling");
				apptType.setId("1");
				apptType.setName("VA");
				apptStatus.setId("1");
				apptStatus.setName("Pending");
			} else if (formAction.equalsIgnoreCase("clarification")) {
				trgAction = "Return for Clarification";
				trgActionId = "3";
				triage.setRequest(consultOrder.getFormComment());
			  	state = StatesMap.getActivitystate().get("Clarification");
			} else if (formAction.equalsIgnoreCase("eConsult")) {
				apptType.setId("7");
				apptType.setName("eConsult");
				apptStatus.setId("1");
				apptStatus.setName("Pending");
				trgAction = "eConsult";
				trgActionId = "5";
				appointment.setDate(currentDateString);
				state = StatesMap.getActivitystate().get("eConsult");
				String lateCompleteTimer = PropertiesLoader.getConsultTimersProperty("lateCompleteTimer", "90d");
				String tmp_apptInPastTimer = PropertiesLoader.getConsultTimersProperty("tmp_apptInPastTimer", "1d");
				workflowProcessInstance.setVariable("lateCompleteTimer", lateCompleteTimer);
				workflowProcessInstance.setVariable("tmp_apptInPastTimer", tmp_apptInPastTimer);
			} else if (formAction.equalsIgnoreCase("communityCare")) {
				trgAction = "Referred to Community Care";
				trgActionId = "6";
				if (commCareType.equalsIgnoreCase("CHOICE")) {
					apptType.setId("2");
					apptType.setName("CHOICE");
				} else if (commCareType.equalsIgnoreCase("DoD")) {
					apptType.setId("3");
					apptType.setName("DoD");
				} else if (commCareType.equalsIgnoreCase("GEC")) {
					apptType.setId("4");
					apptType.setName("GEC");
				} else if (commCareType.equalsIgnoreCase("Non VA Care")) {
					apptType.setId("5");
					apptType.setName("Non-VA Care");
				} else if (commCareType.equalsIgnoreCase("Sharing Agreement")) {
					apptType.setId("6");
					apptType.setName("Sharing Agreement");
				}
				String communityCareStatus = consultOrder.getCommunityCareStatus();
				if (communityCareStatus == null)
					throw new OrderException("communityCareStatus was null");
				statusStr = communityCareStatus.toLowerCase();
				if (statusStr.equalsIgnoreCase("pending")) {
					apptStatus.setId("1");
					apptStatus.setName("Pending");
			  		state = StatesMap.getActivitystate().get("CommCarePending");
				} else if (statusStr.equalsIgnoreCase("scheduled")) {
					apptStatus.setId("2");
					apptStatus.setName("Scheduled");
			  		state = StatesMap.getActivitystate().get("CommCareScheduled");
				}
			}

			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("tmp_triageStarted", true);
			triage.setActionText(trgAction);
			triage.setActionId(trgActionId);
			triage.setComment(consultOrder.getFormComment());
			String executionUid=null;
			if (consultOrder.getExecutionUserId() != null) {
				executionUid = consultOrder.getExecutionUserId();
				triage.setExecutionUserId(executionUid);
			}
			if (consultOrder.getExecutionUserName() != null) {
				triage.setExecutionUserName(consultOrder.getExecutionUserName());
			}

			triage.setExecutionDateTime(currentDateString);

			if (apptType.getId() != null) {
				appointment.setType(apptType);
				appointment.setStatus(apptStatus);
				appointment.setEwl(false);
				triage.setAppointment(appointment);
				newAppointments.add(appointment);
				ccData.setAppointments(newAppointments);
			}

			newTriages.add(triage);
			ccData.setTriages(newTriages);
			
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (executionUid != null) {
				if (executionUid.indexOf("urn:va") != -1) {
					int idx = executionUid.indexOf("user:");
					if (idx == -1)
						throw new OrderException("No \"user:\" was in executionUid: " + executionUid);
					workflowProcessInstance.setVariable("tmp_notificationJSON","{\"userId\": \"" + executionUid.substring(idx + 5).replace(":", ";") + "\"}");
				} else {
					workflowProcessInstance.setVariable("tmp_notificationJSON","{\"userId\": \"" + executionUid + "\"}");
				}
			} else {
				workflowProcessInstance.setVariable("tmp_notificationJSON","{}");
			}
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("triageStarted", null);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.triageCompleted: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Prepares No Response notification
	 * Called from: No Response Received (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void noResponseReceived(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.noResponseReceived");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			String state = StatesMap.getActivitystate().get("NoResponse");
			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("formAction", "triage");
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			
			vistacore.order.Order order = ccData.getOrder();
			if (order == null)
				throw new OrderException("order was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			order.setStatus(getStatusFromState(state));
			ccData.setOrder(order);

			activity.setState(state);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.noResponseReceived: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Prepares No Response notification
	 * Called from: No Response Received Notification (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void noResponseReceivedNotification(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.noResponseReceivedNotification");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			
			if (state.equals(StatesMap.getActivitystate().get("NoResponse"))) {
				String author = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator");
				String subject = "A patient did not respond to scheduling attempts for a consult";
				String message = "15 days passed since the 3rd attempt to contact the patient for " + WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "instanceName");
				String patientUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "patientUid");
				if (patientUid.length() < 5)
					throw new OrderException("patientUid was not in the correct format: length is less than 5: " + patientUid);
				String patientId = patientUid.split(":")[3] + ";" + patientUid.split(":")[4]; 
				
				Long taskId = WorkflowProcessInstanceUtil.getRequiredLong(workflowProcessInstance, "currentTaskInstanceId");
				String notificationTaskId = Long.toString(taskId);
				String jsonString = buildNotificationJson(author, subject, message, patientId, notificationTaskId);
				workflowProcessInstance.setVariable("tmp_notificationJSON",jsonString);
			} else {
				workflowProcessInstance.setVariable("tmp_notificationJSON","");
			}
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.noResponseReceived: An unexpected condition has happened: " + e.getMessage());
		}	
			
	}
	
	public static String buildNotificationJson(String author, String subject, String message, String patientId,
			String notificationTaskId) {
		String jsonString = "{" + 
								"\"recipients\": [" + 
													"{"+ 
														"\"recipient\":{" 
																		+ "\"userId\": \"" + author + "\""
																	+ "}," + 
														"\"salience\":4" + 
													"}" + 
												"]," + 
								"\"producer\": {"
												+ "\"description\": \"workflow: Consults\""
											+ "},"
								+ "\"patientId\": \"" + patientId + "\","
								+ "\"message\": {"
												+ "\"subject\": \"" + subject + "\","
												+ "\"body\": \"" + message + "\""
											+ "},"
								+ "\"resolution\": \"producer\","
								+ "\"associatedItems\": ["
															+ "\"ehmp:task:" + notificationTaskId + "\""
													+ "] "
							+ "}";
		return jsonString;
	}

	/**
	 * Processes patient contact attempts
	 * Called from: Patient Contact Manager (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void patientContactManager(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.patientContactManager");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			List<Schedule> newSchedules = new ArrayList<Schedule>();
			Schedule schedule = new Schedule();

			String attempt = consultOrder.getContactAttempt();
			if (attempt == null)
				throw new OrderException("attempt was null");
			String state = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "state");
			if (attempt.equalsIgnoreCase("First Attempt")) {
				consultOrder.setContactAttempt("Second Attempt");
				state = StatesMap.getActivitystate().get("FirstAttempt");
			} else if (attempt.equalsIgnoreCase("Second Attempt")) {
				consultOrder.setContactAttempt("Third Attempt");
				state = StatesMap.getActivitystate().get("SecondAttempt");
			} else {
				String duration = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "thirdContactTimer");
				if (duration.equalsIgnoreCase("99d")) {
					String thirdContactTimer = PropertiesLoader.getConsultTimersProperty("thirdContactTimer", "1d");
					workflowProcessInstance.setVariable("thirdContactTimer", thirdContactTimer);
				}
				state = StatesMap.getActivitystate().get("ThirdAttempt");
			}
			workflowProcessInstance.setVariable("state",state);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
			  order = ccData.getOrder();
			} else {
			  order = new vistacore.order.Order();
			}
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
			  activity = ccData.getActivity();
			} else {
			  activity = new vistacore.order.Activity();
			}
			order.setStatus(getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getSchedules() != null) {
			  newSchedules = ccData.getSchedules();
			}
			schedule.setActionText( "Contact Patient");
			schedule.setActionId("2");
			schedule.setComment(consultOrder.getFormComment());
			schedule.setContactAttempt(attempt);
			
			if (consultOrder.getExecutionUserId() != null) {
				schedule.setExecutionUserId(consultOrder.getExecutionUserId());
			}
			if (consultOrder.getExecutionUserName() != null) {
				schedule.setExecutionUserName(consultOrder.getExecutionUserName());
			}

			schedule.setExecutionDateTime(currentDateString);
			newSchedules.add(schedule);
			ccData.setSchedules(newSchedules);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.patientContactManager: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Processes formAction received from Scheduling task form
	 * Called from: Scheduling Completed (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void schedulingCompleted(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.schedulingCompleted");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			List<Schedule> newSchedules = new ArrayList<Schedule>();
			List<vistacore.order.Appointment> newAppointments = new ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			Schedule schedule = new Schedule();

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSchedules() != null) {
			  newSchedules = ccData.getSchedules();
			}

			if (ccData.getAppointments() != null) {
			  newAppointments = ccData.getAppointments();
			}

			vistacore.order.AppointmentType apptType = new vistacore.order.AppointmentType();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();
			String schAction = "";
			String schActionId = "";
			String commCareType = consultOrder.getCommunityCareType();
			String statusStr = "";
			appointment.setEwl(false);

			String formAction = consultOrder.getFormAction();
			if (formAction == null)
				throw new OrderException("formAction was null");
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			workflowProcessInstance.setVariable("formAction",formAction);

			if (formAction.equalsIgnoreCase("scheduled")) {
				DateTime compareDate = new DateTime().withTime(0, 0, 0, 0);
				DateTimeFormatter formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
				String apptDateStr = consultOrder.getScheduledDate();
				if (apptDateStr == null)
					throw new OrderException("apptDateStr was null");
				DateTime apptDate;
				try {
					apptDate = formatter.parseDateTime(apptDateStr);
				} catch (Exception e) {
					throw new OrderException("apptDateStr was unable to be parsed: " + e.getMessage());
				}
				if (apptDate.isBefore(compareDate)) {
					state = StatesMap.getActivitystate().get("ApptInPast");
				} else {
					state = StatesMap.getActivitystate().get("ApptBooked");
				}
				schAction = "Scheduled";
				schActionId = "1";
				apptType.setId("1");
				apptType.setName("VA");
				apptStatus.setId("2");
				apptStatus.setName("Scheduled");
				appointment.setDate(consultOrder.getScheduledDate());
				appointment.setClinic(consultOrder.getAcceptingClinic());
				appointment.setProvider(consultOrder.getAcceptingProvider().getDisplayName());

				if (consultOrder.getAcceptingProvider() != null && consultOrder.getAcceptingProvider().getUid() != null ) {
					String acceptingProviderUid = consultOrder.getAcceptingProvider().getUid();
					String completeAssignment = "";
					if (acceptingProviderUid.indexOf("urn:va") != -1) {
						int idx = acceptingProviderUid.indexOf("user:");
						if (idx == -1)
							throw new OrderException("No \"user:\" was in acceptingProviderUid: " + acceptingProviderUid);
						completeAssignment = acceptingProviderUid.substring(idx + 5).replace(":", ";");
					} else {
						completeAssignment = acceptingProviderUid;
					}
					workflowProcessInstance.setVariable("completeAssignment", completeAssignment);
				}
				
				DateTime currentDate = new DateTime(DateTimeZone.UTC);
				int days = Days.daysBetween(currentDate.toLocalDate(), apptDate.toLocalDate()).getDays();
				int timerDays = days + 7;
				String tmp_pastScheduledDateTimerUnits = PropertiesLoader.getConsultTimersProperty("tmp_pastScheduledDateTimerUnits", "d");
				String tmp_apptInPastTimerUnits = PropertiesLoader.getConsultTimersProperty("tmp_apptInPastTimerUnits", "d");
				String tmp_pastScheduledDateTimer = "" + timerDays + tmp_pastScheduledDateTimerUnits;
				int apptInPastTimerDays = days + 1;
				String tmp_apptInPastTimer = "" + apptInPastTimerDays + tmp_apptInPastTimerUnits;
				
				workflowProcessInstance.setVariable("tmp_pastScheduledDateTimer",tmp_pastScheduledDateTimer);
				workflowProcessInstance.setVariable("tmp_apptInPastTimer", tmp_apptInPastTimer);

			} else if (formAction.equalsIgnoreCase("contacted")) {
				schActionId = "2";
				schAction = "Contact Patient";
			} else if (formAction.equalsIgnoreCase("triage")) {
				schAction = "Return to Triage";
				schActionId = "5";
			} else if (formAction.equalsIgnoreCase("EWL")) {
				apptType.setId("0");
				apptType.setName("ewl");
				appointment.setEwl(true);
				schAction = "Placed on Electronic Wait List";
				schActionId = "3";
				state = StatesMap.getActivitystate().get("EWL");
			} else if (formAction.equalsIgnoreCase("communityCare")) {
				schAction = "Referred to Community Care";
				schActionId = "4";
				if (commCareType == null)
					throw new OrderException("commCareType was null");
				
				String communityCareStatus = consultOrder.getCommunityCareStatus();
				if (communityCareStatus == null)
					throw new OrderException("communityCareStatus was null");
				statusStr = communityCareStatus.toLowerCase();
				
				if (commCareType.equalsIgnoreCase("CHOICE")) {
					apptType.setId("2");
					apptType.setName("CHOICE");
				} else if (commCareType.equalsIgnoreCase("DoD")) {
					apptType.setId("3");
					apptType.setName("DoD");
				} else if (commCareType.equalsIgnoreCase("GEC")) {
					apptType.setId("4");
					apptType.setName("GEC");
				} else if (commCareType.equalsIgnoreCase("Non VA Care")) {
					apptType.setId("5");
					apptType.setName("Non-VA Care");
				} else if (commCareType.equalsIgnoreCase("Sharing Agreement")) {
					apptType.setId("6");
					apptType.setName("Sharing Agreement");
				}
				
				if (statusStr.equalsIgnoreCase("pending")) {
					apptStatus.setId("1");
					apptStatus.setName("Pending");
					state = StatesMap.getActivitystate().get("CommCarePending");
				} else if (statusStr.equalsIgnoreCase("scheduled")) {
					apptStatus.setId("2");
					apptStatus.setName("Scheduled");
					state = StatesMap.getActivitystate().get("CommCareScheduled");
				}
			}
			
			workflowProcessInstance.setVariable("state",state);
			appointment.setType(apptType);
			appointment.setStatus(apptStatus);
			
			schedule.setActionText(schAction);
			schedule.setActionId(schActionId);
			schedule.setComment(consultOrder.getFormComment());
			schedule.setContactAttempt(consultOrder.getContactAttempt());

			if (consultOrder.getExecutionUserId() != null) {
				schedule.setExecutionUserId(consultOrder.getExecutionUserId());
			}
			if (consultOrder.getExecutionUserName() != null) {
				schedule.setExecutionUserName(consultOrder.getExecutionUserName());
			}
			schedule.setExecutionDateTime(currentDateString);
			if (apptType.getId() != null) {
				schedule.setAppointment(appointment);
				newAppointments.add(appointment);
				ccData.setAppointments(newAppointments);
			}
			
			newSchedules.add(schedule);
			ccData.setSchedules(newSchedules);
			
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			
			order.setStatus(getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.schedulingCompleted: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Updates Activity and Order objects after order is accepted
	 * Called from: Update Activity & Order (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void updateActivityNOrder(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.updateActivityNOrder");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			Boolean clarification = (state.equals(StatesMap.getActivitystate().get("Clarification")) ? true : false);
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			workflowProcessInstance.setVariable("discontinuedByInitiator", true);
			state = StatesMap.getActivitystate().get("Unreleased");
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			
			vistacore.order.Order order = ccData.getOrder();
			if (order == null)
				throw new OrderException("order was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			List<ConsultOrderData> consultOrders = ccData.getConsultOrders();
			String formAction = consultOrder.getFormAction();
			
			boolean signalSign = setUpdateAndChangedToEmergent(workflowProcessInstance, consultOrder, activity);
			
			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("formAction",formAction);
			
			order.setOrderDate(currentDateString);
			order.setStatus(getStatusFromState(state));
			ccData.setOrder(order);

			Facility orderingFacility = consultOrder.getOrderingFacility();
			if (orderingFacility == null)
				throw new OrderException("orderingFacility was null");
			activity.setSourceFacilityId(orderingFacility.getCode());
			activity.setState(state);
			activity.setActivityHealthy(true);
			activity.setActivityHealthDescription("");
			ccData.setActivity(activity);

			String orderable = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "orderable");
			String cdsIntentResult = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "cdsIntentResult");
			String providerUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerUid");
			String providerName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerName");
			consultClinicalObject.setData(ccData);
			ConsultOrderData consultOrderData = ConsultHelperUtil.buildConsultOrder(consultClinicalObject, consultOrder, orderable, cdsIntentResult, providerUid, providerName);
			consultOrders.add(consultOrderData);
			ccData.setConsultOrders(consultOrders);

			//***************************
			// save Order Date Milestone
			//***************************
			Milestone milestone = new Milestone();
			List<Milestone> newMilestones = new ArrayList<Milestone>();
			milestone.setName("Order Date");
			milestone.setStartDateTime(currentDateString);
			newMilestones.add(milestone);
			ccData.setMilestones(newMilestones);

			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			if (formAction.equalsIgnoreCase("accepted") && !clarification) {
				workflowProcessInstance.signalEvent("noMoreEdits", null);
				if (signalSign) {
					workflowProcessInstance.signalEvent("toSign", null);
				}
			}
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.updateActivityNOrder: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets the Completion and Order objects when order is discontinued or deleted
	 * Called from: Set Order as Deleted (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void setOrderAsDeleted(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.setOrderAsDeleted");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			
			vistacore.order.Order order = ccData.getOrder();
			if (order == null)
				throw new OrderException("order was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			vistacore.order.Completion completion = new vistacore.order.Completion();
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			String providerUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerUid");
			String providerName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerName");
			if (state.indexOf("Discontinued") == -1) {
				state = StatesMap.getActivitystate().get("DiscByProvider");
			}

			order.setStopDate(currentDateString);
			completion.setActionText("Delete");
			completion.setComment(consultOrder.getFormComment());
			completion.setExecutionUserId(providerUid);
			completion.setExecutionUserName(providerName);
			completion.setExecutionDateTime(currentDateString);
			ccData.setCompletion(completion);

			workflowProcessInstance.setVariable("state",state);

			activity.setActivityHealthy(true);
			activity.setActivityHealthDescription("");
			activity.setState(state);
			ccData.setActivity(activity);

			order.setStatus(getStatusFromState(state));
			ccData.setOrder(order);

			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.setOrderAsDeleted: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets activity health information
	 * @param processInstance	a reference to the running process instance
	 * @param activityHealthy	whether activity healthy
	 * @param activityHealthDescription	  health description
	 */
	private static void setActivityHealthInfo(ProcessInstance processInstance, boolean activityHealthy, String activityHealthDescription) {
		try {
			Logging.debug("Entering ConsultHelperUtil.setActivityHealthInfo");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription",activityHealthDescription);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");

			activity.setActivityHealthy(activityHealthy);
			activity.setActivityHealthDescription(activityHealthDescription);
			ccData.setActivity(activity);

			consultClinicalObject.setData(ccData);
			saveClinicalObject(workflowProcessInstance, consultClinicalObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.setActivityHealthInfo: An unexpected condition has happened: " + e.getMessage());
		}
	}
	
	
	/**
	 * Sets activity as unhealthy when triage is late to start
	 * Called from: Activity Health - Late Triage  (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void lateTriageSet(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.Late Triage Set - Consult pending triage review for more than 7 days.");
		setActivityHealthInfo(processInstance, false, "Consult pending triage review for more than 7 days.");
	}

	/**
	 * Sets activity as unhealthy when scheduling is late to start
	 * Called from: Activity Health - Late Scheduling  (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void lateSchedulingSet(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.lateSchedulingSet: Consult not scheduled within 30 days.");
		setActivityHealthInfo(processInstance, false, "Consult not scheduled within 30 days.");		
	}

	/**
	 * Sets activity as unhealthy when competion is late to start
	 * Called from:  Activity Health - Late Completion (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void lateCompletionSet(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.lateCompletionSet: Consult not completed within 90 days.");
		setActivityHealthInfo(processInstance, false, "Consult not completed within 90 days.");		
	}

	/**
	 * Sets activity as unhealthy when consult is past the latestDate
	 * Called from: Activity Health - Activity Health - Past Latest Date (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void pastLatestDateSet(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.pastLatestDateSet: Consult not completed or discontinued by Consult Order Latest Date.");
		setActivityHealthInfo(processInstance, false, "Consult not completed or discontinued by Consult Order Latest Date.");			
	}

	/**
	 * Sets activity as unhealthy when consult is 7 days behind scheduled date
	 * Called from: Activity Health - 7 Days Past Scheduled Date (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void pastScheduledDateSet(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.pastScheduledDateSet: Consult not completed within 7 days of scheduled date.");
		setActivityHealthInfo(processInstance, false, "Consult not completed within 7 days of scheduled date.");					
	}

	/**
	 * Resets activity to healthy
	 * Called from: Activity Health - Reset (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void healthReset(ProcessInstance processInstance) {
		Logging.debug("Entering ConsultHelperUtil.healthReset");
		setActivityHealthInfo(processInstance, true, "");
	}

	/**
	 * Sets task dueDate and earliestDate, except Complete task
	 * Called from: All tasks On Entry Action script
	 * @param processInstance	a reference to the running process instance
	 */
	public static void setTaskDates(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.setTaskDates");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			
			DateTime dueDate = new DateTime(DateTimeZone.UTC).plusDays(7);
			String dueDateString = dueDate.toString(ISODateTimeFormat.dateTimeNoMillis());
			workflowProcessInstance.setVariable("p_dueDate", dueDateString);
			
			DateTime earlyDate = new DateTime(DateTimeZone.UTC);
			String earlyDateString = earlyDate.toString(ISODateTimeFormat.dateTimeNoMillis());
			workflowProcessInstance.setVariable("earliestDate", earlyDateString);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.setTaskDates: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets dueDate and earliestDate for Complete task
	 * Called from: On Entry Action of Complete task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void setCompleteTaskDates(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.setCompleteTaskDates");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			
			DateTimeFormatter formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String latestDateStr = consultOrder.getLatestDate();
			if (latestDateStr == null)
				throw new OrderException("latestDateStr was null");
			DateTime dueDate;
			try {
				dueDate = formatter.parseDateTime(latestDateStr);
			} catch (Exception e) {
				throw new OrderException("latestDateStr was unable to be parsed: " + e.getMessage());
			}
			String dueDateString = dueDate.toString(ISODateTimeFormat.dateTimeNoMillis());
			
			workflowProcessInstance.setVariable("p_dueDate", dueDateString);
			DateTime earlyDate = new DateTime(DateTimeZone.UTC).minusMinutes(5);
			String earlyDateString = earlyDate.toString(ISODateTimeFormat.dateTimeNoMillis());
			workflowProcessInstance.setVariable("earliestDate", earlyDateString );
		} catch (OrderException e) {
			//Error was already logged
		}
		 catch (Exception e) {
			Logging.error("ConsultHelperUtil.setCompleteTaskDates: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Parse serviceResponse received from SavePjdsRecord work item handler service
	 * Called from: On Exit Action of first Save ClinicalObject to pJDS (service)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitSaveClinicalObject(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitSaveClinicalObject");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			JsonParser parser = new JsonParser();
			String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "serviceResponse");
			JsonObject serviceResponseObject = parser.parse(serviceResponse).getAsJsonObject();

			if (serviceResponseObject != null && serviceResponseObject.isJsonObject()) {
				JsonElement status = serviceResponseObject.get("status");
				int statusVal;
				if (status != null && status.isJsonPrimitive()) {
					try {
						statusVal = Integer.parseInt(status.getAsString());
					} catch (Exception e) {
						throw new OrderException("status was not an Integer: " + e.getMessage());
					}
					if (statusVal <= 299) {
						JsonElement uid = serviceResponseObject.get("uid");
						String uidString = uid.getAsString();
						workflowProcessInstance.setVariable("clinicalObjectUid", uidString);
					} else {
						Logging.warn("ConsultHelperUtil.onExitSaveClinicalObject: Process Failed to save to pJDS and will be aborted: " + serviceResponse);
						workflowProcessInstance.setVariable("formAction", "Error");
					}
				} else {
				Logging.warn("ConsultHelperUtil.onExitSaveClinicalObject: Process Failed to save to pJDS and will be aborted: " + serviceResponse);
				workflowProcessInstance.setVariable("formAction", "Error");
				}
			} else {
				Logging.warn("ConsultHelperUtil.onExitSaveClinicalObject: serviceResponseObject is NULL or not an object. Process will be aborted: " + serviceResponse);
				workflowProcessInstance.setVariable("formAction", "Error");
			}
		} catch (JsonSyntaxException e) {
			Logging.error("ConsultHelperUtil.onExitSaveClinicalObject: An unexpected condition has happened with json: " + e.getMessage());
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitSaveClinicalObject: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Prepares Note Object JSON
	 * Called from: On Entry Action of Save noteObject to pJDS (service)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onEntrySaveNoteObject(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onEntrySaveNoteObject");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultClinicalObject consultClinicalObject =  WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			vistacore.order.Visit visit = consultClinicalObject.getVisit();
			String patientUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "patientUid");
			String providerUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "providerUid");
			String clinicalObjectUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "clinicalObjectUid");

			String newNoteObject = "{" +
			    "\"patientUid\": " + "\"" + patientUid + "\"," +
			    "\"authorUid\": " + "\"" + providerUid + "\"," +
			    "\"domain\": \"ehmp-note\"," +
			    "\"subDomain\": \"noteObject\"," +
			    "\"visit\" : " +
			    "{" +
			       "\"location\": " + "\"" + visit.getLocation() + "\"," +
			       "\"locationDesc\": " + "\"" + visit.getLocationDesc() + "\"," +
			       "\"serviceCategory\": " + "\"" + visit.getServiceCategory() + "\"," +
			       "\"dateTime\": " + "\"" + visit.getDateTime() + "\"" +
			    "}," +
			    "\"ehmpState\" : \"active\"," +
			    "\"data\": " +
			    "{" +
			        "\"sourceUid\" : " + "\"" + clinicalObjectUid + "\"" +
			    "}" +
			"}";
			workflowProcessInstance.setVariable("tmp_noteObject",newNoteObject);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onEntrySaveNoteObject: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Prepares Discontinued By Other notification
	 * Called from: Process Discontinued Notification (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processDiscontinueNotification(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.processDiscontinuedNotification");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			
			String author = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator");
			String instanceName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "instanceName");
			String discontinuedBy = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "discontinuedBy");
			String patientUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "patientUid");
			
			// PatientUid format: urn:va:patient:<site>:<ien>, PatientId format:<site>;<ien>
			String[] patientUidSplit = patientUid.split(":");
			
			if (patientUidSplit == null || patientUidSplit.length < 5)
				throw new OrderException("patientUid was not in the expected format (urn:va:patient:<site>:<ien>): " + patientUid);
			String patientId = patientUidSplit[3] + ";" + patientUidSplit[4]; 
			
			String notificationTaskId = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "notificationTaskId");
			if (isEmptyString(notificationTaskId)) {
				Long taskId = WorkflowProcessInstanceUtil.getRequiredLong(workflowProcessInstance, "currentTaskInstanceId");
				notificationTaskId = Long.toString(taskId);
				workflowProcessInstance.setVariable("notificationTaskId",notificationTaskId);
			}


			String dateString = ConsultHelperUtil.getCurrentDateString("MM/dd/YYYY HH:mm ZZZ");
			
			String subject = "Consult " + instanceName + " has been discontinued by another user.";
			String message = "Consult " + instanceName + " has been discontinued by " + discontinuedBy + " on " + dateString ;
			String jsonString = buildNotificationJson(author, subject, message, patientId, notificationTaskId);
			
			workflowProcessInstance.setVariable("tmp_notificationJSON",jsonString);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.processDiscontinuedNotification: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets tmp_pastLatestDateTimer used to trigger Past Latest Date performance indicator
	 * Called from: Set Latest Date Timer (script) 
	 * @param processInstance	a reference to the running process instance
	 */
	public static void latestDateTimer(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.latestDateTimer");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			DateTime compareDate = new DateTime().withTime(0, 0, 0, 0);
			
			DateTimeFormatter formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String latestDateStr = consultOrder.getLatestDate();
			if (latestDateStr == null)
				throw new OrderException("latestDateStr was null");
			DateTime latestDate;
			try {
				latestDate = formatter.parseDateTime(latestDateStr);
			} catch (Exception e) {
				throw new OrderException("latestDateStr was unable to be parsed: " + e.getMessage());
			}
			
			int days = Days.daysBetween(compareDate, latestDate).getDays();
			String tmp_pastLatestDateTimerUnits = PropertiesLoader.getConsultTimersProperty("tmp_pastLatestDateTimerUnits", "d");
			String tmp_pastLatestDateTimer = "" + days + tmp_pastLatestDateTimerUnits;
			workflowProcessInstance.setVariable("tmp_pastLatestDateTimer",tmp_pastLatestDateTimer);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.latestDateTimer: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Triage task
	 * Called from: On Exit Action of Triage task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitTriage(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitTriage");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			String action = consultOrder.getFormAction();
			if (isEmptyString(action))
				throw new OrderException("action was null");
			String comment = (isEmptyString(consultOrder.getFormComment()) ? "" : consultOrder.getFormComment());
			if (action.equalsIgnoreCase("assigned")) {
			  vistacore.order.Provider attentionProvider = consultOrder.getAcceptingProvider();
				if (attentionProvider == null)
					throw new OrderException("attentionProvider was null");
			  workflowProcessInstance.setVariable("taskHistory","Attention " + attentionProvider.getDisplayName() + ": " + comment);
			  workflowProcessInstance.setVariable("taskHistoryAction", "Assign To Triage Member");
			} else if (action.equalsIgnoreCase("clarification")) {
			  workflowProcessInstance.setVariable("taskHistory", comment);
			  workflowProcessInstance.setVariable("taskHistoryAction", "Return for Clarification");
			} else if (action.equalsIgnoreCase("eConsult")) {
			  workflowProcessInstance.setVariable("taskHistory", comment);
			  workflowProcessInstance.setVariable("taskHistoryAction", "eConsult");
			} else if (action.equalsIgnoreCase( "communityCare")) {
			  workflowProcessInstance.setVariable("taskHistory",consultOrder.getCommunityCareType() + " / " + consultOrder.getCommunityCareStatus() + " / " + comment);
			  workflowProcessInstance.setVariable("taskHistoryAction", "Referred to Community Care");
			} else if (action.equalsIgnoreCase("triaged")) {
			  workflowProcessInstance.setVariable("taskHistory", comment);
			  workflowProcessInstance.setVariable("taskHistoryAction", "Send to Scheduling");
			}
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");
			workflowProcessInstance.setVariable("formAction",action);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitTriage: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Sign task
	 * Called from: On Exit Action of Sign task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitSign(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitSign");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			workflowProcessInstance.setVariable("state",StatesMap.getActivitystate().get("Pending"));
			workflowProcessInstance.setVariable("formAction","signed");
			workflowProcessInstance.setVariable("taskHistory",noTaskHistoryText);
			workflowProcessInstance.setVariable("taskHistoryAction",noTaskHistoryActionText);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitSign: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Accept task
	 * Called from: On Exit Action of Accept task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitAccept(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitAccept");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			workflowProcessInstance.setVariable("taskHistory",noTaskHistoryText);
			workflowProcessInstance.setVariable("taskHistoryAction","Accepted");
			setTriageAndSchedulingTaskRoutes(processInstance);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitAccept: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Scheduling task
	 * Called from: On Exit Action of Scheduling task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitScheduling(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitScheduling");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			String formAction = consultOrder.getFormAction();
			if (isEmptyString(formAction))
				throw new OrderException("formAction was null");
			String comment = (isEmptyString(consultOrder.getFormComment()) ? "" : consultOrder.getFormComment());
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");
			workflowProcessInstance.setVariable("formAction",formAction);
			if (formAction.equalsIgnoreCase("scheduled")) {
				StringBuilder taskHistory = new StringBuilder();
				if (!isEmptyString(consultOrder.getScheduledDate())) {
					taskHistory.append(consultOrder.getScheduledDate());
				}
				
				Facility clinic = consultOrder.getAcceptingClinic();
				if (clinic != null && !isEmptyString(clinic.getName())) {
					if (taskHistory.length() > 0) {
						taskHistory.append(", ");
					}
					taskHistory.append(clinic.getName());
				}
				
				Provider provider = consultOrder.getAcceptingProvider();
				if (provider != null && !isEmptyString(provider.getDisplayName())) {
					taskHistory.append(String.format(" (%s)", provider.getDisplayName()));
				}
	
				if (!isEmptyString(comment)) {
					if (taskHistory.length() > 0) {
						taskHistory.append(" : ");
					}
					taskHistory.append(comment);
				}
				
				workflowProcessInstance.setVariable("taskHistory", taskHistory.toString().trim());
				workflowProcessInstance.setVariable("taskHistoryAction", "Scheduled");
			} else if (formAction.equalsIgnoreCase("contacted")) {
				workflowProcessInstance.setVariable("taskHistory", consultOrder.getContactAttempt() + ": " + comment);
				workflowProcessInstance.setVariable("taskHistoryAction", "Contact Patient");
			} else if (formAction.equalsIgnoreCase("EWL")) {
				workflowProcessInstance.setVariable("taskHistory", comment);
				workflowProcessInstance.setVariable("taskHistoryAction", "Electronic Waiting List");
			} else if (formAction.equalsIgnoreCase("communityCare")) {
				workflowProcessInstance.setVariable("taskHistory",consultOrder.getCommunityCareType() + " / " + consultOrder.getCommunityCareStatus() + " / " + comment);
				workflowProcessInstance.setVariable("taskHistoryAction", "Referred to Community Care");
			}
			workflowProcessInstance.signalEvent("schedulingStarted", null);
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitScheduling: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Complete task
	 * Called from: On Exit Action of Complete task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitComplete(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitComplete");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			workflowProcessInstance.setVariable("formAction","completed");
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");
			workflowProcessInstance.setVariable("taskHistory",noTaskHistoryText);
			workflowProcessInstance.setVariable("taskHistoryAction",noTaskHistoryActionText);
			workflowProcessInstance.signalEvent("completionStarted", null);
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitComplete: An unexpected condition has happened: " + e.getMessage());
		}
	}

	/**
	 * Sets taskHistory and taskHistoryAction of Review task
	 * Called from: On Exit Action of Review task
	 * @param processInstance	a reference to the running process instance
	 */
	public static void onExitReview(ProcessInstance processInstance) {
		try {
			Logging.debug("Entering ConsultHelperUtil.onExitReview");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
			workflowProcessInstance.setVariable("formAction","reviewed");
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");
			workflowProcessInstance.setVariable("taskHistory","Consult Reviewed");
			workflowProcessInstance.setVariable("taskHistoryAction",noTaskHistoryActionText);
			workflowProcessInstance.setVariable("tmp_notificationJSON","{\"userId\": \"" + (String)workflowProcessInstance.getVariable("reviewAssignment") + "\"}");
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.onExitReview: An unexpected condition has happened: " + e.getMessage());
		}
	}

	public static void processNotificationWriteResponse(ProcessInstance processInstance){
		Logging.debug("Entering ConsultHelperUtil.processNotificationWriteResponse");
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		try {
			String serviceResponse = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "serviceResponse");
			Logging.debug("ConsultHelperUtil.processNotificationWriteResponse: serviceResponse: " + serviceResponse);

			JsonParser parser = new JsonParser();
			JsonObject serviceResponseJson = parser.parse(serviceResponse).getAsJsonObject();		
			String notificationid = GenericUtils.getOptionalJsonElementValueAsString(serviceResponseJson, "notificationid");
			workflowProcessInstance.setVariable("tmp_notificationId", notificationid);
			Logging.debug("NotificationId: "+ notificationid);
		} catch (JsonSyntaxException e) {
			Logging.error("ConsultHelperUtil.processNotificationWriteResponse: An unexpected condition has happened with json. Could not get notificationId: " + e.getMessage());
			workflowProcessInstance.setVariable("tmp_notificationId", "");
		} catch (OrderException e) {
			//Error was already logged
		} catch (Exception e) {
			Logging.error("ConsultHelperUtil.processNotificationWriteResponse: An unexpected condition has happened: " + e.getMessage());
		}
	}
	
	/**
	 * Populates the WorkflowProcessInstance urgency and urgencyInt fields.  If activity is passed in, it also populates the activities urgency.
	 * If setChangedToEmergent is true, it also populates changedToEmergent.
	 * @param workflowProcessInstance The WorkflowProcessInstance to populate urgency, urgencyInt and possibly changedToEmergent.
	 * @param consultOrder The ConsultOrder that contains an existing urgency.
	 * @param activity (optional) if passed in, urgency will be set in the activity.
	 * @return returns the urgency (as an Integer) that was set in the WorkflowProcessInstance
	 * @throws OrderException
	 */
	protected static Integer setUrgency(WorkflowProcessInstance workflowProcessInstance, ConsultOrder consultOrder, vistacore.order.Activity activity) throws OrderException {
		Logging.debug("Entering ConsultHelperUtil.setUrgency");
		if (consultOrder != null && consultOrder.getUrgency() != null && !consultOrder.getUrgency().isEmpty()) {
			String sConsultOrderUrgency = consultOrder.getUrgency();
			Integer iConsultOrderUrgency;
			try {
				iConsultOrderUrgency = Integer.parseInt(sConsultOrderUrgency);
			} catch (NumberFormatException e) {
				throw new OrderException("Urgency was not an Integer: " + e.getMessage());
			}
			workflowProcessInstance.setVariable("urgency",sConsultOrderUrgency);
			workflowProcessInstance.setVariable("urgencyInt",iConsultOrderUrgency);
			
			if (activity != null)
				activity.setUrgency(iConsultOrderUrgency);
			
			return iConsultOrderUrgency;
		}
		Logging.info("***** ConsultHelperUtil.setUrgency: Exiting setUrgency - there was no consultOrder ");
		return null;
	}
	
	/**
	 * Calls {@link #setUrgency(WorkflowProcessInstance, ConsultOrder, vistacore.order.Activity)} and then populates changedToEmergent.
	 * @param workflowProcessInstance The WorkflowProcessInstance to populate urgency, urgencyInt and possibly changedToEmergent.
	 * @param consultOrder The ConsultOrder that contains an existing urgency.
	 * @param activity (optional) if passed in, urgency will be set in the activity.
	 * @return Returns true if it is calculated that changedToEmergent is true or urgencyInt is >=4.
	 * @throws OrderException
	 */
	protected static boolean setUpdateAndChangedToEmergent(WorkflowProcessInstance workflowProcessInstance, ConsultOrder consultOrder, vistacore.order.Activity activity) throws OrderException {
		Logging.debug("Entering ConsultHelperUtil.setUpdateAndChangedToEmergent");
		Integer urgencyInt = WorkflowProcessInstanceUtil.getRequiredInteger(workflowProcessInstance, "urgencyInt");	
		Integer iConsultOrderUrgency = setUrgency(workflowProcessInstance, consultOrder, activity);
		if (iConsultOrderUrgency == null)
			throw new OrderException("setUrgency returned null, does your consultOrder.urgency exist?");
		
		Boolean changedToEmergent = WorkflowProcessInstanceUtil.getRequiredBoolean(workflowProcessInstance, "changedToEmergent");
		
		if (urgencyInt.intValue() >= 4 && iConsultOrderUrgency < 4 && !changedToEmergent.booleanValue()) {
			changedToEmergent = true;
			workflowProcessInstance.setVariable("changedToEmergent", true);
		} else {
			changedToEmergent = false;
			workflowProcessInstance.setVariable("changedToEmergent", false);
		}
		
		if (iConsultOrderUrgency >= 4 || changedToEmergent)
			return true;
		else
			return false;
	}
	
	/**
	 * Calls {@link #setUrgency(WorkflowProcessInstance, ConsultOrder, vistacore.order.Activity)} and then populates changedToEmergent.
	 * @param workflowProcessInstance The WorkflowProcessInstance to populate urgency, urgencyInt and possibly changedToEmergent.
	 * @param consultOrder The ConsultOrder that contains an existing urgency.
	 * @param activity (optional) if passed in, urgency will be set in the activity.
	 * @param completed The state of the workupComplete.
	 * @return Returns true if changedToEmergent was set to true
	 * @throws OrderException
	 */
	protected static boolean setUpdateAndChangedToEmergentWaitOnLabs(WorkflowProcessInstance workflowProcessInstance, ConsultOrder consultOrder, vistacore.order.Activity activity, boolean completed) throws OrderException {
		Logging.debug("Entering ConsultHelperUtil.setUpdateAndChangedToEmergentWaitOnLabs");
		Integer urgencyInt = WorkflowProcessInstanceUtil.getRequiredInteger(workflowProcessInstance, "urgencyInt");
		Integer iConsultOrderUrgency = setUrgency(workflowProcessInstance, consultOrder, activity);
		if (iConsultOrderUrgency == null)
			throw new OrderException("setUrgency returned null, does your consultOrder.urgency exist?");
		
		if (urgencyInt >= 4 && iConsultOrderUrgency < 4) {
			workflowProcessInstance.setVariable("changedToEmergent", true);
			Logging.debug("ConsultHelperUtil.setUpdateAndChangedToEmergentWaitOnLabs: changedToEmergent");
			workflowProcessInstance.signalEvent("toSign", null);
			return true;
		} else {
			workflowProcessInstance.setVariable("changedToEmergent", false);
			Logging.debug("ConsultHelperUtil.setUpdateAndChangedToEmergentWaitOnLabs: changedToEmergent is reset");
			return false;
		}
	}

	/**
	 * Extracts out an uppercase status from a state.<br/><br/>
	 * 
	 * Examples of state are:<br/>
	 * "Unreleased:Pending Signature"<br/>
	 * "Unreleased:Pre-order Workup"<br/>
	 * "Draft"<br/><br/>
	 * 
	 * In this example, the status returned will be<br/>
	 * "UNRELEASED"<br/>
	 * "UNRELEASED"<br/>
	 * "DRAFT"<br/><br/>
	 * @param state
	 * @return
	 */
	protected static String getStatusFromState(String state) {
		Logging.debug("Entering ConsultHelperUtil.getStatusFromState");
		if (state == null)
			return "";
		
		int index = state.indexOf(":");
		int length = index != -1 ?  index : state.length();
		
		String status = state.substring(0, length);
		status = status.toUpperCase();
		return status;
	}

	public static boolean isEmptyString( final String s ) {
		// Null-safe, short-circuit evaluation.
		return s == null || s.trim().isEmpty();
	}
}
