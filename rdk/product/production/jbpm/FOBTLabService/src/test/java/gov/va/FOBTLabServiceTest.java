package gov.va;

import static org.junit.Assert.*;

import org.junit.Test;
import org.springframework.web.client.RestTemplate;

public class FOBTLabServiceTest {

	FOBTServiceHandler fobtHandler = new FOBTServiceHandler() {

        @Override
        public String pollJDSResults(String pid, String orderId) {

            if ((pid == "1234") && (orderId == "56789")) {
    			return "Found";
    		} else {
            	return "No Lab Results";
            }
    	}
    };


	// This are really integration tests, shouldn't be needed to successfully
	// build and thus commented - set methods to static to use
//	@Test
//	public void testEstablishSession() {
//		Boolean sessionEstablished = FOBTServiceHandler.establishSession();
//		assertTrue(sessionEstablished);
//		assertNotNull(FOBTServiceHandler.getSessionId());
//	}
//
//	@Test
//	public void testGetRdkResponse() {
//		String res = FOBTServiceHandler
//				.getRdkResponse(
//						"http://IP_ADDRESS:PORT/resource/fhir/patient/9E7A;129/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1",
//						false);
//		assertNotNull(res);
//
//		// should have a token now - try to reuse it
//		String res2 = FOBTServiceHandler
//				.getRdkResponse(
//						"http://IP_ADDRESS:PORT/resource/fhir/patient/9E7A;129/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1",
//						false);
//		assertNotNull(res2);
//	}
//
//	@Test
//	public void testGetRdkResponseInvalidToken() {
//		String res = FOBTServiceHandler
//				.getRdkResponse(
//						"http://IP_ADDRESS:PORT/resource/fhir/patient/9E7A;129/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1",
//						false);
//		assertNotNull(res);
//
//		// sabotage our own token - pretend like it expired
//		FOBTServiceHandler
//				.setSessionId("s%3AbxwyKXXsrFGQAiKaoojoU6UphhYMt7mR.LbOT5SKw4UqPTIGiHLnoR3kCXZmIPoyKUpsnOAA4Cp9");
//
//		String res2 = FOBTServiceHandler
//				.getRdkResponse(
//						"http://IP_ADDRESS:PORT/resource/fhir/patient/9E7A;129/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1",
//						false);
//		assertNotNull(res2);
//	}
//
//	@Test
//	public void testGetRdkResponseNoToken() {
//		FOBTServiceHandler.setSessionId(null);
//		String res = FOBTServiceHandler
//				.getRdkResponse(
//						"http://IP_ADDRESS:PORT/resource/fhir/patient/9E7A;129/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1",
//						false);
//		assertNotNull(res);
//	}

	@Test
	public void testgetRDKurl() {
		String rdkUrl = FOBTServiceHandler.getRDKurl();
		assertNotNull(rdkUrl);
	}

	@Test
	public void testgetRestTemplate() {
		RestTemplate restTemplate = FOBTServiceHandler.getRestTemplate();
		assertNotNull(restTemplate);
	}

	@Test
	public void testpollJDSResultsFound() {
		String response = fobtHandler.pollJDSResults("1234", "56789");
		assertNotNull(response);
		assertEquals("Found", response);
	}

	@Test
	public void testpollJDSResultsNotFound() {
		String response = fobtHandler.pollJDSResults("1212", "5656");
		assertNotNull(response);
		assertEquals("No Lab Results", response);
	}

}
