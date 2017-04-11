package com.cognitive.cds.invocation.engineplugins;

import com.cognitive.cds.invocation.EngineInstanceStateManagementIFace;
import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
//import org.cogmed.cds.invocation.framework.VMRTransformTest;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:Test-CDSMockTest.xml"})
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)

public class OpenCDSFhirTest{
    
    @Autowired
    ApplicationContext appContext;
    
    @Autowired(required=false)
    private EngineInstanceStateManagementIFace eism;
    
    @Ignore("This is really an integration test")
    @Test
    public void xxtestFhirPayloadAAA(){
    	OpenCDS openCDS = new OpenCDS();
    	openCDS.setEndPoint("http://IPADDRESS:PORT/opencds");
    	List<Rule> rules = new ArrayList<>();
    	Rule rule = new Rule();
    	Properties props = new Properties();
    	props.put("scopingEntityId", "com.cognitive");
    	props.put("businessId", "abdominalAorticAneurysmScreening");
    	props.put("version","1.0.0");
    	rule.setProperties(props);
    	rules.add(rule);
    	String payload = getFhirString("patientObs.json");
    	ResultBundle result = openCDS.invoke(rules, payload, "11111", eism);
    	System.out.println(result.getResults().get(0).getBody());
    	String  body = (String)result.getResults().get(0).getBody();
    	assertTrue(body.contains("CommunicationRequest"));
    	
    }
    @Ignore("This is really an integration test")
    @Test 
    public void xxtestFhirPayloadGender(){
    	OpenCDS openCDS = new OpenCDS();
        openCDS.setEndPoint("http://IPADDRESS:PORT/opencds");

    	List<Rule> rules = new ArrayList<>();
    	Rule rule = new Rule();
    	Properties props = new Properties();
    	props.put("scopingEntityId", "com.cognitive");
    	props.put("businessId", "genderAge");
    	props.put("version","1.0.0");
    	rule.setProperties(props);
    	rules.add(rule);
    	String payload = getFhirString("patientObs.json");
    	
    	ResultBundle result = openCDS.invoke(rules, payload, "11111", eism);
    	System.out.println(result.getResults().get(0).getBody());
    	String  body = (String)result.getResults().get(0).getBody();
    	assertTrue(body.contains("CommunicationRequest"));
     }
    
    @Ignore("This is really an integration test")
    @Test
    public void xtestFhirPayloadHTN(){
    	OpenCDS openCDS = new OpenCDS();
    	openCDS.setEndPoint("http://IPADDRESS:PORT/opencds");
    	List<Rule> rules = new ArrayList<>();
    	Rule rule = new Rule();
    	Properties props = new Properties();
    	props.put("scopingEntityId", "com.cognitive");
    	props.put("businessId", "hypertension");
    	props.put("version","1.0.0");
    	rule.setProperties(props);
    	rules.add(rule);
    	String payload = getFhirString("vitals.json");
    	ResultBundle result = openCDS.invoke(rules, payload, "11111", eism);
    	System.out.println(result.getResults().get(0).getBody());
    	String  body = (String)result.getResults().get(0).getBody();
    	assertTrue(body.contains("CommunicationRequest"));
    }
    private String getFhirString(String file){
	StringBuilder tmp = new StringBuilder();
        try {
            InputStream is = appContext.getResource("classpath:" + file).getInputStream();
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            String sCurrentLine;
            while ((sCurrentLine = br.readLine()) != null) {
				tmp.append(sCurrentLine);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} 
		return tmp.toString();
	}

}
