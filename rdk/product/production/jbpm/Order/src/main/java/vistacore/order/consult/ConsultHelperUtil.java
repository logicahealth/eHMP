package vistacore.order.consult;
import vistacore.order.consult.ConsultOrderData;
import vistacore.order.consult.Orderable;
import vistacore.order.consult.CdsIntentResult;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonArray;
import java.util.List;
import java.util.ArrayList;

/**
 * This class provides common utilities for the consult activity
 */

public class ConsultHelperUtil implements java.io.Serializable {

    static final long serialVersionUID = 1L;

    public ConsultHelperUtil() {
    }

    public static ConsultOrderData buildConsultOrder(ConsultOrder consultOrder, String orderableString, String cdsIntentResultString, String userId, String userName) {
	DateTime currentDate = new DateTime(DateTimeZone.UTC);
	DateTimeFormatter dtformatter = DateTimeFormat.forPattern("YYYYMMddHHmmss");
	String currentDateString = currentDate.toString(dtformatter);
	System.out.println("Enter buildConsultOrder *****");
	ConsultOrderData consultOrderData = new ConsultOrderData();
	Orderable orderable = praseJsonToObject(orderableString);
	consultOrderData.setOrderable(orderable);

	CdsIntentResult cdsIntentResult = praseCDSIntent(cdsIntentResultString);
	consultOrderData.setCdsIntentResult(cdsIntentResult);

	consultOrderData.setUrgency(Integer.parseInt(consultOrder.getUrgency()));
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
	return consultOrderData;
    }

    public static Orderable praseJsonToObject(String orderableString) {
    System.out.println("Enter praseJsonToObject *****");
	Orderable orderable = new Orderable();
	if (orderableString == null || orderableString.isEmpty()) {
		return orderable;
	}
	OrderableData orderabaleData = new OrderableData();

	JsonParser parser = new JsonParser();
	JsonObject jsonObject = parser.parse(orderableString).getAsJsonObject();

	/* we ignore NullPointerExceptions in the following statements */
	/* because the JSON elements are not guranteed to be in the received string */
	try {
		orderable.setDomain(jsonObject.get("domain").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setSubDomain(jsonObject.get("facility-enterprise").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setName(jsonObject.get("name").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setState(jsonObject.get("state").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setSubDomain(jsonObject.get("subDomain").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setType(jsonObject.get("type").getAsString());
	} catch (Exception e) {}

	try {
		orderable.setUid(jsonObject.get("uid").getAsString());
	} catch (Exception e) {}

	JsonObject dataObj = jsonObject.get("data").getAsJsonObject();
	if (dataObj != null) {
		JsonObject activityData = dataObj.get("activity").getAsJsonObject();
		if (activityData != null) {
			vistacore.order.Activity activity = new vistacore.order.Activity();
			activity.setDeploymentId(activityData.get("deploymentId").getAsString());
			activity.setProcessDefinitionId(activityData.get("processDefinitionId").getAsString());
			orderabaleData.setActivity(activity);
		}

		JsonArray codesData = dataObj.get("codes").getAsJsonArray();
		java.util.List<vistacore.order.consult.Code> codes = new java.util.ArrayList<Code>(); 
		for (int i = 0; i < codesData.size(); i++) {
			JsonObject jcode = codesData.get(i).getAsJsonObject();
			Code code = new Code();
			code.setCode(jcode.get("code").getAsString());
			code.setDisplay(jcode.get("display").getAsString());
			code.setSystem(jcode.get("system").getAsString());
			codes.add(code);
		}
		orderabaleData.setCodes(codes);
		try {
			orderabaleData.setInstructions(dataObj.get("instructions").getAsString());
		} catch (Exception e) {}

		Prerequisites prerequisites = new Prerequisites();
		EhmpQuestionnaire ehmpQuestionnaire = new EhmpQuestionnaire();
		java.util.List<vistacore.order.consult.ObservationResult> observationResults = new java.util.ArrayList<ObservationResult>();
		try {
			JsonObject prereqData = dataObj.get("prerequisites").getAsJsonObject();
			prerequisites.setCdsIntent(prereqData.get("cdsIntent").getAsString());
			JsonObject ehmpqData = prereqData.get("ehmp-questionnaire").getAsJsonObject();
			JsonArray obsResults = ehmpqData.get("observation-results").getAsJsonArray();
			for (int i = 0; i < obsResults.size(); i++) {
				ObservationResult observationResult = new ObservationResult();
				DerivedFrom derivedFrom = new DerivedFrom();
				Version version = new Version();
				JsonObject obsResult1 = obsResults.get(i).getAsJsonObject();
				JsonObject obsResult = obsResult1.get("observation-result").getAsJsonObject();
				JsonObject derivedFromData = obsResult.get("derived-from").getAsJsonObject();
				JsonObject versionData = derivedFromData.get("version").getAsJsonObject();
				version.setModule(versionData.get("module").getAsString());
				version.setPath(versionData.get("path").getAsString());
				version.setTime(versionData.get("time").getAsString());
				derivedFrom.setForm(derivedFromData.get("form").getAsString());
				derivedFrom.setItem(derivedFromData.get("item").getAsString());
				derivedFrom.setVersion(version);

				observationResult.setDerivedFrom(derivedFrom);
				observationResult.setEpisodicity(obsResult.get("episodicity").getAsString());
				observationResult.setLegoId(obsResult.get("lego-id").getAsString());
				observationResult.setObservable(obsResult.get("observable").getAsString());
				observationResult.setProvenance(obsResult.get("provenance").getAsString());
				observationResult.setQuestionText(obsResult.get("question-text").getAsString());
				observationResult.setTiming(obsResult.get("timing").getAsString());
				observationResult.setValue(obsResult.get("value").getAsString());
				version = new Version();
				versionData = obsResult.get("version").getAsJsonObject();
				version.setModule(versionData.get("module").getAsString());
				version.setPath(versionData.get("path").getAsString());
				version.setTime(versionData.get("time").getAsString());
				observationResult.setVersion(version);
				observationResults.add(observationResult);
			}
			ehmpQuestionnaire.setObservationResults(observationResults);
			prerequisites.setEhmpQuestionnaire(ehmpQuestionnaire);

			orderabaleData.setPrerequisites(prerequisites);
		} catch (Exception e) {}
		TeamFocus teamFocus = new TeamFocus();
		JsonObject tfObject = dataObj.get("teamFocus").getAsJsonObject();
		teamFocus.setCode(tfObject.get("code").getAsString());
		teamFocus.setName(tfObject.get("name").getAsString());
		orderabaleData.setTeamFocus(teamFocus);
		orderable.setData(orderabaleData);
	}
	return orderable;
    }

    public static CdsIntentResult praseCDSIntent(String cdsIntentResultString) {
    System.out.println("Enter praseCDSIntent *****");
	CdsIntentResult cdsIntentResult = new CdsIntentResult();
	if (cdsIntentResultString == null || cdsIntentResultString.isEmpty()) {
		return cdsIntentResult;
	}
	CdsIntentData cdsIntentData = new CdsIntentData();

	JsonParser parser = new JsonParser();
	JsonObject jsonObject = parser.parse(cdsIntentResultString).getAsJsonObject();

	cdsIntentResult.setStatus(jsonObject.get("status").getAsInt());
	JsonObject intentData = jsonObject.get("data").getAsJsonObject();
	if (intentData != null) {
		java.util.List<String> faultInfo = new java.util.ArrayList<String>();
		JsonArray faultArray = intentData.get("faultInfo").getAsJsonArray();
		for (int i = 0; i < faultArray.size(); i++) {
			faultInfo.add(faultArray.get(i).getAsString());
		}
		cdsIntentData.setFaultInfo(faultInfo);

		JsonArray resultsObj = intentData.get("results").getAsJsonArray();
		List<Result> results = new ArrayList<Result>();
		for (int i = 0; i < resultsObj.size(); i++)  {
			Result result = new Result();
			JsonObject resultObj = resultsObj.get(i).getAsJsonObject();
			JsonObject codingObj = resultObj.get("coding").getAsJsonObject();
			Code code = new Code();
		/* we ignore NullPointerExceptions in the following statements */
		/* because the JSON elements are not guranteed to be in the received string */
			try {
				code.setCode(codingObj.get("code").getAsString());
			} catch (Exception e) {}

			try {
				code.setDisplay(codingObj.get("display").getAsString());
			} catch (Exception e) {}

			try {
				code.setSystem(codingObj.get("system").getAsString());
			} catch (Exception e) {}
			result.setCoding(code);

			Detail detail = new Detail();
			List<Identifier> identifiers = new ArrayList<Identifier>();

			JsonObject detailObj = resultObj.get("detail").getAsJsonObject();
			JsonArray idObjects = detailObj.get("identifier").getAsJsonArray();
			for (int j = 0; j < idObjects.size(); j++) {
				Identifier identifier = new Identifier();
				JsonObject idObject = idObjects.get(j).getAsJsonObject();
				try {
					identifier.setSystem(idObject.get("system").getAsString());
				} catch (Exception e) {}

				try {
					identifier.setValue(idObject.get("value").getAsString());
				} catch (Exception e) {}

				identifiers.add(identifier);
			}

			try {
				detail.setResourceType(detailObj.get("resourceType").getAsString());
			} catch (Exception e) {}

			try {
				detail.setComments(detailObj.get("comments").getAsString());
			} catch (Exception e) {}

			try {
				detail.setStatus(detailObj.get("status").getAsString());
			} catch (Exception e) {}

			detail.setIdentifier(identifiers);
			result.setDetail(detail);

			try {
				result.setDuration(resultObj.get("duration").getAsString());
			} catch (Exception e) {}

			JsonObject remedObj = resultObj.get("remediation").getAsJsonObject();
			codingObj = remedObj.get("coding").getAsJsonObject();
			Remediation remediation = new Remediation();
			code = new Code();
			try {
				code.setCode(codingObj.get("code").getAsString());
			} catch (Exception e) {}

			try {
				code.setDisplay(codingObj.get("display").getAsString());
			} catch (Exception e) {}

			try {
				code.setSystem(codingObj.get("system").getAsString());
			} catch (Exception e) {}

			remediation.setCoding(code);

			try {
				remediation.setAction(remedObj.get("action").getAsString());
			} catch (Exception e) {}

			try {
				remediation.setDomain(remedObj.get("domain").getAsString());
			} catch (Exception e) {}

			result.setRemediation(remediation);

			try {
				result.setStatus(resultObj.get("status").getAsString());
			} catch (Exception e) {}

			results.add(result);

		}
		cdsIntentData.setResults(results);

		CdsIntentStatus cdsIntentStatus = new CdsIntentStatus();
		JsonObject statusObj = intentData.get("status").getAsJsonObject();

		try {
			cdsIntentStatus.setCode(statusObj.get("code").getAsString());
		} catch (Exception e) {}

		try {
			cdsIntentStatus.setHttpStatus(statusObj.get("httpStatus").getAsString());
		} catch (Exception e) {}

		cdsIntentData.setStatus(cdsIntentStatus);

	}

	cdsIntentResult.setData(cdsIntentData);
	return cdsIntentResult;
    }
}