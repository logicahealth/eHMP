package gov.va.patientpcmmteaminfo.util;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.rdk.http.resources.RdkResourceUtil;

public class PcmmTeamInfoResourceUtil extends RdkResourceUtil {
	protected static String patientSearchEndpoint = "resource/patient-search/pid?pid={pid}";

	public String invokeGetResource(String pid) throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG).concat(patientSearchEndpoint.replace("{pid}", pid));
		return super.invokeGetResource(resourceUrl);
	}
}
