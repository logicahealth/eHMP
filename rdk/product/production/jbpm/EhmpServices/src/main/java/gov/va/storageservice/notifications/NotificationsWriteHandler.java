package gov.va.storageservice.notifications;

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
import gov.va.ehmp.services.utils.Logging;
import gov.va.kie.utils.WorkItemUtil;
import gov.va.storageservice.notifications.util.ResourceUtil;

public class NotificationsWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		Logging.debug("NotificationsWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts/Resolves the notification (contained in a parameter of the WorkItem called 'notification')
	 * to the Notifications API and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			Logging.info("Entering NotificationsWriteHandler.executeWorkItem");
			
			String result = null;
			ResourceUtil resUtil = new ResourceUtil();
			String notification = WorkItemUtil.extractRequiredStringParam(workItem, "notification");
			Object notificationId = workItem.getParameter("notificationId");
			
			Logging.debug("NotificationsWriteHandler.executeWorkItem with notification = " + notification);
			result = resUtil.invokePostResource(notificationId, notification);
			
			Logging.debug("NotificationsWriteHandler.executeWorkItem result = " + result);
			
			response = transformResult(result);
			
			Logging.debug("NotificationsWriteHandler.executeWorkItem response = " + response);
		} catch (EhmpServicesException e) {
			response = e.toJsonString();
		} catch (Exception e) {
			Logging.error("NotificationsWriteHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage());
			response = ErrorResponseUtil.create(HttpStatus.INTERNAL_SERVER_ERROR, "NotificationsWriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
	}

	/*
	 * Transform Notification Storage API response
	 * 
	 * 
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 * */
	protected String transformResult(String result) throws EhmpServicesException {
		String response = "";
		if (result != null && !result.isEmpty()) {
			JsonParser parser = new JsonParser();
			
			JsonObject obj = null;
			try {
				obj = parser.parse(result).getAsJsonObject();
				Logging.debug("NotificationsWriteHandler.transformResult json parsed");
			}
			catch(Exception e) {
				throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "JSON parsing exception:" + e.getMessage(), e);
			}

			JsonObject outputObj = new JsonObject();
			outputObj.addProperty("status", 200);
			
			String notificationid = "";
			JsonElement dataElement = obj.get("data");
			if (dataElement != null && dataElement.isJsonObject()) {
				Logging.debug("NotificationsWriteHandler.transformResult Found data element");
				JsonElement notificationElement = dataElement.getAsJsonObject().get("notificationid");
				if (notificationElement != null && notificationElement.isJsonPrimitive()) {
					notificationid = notificationElement.getAsString();
					Logging.debug("NotificationsWriteHandler.transformResult notificationid = " + notificationid);
				}
			}
			outputObj.addProperty("notificationid", notificationid);
			
			Gson gson = new GsonBuilder().create();
			response = gson.toJson(outputObj);
		}
		Logging.debug("NotificationsWriteHandler.transformResult response = " + response);
		return response;
	}	
}
