package gov.va.storageservice.notifications.util;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.rdk.http.resources.RdkResourceUtil;

public class ResourceUtil extends RdkResourceUtil {
	protected static String notificationsResource = "resource/notifications";

	/**
	 * Invokes the notifications resource on the rdk fetch server and returns the response from that server.
	 * @param jsonBody the data to send to the server.
	 * @return The response from the notifications resource.
	 * @throws EhmpServicesException If the server encounters bad data or an unexpected condition.
	 */
	public String invokePostResource(String jsonBody) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG).concat(notificationsResource);
		return invokePostResource(resourceUrl, jsonBody);
	}
}
