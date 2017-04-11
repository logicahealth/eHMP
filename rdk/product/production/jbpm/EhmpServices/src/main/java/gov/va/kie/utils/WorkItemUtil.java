package gov.va.kie.utils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemManager;
import org.springframework.http.HttpStatus;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.utils.Logging;

public class WorkItemUtil {
	/**
	 * Extracts the given parameter from the work item, validates it's of type String and then returns it.
	 * 
	 * @throws EhmpServicesException If workItem is null, the paramName is null or empty, the object returned is null, or if what is returned is not a String.
	 */
	public static String extractStringParam(WorkItem workItem, String paramName) throws EhmpServicesException {
		if (workItem == null) {
			throw new EhmpServicesException(HttpStatus.BAD_REQUEST, "workItem was null");			
		}
		if (paramName == null || paramName.isEmpty()) {
			throw new EhmpServicesException(HttpStatus.BAD_REQUEST, "paramName was null or empty");			
		}
		
		Object obj  = workItem.getParameter(paramName);
		if (obj == null) {
			throw new EhmpServicesException(HttpStatus.BAD_REQUEST, "Required parameter '" + paramName + "' is not provided.");
		}
		if (!(obj instanceof java.lang.String)) {
			throw new EhmpServicesException(HttpStatus.BAD_REQUEST, "Required parameter '" + paramName + "' was not a String as expected.");
		}
		
		String retvalue = (String)obj;
		return retvalue;
	}

	/**
	 * Extracts the given parameter from the work item, validates it's of type long and then returns it.
	 * Long data type is not supported in input declaration so long value needs to converted to String before passing
	 * 
	 * @throws EhmpServicesException If workItem is null, the paramName is null or empty, the object returned is null, or if what is returned is not a long.
	 */
	public static long extractLongParam(WorkItem workItem, String paramName) throws EhmpServicesException {
		String paramValue = extractStringParam(workItem, paramName);		
		try {
			return Long.parseLong(paramValue);
		} 
		catch(Exception e){
			throw new EhmpServicesException(HttpStatus.BAD_REQUEST, "Required parameter '" + paramName + "' was not a string representation of long number as expected.");
		}		
	}
	
	/**
	 * Completes the WorkItem and populates a field called ServiceResponse with the json provided.
	 * 
	 * @param workItem we retrieve the name and id from the work item
	 * @param manager used to call completeWorkItem
	 * @param serviceResponse The json message to send back in the field called ServiceResponse
	 */
	public static void completeWorkItem(WorkItem workItem, WorkItemManager manager, String serviceResponse) {
		if (workItem == null) {
			Logging.error("workItem cannot be null in populateServiceResult");
			return;
		}
		if (manager == null) {
			Logging.error("manager cannot be null in populateServiceResult");
			return;
		}
		
		Map<String, Object> serviceResult = new HashMap<String, Object>();
		serviceResult.put("ServiceResponse", serviceResponse);
		
		long id = workItem.getId();
		String name = workItem.getName();
		manager.completeWorkItem(id, serviceResult);
		
		Logging.debug("work item completed (" + id + ") - " + name);
	}
	
	public static String buildSuccessResponse() {
		return buildSuccessResponse(null);
	}
	public static String buildSuccessResponse(String message) {
		Map<String,String> map = new HashMap<String,String>();
		if (message != null && message.isEmpty() == false)
			map.put("message", message);
		return buildResponse(200, map);
	}
	/*
	 * Builds success response
	 */
	private static String buildResponse(int status, Map<String,String> map) {
		String response = new String();
		
		JsonObject outputObj = new JsonObject();				
		outputObj.addProperty("status", status);
		if (map != null) {
			Iterator<String> it = map.keySet().iterator();
			while (it.hasNext()) {
				String key = it.next();
				String value = map.get(key);
				
				outputObj.addProperty(key, value);
			}
		}
		Gson gson = new GsonBuilder().create();
		response = gson.toJson(outputObj);
		
		return response;
	}
}
