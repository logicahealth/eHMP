package gov.va.clinicalobjectstorageservice.util;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.rdk.http.resources.RdkResourceUtil;

public class ResourceUtil extends RdkResourceUtil {
	protected static String writeClinicalObjectResource = "resource/write-health-data/patient/{pid}/clinical-objects";
	protected static String readOrUpdateClinicalObjectResource = "resource/write-health-data/patient/{pid}/clinical-objects/{uid}";

	/**
	 * Invokes the write clinical objects resource on the rdk writeback server and returns the response from that server.
	 * 
	 * @param jsonBody the data to send to the server.
	 * @param pid the pid to send to the server.
	 * @return The response from the write clinical objects resource.
	 * @throws EhmpServicesException If the server encounters bad data or an unexpected condition.
	 */
	public String invokePostResource(String jsonBody, String pid) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_WRITEBACKSERVER_CONFIG).concat(writeClinicalObjectResource.replace("{pid}", pid));
		return super.invokePostResource(resourceUrl, jsonBody);
	}

	/**
	 * Invokes the update clinical objects resource on the rdk writeback server and returns the response from that server.
	 * 
	 * @param jsonBody the data to send to the server.
	 * @param pid the pid to send to the server.
	 * @param uid the uid to send to the server.
	 * @return The response from the update clinical objects resource.
	 * @throws EhmpServicesException
	 */
	public String invokePutResource(String jsonBody, String pid, String uid) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_WRITEBACKSERVER_CONFIG).concat(readOrUpdateClinicalObjectResource.replace("{pid}", pid).replace("{uid}", uid));
		return super.invokePutResource(resourceUrl, jsonBody);
	}

	/**
	 * Invokes the read clinical objects resource on the rdk writeback server and returns the response from that server.
	 * 
	 * @param pid the pid to send to the server.
	 * @param uid the uid to send to the server.
	 * @return The response from the read clinical objects resource.
	 * @throws EhmpServicesException
	 */
	public String invokeGetResource(String pid, String uid) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_WRITEBACKSERVER_CONFIG).concat(readOrUpdateClinicalObjectResource.replace("{pid}", pid).replace("{uid}", uid));
		return super.invokeGetResource(resourceUrl);
	}
}
