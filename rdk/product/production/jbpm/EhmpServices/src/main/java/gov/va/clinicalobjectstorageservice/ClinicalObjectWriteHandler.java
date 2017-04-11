package gov.va.clinicalobjectstorageservice;

import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.va.clinicalobjectstorageservice.util.ResourceUtil;
import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.utils.Logging;
import gov.va.kie.utils.WorkItemUtil;

public class ClinicalObjectWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		Logging.info("ClinicalObjectWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts or puts the clinicalObject (contained in a parameter of the WorkItem called 'clinicalObject')
	 * to pJDS and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		try {
			Logging.info("Entering ClinicalObjectWriteHandler.executeWorkItem");
			String pId  = WorkItemUtil.extractStringParam(workItem, "pid");
			String jsonObject = WorkItemUtil.extractStringParam(workItem,"clinicalObject");
			String uId = null;
			
			if (workItem != null && workItem.getParameter("uid") != null) {
				uId = WorkItemUtil.extractStringParam(workItem,"uid");				
			}			
			
			Logging.debug("ClinicalObjectWriteHandler.executeWorkItem pId = " + pId + ", uId = " + uId);
			Logging.debug("ClinicalObjectWriteHandler.executeWorkItem jsonObject = " + jsonObject);
			
			ResourceUtil resUtil = new ResourceUtil();
			
			String result = null;
			if (uId != null) {
				// Update clinical object in pJDS
				result = resUtil.invokePutResource(jsonObject, pId, uId);
			} else {			
				// Write clinical object to pJDS
				result = resUtil.invokePostResource(jsonObject, pId);
			}

			Logging.debug("ClinicalObjectWriteHandler.executeWorkItem result = " + result);
			response = transformResult(result);
			Logging.debug("ClinicalObjectWriteHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}
	
	/*
	 * Transform Clinical Object Storage API response
	 * 
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 * */
	protected String transformResult(String result) throws EhmpServicesException {
		String response = new String();
		if (result != null && !result.isEmpty()) {
			JsonParser parser = new JsonParser();
			
			JsonObject obj = null;
			try {
				obj = parser.parse(result).getAsJsonObject();
			}
			catch(Exception e) {
				throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "JSON parsing exception:" + e.getMessage(), e);
			}

			JsonObject outputObj = new JsonObject();
			outputObj.addProperty("status", 200);
			
			String uid = "";
			JsonElement dataElement = obj.get("data");
			if (dataElement != null && dataElement.isJsonObject()) {
				JsonElement headersElement = dataElement.getAsJsonObject().get("headers");
				if (headersElement != null && headersElement.isJsonObject()) {
					JsonElement locationElement = headersElement.getAsJsonObject().get("location");
					if (locationElement != null && locationElement.isJsonPrimitive()) {
						String location = locationElement.getAsString();
						int ind = location.lastIndexOf('/');
						if (ind != -1) {
							uid = location.substring(location.lastIndexOf('/') + 1);
						}
					}
				}
			}
			outputObj.addProperty("uid", uid);
			
			Gson gson = new GsonBuilder().create();
			response = gson.toJson(outputObj);
		}
		return response;
	}	
}
