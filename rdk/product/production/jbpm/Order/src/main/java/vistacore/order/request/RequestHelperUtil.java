package vistacore.order.request;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.drools.core.util.KieFunctions;
import org.jboss.logging.Logger;
import org.joda.time.DateTime;
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

import vistacore.order.Activity;
import vistacore.order.Visit;
import vistacore.order.kie.utils.WorkflowProcessInstanceUtil;

/**
 * Provides common utilities and script contents for the request activity
 * 
 * @author sam.amer
 */

public class RequestHelperUtil implements java.io.Serializable {

	static final long serialVersionUID = 1L;

	private static final Logger LOGGER = Logger.getLogger(RequestHelperUtil.class);

	public RequestHelperUtil() {
	}

	public static void preparePJDSRecord(ProcessInstance processInstance) {
		try {
			LOGGER.debug("RequestHelperUtil.preparePJDSRecord Entering");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;

			Gson gson = new Gson();
			workflowProcessInstance.setVariable("responseNotificationDays", null);
			workflowProcessInstance.setVariable("requestNotificationDays", null);

			String ehmpStateComputed = "draft";
			String stateComputed = "Draft";
			String formAction = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "formAction");

			if (formAction == null || formAction == "draft") {
				formAction = "Draft";
				ehmpStateComputed = "draft";
			} else if ("accepted".equalsIgnoreCase(formAction)) {
				ehmpStateComputed = "active";
				stateComputed = "Active: Pending Response";
			} else if ("deleted".equalsIgnoreCase(formAction) || "discontinued".equalsIgnoreCase(formAction)) {
				ehmpStateComputed = "deleted";
				stateComputed = "Deleted";
			}

			Visit mainVisit = (Visit) workflowProcessInstance.getVariable("mainVisit");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			if (mainVisit == null) {
			    
				mainVisit = (Visit) requestActivity.getVisit();
				//if requestActivity didn't include a visit object, make one up
				//this is needed because clinical objects and notes cannot be saved to pJDS without a full visit object
				if (mainVisit.getDateTime() == null) {
					DateTime currentDate = new DateTime(DateTimeZone.UTC);
					DateTimeFormatter dtformatter = DateTimeFormat.forPattern("YYYYMMddHHmmss");
					String currentDateString = currentDate.toString(dtformatter);
					mainVisit = new Visit();
					mainVisit.setDateTime(currentDateString);
					mainVisit.setLocation("-1");
					mainVisit.setLocationDesc("No Visit Location");
					mainVisit.setServiceCategory("-1");
					workflowProcessInstance.setVariable("mainVisit", mainVisit);
					Boolean createNoteObject = false;
					requestActivity.setVisit(mainVisit);				
				} else {				    
					workflowProcessInstance.setVariable("mainVisit", requestActivity.getVisit());
					Boolean createNoteObject = true;
				}
				
			} 
			
			// reset the visits within the Data object
			int responsesCount = 0;
			if (requestActivity.getData().getResponses() != null) {
				responsesCount = requestActivity.getData().getResponses().size();
			}
			int requestsCount = 0;
			if (requestActivity.getData().getRequests() != null) {
				requestsCount = requestActivity.getData().getRequests().size();
			}
			RequestData data = requestActivity.getData();
			Request v_response = null;
			Request v_request = null;
			List<Request> newResponses = new ArrayList<Request>();
			List<Request> newRequests = new ArrayList<Request>();
			for (int i = 0; i < responsesCount; i++) {
				v_response = requestActivity.getData().getResponses().get(i);
				v_response.setVisit(mainVisit);
				newResponses.add(v_response);
			}
			for (int i = 0; i < requestsCount; i++) {
				v_request = requestActivity.getData().getRequests().get(i);
				v_request.setVisit(mainVisit);
				newRequests.add(v_request);
			}
			data.setRequests(newRequests);
			data.setResponses(newResponses);
			requestActivity.setData(data);

			if (requestActivity.getData().getActivity().getProcessInstanceId() != null) {
				requestActivity.getData().getActivity()
						.setProcessInstanceId(Long.toString(workflowProcessInstance.getId()));
			}
			
			requestActivity.setEhmpState(ehmpStateComputed);
			
			String json = gson.toJson(requestActivity);
			workflowProcessInstance.setVariable("pjdsRecord", json);
			workflowProcessInstance.setVariable("state", stateComputed);
			workflowProcessInstance.setVariable("clinicalObjectUid", requestActivity.getUid());
			LOGGER.debug("RequestHelperUtil.preparePJDSRecord pjdsRecord:" + json);
			
			// reset performance indicators
			Boolean activityHealthy = true;
			String activityHealthDescription = "";
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);

			workflowProcessInstance.setVariable("requestActivity", requestActivity);

			LOGGER.debug("RequestHelperUtil.preparePJDSRecordPrepare pJDS Record DONE!");
		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.preparePJDSRecord: %s", e.getMessage()), e);
		}
	}

	public static void exitSavePJDSRecord(ProcessInstance processInstance) throws Exception {

		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		String serviceResponse = (String) workflowProcessInstance.getVariable("serviceResponse");
		LOGGER.debug("RequestHelperUtil.exitSavePJDSRecord serviceResponse:" + serviceResponse);

		JsonParser parser = new JsonParser();
		JsonObject obj = parser.parse(serviceResponse).getAsJsonObject();
		JsonElement dataElement = obj.get("status");
		if (dataElement == null) {
			throw new Exception("Invalid response received(status is missing) from ClinicalObjectWriteService");
		}
		if (dataElement.getAsInt() != 200) {
			dataElement = obj.get("error");
			if (!KieFunctions.isEmpty(dataElement.getAsString())) {
				throw new Exception(dataElement.getAsString());
			} else {
				throw new Exception("UNKNOWN ERROR");
			}
		}
		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
		dataElement = obj.get("uid");
		if (dataElement == null) {
			throw new Exception("Invalid response received(uid is missing) from ClinicalObjectWriteService");
		} else {
			String uid = (String) workflowProcessInstance.getVariable("clinicalObjectUid");
			if (KieFunctions.isEmpty(uid)) {
				uid = dataElement.getAsString();
				workflowProcessInstance.setVariable("clinicalObjectUid", uid);
				requestActivity.setUid(uid);
				workflowProcessInstance.setVariable("requestActivity", requestActivity);
			}
		}
	}

	public static void setFormAction(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		
		try {
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			LOGGER.debug("RequestHelperUtil.setFormAction formAction:" + requestActivity.getFormAction());
			workflowProcessInstance.setVariable("formAction", requestActivity.getFormAction());
			workflowProcessInstance.setVariable("instanceName", requestActivity.getInstanceName());
			workflowProcessInstance.setVariable("clinicalObjectUid", requestActivity.getUid());
		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.setFormAction: %s", e.getMessage()), e);
		}
	}

	@SuppressWarnings("unchecked")
	public static void exitNotificationWriteService(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		String serviceResponse = (String) workflowProcessInstance.getVariable("serviceResponse");
		LOGGER.debug("RequestHelperUtil.exitNotificationWriteService serviceResponse:" + serviceResponse);

		Gson gson = new Gson();
		Map<String, String> map = new HashMap<String, String>();
		map = (Map<String, String>) gson.fromJson(serviceResponse, map.getClass());

		LOGGER.debug("RequestHelperUtil.exitNotificationWriteService NotificationId:" + map.get("notificationid"));

		workflowProcessInstance.setVariable("notificationId", map.get("notificationid"));
	}

	public static void returnedRequestPastDueNotification(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		try {
			LOGGER.debug(
					"RequestHelperUtil.returnedRequestPastDueNotification Entering");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			String recipient = requestActivity.getData().getActivity().getAssignedTo();
			LOGGER.debug("RequestHelperUtil.returnedRequestPastDueNotification recipient: " + recipient);
			String icn = (String) workflowProcessInstance.getVariable("icn");
			String site = icn.split(";")[0];
			String dfn = icn.split(";")[1];
			String displayName = requestActivity.getDisplayName();
			String subject = "Complete Returned Request";
			String message = displayName + ", Request has been returned and Is currently past due.";

			Long taskId = (Long) workflowProcessInstance.getVariable("currentTaskInstanceId");

			String notificationText = "{\"recipients\": [{\"recipient\": {\"userId\": \"" + recipient
					+ "\"},\"salience\": 4}],\"producer\": {\"description\": \"workflow: Request\"},\"patientId\": \""
					+ site + ";" + dfn + "\",\"message\": {\"subject\": \"" + subject + "\",\"body\": \"" + message
					+ "\"},\"resolution\": \"producer\", \"associatedItems\": [\"ehmp:task:" + taskId + "\"] }";
			workflowProcessInstance.setVariable("notificationText", notificationText);

			// Set performance indicators
			List<Request> reqs = requestActivity.getData().getResponses();
			Request latestResponse = reqs.get(reqs.size() - 1);
			DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyyMMddHHmmss");
			DateTime date = formatter.parseDateTime(latestResponse.getLatestDate());

			formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String dateString = formatter.print(date);

			Boolean activityHealthy = false;
			String activityHealthDescription = "Request not completed or discontinued by " + dateString;
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);
		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.returnedRequestPastDueNotification: %s", e.getMessage()), e);
		}
	}

	public static void setActivityHealthState(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;

		try {
			LOGGER.debug("RequestHelperUtil.setActivityHealthState Declined Request, setting perf indicator");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");

			// Set performance indicators
			List<Request> reqs = requestActivity.getData().getResponses();
			Request latestResponse = reqs.get(reqs.size() - 1);
			DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyyMMddHHmmss");
			DateTime date = formatter.parseDateTime(latestResponse.getLatestDate());

			formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String dateString = formatter.print(date);

			Boolean activityHealthy = false;
			String activityHealthDescription = "Request not completed or discontinued by " + dateString;
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);
		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.setActivityHealthState: %s", e.getMessage()), e);
		}
	}

	public static void enterReviewTask(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.enterReviewTask Entering");
		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");

		String rc = requestActivity.getData().getActivity().getAssignedTo();
		LOGGER.debug("RequestHelperUtil.enterReviewTask RoutingCode:" + rc);

		List<Request> reqs = requestActivity.getData().getResponses();
		Request latestResponse = reqs.get(reqs.size() - 1);

		LOGGER.debug("RequestHelperUtil.enterReviewTask RoutingCode:" + latestResponse.getAssignTo());

		if (KieFunctions.equalsTo(latestResponse.getAssignTo(), "Me")) {
			LOGGER.debug("RequestHelperUtil.enterReviewTask On Entry Action of Request setting actor ");
			workflowProcessInstance.setVariable("actor", rc);
			workflowProcessInstance.setVariable("groups", null);
			LOGGER.debug("RequestHelperUtil.enterReviewTask On Entry Action of Request after setting actor ");
		} else if (KieFunctions.equalsTo(latestResponse.getAssignTo(), "Person")) {
			workflowProcessInstance.setVariable("actor", rc);
			workflowProcessInstance.setVariable("groups", null);
		} else {
			workflowProcessInstance.setVariable("groups", rc);
			workflowProcessInstance.setVariable("actor", null);
		}

		workflowProcessInstance.setVariable("comments", latestResponse.getRequest());
		workflowProcessInstance.setVariable("assignedTo", rc);

		DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyyMMddHHmmss").withZone(DateTimeZone.UTC);
		DateTime eDate = formatter.parseDateTime(latestResponse.getEarliestDate());
		workflowProcessInstance.setVariable("earliestDate", eDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

		DateTime lDate = formatter.parseDateTime(latestResponse.getLatestDate());
		String lDateISO = lDate.toString(ISODateTimeFormat.dateTimeNoMillis());
		workflowProcessInstance.setVariable("dueDate", lDateISO);

		DateTime currentDate = new DateTime(DateTimeZone.UTC);
		DateTimeFormatter notifcationFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
				.withZone(DateTimeZone.UTC);
		DateTime taskDueDateTime = notifcationFormatter.parseDateTime(lDateISO);
		int secsDiff = Seconds.secondsBetween(currentDate, taskDueDateTime).getSeconds();

		String notifTime = "0";
		if (secsDiff > 0) {

			int days = secsDiff / (3600 * 24);
			int remSeconds = secsDiff - days * 3600 * 24;
			int hours = remSeconds / 3600;
			remSeconds = remSeconds - hours * 3600;
			int minutes = remSeconds / 60;
			remSeconds = remSeconds - minutes * 60;

			notifTime = days + "d" + hours + "h" + minutes + "m" + remSeconds + "s";
		}

		LOGGER.debug("RequestHelperUtil.enterReviewTask Request notifTime:" + notifTime);
		workflowProcessInstance.setVariable("requestNotificationDays", notifTime);

		LOGGER.debug("RequestHelperUtil.enterReviewTask earliestDate:"
				+ eDate.toString(ISODateTimeFormat.dateTimeNoMillis()));
		LOGGER.debug("RequestHelperUtil.enterReviewTask p_dueDate:"
				+ lDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

	}

	public static void exitReviewTask(ProcessInstance processInstance) {
		LOGGER.debug("RequestHelperUtil.exitReviewTask Entering");
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;

		String formAction = (String) workflowProcessInstance.getVariable("formAction");
		LOGGER.debug("RequestHelperUtil.exitReviewTask formAction:" + formAction);

		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
		workflowProcessInstance.setVariable("formAction", formAction);

		Activity activity = (Activity) workflowProcessInstance.getVariable("activity");
		requestActivity.getData().setActivity(activity);

		if (requestActivity.getData().getRequests() == null) {
			requestActivity.getData().setRequests(new ArrayList<Request>());
		}

		Request request = (Request) workflowProcessInstance.getVariable("request");
		requestActivity.getData().getRequests().add(request);

		workflowProcessInstance.setVariable("requestActivity", requestActivity);

		workflowProcessInstance.setVariable("instanceName", activity.getInstanceName());
		workflowProcessInstance.setVariable("urgency", activity.getUrgency().toString());
		workflowProcessInstance.setVariable("assignedTo", activity.getAssignedTo());

		workflowProcessInstance.setVariable("taskHistory", request.getRequest());
		workflowProcessInstance.setVariable("taskHistoryAction", null);
	}

	public static void enterNotificationResolve(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.enterNotificationResolve Entering");

		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
		String recipient = requestActivity.getData().getActivity().getAssignedTo();
		LOGGER.debug("RequestHelperUtil.enterNotificationResolve recipient:" + recipient);

		String notificationText = "{'userId': '" + recipient + "'}";
		workflowProcessInstance.setVariable("notificationText", notificationText);

	}

	public static void exitNotificationResolve(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		String serviceResponse = (String) workflowProcessInstance.getVariable("serviceResponse");
		LOGGER.debug(
				"RequestHelperUtil.exitNotificationResolve Notif Resolve serviceResponse: **** " + serviceResponse);

		workflowProcessInstance.setVariable("notificationId", null);
	}

	public static void prepareRequestNoteObject(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject Entering");
		try {
			// Prepare an Initial RequestActivity NoteObject
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			if (requestActivity == null) {
				LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject requestActivity parameter is NULL");
			} else if (requestActivity.getVisit() == null) {
				LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject requestActivity.getVisit is NULL");
			} else {
				LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject requestActivity.getVisit().getLocation():"
						+ requestActivity.getVisit().getLocation());
				LOGGER.debug(
						"RequestHelperUtil.prepareRequestNoteObject requestActivity.getVisit().getServiceCategory():"
								+ requestActivity.getVisit().getServiceCategory());
				LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject requestActivity.getVisit().getDateTime():"
						+ requestActivity.getVisit().getDateTime());
			}

			Visit visit = new Visit();
			visit = requestActivity.getVisit();
			String visitLocation = visit.getLocation();
			String visitServiceCategory = visit.getServiceCategory();
			String visitDateTime = visit.getDateTime();
			LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject visitLocation:" + visitLocation);
			LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject visitServiceCategory:" + visitServiceCategory);
			LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject visitDateTime:" + visitDateTime);

			String noteObjectId = requestActivity.getAuthorUid().substring(12).replace(":", ";");
			LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject noteObjectId:" + noteObjectId);
			workflowProcessInstance.setVariable("hasNoteObject", noteObjectId);
			String clinicalObjectUid = (String) workflowProcessInstance.getVariable("clinicalObjectUid");
			String newNoteObject = "{" + "\"patientUid\": " + "\"" + requestActivity.getPatientUid() + "\","
					+ "\"authorUid\": " + "\"" + requestActivity.getAuthorUid() + "\"," + "\"domain\": \"ehmp-note\","
					+ "\"subDomain\": \"noteObject\"," + "\"visit\" : " + "{" + "\"location\": " + "\"" + visitLocation
					+ "\"," + "\"serviceCategory\": " + "\"" + visitServiceCategory + "\"," + "\"dateTime\": " + "\""
					+ visitDateTime + "\"" + "}," + "\"ehmpState\" : \"active\"," + "\"data\": " + "{"
					+ "\"sourceUid\" : " + "\"" + clinicalObjectUid + "\"" + "}" + "}";
			workflowProcessInstance.setVariable("noteObject", newNoteObject);
			LOGGER.debug("RequestHelperUtil.prepareRequestNoteObject noteObject: " + newNoteObject);			

		} catch (Exception e) {
			LOGGER.error("RequestHelperUtil.prepareRequestNoteObject - An unexpected condition has happened: " + e.getMessage());
		}
	}

	public static void exitSaveNoteObjectToPJDS(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		String serviceResponse = (String) workflowProcessInstance.getVariable("serviceResponse");
		LOGGER.debug("RequestHelperUtil.exitSaveNoteObjectToPJDS");
		if (serviceResponse.indexOf("error") >= 0) {
			LOGGER.debug("RequestHelperUtil.exitSaveNoteObjectToPJDS Process Failed to save note object to pJDS **** "
					+ serviceResponse);
		} else {
			LOGGER.debug("RequestHelperUtil.exitSaveNoteObjectToPJDS serviceResponse:"
					+ serviceResponse);
		}
	}

	public static void processENDSignal(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.processENDSignal Entering");
		try {
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			RequestSignal requestSignalData = (RequestSignal) workflowProcessInstance.getVariable("requestSignalData");
			LOGGER.debug("RequestHelperUtil.processENDSignal comment:"
					+ requestSignalData.getData().getComment());

			if (requestActivity.getData().getSignals() == null) {
				requestActivity.getData().setSignals(new ArrayList<RequestSignal>());
			}

			DateTime currentDate = new DateTime(DateTimeZone.UTC);
			DateTimeFormatter dtformatter = DateTimeFormat.forPattern("YYYYMMddHHmmss+0000");
			String currentDateString = currentDate.toString(dtformatter);
			requestSignalData.setExecutionDateTime(currentDateString);

			requestActivity.getData().getSignals().add(requestSignalData);

			workflowProcessInstance.setVariable("requestActivity", requestActivity);
			workflowProcessInstance.setVariable("formAction", requestSignalData.getActionText());
			workflowProcessInstance.setVariable("state", "Discontinued");
			workflowProcessInstance.setVariable("clinicalObjectUid", requestActivity.getUid());
			workflowProcessInstance.setVariable("action", "discontinue");

			// reset performance indicators
			Boolean activityHealthy = true;
			String activityHealthDescription = "";
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);

			// set signal data
			workflowProcessInstance.setVariable("signalName", requestSignalData.getName());
			workflowProcessInstance.setVariable("signalHistory", requestSignalData.getData().getComment());
			workflowProcessInstance.setVariable("signalAction", "Discontinue");
			workflowProcessInstance.setVariable("signalOwner", requestSignalData.getExecutionUserId());
			workflowProcessInstance.setVariable("actionId", Integer.parseInt(requestSignalData.getActionId()));

		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.processENDSignal: An unexpected condition has happened: %s",
					e.getMessage()), e);
		}
	}

	public static void prepareResponseNoteObject(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject Entering");
		try {
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			if (requestActivity == null) {
				LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject requestActivity parameter is NULL");
			} else if (requestActivity.getVisit() == null) {
				LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject requestActivity.getVisit is NULL");
			} else {
				LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject requestActivity.getVisit().getLocation():"
						+ requestActivity.getVisit().getLocation());
				LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject requestActivity.getVisit().getServiceCategory():"
						+ requestActivity.getVisit().getServiceCategory());
				LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject requestActivity.getVisit().getDateTime():"
						+ requestActivity.getVisit().getDateTime());
			}

			Visit visit = new Visit();
			visit = requestActivity.getVisit();
			String visitLocation = visit.getLocation();
			String visitServiceCategory = visit.getServiceCategory();
			String visitDateTime = visit.getDateTime();
			LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject visitLocation:" + visitLocation);
			LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject visitServiceCategory:" + visitServiceCategory);
			LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject visitDateTime:" + visitDateTime);

			String clinicalObjectUid = (String) workflowProcessInstance.getVariable("clinicalObjectUid");
			String authorId = "urn:va:user:"
					+ requestActivity.getData().getActivity().getAssignedTo().replaceAll(";", ":");

			String newNoteObject = "{" + "\"patientUid\": " + "\"" + requestActivity.getPatientUid() + "\","
					+ "\"authorUid\": " + "\"" + authorId + "\"," + "\"domain\": \"ehmp-note\","
					+ "\"subDomain\": \"noteObject\"," + "\"visit\" : " + "{" + "\"location\": " + "\"" + visitLocation
					+ "\"," + "\"serviceCategory\": " + "\"" + visitServiceCategory + "\"," + "\"dateTime\": " + "\""
					+ visitDateTime + "\"" + "}," + "\"ehmpState\" : \"active\"," + "\"data\": " + "{"
					+ "\"sourceUid\" : " + "\"" + clinicalObjectUid + "\"" + "}" + "}";
			workflowProcessInstance.setVariable("noteObject", newNoteObject);
			LOGGER.debug("RequestHelperUtil.prepareResponseNoteObject noteObject:" + newNoteObject);

		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.prepareResponseNoteObject: An unexpected condition has happened: %s",
					e.getMessage()), e);
		}
	}

	public static void processEDITSignal(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		try {

			LOGGER.debug("RequestHelperUtil.processEDITSignal Entering");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			workflowProcessInstance.setVariable("action", "EDIT");

			if (requestActivity.getData().getSignals() == null) {
				requestActivity.getData().setSignals(new ArrayList<RequestSignal>());
			}

			RequestActivity updatedRequestActivity = (RequestActivity) workflowProcessInstance
					.getVariable("updatedRequestActivity");
			List<Request> reqs = updatedRequestActivity.getData().getRequests();
			List<Request> res = updatedRequestActivity.getData().getResponses();

			List<RequestSignal> signals = updatedRequestActivity.getData().getSignals();

			String executionUserId = null;
			Integer actionId = null;
			String name = null;

			if (signals != null && signals.size() >= 1) {
				RequestSignal latestSignal = signals.get(signals.size() - 1);
				DateTime currentDate = new DateTime(DateTimeZone.UTC);
				DateTimeFormatter dtformatter = DateTimeFormat.forPattern("YYYYMMddHHmmss+0000");
				String currentDateString = currentDate.toString(dtformatter);
				latestSignal.setExecutionDateTime(currentDateString);

				requestActivity.getData().getSignals().add(latestSignal);
				executionUserId = latestSignal.getExecutionUserId();
				actionId = Integer.parseInt(latestSignal.getActionId());
				name = latestSignal.getName();
			}
			if (reqs != null && reqs.size() >= 1) {
				Request latestRequest = reqs.get(reqs.size() - 1);
				requestActivity.getData().getRequests().add(latestRequest);
				workflowProcessInstance.setVariable("comments", latestRequest.getRequest());
			}

			if (res != null && res.size() >= 1) {
				Request latestResponse = res.get(res.size() - 1);
				requestActivity.getData().getResponses().add(latestResponse);
			}

			requestActivity.getData().setActivity(updatedRequestActivity.getData().getActivity());

			requestActivity.setFormAction(updatedRequestActivity.getFormAction());
			requestActivity.setInstanceName(updatedRequestActivity.getInstanceName());

			requestActivity.setPatientUid(updatedRequestActivity.getPatientUid());
			requestActivity.setAuthorUid(updatedRequestActivity.getAuthorUid());
			requestActivity.setDomain(updatedRequestActivity.getDomain());
			requestActivity.setSubDomain(updatedRequestActivity.getSubDomain());
			requestActivity.setDisplayName(updatedRequestActivity.getDisplayName());
			requestActivity.setReferenceId(updatedRequestActivity.getReferenceId());
			requestActivity.setUrgency(updatedRequestActivity.getUrgency());
			workflowProcessInstance.setVariable("destinationFacility",
					updatedRequestActivity.getData().getActivity().getDestinationFacilityId());
			workflowProcessInstance.setVariable("facility",
					updatedRequestActivity.getData().getActivity().getSourceFacilityId());

			LOGGER.debug("RequestHelperUtil.processEDITSignal instanceName:" + updatedRequestActivity.getInstanceName());

			// reset the visits
			int responsesCount = 0;
			if (requestActivity.getData().getResponses() != null) {
				responsesCount = requestActivity.getData().getResponses().size();
			}
			int requestsCount = 0;
			if (requestActivity.getData().getRequests() != null) {
				requestsCount = requestActivity.getData().getRequests().size();
			}
			RequestData data = requestActivity.getData();
			Request v_response = null;
			Request v_request = null;
			List<Request> newResponses = new ArrayList<Request>();
			List<Request> newRequests = new ArrayList<Request>();
			Visit mainVisit = (Visit) workflowProcessInstance.getVariable("mainVisit");
			for (int i = 0; i < responsesCount; i++) {
				v_response = requestActivity.getData().getResponses().get(i);
				v_response.setVisit(mainVisit);
				newResponses.add(v_response);
			}
			for (int i = 0; i < requestsCount; i++) {
				v_request = requestActivity.getData().getRequests().get(i);
				if (i > 0) {
					v_request.setVisit(mainVisit);
				}
				newRequests.add(v_request);
			}
			data.setRequests(newRequests);
			data.setResponses(newResponses);
			requestActivity.setData(data);

			Gson gson = new Gson();
			String json = gson.toJson(requestActivity);

			workflowProcessInstance.setVariable("pjdsRecord", json);
			workflowProcessInstance.setVariable("urgency",
					Integer.toString(updatedRequestActivity.getData().getActivity().getUrgency()));
			workflowProcessInstance.setVariable("assignedTo",
					updatedRequestActivity.getData().getActivity().getAssignedTo());
			workflowProcessInstance.setVariable("subDomain",
					updatedRequestActivity.getData().getActivity().getDomain());
			workflowProcessInstance.setVariable("instanceName",
					updatedRequestActivity.getData().getActivity().getInstanceName());

			// set signal data
			workflowProcessInstance.setVariable("signalName", name);
			workflowProcessInstance.setVariable("signalHistory", "");
			workflowProcessInstance.setVariable("signalAction", "Edit");
			workflowProcessInstance.setVariable("signalOwner", executionUserId);
			workflowProcessInstance.setVariable("actionId", actionId);

			// reset performance indicators

			Boolean activityHealthy = true;
			String activityHealthDescription = "";
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);

		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.processEDITSignal - An unexpected condition has happened: ",
					e.getMessage()), e);
		}
	}

	public static void processDiscontinueReturnDecline(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.processDiscontinueReturnDecline Entering");
		try {
			String formAction = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "formAction");
			String action = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "action");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			Visit mainVisit = (Visit) workflowProcessInstance.getVariable("mainVisit");
			LOGGER.debug("RequestHelperUtil.processDiscontinueReturnDecline formAction:" + formAction);
			Gson gson = new Gson();
			String ehmpStateComputed = "active";
			String stateComputed = "Completed";
			if ("discontinue".equalsIgnoreCase(formAction)) {
				stateComputed = "Discontinued";
				requestActivity.getData().getActivity().setState(stateComputed);
			} else if ("clarification".equalsIgnoreCase(action)) {
				stateComputed = "Returned: Clarification Requested";
			} else if ("decline".equalsIgnoreCase(action)) {
				stateComputed = "Returned: Declined";
			}

			requestActivity.setEhmpState(ehmpStateComputed);
			// reset the visits
			int responsesCount = 0;
			if (requestActivity.getData().getResponses() != null) {
				responsesCount = requestActivity.getData().getResponses().size();
			}
			int requestsCount = 0;
			if (requestActivity.getData().getRequests() != null) {
				requestsCount = requestActivity.getData().getRequests().size();
			}
			RequestData data = requestActivity.getData();
			Request v_response = null;
			Request v_request = null;
			List<Request> newResponses = new ArrayList<Request>();
			List<Request> newRequests = new ArrayList<Request>();
			for (int i = 0; i < responsesCount; i++) {
				v_response = requestActivity.getData().getResponses().get(i);
				v_response.setVisit(mainVisit);
				newResponses.add(v_response);
			}
			for (int i = 0; i < requestsCount; i++) {
				v_request = requestActivity.getData().getRequests().get(i);
				if (i > 0) {
					v_request.setVisit(mainVisit);
				}
				newRequests.add(v_request);
			}
			data.setRequests(newRequests);
			data.setResponses(newResponses);
			requestActivity.setData(data);

			String json = gson.toJson(requestActivity);

			workflowProcessInstance.setVariable("pjdsRecord", json);
			workflowProcessInstance.setVariable("state", stateComputed);
			workflowProcessInstance.setVariable("clinicalObjectUid", requestActivity.getUid());

			LOGGER.debug("RequestHelperUtil.processDiscontinueReturnDecline pjdsRecord:" + json);

			// reset performance indicators

			Boolean activityHealthy = true;
			String activityHealthDescription = "";
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);

		} catch (Exception e) {
			LOGGER.error(String.format("RequestHelperUtil.processDiscontinueReturnDecline: %s", e.getMessage()), e);
		}
	}

	public static void enterResponseTask(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.enterResponseTask Entering");
		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
		String action = (String) workflowProcessInstance.getVariable("action");
		String rc = requestActivity.getData().getActivity().getAssignedTo();
		LOGGER.debug("RequestHelperUtil.enterResponseTask - Response RoutingCode:" + rc);

		List<Request> reqs = requestActivity.getData().getRequests();
		Request latestRequest = reqs.get(reqs.size() - 1);

		String assignTo = latestRequest.getAssignTo();

		if (KieFunctions.equalsTo(action, "reassign")) {
			List<Request> ress = requestActivity.getData().getResponses();
			Request latestResponse = ress.get(ress.size() - 1);
			assignTo = latestResponse.getAssignTo();
		}

		if (KieFunctions.equalsTo(assignTo, "Me")) {
			LOGGER.debug("RequestHelperUtil.enterResponseTask actor:"+rc);
			workflowProcessInstance.setVariable("actor", rc);
			workflowProcessInstance.setVariable("groups", null);
		} else if (KieFunctions.equalsTo(assignTo, "Person")) {
			workflowProcessInstance.setVariable("actor", rc);
			workflowProcessInstance.setVariable("groups", null);
		} else {
			workflowProcessInstance.setVariable("actor", null);
			workflowProcessInstance.setVariable("groups", rc);
		}

		workflowProcessInstance.setVariable("comments", latestRequest.getRequest());

		DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyyMMddHHmmss").withZone(DateTimeZone.UTC);
		DateTime eDate = formatter.parseDateTime(latestRequest.getEarliestDate());
		workflowProcessInstance.setVariable("earliestDate", eDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

		LOGGER.debug("RequestHelperUtil.enterResponseTask earliestDate:" + eDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

		DateTime lDate = formatter.parseDateTime(latestRequest.getLatestDate());
		String lDateISO = lDate.toString(ISODateTimeFormat.dateTimeNoMillis());
		workflowProcessInstance.setVariable("dueDate", lDateISO);

		LOGGER.debug("RequestHelperUtil.enterResponseTask dueDate:" + lDateISO);

		DateTime currentDate = new DateTime(DateTimeZone.UTC);
		DateTimeFormatter notifcationFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
				.withZone(DateTimeZone.UTC);
		DateTime taskDueDateTime = notifcationFormatter.parseDateTime(lDateISO);

		String notifTime = "0";
		int secsDiff = Seconds.secondsBetween(currentDate, taskDueDateTime).getSeconds();

		if (secsDiff > 0) {
			int days = secsDiff / (3600 * 24);
			int remSeconds = secsDiff - days * 3600 * 24;
			int hours = remSeconds / 3600;
			remSeconds = remSeconds - hours * 3600;
			int minutes = remSeconds / 60;
			remSeconds = remSeconds - minutes * 60;
			notifTime = days + "d" + hours + "h" + minutes + "m" + remSeconds + "s";
		}

		LOGGER.debug("RequestHelperUtil.enterResponseTask responseNotificationDays:" + notifTime);

		workflowProcessInstance.setVariable("responseNotificationDays", notifTime);

		LOGGER.debug("RequestHelperUtil.enterResponseTask earliestDate:" + eDate.toString(ISODateTimeFormat.dateTimeNoMillis()));

		LOGGER.debug("RequestHelperUtil.enterResponseTask p_dueDate:" + lDate.toString(ISODateTimeFormat.dateTimeNoMillis()));
	}

	public static void exitResponseTask(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.exitResponseTask Entering");

		RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
		String action = (String) workflowProcessInstance.getVariable("action");
		String formAction = (String) workflowProcessInstance.getVariable("formAction");
		Activity activity = (Activity) workflowProcessInstance.getVariable("activity");
		Request response = (Request) workflowProcessInstance.getVariable("response");
		LOGGER.debug("RequestHelperUtil.exitResponseTask action:" + action);
		LOGGER.debug("RequestHelperUtil.exitResponseTask response route:" + response.getRoute());
		LOGGER.debug("RequestHelperUtil.exitResponseTask response activity:" + activity);
		workflowProcessInstance.setVariable("formAction", formAction);
		requestActivity.getData().setActivity(activity);
		workflowProcessInstance.setVariable("action", action);
		if (requestActivity.getData().getResponses() == null) {
			requestActivity.getData().setResponses(new ArrayList<Request>());
		}
		requestActivity.getData().getResponses().add(response);
		workflowProcessInstance.setVariable("requestActivity", requestActivity);
		workflowProcessInstance.setVariable("taskHistory", response.getRequest());
		workflowProcessInstance.setVariable("taskHistoryAction",
				ActionMap.valueOf(action.toUpperCase()).getLabel());

	}

	public static void afterLatestDateNotification(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		try {
			LOGGER.debug("RequestHelperUtil.afterLatestDateNotification Entering");
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			String action = (String) workflowProcessInstance.getVariable("action");
			String icn = (String) workflowProcessInstance.getVariable("icn");
			String site = icn.split(";")[0];
			String dfn = icn.split(";")[1];
			String displayName = requestActivity.getDisplayName();
			String subject = "Request Past Due";
			String message = "Your Request, " + displayName + ", is past the latest date and has not been completed.";

			Long taskId = (Long) workflowProcessInstance.getVariable("currentTaskInstanceId");
			String[] authorArray = requestActivity.getAuthorUid().split(":");
			String author = authorArray[3] + ";" + authorArray[4];

			List<Request> reqs = requestActivity.getData().getRequests();
			Request latestRequest = reqs.get(reqs.size() - 1);
			String recipient = "";

			String assignTo = latestRequest.getAssignTo();

			if (KieFunctions.equalsTo(action, "reassign")) {
				List<Request> ress = requestActivity.getData().getResponses();
				Request latestResponse = ress.get(ress.size() - 1);
				assignTo = latestResponse.getAssignTo();
			}

			if (KieFunctions.equalsTo(assignTo, "Me") || KieFunctions.equalsTo(assignTo, "Person")) {
				String routingCode = requestActivity.getData().getActivity().getAssignedTo();
				LOGGER.debug("RequestHelperUtil.afterLatestDateNotification  routingCode:" + routingCode);
				recipient = " {\"recipient\": {\"userId\": \"" + routingCode + "\"},\"salience\": 4}";
			} else {
				String routes = requestActivity.getData().getActivity().getAssignedTo();
				String teamFacility = requestActivity.getData().getActivity().getDestinationFacilityId();
				String[] routesList = routes.split(",");

				for (String route : routesList) {

					route = route.trim();
					if (KieFunctions.isEmpty(route)) {
						continue;
					}

					Integer team = null;
					Integer teamRole = null;
					String subRouteCode = null;
					if (route.startsWith("[")) {
						route = route.replace("[", "").replace("]", "");
						String[] subRoutes = route.split("/");

						if (!KieFunctions.isEmpty(recipient)) {
							recipient = recipient + ",";
						}

						for (String subRoute : subRoutes) {
							subRoute = subRoute.trim();

							LOGGER.debug("RequestHelperUtil.afterLatestDateNotification subRoute:" + subRoute.toString());

							String category = subRoute.substring(0, 2);
							int subRouteCodeBegin = subRoute.indexOf('(');
							int subRouteCodeEnd = subRoute.indexOf(')');

							subRouteCode = subRoute.substring(subRouteCodeBegin + 1, subRouteCodeEnd);
							if (KieFunctions.equalsTo(category, "TM")) {
								team = Integer.parseInt(subRouteCode);
							} else if (KieFunctions.equalsTo(category, "TR")) {
								teamRole = Integer.parseInt(subRouteCode);
							}
						}

						recipient = recipient + " {\"recipient\": {\"facility\": \"" + teamFacility
								+ "\",\"teamId\": \"" + team + "\", \"teamRole\": \"" + teamRole
								+ "\"},\"salience\": 4} ";
					}
				}
			}
			recipient = recipient + ", {\"recipient\": {\"userId\": \"" + author + "\"},\"salience\": 4}";

			String notificationText = "{\"recipients\": [" + recipient
					+ "],\"producer\": {\"description\": \"workflow: Request\"}, \"patientId\": \"" + site + ";" + dfn
					+ "\",\"message\": {\"subject\": \"" + subject + "\",\"body\": \"" + message
					+ "\"},\"resolution\": \"producer\",  \"associatedItems\": [\"ehmp:task:" + taskId + "\"] }";

			LOGGER.debug("RequestHelperUtil.afterLatestDateNotification notificationText:" + notificationText);
			workflowProcessInstance.setVariable("notificationText", notificationText);
			LOGGER.debug("RequestHelperUtil.afterLatestDateNotification  Exiting");

			// set performance indicators
			DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyyMMddHHmmss");
			DateTime date = formatter.parseDateTime(latestRequest.getLatestDate());

			formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String dateString = formatter.print(date);

			Boolean activityHealthy = false;
			String activityHealthDescription = "Request not completed or discontinued by " + dateString;
			workflowProcessInstance.setVariable("activityHealthy", activityHealthy);
			workflowProcessInstance.setVariable("activityHealthDescription", activityHealthDescription);

		} catch (Exception e) {
			LOGGER.debug("RequestHelperUtil.afterLatestDateNotification - An unexpected condition has happened: "
					+ e.getMessage());
		}

	}

	public static void setReassignData(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		LOGGER.debug("RequestHelperUtil.setReassignData Entering");

		try {
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			String rc = requestActivity.getData().getActivity().getAssignedTo();
			LOGGER.debug("RequestHelperUtil.setReassignData RoutingCode:" + rc);

			List<Request> reqs = requestActivity.getData().getResponses();
			Request latestResponse = reqs.get(reqs.size() - 1);

			LOGGER.debug("RequestHelperUtil.setReassignData assignTo:" + latestResponse.getAssignTo());

			if (KieFunctions.equalsTo(latestResponse.getAssignTo(), "Me")) {
				LOGGER.debug("RequestHelperUtil.setReassignData  actor:" +rc);
				workflowProcessInstance.setVariable("actor", rc);
				workflowProcessInstance.setVariable("groups", null);				
			} else if (KieFunctions.equalsTo(latestResponse.getAssignTo(), "Person")) {
				workflowProcessInstance.setVariable("actor", rc);
				workflowProcessInstance.setVariable("groups", null);
			} else {
				workflowProcessInstance.setVariable("groups", rc);
				workflowProcessInstance.setVariable("actor", null);
			}
		} catch (Exception e) {
			LOGGER.debug("RequestHelperUtil.setReassignData - An unexpected condition has happened: "
					+ e.getMessage());
		}

	}

	public static void processReassignData(ProcessInstance processInstance) {
		WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance) processInstance;
		try {
			RequestActivity requestActivity = (RequestActivity) workflowProcessInstance.getVariable("requestActivity");
			Visit mainVisit = (Visit) workflowProcessInstance.getVariable("mainVisit");
			LOGGER.debug("RequestHelperUtil.processReassignData Entering");
			Gson gson = new Gson();

			String ehmpStateComputed = "active";
			String stateComputed = "Active: Reassign";

			requestActivity.setEhmpState(ehmpStateComputed);

			// reset the visits
			int responsesCount = 0;
			if (requestActivity.getData().getResponses() != null) {
				responsesCount = requestActivity.getData().getResponses().size();
			}
			int requestsCount = 0;
			if (requestActivity.getData().getRequests() != null) {
				requestsCount = requestActivity.getData().getRequests().size();
			}
			RequestData data = requestActivity.getData();
			Request v_response = null;
			Request v_request = null;
			List<Request> newResponses = new ArrayList<Request>();
			List<Request> newRequests = new ArrayList<Request>();
			for (int i = 0; i < responsesCount; i++) {
				v_response = requestActivity.getData().getResponses().get(i);
				v_response.setVisit(mainVisit);
				newResponses.add(v_response);
			}
			for (int i = 0; i < requestsCount; i++) {
				v_request = requestActivity.getData().getRequests().get(i);
				if (i > 0) {
					v_request.setVisit(mainVisit);
				}
				newRequests.add(v_request);
			}
			data.setRequests(newRequests);
			data.setResponses(newResponses);
			requestActivity.setData(data);

			String json = gson.toJson(requestActivity);

			workflowProcessInstance.setVariable("pjdsRecord", json);
			workflowProcessInstance.setVariable("state", stateComputed);
			workflowProcessInstance.setVariable("clinicalObjectUid", requestActivity.getUid());

			LOGGER.debug("RequestHelperUtil.processReassignData pjdsRecord:" + json);

		} catch (Exception e) {
			LOGGER.debug("RequestHelperUtil.processReassignData - An unexpected condition has happened: "
					+ e.getMessage());
		}
	}

}
