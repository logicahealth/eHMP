package gov.va;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.jboss.logging.Logger;
import org.jboss.logging.MDC;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import vistacore.jbpm.utils.logging.RequestMessageType;



public class CDSInvocationServiceHandler implements WorkItemHandler, Closeable, Cacheable {
	private static final Logger LOGGER = Logger.getLogger(CDSInvocationServiceHandler.class);
	private static final String CDS_CONFIG = "cdsconfig.properties";
	private static final String CDS_PROTOCOL = "CDSInvocation-Protocol";
	private static final String CDS_IP = "CDSInvocation-IP";
	private static final String CDS_PORT = "CDSInvocation-Port";
	private static final String CDS_INVOKE_RULES_PATH = "cds-results-service/cds/invokeRules";

	public CDSInvocationServiceHandler() {	
	}	
	
	/** The access string. */
	protected static String CDSInvocationEnvelope = "{\"context\":{\"location\":{\"entityType\":\"Location\",\"id\":\"Location1\",\"name\":\"Test Location\"},\"subject\":{\"entityType\":\"Subject\",\"id\":\"SITE;129\",\"name\":\"TestSubject\"},\"user\":{\"entityType\":\"User\",\"id\":\"Id1\",\"name\":\"Tester\"}},\"target\":{\"intentsSet\":[\"FitFobtResult\"],\"mode\":\"Normal\",\"type\":\"Direct\"},\"dataModel\":@LabFHIRResult@}";
	
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
		return CDSPropertiesLoaderInnerClass.getProperty(CDS_PROTOCOL) + "://" 
				+ CDSPropertiesLoaderInnerClass.getProperty(CDS_IP) + ":"
				+ CDSPropertiesLoaderInnerClass.getProperty(CDS_PORT) + "/";
	}

	/** 
	 * Invoke CDS to process Lab Results
	 * 
	 * @return String = Normal or Abnormal
	 */
	public String invokeCDS(String LabFHIRResult) {
		LOGGER.debug("CDSInvocationServiceHandler.invokeCDS");
		
		try {
			String cdsInvocationServer = getCDSInvocationUrl() + CDS_INVOKE_RULES_PATH;
			
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
	
	/**
	 * Inner class to remain static for dealing with the properties
	 */
	private static final class CDSPropertiesLoaderInnerClass {
		private static final Properties cdsProperties = new Properties();
		private static final Logger LOGGER = Logger.getLogger(CDSPropertiesLoaderInnerClass.class);
		static {
			try {
				LOGGER.debug(String.format("Loading Properties files; %s",CDS_CONFIG));
				cdsProperties.load(CDSPropertiesLoaderInnerClass.class.getClassLoader().getResourceAsStream(CDS_CONFIG));
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}

		/**
		 * Pulls a property from the properties based on the original file name
		 * @return String
		 */
		public static final String getProperty(String prop) {
			return cdsProperties.getProperty(prop);
		}
	}
}
