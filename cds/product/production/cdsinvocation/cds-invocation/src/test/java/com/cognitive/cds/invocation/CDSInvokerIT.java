/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
package com.cognitive.cds.invocation;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.cxf.helpers.IOUtils;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.crs.CRSResolver;
import com.cognitive.cds.invocation.execution.model.Coding;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisite;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisites;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.FhirUtils;

import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.dstu2.composite.CodeableConceptDt;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.composite.QuantityDt;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.valueset.ObservationStatusEnum;
import ca.uhn.fhir.model.primitive.DecimalDt;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.parser.XmlParser;

/**
 *
 * @author tnguyen
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:crs-cdsinvoke-context.xml" })
public class CDSInvokerIT {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CDSInvokerIT.class);

    @Autowired
    @Qualifier("cdsInvoker")
	CDSInvoker instance;
        
    @Autowired
    @Qualifier("crsResolver")
    CRSResolver resolver;
	
	
    /**
     * Test of invoke method, of class CDSInvoker.
     * This test will be processing a sample INTENT, with calls to CRS, RDK, and OPENCDS services.     
     * 
     */
    @Ignore
    @Test
    public void testInvokeRheu() {
        System.out.println("========== testInvokeRheu ===============");

        // ------- PREPING Invocation Target with no extra parameters and inputDataModel -------
        InvocationTarget invocationTarget = new InvocationTarget();
        invocationTarget.setMode(InvocationMode.Normal);
        invocationTarget.setType(InvocationType.Direct);
        
        List<String> intents = new ArrayList<>();
        intents.add("RheumatologyConsultScreen");
        invocationTarget.setIntentsSet(intents);
        
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SITE;140"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        
		Map<String, Object> parameters = null;
        Object inputDataModel = null;
        
        
        ResultBundle resultB = instance.invoke(invocationTarget, context, parameters, inputDataModel);

        log.info("DONE - total results = "+ resultB.getResults().size());
        
        if (resultB.getResults().size() > 0) {
        	
            ConsultPrerequisites cr = (ConsultPrerequisites) resultB.getResults().get(0).getBody();

	        // PARSE AND CHECK FINAL BUNDLE
	        IParser parser = FhirUtils.newJsonParser().setPrettyPrint(true);
	        String outstr = parser.encodeResourceToString((Observation) cr.getPrerequisites().get(0).getDetail());
	        log.info("\n\n Printing one returned Observation for RheumatologyConsultScreen:\n" + outstr);
	        
        } else {
        	log.info("No Observations from Rules!");
        }


    }

    @Ignore
    @Test
    public void testInvokePT() {
        System.out.println("========== testInvokePT ===============");

       
        // ------- PREPING Invocation Target with no extra parameters and inputDataModel -------
        InvocationTarget invocationTarget = new InvocationTarget();
        invocationTarget.setMode(InvocationMode.Normal);
        invocationTarget.setType(InvocationType.Direct);
        
        List<String> intents = new ArrayList<>();
        intents.add("PTConsultScreen");
        invocationTarget.setIntentsSet(intents);
        
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SITE;140"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        
		Map<String, Object> parameters = null;
        Object inputDataModel = null;
        
        
        ResultBundle result = instance.invoke(invocationTarget, context, parameters, inputDataModel);
        

        log.info("DONE - total results = "+ result.getResults().size());

    }

    
    
    
    /**
     * Test of invoke method, of class CDSInvoker.
     */
    @Ignore
    @Test
    public void testInvokeWithPriorProps() {
        System.out.println("========== testInvokeWithPriorProps ===============");

       
        // ------- PREPING Invocation Target with no extra parameters and inputDataModel -------
        InvocationTarget invocationTarget = new InvocationTarget();
        invocationTarget.setMode(InvocationMode.Normal);
        invocationTarget.setType(InvocationType.Direct);
        
        List<String> intents = new ArrayList<>();
        intents.add("RheumatologyConsultScreen");
        invocationTarget.setIntentsSet(intents);
        
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SITE;140"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        
		Map<String, Object> parameters = new HashMap<>();
        Object inputDataModel = null;
        
        
        
		Observation obs = new Observation();
		// Needed: Code, status,
		CodeableConceptDt code = new CodeableConceptDt();
		CodingDt codeDt = new CodingDt();
		codeDt.setCode("29463-7");
		codeDt.setSystem("http://loinc.org");
		code.getCoding().add(codeDt);
		obs.setCode(code);
		obs.setStatus(ObservationStatusEnum.PRELIMINARY);

		// Useful: issued, value
		obs.setComments("Comment");
		Date now = new Date(System.currentTimeMillis());
		obs.setIssuedWithMillisPrecision(now);
		QuantityDt qdt = new QuantityDt();
		qdt.setCode("Pounds");
		DecimalDt theValue = new DecimalDt(180.5);
		qdt.setValue(theValue);
		obs.setValue(qdt);

		parameters.put("Weight", obs);
        
        ResultBundle result = instance.invoke(invocationTarget, context, parameters, inputDataModel);
        
        log.info("DONE");
    }
        
        
    @Ignore("untested")
    @Test
    public void testInvokeWithEmptyIntentTarget() {
        System.out.println("========== testInvokeWithEmptyIntentTarget ===============");

       
        // ------- PREPING Invocation Target with no extra parameters and inputDataModel -------
        InvocationTarget invocationTarget = new InvocationTarget();
        
        List<String> intents = new ArrayList<>();
        intents.add("PTConsultScreen");
        invocationTarget.setIntentsSet(intents);
        
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SITE;140"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        
		Map<String, Object> parameters = null;
        Object inputDataModel = null;
        
        ResultBundle result = instance.invoke(invocationTarget, context, parameters, inputDataModel);

        log.info("DONE");
    }
    
    
	/**
	 * Build a new ResultBundle for an Intent with Prereqs, 
	 * given a simulated ResultBundle that was return from OpenCDS.
	 * 
	 * @throws IOException
	 */
    @Ignore
    @Test
    public void buildConsultPrerequiste() throws IOException {
        //------------------------------------------------------------
        // GIVEN a ResultBundle from OpenCDS, 
        // extract the body and create a ConsultPrerequisites object from it.
        //------------------------------------------------------------
        // Prepare a sample static ResultBundle
        ResultBundle resultBundleOut = setupResultBundle();

    	//PREPING new ResultBundle and it's single Result object to populate and return.
    	ResultBundle newResultBundle = new ResultBundle();
    	newResultBundle.setFaultInfo(resultBundleOut.getFaultInfo());
    	newResultBundle.setStatus(resultBundleOut.getStatus());
    	
        Result newResult = new Result();
        newResult.setCallId(resultBundleOut.getResults().get(0).getCallId());
        newResult.setGeneratedBy(resultBundleOut.getResults().get(0).getGeneratedBy());
        newResult.setProvenance(resultBundleOut.getResults().get(0).getProvenance());
        newResult.setTitle(resultBundleOut.getResults().get(0).getTitle());
        newResult.setType(resultBundleOut.getResults().get(0).getType());
        
        //--------------------------------------------------------------
        // BUILD a single consult from engineBundle body content (Obsverations)
		// Loop through bundle (Observation) entries and for each
		//		create a ConsultPrerequisite object
		// 		then add to ConsultPrerequisites list
        //--------------------------------------------------------------
        ConsultPrerequisites consultList = new ConsultPrerequisites();
        
        for ( Result result : resultBundleOut.getResults()) {
        	
        	Observation obs = (Observation) result.getBody();
       
        	// BUILD a ConsultPrerequisite
        	ConsultPrerequisite aConsult = new ConsultPrerequisite();
        	
        	aConsult.setDuration(getExtValuePerCategory(obs.getUndeclaredModifierExtensions(), "duration"));
	        
	        Coding coding = new Coding();
	        coding.setCode(obs.getIdentifier().get(0).getValue());
	        coding.setSystem(obs.getIdentifier().get(0).getSystem());
	        coding.setDisplay(obs.getComments());
	        
	        aConsult.setCoding(coding);
	
	        aConsult.setStatus(getExtValuePerCategory(obs.getUndeclaredModifierExtensions(), "status"));
	        aConsult.setDetail(obs);
	
	        // PREP Remediation.  Note, coding here is same as top level coding.
	        aConsult.getRemediation().setCoding(coding);
	        
	        String domain = "";
	        if ((obs.getIdentifier() != null) && obs.getIdentifier().get(0).getSystem().contains("loinc")) {
	        	domain = "lab";
	        } 
	        
	        aConsult.getRemediation().setDomain(domain);
	        
	        consultList.getPrerequisites().add(aConsult);
        }
        
        newResult.setBody(consultList);
        newResultBundle.getResults().add(newResult);

        if (newResultBundle.getResults().size() > 0) {
        	
            ConsultPrerequisites cr = (ConsultPrerequisites) newResultBundle.getResults().get(0).getBody();
            

	        // PARSE AND CHECK FINAL BUNDLE
	        IParser parser = FhirUtils.newJsonParser().setPrettyPrint(true);
	        String outstr = parser.encodeResourceToString((Observation) cr.getPrerequisites().get(0).getDetail());
	        log.info("\n\n Printing one returned Observation for RheumatologyConsultScreen:\n" + outstr);
	        
        } else {
        	log.info("No Observations from Rules!");
        }
    }


    /**
     * 
     * @param modExts
     * @param category
     * @return
     */
    private String getExtValuePerCategory(List<ExtensionDt> modExts, String category) {
    	String value = "";
    	
    	// Loop through all extensions to find the related category ext item 
    	
    	for (ExtensionDt ext : modExts) {
    		if (ext.getUrlAsString().endsWith(category)) {
    			value = ext.getValue().toString();
    			break;
    		}
    	}
    	
    	return value;
    }

    /**
     * 
     * @return
     * @throws IOException
     */
    private ResultBundle setupResultBundle() throws IOException {
    	
        ResultBundle out = new ResultBundle();

        out.setFaultInfo(null);
        out.setStatus(StatusCode.SUCCESS);

        //=======================
        // 1st Observation
        //=======================
        Result newResult1 = new Result();
        newResult1.setCallId("XXX");
        newResult1.setGeneratedBy("GeneratePersonID");
        newResult1.setProvenance(null);
        newResult1.setTitle("Title1");
        newResult1.setType(null);
        
        // -------------------------------------------
        // READ in the Fhir Observation so can insert it as an Object type
        // to attribute "body", within the Result class
        // -------------------------------------------
        String b = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRheuObservationsSingle1.json"));
        Observation obs1 = (Observation) FhirUtils.newJsonParser().parseResource(b);
        newResult1.setBody(obs1);
        out.getResults().add(newResult1);

        //=======================
        // 2nd Observation
        //=======================
        Result newResult2 = new Result();
        newResult2.setCallId("XXX");
        newResult2.setGeneratedBy("GeneratePersonID");
        newResult2.setProvenance(null);
        newResult2.setTitle("Title1");
        newResult2.setType(null);
        
        // -------------------------------------------
        // READ in the Fhir Observation so can insert it as an Object type
        // to attribute "body", within the Result class
        // -------------------------------------------
        b = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRheuObservationsSingle2.json"));
        Observation obs2 = (Observation) FhirUtils.newJsonParser().parseResource(b);
        newResult2.setBody(obs2);
        
        out.getResults().add(newResult2);

        return out;
    }
    
    

}
