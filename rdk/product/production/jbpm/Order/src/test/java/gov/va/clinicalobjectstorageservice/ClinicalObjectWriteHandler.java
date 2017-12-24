package gov.va.clinicalobjectstorageservice;

import java.time.Instant;
import java.util.UUID;

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

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import vistacore.jds.MockJDSStore;
import vistacore.order.exception.OrderException;

/**
 * This implements an interface to a MockJDSStore for Integration Tests
 * @author steven.elliott
 *
 */
public class ClinicalObjectWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(ClinicalObjectWriteHandler.class);
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.info("ClinicalObjectWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts or puts the clinicalObject (contained in a parameter of the WorkItem called 'clinicalObject')
	 * to pJDS and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		try {
			LOGGER.info("Entering ClinicalObjectWriteHandler.executeWorkItem");
			String pId  = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
			String jsonObject = WorkItemUtil.extractRequiredStringParam(workItem,"clinicalObject");
			String uId = WorkItemUtil.extractOptionalStringParam(workItem,"uid");
			
			LOGGER.debug("ClinicalObjectWriteHandler.executeWorkItem pId = " + pId + ", uId = " + uId);
			LOGGER.debug("ClinicalObjectWriteHandler.executeWorkItem jsonObject = " + jsonObject);
			
			// This will throw NPE if either is null
			if(pId.isEmpty()) {
				throw new Exception(String.format("pid:%s is empty and invalid!",pId));
			}
			
			if(uId == null) {
				uId = UUID.randomUUID().toString();
			}
			jsonObject = addUid(uId, jsonObject);
			
			MockJDSStore.setValue(pId+":"+uId, jsonObject);
			response = jsonObject;

			LOGGER.debug("ClinicalObjectWriteHandler.executeWorkItem result = " + jsonObject);
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
	 * Add uId to JsonObject
	 * 
	 * 
	 */
	protected String addUid(String uid, String jsonObject) throws EhmpServicesException {
		try {
			JsonParser parser = new JsonParser();
			JsonObject obj = parser.parse(jsonObject).getAsJsonObject();
			JsonElement dataElement = obj.get("data");
			if (dataElement != null && dataElement.getAsJsonObject() != null) {
				dataElement.getAsJsonObject().addProperty("creationDateTime", Instant.now().toString());
			}
			obj.addProperty("status", 200);
			obj.addProperty("uid", uid);
			
			Gson gson = new GsonBuilder().create();
			return gson.toJson(obj);
		}
		catch(Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "JSON parsing exception:" + e.getMessage(), e);
		}
	}	
}