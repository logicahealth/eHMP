package gov.va.rdk.http.resources;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Paths;
import java.security.CodeSource;
import java.security.ProtectionDomain;
import java.util.Collection;
import java.util.Properties;

import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import gov.va.clinicalobjectstorageservice.ClinicalObjectWriteHandler;
import gov.va.ehmp.services.exception.EhmpServicesException;
import vistacore.jbpm.utils.logging.RequestMessageType;


public abstract class RdkResourceUtil {
	protected static final String RDK_FETCHSERVER_CONFIG = "rdkconfig.properties";
	protected static final String RDK_WRITEBACKSERVER_CONFIG = "rdkwritebackconfig.properties";
	
	private static final String AUTHENTICATION_RESOURCE = "resource/authentication/systems/internal";
	private static final String RDK_SESSION_COOKIE_ID = "rdk.sid";
	private static final Logger LOGGER = Logger.getLogger(RdkResourceUtil.class);
	
	/** JSON Web Token implementation */
	private static final String RDK_JWT_ID = "X-Set-JWT";
	private static final String RDK_JWT_PREPEND = "Bearer ";
	private static final String X_REQUEST_ID  = "X-Request-ID";
	private static final String X_SESSION_ID  = "X-Session-ID";

	private String rdkSessionCookieId = null;
	private String sessionId = null;
	private String jwt = null;


	/**
	 * Adds the JBPM Authorization Header to the HttpHeaders.
	 * @return
	 */
	private HttpHeaders addJbpmAuthenticationHeader() {
		//Logging.debug("Populating JBPM Authorization");
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "JBPM");
		//Add in X-Request-ID and X-Session-ID headers
		if(MDC.get("requestId") != null) {
			headers.add(X_REQUEST_ID, MDC.get("requestId").toString());
		}
		if(MDC.get("sid") != null) {
			headers.add(X_SESSION_ID, MDC.get("sid").toString());
		}

		return headers;
	}

	/**
	 * Connects to the rdk AUTHENTICATION_RESOURCE.  The sessionId and jwt are populated if they exist.
	 * If it cannot connect, it throws an IllegalStateException.
	 * @return True will be returned if the sessionId was found.  Otherwise false is returned.
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 */
	private boolean establishSession() throws EhmpServicesException {
		String resourceUrl = getRDKUrl(RDK_FETCHSERVER_CONFIG) + AUTHENTICATION_RESOURCE;
		LOGGER.debug("establishSession Establishing Session from: " + resourceUrl);
		
		try {
			HttpEntity<String> request = new HttpEntity<String>(addJbpmAuthenticationHeader());
			LOGGER.debug("establishSession Connecting to: " + resourceUrl);
						
			ResponseEntity<String> result = getRestTemplate().exchange(resourceUrl, HttpMethod.POST, request, String.class);
			HttpStatus resultStatus = result.getStatusCode();
			
			LOGGER.debug("RdkResourceUtil.establishSession resultStatus is: " + resultStatus);
			
			if (resultStatus.is2xxSuccessful()) {
				Collection<String> cookies = result.getHeaders().get("Set-Cookie");
				
				boolean sessionIdFound = false;

				for (String cookie : cookies) {
					if (cookie.contains(RDK_SESSION_COOKIE_ID)) {
						String[] cookieCrumbles = cookie.split(";");
						if (cookieCrumbles.length > 0) {
							for (String crumble : cookieCrumbles) {
								if (crumble.contains(RDK_SESSION_COOKIE_ID)) {
									String[] sessionIdParts = crumble.split("=", 2);
									if (sessionIdParts.length > 0) {
										rdkSessionCookieId = sessionIdParts[0];
										sessionId = sessionIdParts[1];
										LOGGER.debug("RdkResourceUtil.establishSession Found rdkSessionCookieId: " + rdkSessionCookieId + ", sessionId: " + sessionId);
										sessionIdFound = true;
									}
								}
							}
						}
					}
				}
								
				Collection<String> jwtHeaders = result.getHeaders().get(RDK_JWT_ID);
				//detect JWT value
				for (String jwtHeader : jwtHeaders) {
					if (jwtHeader.length() > 0) {
						jwt = jwtHeader;
						LOGGER.debug("establishSession Found jwt: " + jwt);
						return sessionIdFound;
					}
				}
			}
		} catch (Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "Exception: " + e.getMessage(), e);
		}

		sessionId = null;
		jwt = null;
		return false;
	}

	/**
	 * Gets the restTemplate.
	 *
	 * @return a new restTemplate
	 */
	private RestTemplate getRestTemplate() {
		//LOGGER.debug("Getting Rest Template");
		RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());
		return restTemplate;
	}

	/**
	 * Gets the RDK url.
	 *
	 * @return the RDK url string
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions. 
	 */
	protected String getRDKUrl(String configFile) throws EhmpServicesException {
		LOGGER.debug("Getting RDK URL from configFile: " + configFile);
		String rdkResourceEndpoint = "";
		Properties prop = new Properties();
		String propertiesPath = "";

		File tempFile;
		FileInputStream file = null;

		try {
			String path = getPath();
			tempFile = new File(path);
			propertiesPath = tempFile.getParent();
			String filename = "";
			
			try {
				filename = Paths.get(propertiesPath, configFile).toString();
				file = new FileInputStream(filename);
			} catch (FileNotFoundException e) {
				// if the properties file not found where the jar is, look for
				// it in the project file
				propertiesPath = tempFile.getParentFile().getParent();
				String warningMsg = "getRDKUrl Couldn't find rdk config file at '" + filename + "'\nTrying to find it at ";
				filename = propertiesPath + "/" + configFile;
				warningMsg += "'" + filename + "'";
				LOGGER.warn(warningMsg, e);
				file = new FileInputStream(filename);
			}
			
			prop.load(file);
			
			rdkResourceEndpoint = prop.getProperty("RDK-Protocol") + "://"
					+ prop.getProperty("RDK-IP") + ":"
					+ prop.getProperty("RDK-Port") + "/";
		} catch (Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get RDK url. Exception:" + e.getMessage(), e);
		}
		finally {
			if (file != null) {
				try { 
					file.close();
				} catch(Exception e){
					// Do nothing
				}				
			}	
		}

		return rdkResourceEndpoint;
	}

	private String getPath() throws EhmpServicesException {
		ProtectionDomain protectionDomain = ClinicalObjectWriteHandler.class.getProtectionDomain();
		if (protectionDomain == null)
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "protectionDomain was null");
		
		CodeSource codeSource = protectionDomain.getCodeSource();
		if (codeSource == null)
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "codeSource was null");
		
		URL location = codeSource.getLocation();
		if (location == null)
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "location was null");
		
		URI uri = null;
		try {
			uri = location.toURI();
		} catch (Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "uri was invalid");
		}
		if (uri == null)
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "uri was null");
		
		String path = uri.getPath();
		if (path == null)
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "path was null");
		
		return path;
	}
	
	/**
	 * Calls the resourceUrl and returns the data from the body of the POST (passes in the jsonBody as the body of the request)
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 */
	protected String invokePostResource(String resourceUrl, String jsonBody) throws EhmpServicesException {
		return invokeResource(resourceUrl, HttpMethod.POST, jsonBody, false);
	}
	
	/**
	 * Calls the resourceUrl and returns the data from the body of the PUT (passes in the jsonBody as the body of the request)
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 */
	protected String invokePutResource(String resourceUrl, String jsonBody) throws EhmpServicesException {
		return invokeResource(resourceUrl, HttpMethod.PUT, jsonBody, false);
	}
	
	/**
	 * Calls the resourceUrl and returns the data from the body of the GET
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions.
	 */
	protected String invokeGetResource(String resourceUrl) throws EhmpServicesException {
		return invokeResource(resourceUrl, HttpMethod.GET, null, false);
	}
	
	/**
	 * Calls the URL provided with the method type passed in as httpMethod (passing json if it's a POST or a PUT) and returns the response.
	 * 
	 * @param resourceUrl The URL to call.
	 * @param httpMethod How you want to connect, ex. HttpMethod.POST, HttpMethod.PUT, HttpMethod.GET
	 * @param jsonBody If this is a POST or a PUT, this is the JSON that is submitted
	 * @param isRetry If the call fails the first time we try it again.  This is used internally so it doesn't repeat.
	 * @return the response received from making the call.
	 * @throws EhmpServicesException If the server encounters bad data or any unexpected conditions. 
	 */
	private String invokeResource(String resourceUrl, HttpMethod httpMethod, String jsonBody, boolean isRetry) throws EhmpServicesException {
		LOGGER.debug("invokeResource " + (isRetry ? "(retry) " : "") + "Invoking a " + httpMethod + " on the resource: " + resourceUrl);

		//If the thread has a resquestId and a sessionId save those so they can be re-threaded
		Object requestId = MDC.get("requestId");
		Object sid = MDC.get("sid");

		String response = "";

		if (sessionId == null || jwt == null) {
			LOGGER.debug("invokeResource " + (isRetry ? "(retry)" : "") + "sessionId and jwt were null, re-establishing session");
			if (!establishSession()) {
				// couldn't establish a session..
				throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to establish a session"); 
			}
		}

		HttpStatus resultStatus = null;
		ResponseEntity<String> result = null;

		try {
			HttpHeaders headers = new HttpHeaders();
			if (rdkSessionCookieId == null) {
				throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "rdkSessionCookieId was null");
			}
			
			headers.set("Cookie", rdkSessionCookieId.concat("=").concat(sessionId));
			headers.set("Authorization", RDK_JWT_PREPEND.concat(jwt));
			headers.set("Content-Type", "application/json");
			if(requestId != null) {
				headers.set(X_REQUEST_ID,requestId.toString());
			}
			if(sid != null) {
				headers.set(X_SESSION_ID, sid.toString());
			}
			HttpEntity<String> request = null;
			
			//Log the Outgoing Request
			LOGGER.info(RequestMessageType.OUTGOING_REQUEST + " " + httpMethod + " " + resourceUrl );

			if ((httpMethod == HttpMethod.POST || httpMethod == HttpMethod.PUT) && jsonBody != null) {
				request = new HttpEntity<String>(jsonBody, headers);
			}
			else {
				request = new HttpEntity<String>(headers);
			}
						
			result = getRestTemplate().exchange(resourceUrl, httpMethod, request, String.class);
			
			//Retrieve X-Request-ID and X-Session-ID if they exist
			if(result.getHeaders().containsKey(X_REQUEST_ID)) {
				//RDK only has one X-Request-ID entry
				MDC.put("requestId", result.getHeaders().get(X_REQUEST_ID).get(0));
			}
			if(result.getHeaders().containsKey(X_SESSION_ID)) {
				//RDK only has one X-Session-ID entry
				MDC.put("sid", result.getHeaders().get(X_SESSION_ID).get(0));
			}

			resultStatus = result.getStatusCode();
						
			if (resultStatus.is2xxSuccessful()) {				
				response = result.getBody();

				//Log the Incoming Response
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE + " " + response );
			} 
			else {
				//Log the Incoming Response Error
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE + " Response code: "+
						resultStatus.value() + " - " + resultStatus.getReasonPhrase());
			}
			


		} catch (HttpClientErrorException hce) {
			resultStatus = hce.getStatusCode();

			if (resultStatus.equals(HttpStatus.UNAUTHORIZED) && isRetry == false) {
				// if 401 unauthorized our auth token was likely expired,
				// try to refresh it and give another shot
				// do this only once to avoid an infinite loop
				sessionId = null;
				jwt = null;
				return invokeResource(resourceUrl, httpMethod, jsonBody, true);
			} else if (resultStatus.equals(HttpStatus.UNAUTHORIZED)) {
				throw new EhmpServicesException(resultStatus, "HttpAuthorizationException (Caused by HttpClientErrorException " + HttpStatus.UNAUTHORIZED + "): " + hce.getMessage(), hce);
			} else if (resultStatus.equals(HttpStatus.FORBIDDEN)) {
				throw new EhmpServicesException(resultStatus, "HttpAuthorizationException (Caused by HttpClientErrorException " + HttpStatus.FORBIDDEN + "): " + hce.getMessage(), hce);
			} else {
				String messageBody = hce.getResponseBodyAsString();
				throw new EhmpServicesException(resultStatus, "HttpRuntimeException (Caused by HttpClientErrorException " + resultStatus + "): " + hce.getMessage() + ", messageBody: " + messageBody, hce);
			}
		} catch (RestClientException rce) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "HttpRuntimeException (Caused by RestClientException): " + rce.getMessage(), rce);
		} catch (Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, "HttpRuntimeException (Caused by Exception): " + e.getMessage(), e);
		}
		finally {
			if(requestId != null){
				MDC.put("requestId", requestId);
			}
			if(sid != null){
				MDC.put("sid", sid);
			}
		}
		return response;
	}

}
