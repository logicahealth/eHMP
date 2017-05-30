package gov.va;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.CodeSource;
import java.security.ProtectionDomain;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
//import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import vistacore.jbpm.utils.logging.RequestMessageType;



public class CDSInvocationServiceHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(CDSInvocationServiceHandler.class);

	public CDSInvocationServiceHandler() {	
	}	
	
	/** The access string. */
	protected static String CDSInvocationEnvelope = "{\"context\":{\"location\":{\"entityType\":\"Location\",\"id\":\"Location1\",\"name\":\"Test Location\"},\"subject\":{\"entityType\":\"Subject\",\"id\":\"9E7A;129\",\"name\":\"TestSubject\"},\"user\":{\"entityType\":\"User\",\"id\":\"Id1\",\"name\":\"Tester\"}},\"target\":{\"intentsSet\":[\"FitFobtResult\"],\"mode\":\"Normal\",\"type\":\"Direct\"},\"dataModel\":@LabFHIRResult@}";
	
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
	 * Gets the CDS invocation url.
	 *
	 * @return the CDS invocation url string
	 */
	protected static String getCDSInvocationUrl() {
		String cdsInvocationEndpoint = "";
		Properties prop = new Properties();
		String propertiesPath = "";
		
		File tempFile;
		FileInputStream file = null;

		try {
			tempFile = new File(getCDSPath());
			propertiesPath=tempFile.getParent();

			try {
				file = new FileInputStream(propertiesPath+"/cdsconfig.properties");
			} catch (FileNotFoundException e) {
				//if the properties file not found where the jar is, look for it in the project file
				propertiesPath = tempFile.getParentFile().getParent();
				file = new FileInputStream(propertiesPath+"/cdsconfig.properties");
			}
			LOGGER.debug("CDS properties path: " + propertiesPath);
			prop.load(file);
			cdsInvocationEndpoint = prop.getProperty("CDSInvocation-Protocol") + "://" + prop.getProperty("CDSInvocation-IP") + ":"+ prop.getProperty("CDSInvocation-Port") + "/";
			
		} catch (FileNotFoundException e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: File was not found: " + e.getMessage(), e);
		} catch (IOException e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with IO: " + e.getMessage(), e);
		} catch (CDSException e) {
			//Error was already logged
		} catch (Exception e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage(), e);
		}
		
		finally {
			if (file != null) {
				try {
					file.close();
				} catch (IOException e) {
					LOGGER.info("CDSInvocationServiceHandler.getCDSInvocationUrl: Problem closing file handle: " + e.getMessage(), e);
				}
			}
		}
		return cdsInvocationEndpoint;
	}


	private static String getCDSPath() throws CDSException {
		ProtectionDomain protectionDomain = CDSInvocationServiceHandler.class.getProtectionDomain();
		if (protectionDomain == null)
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: protectionDomain cannot be null");
		CodeSource codeSource = protectionDomain.getCodeSource();
		if (codeSource == null)
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: codeSource cannot be null");
		URL location = codeSource.getLocation();
		if (location == null)
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: location cannot be null");
		URI uri;
		try {
			uri = location.toURI();
		} catch (URISyntaxException e) {
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: uri was invalid: " + e.getMessage(), e);
		}
		if (uri == null)
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: uri cannot be null");
		String path = uri.getPath();
		if (path == null)
			throw new CDSException("CDSInvocationServiceHandler.getCDSPath: path cannot be null");
		return path;
	}

	/** 
	 * Invoke CDS to process Lab Results
	 * 
	 * @return String = Normal or Abnormal
	 */
	public String invokeCDS(String LabFHIRResult) {
		LOGGER.debug("CDSInvocationServiceHandler.invokeCDS");
		
		try {
			String cdsInvocationServer = getCDSInvocationUrl() + "cds-results-service/cds/invokeRules";
			
			CDSResponse results = null;
			String jsonFHIRLabResults = CDSInvocationEnvelope.replace("@LabFHIRResult@", LabFHIRResult);
			
			RestTemplate restTemplate = getRestTemplate();
			restTemplate.getMessageConverters().add(new FormHttpMessageConverter());
			HttpHeaders headers = new HttpHeaders();  
			headers.setContentType(MediaType.APPLICATION_JSON);
			
			//Populate X-Request-ID and X-Session-ID from ThreadLocal
			if(MDC.get("requestId")!=null) {
				headers.set("X-Request-ID", (String) MDC.get("requestId"));
				headers.set("X-Session-ID", (String) MDC.get("sid"));
			}
			HttpEntity<String> payload = new HttpEntity<String>(jsonFHIRLabResults, headers);

			//Log the Outgoing Request
			LOGGER.info(RequestMessageType.OUTGOING_REQUEST + " " +  HttpMethod.POST + " " + cdsInvocationServer );
			
			String response = getRestTemplate().postForObject(cdsInvocationServer, payload, String.class);
			ObjectMapper mapper = new ObjectMapper();
			results = mapper.readValue(response, CDSResponse.class);
			String resultStatus = results.getResults().get(1).getBody().getPayload().get(0).getContentString();
			
			if (resultStatus.indexOf("abnormal") > -1) {
				//Log the Incoming Response Error
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE + " Response code: "+
						results.getStatus().getCode()+" - "+	results.getStatus().getHttpStatus());
				return "Abnormal";
			} else {
				//Log the Incoming Response
				LOGGER.info(RequestMessageType.INCOMING_RESPONSE + " " +  response );
				return "Normal";
			}
		} catch (RestClientException e) {  
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with rest: " + e.getMessage(), e);
 		} catch (JsonParseException e) {
 			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with jsonParse: " + e.getMessage(), e);
		} catch (JsonMappingException e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with jsonMapping: " + e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage(), e);
		}

		return "";
	}
	
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("CDSInvocationServiceHandler.executeWorkItem");
		
		try {
			String labFHIRResult = (String) workItem.getParameter("labFHIRResult");
			
			//site is for future use
			@SuppressWarnings("unused")
			String site = (String) workItem.getParameter("site");
			
			String result = invokeCDS(labFHIRResult);
			
			Map<String, Object> serviceResult = new HashMap<String, Object>();	
			serviceResult.put("ServiceResponse", result);
			manager.completeWorkItem(workItem.getId(), serviceResult);
		} catch (Exception e) {
			LOGGER.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage(), e);
		}
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("CDSInvocationServiceHandler.abortWorkItem");
	}
	
	@Override
	public void close() {
	}
}
