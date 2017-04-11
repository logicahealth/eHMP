package gov.va;

//import java.io.File;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Collection;
//import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.joda.time.DateTime;
//import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * This code will eventually be merged into EhmpServices.  There is a class in there called RdkResourceUtil
 * that this class will eventually be replaced with.  It is more generic and provides better error handling.
 */
public class FOBTServiceHandler implements WorkItemHandler, Closeable,
		Cacheable {

	public FOBTServiceHandler() {
	}

	/** The lab result resource. */
	protected static String labResultResource = "resource/fhir/patient/{pid}/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1";
	protected static String authenticationResource = "resource/authentication/systems/internal";

	/** The lab result query string. */
	protected static String queryString = "&_ack=true";
	protected static String RDK_SESSION_COOKIE_ID = "rdk.sid";

	/** JSON Web Token implementation */
	protected static String rdkJwtId = "X-Set-JWT";
	protected static String rdkJwtPrepend = "Bearer ";

	private static String rdkSessionCookieId = null;
	private static String sessionId = null;
	private static String jwt = null;

	protected static String getSessionId() {
		return sessionId;
	}

	protected static void setSessionId(String sid) {
		System.out.println("SessionId was set to " + sid);
		sessionId = sid;
	}

	protected static String getJwt() {
		return jwt;
	}

	protected static void setJwt(String jwtToSet) {
		System.out.println("JWT was set to " + jwtToSet);
		jwt = jwtToSet;
	}

	protected static HttpHeaders getJbpmAuthenticationHeader() {
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "JBPM");
		return headers;
	}

	protected Boolean establishSession() {
		String resourceUrl = getRDKurl() + authenticationResource;
		try {
			HttpEntity<String> request = new HttpEntity<String>(
					getJbpmAuthenticationHeader());
			ResponseEntity<String> result = getRestTemplate().exchange(
					resourceUrl, HttpMethod.POST, request, String.class);
			HttpStatus resultStatus = result.getStatusCode();
			if (resultStatus.is2xxSuccessful()) {
				Collection<String> cookies = result.getHeaders().get(
						"Set-Cookie");

				Boolean success = false;

				for (String cookie : cookies) {
					// System.out.println(cookie);
					if (cookie.contains(RDK_SESSION_COOKIE_ID)) {
						String[] cookieCrumbles = cookie.split(";");
						if (cookieCrumbles.length > 0) {
							for (String crumble : cookieCrumbles) {
								if (crumble.contains(RDK_SESSION_COOKIE_ID)) {
									String[] sessionIdParts = crumble.split(
											"=", 2);
									if (sessionIdParts.length > 0) {
										rdkSessionCookieId = sessionIdParts[0];
										setSessionId(sessionIdParts[1]);
										success = true;
									}
								}
							}
						}
					}
				}

				Collection<String> jwtHeaders = result.getHeaders().get(rdkJwtId);
				//detect JWT value
				for (String jwtHeader : jwtHeaders) {
					if (jwtHeader.length() > 0) {
						setJwt(jwtHeader);
						return success;
					}
				}

			}
		} catch (RestClientException rce) {
			rce.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

		setSessionId(null);
		setJwt(null);
		return false;
	}

	/**
	 * Gets the restTemplate.
	 *
	 * @return a new restTemplate
	 */
	protected static RestTemplate getRestTemplate() {
		RestTemplate restTemplate = new RestTemplate(
				new SimpleClientHttpRequestFactory());
		return restTemplate;
	}

	/**
	 * Gets the RDK url.
	 *
	 * @return the RDK url string
	 */
	protected static String getRDKurl() {

		System.out.println("getRDKurl");

		String rdkResourceEndpoint = "";
		Properties prop = new Properties();
		String propertiesPath = "";

		File tempFile;
		FileInputStream file = null;

		try {
			tempFile = new File(FOBTServiceHandler.class.getProtectionDomain()
					.getCodeSource().getLocation().toURI().getPath());
			propertiesPath = tempFile.getParent();

			try {
				file = new FileInputStream(propertiesPath
						+ "/rdkconfig.properties");
			} catch (FileNotFoundException e) {
				// if the properties file not found where the jar is, look for
				// it in the project file
				propertiesPath = tempFile.getParentFile().getParent();
				file = new FileInputStream(propertiesPath
						+ "/rdkconfig.properties");
			}
			System.out.println("RDK properties path: " + propertiesPath);
			prop.load(file);
			rdkResourceEndpoint = prop.getProperty("RDK-Protocol") + "://"
					+ prop.getProperty("RDK-IP") + ":"
					+ prop.getProperty("RDK-Port") + "/";
			System.out.println("RDK URL: " + rdkResourceEndpoint);
			file.close();
		} catch (URISyntaxException e2) {
			e2.printStackTrace();
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return rdkResourceEndpoint;
	}

	protected String getRdkResponse(String resourceUrl, boolean isRetry) {

		System.out.println("getRdkResponse" + (isRetry ? " (retry): " : ": ") + resourceUrl);

		String response = new String();

		if (getSessionId() == null || getJwt() == null) {
			if (!establishSession()) {
				// couldn't establish a session..
				return response;
			}
		}

		HttpStatus resultStatus = null;
		ResponseEntity<String> result = null;

		try {
			// response = getRestTemplate().getForObject(resourceUrl,
			// String.class);
			HttpHeaders headers = new HttpHeaders();
			headers.set("Cookie", rdkSessionCookieId.concat("=").concat(getSessionId()));
			headers.set("Authorization", rdkJwtPrepend.concat(getJwt()));
			HttpEntity<String> request = new HttpEntity<String>(headers);
			result = getRestTemplate().exchange(resourceUrl, HttpMethod.GET,
					request, String.class);
			resultStatus = result.getStatusCode();
			if (resultStatus.is2xxSuccessful()) {
				response = result.getBody();
				System.out.println(response);
			}
		} catch (HttpClientErrorException hce) {
			resultStatus = hce.getStatusCode();

			if (resultStatus.equals(HttpStatus.UNAUTHORIZED)) {
				// if 401 UNAUTHORIZED our auth token was likely expired,
				// try to refresh it and give another shot
				// do this only once to avoid an infinite loop
				if (!isRetry) {
					setSessionId(null);
					setJwt(null);
					System.out.println("getRdkResponse received an Unauthorized status, going to establish a new session and invoke again");
					return getRdkResponse(resourceUrl, true);
				}
			} else {
				String messageBody = hce.getResponseBodyAsString();
				System.out.println("ERROR: " + messageBody);
				hce.printStackTrace();
			}
		} catch (RestClientException rce) {
			rce.printStackTrace();
		}
		return response;
	}

	/**
	 * Poll JDS for Lab results
	 *
	 * @return a string
	 */
	public String pollJDSResults(String pid, String orderId) {

		System.out.println("pollJDSResults");

		if((orderId != null) && (orderId.trim().length() > 0)) {
			queryString = queryString.concat("&orderId=").concat(orderId);
		}

		String resourceUrl = getRDKurl().concat(
				labResultResource.replace("{pid}", pid)).concat(queryString);

		LabFHIRResult labResults = null;
		int recordCount = 0;
		String returnString = "No Lab Results";
		String response = getRdkResponse(resourceUrl, false);

		try {
			if (response.indexOf("error") == -1) {

				ObjectMapper mapper = new ObjectMapper();
				labResults = mapper.readValue(response, LabFHIRResult.class);

				recordCount = labResults.getTotal();

				if (recordCount > 0) {

					String type = labResults.getEntry().get(0).getResource()
							.getResourceType();
					String status = labResults.getEntry().get(0).getResource()
							.getStatus();
					if (type.equalsIgnoreCase("DiagnosticReport")
							&& status.equalsIgnoreCase("final")) {

						// check to confirm this is a new result - within a
						// month from today
						String issued = labResults.getEntry().get(0)
								.getResource().getIssued();
						@SuppressWarnings("unused")
						DateTime dateIssued = new DateTime(issued);
						// Confirm that this is a new result - within the last
						// month
						// if(dateIssued.plusMonths(1).isAfterNow()) {

						returnString = response;

						// }
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return returnString;

	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {

		System.out.println("FOBTService.executeWorkItem");
		String pid = (String) workItem.getParameter("pid");
		String orderId = (String) workItem.getParameter("orderId");
		//String orderId = getOrderId();

		//site is for future use
		@SuppressWarnings("unused")
		String site = (String) workItem.getParameter("site");

		String result = pollJDSResults(pid, orderId);

		Map<String, Object> serviceResult = new HashMap<String, Object>();
		serviceResult.put("ServiceResponse", result);
		manager.completeWorkItem(workItem.getId(), serviceResult);

	}

	String getOrderId() {
		String orderId = null;
		//TODO retrieve oderId from vxSync //
		return orderId;
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {

		System.out.println("FOBTService.abortWorkItem");

	}

	@Override
	public void close() {

	}

}
