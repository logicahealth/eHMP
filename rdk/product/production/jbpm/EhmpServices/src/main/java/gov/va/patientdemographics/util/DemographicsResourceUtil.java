package gov.va.patientdemographics.util;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.rdk.http.resources.RdkResourceUtil;

public class DemographicsResourceUtil extends RdkResourceUtil {

	protected static String getPatientDemographics = "resource/patient/record/domain/demographics?pid={pid}&filter=not(ilike(\"pid\",\"HDR%25\"),ilike(\"pid\",\"VLER%25\"),ilike(\"pid\",\"DOD%25\"))";
																										   
	/**
	 * Invokes the get patient domain resource on the RDK fetch server and returns the response from that server.
	 * 
	 * @param pid the pid to send to the server.
	 * @return The response from the get patient domain resource.
	 * @throws EhmpServicesException
	 */
	public String invokeGetResource(String pid) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG).concat(getPatientDemographics.replace("{pid}", pid));
		return super.invokeGetResource(resourceUrl);
	}

}
