package gov.va.signalregistrationservice.util;

import gov.va.ehmp.services.utils.Logging;
import gov.va.signalregistrationservice.entities.EventListener;
import gov.va.signalregistrationservice.entities.EventMatchAction;
import gov.va.signalregistrationservice.entities.EventMatchCriteria;
import gov.va.signalregistrationservice.entities.SimpleMatch;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;

import org.kie.api.runtime.Environment;
import org.kie.api.runtime.EnvironmentName;
import org.kie.api.runtime.KieSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class RegistrationUtil {

	private static void recurse(JsonElement json, String prefix, Map<String, String> map) {
		if (json == null) {
			return;
		}
		
		if (json.isJsonPrimitive()) {
			map.put(prefix, json.getAsString());
		}	
		else if (json.isJsonArray()) {
			int ind = 0;
			for (JsonElement e : json.getAsJsonArray()) {
				recurse(e, prefix + "[" + (ind++) + "]", map);
			}
		} else if (json.isJsonObject()) {
			prefix = prefix.length() > 0 ? prefix.concat(".") : prefix;
			for (Map.Entry<String, JsonElement> entry : json.getAsJsonObject().entrySet()) {
				recurse(entry.getValue(), prefix + entry.getKey(), map);
			}
		}
		else {
			Logging.info("Json was not a primitive, jsonArray, or jsonObject - treating as null");
			return;
		}
	}
	
	/*
	 * This method flattens an object like {foo:{bar:false}} to {"foo.bar":false} and returns map with key-value pairs
	 * This is similar to http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects(which is a java script implementation)
	 * */	
	public static Map<String, String> flattenJson(JsonElement json) {
		Map<String, String> map = new LinkedHashMap<>();
		
		if (json != null && json.isJsonObject()) {
			recurse(json, "", map);
		}

		return map;
	}

	/*
	 * Builds success response
	 * */
	public static String buildSuccessResponse() {
		String response = new String();
		
		JsonObject outputObj = new JsonObject();
		outputObj.addProperty("status", 200);
		
		Gson gson = new GsonBuilder().create();
		response = gson.toJson(outputObj);
		
		return response;
	}
		
	/*
	 * Insert row into AM_EVENTLISTENER
	 * */
	public static void createEventListener(EntityManager em,
			String eventActionScope,
			String apiVersion,
			String eventDescription,
			String eventName,
			BigDecimal eventMatchCriteriaId,
			BigDecimal eventMatchActionId) {
		
		em.persist(new EventListener(eventActionScope, apiVersion, eventDescription, eventName, eventMatchActionId, eventMatchCriteriaId));
	}

	/*
	 * Insert row(s) into SIMPLE_MATCH
	 * */
	public static void createSimpleMatchRecords(EntityManager em,
			JsonObject matchJsonObject, 
			BigDecimal eventMatchCriteriaId) {
		
		Map<String, String> matchingCriteriaMap = RegistrationUtil.flattenJson(matchJsonObject);
		for(Map.Entry<String, String> match : matchingCriteriaMap.entrySet()) {
			em.persist(new SimpleMatch(match.getKey(), match.getValue(), eventMatchCriteriaId));
		}
	}

	/*
	 * Insert row into EVENT_MATCH_ACTION
	 * */
	public static BigDecimal createMatchAction(EntityManager em,
			long processInstanceId,
			String signalName,
			String signalContent,
			String processDefinitionId,
			String version) {
		
		Query query = em.createNativeQuery("select ACTIVITYDB.AM_EVENT_MATCH_ACTION_ID_SEQ.nextval from dual");
		BigDecimal eventMatchActionId = (BigDecimal)query.getSingleResult();
		
		em.persist(new EventMatchAction(eventMatchActionId, signalContent, signalName, processDefinitionId, version, processInstanceId));
		return eventMatchActionId;
	}

	/*
	 * Insert row into EVENT_MATCH_CRITERIA
	 **/
	public static BigDecimal createMatchCriteria(EntityManager em) {
		
		Query query = em.createNativeQuery("select ACTIVITYDB.AM_EVENT_MATCH_CRITERIA_ID_SEQ.nextval from dual");
		BigDecimal eventMatchCriteriaId = (BigDecimal)query.getSingleResult();
		
		em.persist(new EventMatchCriteria(eventMatchCriteriaId));
		
		return eventMatchCriteriaId;
	}
	
	public static EntityManager getEntityManager(KieSession ksession) {
		Environment env = ksession.getEnvironment();
		EntityManagerFactory entityManagerFactory = (EntityManagerFactory)env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
		
		return entityManagerFactory.createEntityManager();
	}
	
}
