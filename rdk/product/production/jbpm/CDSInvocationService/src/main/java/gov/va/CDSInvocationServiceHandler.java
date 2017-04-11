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
import java.net.URISyntaxException;
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
	    	tempFile = new File(CDSInvocationServiceHandler.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
			propertiesPath=tempFile.getParent();

	    	try {
				file = new FileInputStream(propertiesPath+"/cdsconfig.properties");
			} catch (FileNotFoundException e) {
				//if the properties file not found where the jar is, look for it in the project file
				propertiesPath = tempFile.getParentFile().getParent();
	    		file = new FileInputStream(propertiesPath+"/cdsconfig.properties");
	    	}
	    	System.out.println("CDS properties path: " + propertiesPath);
			prop.load(file);
			cdsInvocationEndpoint = prop.getProperty("CDSInvocation-Protocol") + "://" + prop.getProperty("CDSInvocation-IP") + ":"+ prop.getProperty("CDSInvocation-Port") + "/";
			file.close();
	    } catch (URISyntaxException e2) {
			e2.printStackTrace();
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();			
		}
		return cdsInvocationEndpoint;
	}
	

	/** 
	 * Invoke CDS to process Lab Results
	 * 
	 * @return String = Normal or Abnormal
	 */
	public String invokeCDS(String LabFHIRResult) {
		
		System.out.println("CDSInvocationServiceHandler.invokeCDS");
		
		String cdsInvocationServer = getCDSInvocationUrl() + "cds-results-service/cds/invokeRules";
		
		CDSResponse results = null;
		String jsonFHIRLabResults = CDSInvocationEnvelope.replace("@LabFHIRResult@", LabFHIRResult);
		
        RestTemplate restTemplate = getRestTemplate();
        restTemplate.getMessageConverters().add(new FormHttpMessageConverter());  
        HttpHeaders headers = new HttpHeaders();  
        headers.setContentType(MediaType.APPLICATION_JSON);  
        String resultStatus = null;
        try {
        	
        	HttpEntity<String> payload = new HttpEntity<String>(jsonFHIRLabResults,  headers);
            String response = getRestTemplate().postForObject(cdsInvocationServer, payload, String.class);             
            ObjectMapper mapper = new ObjectMapper();
            results = mapper.readValue(response, CDSResponse.class);
            resultStatus = results.getResults().get(1).getBody().getPayload().get(0).getContentString();
            
        } catch (RestClientException re) {  
        	re.printStackTrace();
 		} catch (JsonParseException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

        if (resultStatus.indexOf("abnormal") > -1) {
			return "Abnormal";
		} else {
        	return "Normal";
        }
		
	}
	
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		
			System.out.println("CDSInvocationServiceHandler.executeWorkItem");
			
			String labFHIRResult = (String) workItem.getParameter("labFHIRResult");
			
			//site is for future use
			@SuppressWarnings("unused")
			String site = (String) workItem.getParameter("site");
			
			String result = invokeCDS(labFHIRResult);
							
			Map<String, Object> serviceResult = new HashMap<String, Object>();	
			serviceResult.put("ServiceResponse", result);
			manager.completeWorkItem(workItem.getId(), serviceResult);
		
	}

	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		
		System.out.println("CDSInvocationServiceHandler.abortWorkItem");
	
	}
	
	@Override
	public void close() {
			
	}
	
}
