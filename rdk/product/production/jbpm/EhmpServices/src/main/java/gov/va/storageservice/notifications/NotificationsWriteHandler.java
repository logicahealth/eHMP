package gov.va.storageservice.notifications;

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
import gov.va.storageservice.notifications.util.ResourceUtil;

public class NotificationsWriteHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(NotificationsWriteHandler.class);
	public void close() {
		//Ignored
	}
	
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("NotificationsWriteHandler.abortWorkItem has been called");
	}
	
	/**
	 * Posts/Resolves the notification (contained in a parameter of the WorkItem called 'notification')
	 * to the Notifications API and then completes the WorkItem (the response is contained in ServiceResponse).
	 */
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			LOGGER.info("Entering NotificationsWriteHandler.executeWorkItem");
			
			String result = null;
			ResourceUtil resUtil = new ResourceUtil();
			String notification = WorkItemUtil.extractRequiredStringParam(workItem, "notification");
			Object notificationId = workItem.getParameter("notificationId");
			
			LOGGER.debug(String.format("NotificationsWriteHandler.executeWorkItem with notification = %s", notification));
			result = resUtil.invokePostResource(notificationId, notification);
			
			LOGGER.debug(String.format("NotificationsWriteHandler.executeWorkItem result = %s", result));
			
			response = transformResult(result);
			
			LOGGER.debug(String.format("NotificationsWriteHandler.executeWorkItem response = %s", response));
		} catch (EhmpServicesException e) {
			LOGGER.error(e.getMessage(), e);
			response = e.createJsonErrorResponse();
		} catch (Exception e) {
			LOGGER.error(String.format("NotificationsWriteHandler.executeWorkItem: An unexpected condition has happened: %s", e.getMessage()), e);
			response = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "NotificationsWriteHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
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
				LOGGER.debug("NotificationsWriteHandler.transformResult json parsed");
			}
			catch(Exception e) {
				throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "JSON parsing exception:" + e.getMessage(), e);
			}

			JsonObject outputObj = new JsonObject();
			outputObj.addProperty("status", 200);
			
			String notificationid = "";
			JsonElement dataElement = obj.get("data");
			if (dataElement != null && dataElement.isJsonObject()) {
				LOGGER.debug("NotificationsWriteHandler.transformResult Found data element");
				JsonElement notificationElement = dataElement.getAsJsonObject().get("notificationid");
				if (notificationElement != null && notificationElement.isJsonPrimitive()) {
					notificationid = notificationElement.getAsString();
					LOGGER.debug(String.format("NotificationsWriteHandler.transformResult notificationid = %s", notificationid));
				}
			}
			outputObj.addProperty("notificationid", notificationid);
			
			Gson gson = new GsonBuilder().create();
			response = gson.toJson(outputObj);
		}
		LOGGER.debug(String.format("NotificationsWriteHandler.transformResult response = %s", response));
		return response;
	}	
}
