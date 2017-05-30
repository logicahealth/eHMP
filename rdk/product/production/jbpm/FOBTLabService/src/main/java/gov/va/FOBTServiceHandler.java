package gov.va;

//import java.io.File;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.security.CodeSource;
import java.security.ProtectionDomain;
import java.util.Collection;
//import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
import org.joda.time.DateTime;
//import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import vistacore.jbpm.utils.logging.RequestMessageType;

/**
 * This code will eventually be merged into EhmpServices.  There is a class in there called RdkResourceUtil
 * that this class will eventually be replaced with.  It is more generic and provides better error handling.
 */
public class FOBTServiceHandler implements WorkItemHandler, Closeable, Cacheable {

	public FOBTServiceHandler() {
	}

	/** The lab result resource. */
	protected static String labResultResource = "resource/fhir/patient/{pid}/diagnosticreport?domain=lab&name=OCCULT BLOOD&_sort:desc=date&_count=1";
	protected static String authenticationResource = "resource/authentication/systems/internal";
	private static final Logger LOGGER = Logger.getLogger(FOBTServiceHandler.class);
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
		LOGGER.debug("SessionId was set to " + sid);
		sessionId = sid;
	}

	protected static String getJwt() {
		return jwt;
	}

	protected static void setJwt(String jwtToSet) {
		LOGGER.debug("JWT was set to " + jwtToSet);
		jwt = jwtToSet;
	}

	protected static HttpHeaders getJbpmAuthenticationHeader() {
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "JBPM");
		return headers;
	}

	protected Boolean establishSession() throws FOBTException {
		String resourceUrl = getRDKurl() + authenticationResource;
		try {
			HttpEntity<String> request = new HttpEntity<String>(getJbpmAuthenticationHeader());
			ResponseEntity<String> result = getRestTemplate().exchange(resourceUrl, HttpMethod.POST, request, String.class);
			HttpStatus resultStatus = result.getStatusCode();
			if (resultStatus.is2xxSuccessful()) {
				Collection<String> cookies = result.getHeaders().get("Set-Cookie");

				Boolean success = false;

				for (String cookie : cookies) {
					// LOGGER.debug(cookie);
					if (cookie.contains(RDK_SESSION_COOKIE_ID)) {
						String[] cookieCrumbles = cookie.split(";");
						if (cookieCrumbles.length > 0) {
							for (String crumble : cookieCrumbles) {
								if (crumble.contains(RDK_SESSION_COOKIE_ID)) {
									String[] sessionIdParts = crumble.split("=", 2);
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
			throw new FOBTException("FOBTServiceHandler.establishSession: rest client exception: " + rce.getMessage(), rce);
		} catch (Exception e) {
			throw new FOBTException("FOBTServiceHandler.establishSession: An unexpected condition has happened: " + e.getMessage(), e);
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
		RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());
		return restTemplate;
	}

	/**
	 * Gets the RDK url.
	 *
	 * @return the RDK url string
	 */
	protected static String getRDKurl() {
		LOGGER.debug("getRDKurl");

		String rdkResourceEndpoint = "";
		Properties prop = new Properties();
		String propertiesPath = "";

		File tempFile;
		FileInputStream file = null;

		try {
			tempFile = new File(getFOBTPath());
			propertiesPath = tempFile.getParent();

			try {
				file = new FileInputStream(propertiesPath + "/rdkconfig.properties");
			} catch (FileNotFoundException e) {
				// if the properties file not found where the jar is, look for
				// it in the project file
				propertiesPath = tempFile.getParentFile().getParent();
				file = new FileInputStream(propertiesPath + "/rdkconfig.properties");
			}
			LOGGER.debug("RDK properties path: " + propertiesPath);
			prop.load(file);
			rdkResourceEndpoint = prop.getProperty("RDK-Protocol") + "://"
					+ prop.getProperty("RDK-IP") + ":"
					+ prop.getProperty("RDK-Port") + "/";
			LOGGER.debug("RDK URL: " + rdkResourceEndpoint);
		} catch (FileNotFoundException e) {
			LOGGER.error("FOBTServiceHandler.getRDKurl: File was not found: " + e.getMessage(), e);
		} catch (IOException e) {
			LOGGER.error("FOBTServiceHandler.getRDKurl: An unexpected condition has happened with IO: " + e.getMessage(), e);
		} catch (FOBTException e) {
			//Error was already logged
		} catch (Exception e) {
			LOGGER.error("FOBTServiceHandler.getRDKurl: An unexpected condition has happened: " + e.getMessage(), e);
		}
		
		finally {
			if (file != null) {
				try {
					file.close();
				} catch (IOException e) {
					LOGGER.info("FOBTServiceHandler.getRDKurl: Problem closing file handle: " + e.getMessage(), e);
				}
			}
		}

		return rdkResourceEndpoint;
	}

	private static String getFOBTPath() throws FOBTException {
		ProtectionDomain protectionDomain = FOBTServiceHandler.class.getProtectionDomain();
		if (protectionDomain == null)
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: protectionDomain cannot be null");
		CodeSource codeSource = protectionDomain.getCodeSource();
		if (codeSource == null)
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: codeSource cannot be null");
		URL location = codeSource.getLocation();
		if (location == null)
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: location cannot be null");
		URI uri;
		try {
			uri = location.toURI();
		} catch (Exception e) {
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: uri was invalid: " + e.getMessage(), e);
		}
		if (uri == null)
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: uri cannot be null");
		String path = uri.getPath();
		if (path == null)
			throw new FOBTException("FOBTServiceHandler.getFOBTPath: path cannot be null");
		return path;
	}

	protected String getRdkResponse(String resourceUrl, boolean isRetry) throws FOBTException {
		LOGGER.debug("getRdkResponse" + (isRetry ? " (retry): " : ": ") + resourceUrl);

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
			if(MDC.get("requestId")!=null) {
				headers.set("X-Request-ID", (String) MDC.get("requestId"));
				headers.set("X-Session-ID", (String) MDC.get("sid"));
			}
			HttpEntity<String> request = new HttpEntity<String>(headers);
			
			//Log the Outgoing Request
			LOGGER.info(RequestMessageType.OUTGOING_REQUEST + " " +  HttpMethod.GET  + " " + resourceUrl );
						
			result = getRestTemplate().exchange(resourceUrl, HttpMethod.GET, request, String.class);
			resultStatus = result.getStatusCode();

			if (resultStatus.is2xxSuccessful()) {
				response = result.getBody();

				//Log the Incoming Response
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE + " " + response );
			}
			else {
				//Log the Incoming Response Error
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE +  " Response code: " +
						resultStatus.value() + " - "+	resultStatus.getReasonPhrase());
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
					LOGGER.debug("getRdkResponse received an Unauthorized status, going to establish a new session and invoke again");
					return getRdkResponse(resourceUrl, true);
				}
			} else {
				String messageBody = hce.getResponseBodyAsString();
				throw new FOBTException("FOBTServiceHandler.getRdkResponse: ERROR: " + messageBody);
			}
		} catch (RestClientException rce) {
			throw new FOBTException("FOBTServiceHandler.getRdkResponse: problem with rest: " + rce.getMessage(), rce);
		}
		return response;
	}

	/**
	 * Poll JDS for Lab results
	 *
	 * @return a string
	 */
	public String pollJDSResults(String pid, String orderId) {
		LOGGER.debug("pollJDSResults");
		String returnString = "No Lab Results";
		
		try {
			if ((orderId != null) && (orderId.trim().length() > 0)) {
				queryString = queryString.concat("&orderId=").concat(orderId);
			}
	
			String resourceUrl = getRDKurl().concat(labResultResource.replace("{pid}", pid)).concat(queryString);
	
			LabFHIRResult labResults = null;
			int recordCount = 0;
			String response = getRdkResponse(resourceUrl, false);

			if (response.indexOf("error") == -1) {

				ObjectMapper mapper = new ObjectMapper();
				labResults = mapper.readValue(response, LabFHIRResult.class);
				recordCount = labResults.getTotal();

				if (recordCount > 0) {
					String type = labResults.getEntry().get(0).getResource().getResourceType();
					String status = labResults.getEntry().get(0).getResource().getStatus();
					if (type.equalsIgnoreCase("DiagnosticReport") && status.equalsIgnoreCase("final")) {
						// check to confirm this is a new result - within a
						// month from today
						String issued = labResults.getEntry().get(0).getResource().getIssued();
						@SuppressWarnings("unused")
						DateTime dateIssued = new DateTime(issued);
						// Confirm that this is a new result - within the last month
						// if (dateIssued.plusMonths(1).isAfterNow()) {
						returnString = response;
						// }
					}
				}
			}
		} catch (FOBTException e) {
			//Error was already logged
		} catch (Exception e) {
			LOGGER.error("FOBTServiceHandler.pollJDSResults: An unexpected condition has happened: " + e.getMessage(), e);
		}

		return returnString;

	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("FOBTService.executeWorkItem");
		try {
			String pid = (String) workItem.getParameter("pid");
			String orderId = (String) workItem.getParameter("orderId");

			//site is for future use
			@SuppressWarnings("unused")
			String site = (String) workItem.getParameter("site");

			String result = pollJDSResults(pid, orderId);

			Map<String, Object> serviceResult = new HashMap<String, Object>();
			serviceResult.put("ServiceResponse", result);
			manager.completeWorkItem(workItem.getId(), serviceResult);
		} catch (Exception e) {
			LOGGER.error("FOBTServiceHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage(), e);
		}
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("FOBTService.abortWorkItem");
	}

	@Override
	public void close() {
	}
}
