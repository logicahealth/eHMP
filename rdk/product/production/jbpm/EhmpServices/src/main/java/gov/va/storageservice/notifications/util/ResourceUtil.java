package gov.va.storageservice.notifications.util;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.rdk.http.resources.RdkResourceUtil;
import gov.va.ehmp.services.utils.Logging;

public class ResourceUtil extends RdkResourceUtil {
	protected static String notificationsResource = "resource/notifications";
	protected static String notificationsResolveResource = "resource/notifications/id/";

	/**
	 * Invokes the notifications resource on the rdk fetch server and returns the response from that server.
	 * @param notificationId.
	 * @param jsonBody the data to send to the server.
	 * @return The response from the notifications resource.
	 * @throws EhmpServicesException If the server encounters bad data or an unexpected condition.
	 */
	 public String invokePostResource(Object notificationId, String jsonBody) throws EhmpServicesException {
		String resourceUrl = null;
		if (notificationId != null) {
			Logging.debug("invokePostResource to resolve Notification with notificationId = " + notificationId.toString());
			resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG).concat(notificationsResolveResource);
			resourceUrl = resourceUrl + notificationId.toString() + "/resolved";
		} else {
			resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG).concat(notificationsResource);
		}
		return super.invokePostResource(resourceUrl, jsonBody);
	}
}
