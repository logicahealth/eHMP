package gov.va;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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



public class CDSInvocationServiceHandler implements WorkItemHandler, Closeable, Cacheable {

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
			CDSLogging.debug("CDS properties path: " + propertiesPath);
			prop.load(file);
			cdsInvocationEndpoint = prop.getProperty("CDSInvocation-Protocol") + "://" + prop.getProperty("CDSInvocation-IP") + ":"+ prop.getProperty("CDSInvocation-Port") + "/";
			
		} catch (FileNotFoundException e) {
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: File was not found: " + e.getMessage());
		} catch (IOException e) {
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with IO: " + e.getMessage());
		} catch (CDSException e) {
			//Error was already logged
		} catch (Exception e) {
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage());
		}
		
		finally {
			if (file != null) {
				try {
					file.close();
				} catch (IOException e) {
					CDSLogging.info("CDSInvocationServiceHandler.getCDSInvocationUrl: Problem closing file handle: " + e.getMessage());
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
		CDSLogging.debug("CDSInvocationServiceHandler.invokeCDS");
		
		try {
			String cdsInvocationServer = getCDSInvocationUrl() + "cds-results-service/cds/invokeRules";
			
			CDSResponse results = null;
			String jsonFHIRLabResults = CDSInvocationEnvelope.replace("@LabFHIRResult@", LabFHIRResult);
			
			RestTemplate restTemplate = getRestTemplate();
			restTemplate.getMessageConverters().add(new FormHttpMessageConverter());
			HttpHeaders headers = new HttpHeaders();  
			headers.setContentType(MediaType.APPLICATION_JSON);
			HttpEntity<String> payload = new HttpEntity<String>(jsonFHIRLabResults, headers);
			String response = getRestTemplate().postForObject(cdsInvocationServer, payload, String.class);
			ObjectMapper mapper = new ObjectMapper();
			results = mapper.readValue(response, CDSResponse.class);
			String resultStatus = results.getResults().get(1).getBody().getPayload().get(0).getContentString();
			
			if (resultStatus.indexOf("abnormal") > -1) {
				return "Abnormal";
			} else {
				return "Normal";
			}
		} catch (RestClientException e) {  
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with rest: " + e.getMessage());
 		} catch (JsonParseException e) {
 			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with jsonParse: " + e.getMessage());
		} catch (JsonMappingException e) {
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened with jsonMapping: " + e.getMessage());
		} catch (Exception e) {
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage());
		}

		return "";
	}
	
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		CDSLogging.debug("CDSInvocationServiceHandler.executeWorkItem");
		
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
			CDSLogging.error("CDSInvocationServiceHandler.getCDSInvocationUrl: An unexpected condition has happened: " + e.getMessage());
		}
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		CDSLogging.debug("CDSInvocationServiceHandler.abortWorkItem");
	}
	
	@Override
	public void close() {
	}
}
