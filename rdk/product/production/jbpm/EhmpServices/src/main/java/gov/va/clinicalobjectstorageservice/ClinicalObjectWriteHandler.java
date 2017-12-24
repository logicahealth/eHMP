package gov.va.clinicalobjectstorageservice;

import org.jboss.logging.Logger;
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
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;


public class ClinicalObjectWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(ClinicalObjectWriteHandler.class);

	@Override
	public void close() {
		//Ignored
	}
	
	@Override
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.info("ClinicalObjectWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts or puts the clinicalObject (contained in a parameter of the WorkItem called 'clinicalObject')
	 * to pJDS and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	@Override
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		try {
			LOGGER.info("Entering ClinicalObjectWriteHandler.executeWorkItem");
			String pId  = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
			String jsonObject = WorkItemUtil.extractRequiredStringParam(workItem,"clinicalObject");
			String uId = WorkItemUtil.extractOptionalStringParam(workItem,"uid");
			
			LOGGER.debug(String.format("ClinicalObjectWriteHandler.executeWorkItem pId = %s, uId = %s", pId, uId));
			LOGGER.debug(String.format("ClinicalObjectWriteHandler.executeWorkItem jsonObject = %s", jsonObject));
			
			ResourceUtil resUtil = new ResourceUtil();
			
			String result = null;
			if (uId != null) {
				// Update clinical object in pJDS
				result = resUtil.invokePutResource(jsonObject, pId, uId);
			} else {			
				// Write clinical object to pJDS
				result = resUtil.invokePostResource(jsonObject, pId);
			}

			LOGGER.debug(String.format("ClinicalObjectWriteHandler.executeWorkItem result = %s", result));
			response = transformResult(result);
			LOGGER.debug(String.format("ClinicalObjectWriteHandler.executeWorkItem response = %s", response));
		} catch (EhmpServicesException e) {
			response = e.createJsonErrorResponse();
			LOGGER.error(e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ClinicalObjectWriteHandler.executeWorkItem: An unexpected condition has happened: %" + e.getMessage(), e));
			response = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "ClinicalObjectWriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
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
