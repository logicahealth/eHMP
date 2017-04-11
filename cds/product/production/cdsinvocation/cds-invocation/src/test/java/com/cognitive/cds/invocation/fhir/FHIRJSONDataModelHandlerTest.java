/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
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
 *
 */

package com.cognitive.cds.invocation.fhir;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.exceptions.DataValidationException;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.FhirUtils;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-CDSFHIRDataTest.xml" })
public class FHIRJSONDataModelHandlerTest {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FhirDataRetrieverTest.class);

    @Autowired
    @Qualifier("validBundle")
    Resource validBundle;
    @Autowired
    @Qualifier("invalidBundle")
    Resource invalidBundle;
    @Autowired
    @Qualifier("validResource")
    Resource validResource;
    @Autowired
    @Qualifier("invalidResource")
    Resource invalidResource;

    @Autowired
    @Qualifier("fhirDataHandler")
    FHIRJSONDataModelHandler instance;

    @BeforeClass
    static public void init()
    {
        log.error("-- Errors expected in log from HAPI validation during test --");  
    }
    
    @AfterClass
    static public void cleanup()
    {
        log.error("-- End expected Errors --");  
        
    }
    /**
     * Test that a valid FHIR Data bundle validated correctly
     */
    @Test
    public void testDataQueryValid() {
       
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = null;
        Object inputDataModel = null;
        boolean validate = true;
        queries.add("valid");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            fail("Valid query sample showing as invalid. Exception: " + e.getMessage());
        }

    }

    /**
     * Test that a Invalid FHIR data query bundle is properly validated and an
     * error results
     */
    @Test
    public void testDataQueryInvalid() {
   
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = null;
        Object inputDataModel = null;
        boolean validate = true;
        queries.add("invalid");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
            fail("Bundle should be invalid - Either the data source is a problem or validation is not working.");
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            assertTrue("There should be one of more specific faults", e.getFaults().size() > 0);
            log.debug("Got expected exception: " + e.getMessage());
        }

    }

    /**
     * Test that when a valid FHIR resource is used as a parameter that is
     * passes validation.
     */
    @Test
    public void testParameterValid() {
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = new Properties();

        try {
            parameter.put("Valid", getValidResource());
        } catch (IOException e1) {
            fail("Exception geting a valid resource: " + e1.getMessage());
        }

        Object inputDataModel = null;
        boolean validate = true;
        queries.add("EmtpyData");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            fail("Valid parameter showing as invalid. Exception: " + e.getMessage());
        }

    }

    /**
     * Test that when a valid FHIR resource is used as a parameter in the form
     * of a string that would passes validation.
     */
    @Test
    public void testParameterValidAsString() {
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = new Properties();

        try {
            String jsonResource = FhirUtils.newJsonParser().encodeResourceToString(getValidResource());
            parameter.setProperty("Valid", jsonResource);
        } catch (IOException e1) {
            fail("Exception geting a valid resource: " + e1.getMessage());
        }

        Object inputDataModel = null;
        boolean validate = true;
        queries.add("EmtpyData");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            fail("Valid parameter as string showing as invalid. Exception: " + e.getMessage());
        }

    }

    /**
     * Test that when an invalid FHIR resource is used as a parameter that and
     * error is properly trapped
     */
    @Test
    public void testParameterInvalid() {
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = new Properties();

        try {
            parameter.put("Valid", getInvalidResource());
        } catch (IOException e1) {
            fail("Exception geting a invalid resource: " + e1.getMessage());
        }

        Object inputDataModel = null;
        boolean validate = true;
        queries.add("EmtpyData");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
            fail("Validation should have rejected this input parameter");
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            assertTrue("There should be one or more faults present", e.getFaults().size() > 0);
        }
    }

    /**
     * Test that when a cvalid FHIR Bundle is provided as Input that it passes
     * validation
     */
    @Test
    public void testInputModelValid() {
        
        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = null;
        Object inputDataModel = null;
        try {
            inputDataModel = getValidBundle();
        } catch (IOException e1) {
            fail("Exception loading a valid resource bundle: " + e1.getMessage());
        }
        boolean validate = true;
        queries.add("EmptyData");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected input model test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            fail("Valid input sample showing as invalid. Exception: " + e.getMessage());
        }

    }

    /**
     * Test that when an invalid FHIR Bundle is passed as input that validation
     * occurs and a error is thrown
     */

    @Test
    public void testInputModelInvalid() {

        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
        Properties parameter = null;
        Object inputDataModel = null;
        try {
            inputDataModel = getInvalidBundle();
        } catch (IOException e1) {
            fail("Exception loading a invalid resource bundle: " + e1.getMessage());
        }
        boolean validate = true;
        queries.add("EmptyData");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
            fail("Invalid Bundle used as input validation should have failed");
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected invalid input model test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            assertTrue("Did not see expected faults in invalid input model",e.getFaults().size()>0);
        }
    }

    /**
     * Test that multiple valid channels pass validation This insures that
     * composition does not introduce invalid context
     */
    @Test
    public void testCombinationValid() {


        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
       
        Object inputDataModel = null;
        try {
            inputDataModel = getValidBundle();
        } catch (IOException e1) {
            fail("Exception loading a valid resource bundle, valid combo test: " + e1.getMessage());
        }
        
        Properties parameter = new Properties();

        try {
            String jsonResource = FhirUtils.newJsonParser().encodeResourceToString(getValidResource());
            parameter.setProperty("Valid", jsonResource);
        } catch (IOException e1) {
            fail("Exception geting a paramter valid resource: " + e1.getMessage());
        }
        
        boolean validate = true;
        queries.add("valid");

        try {
            String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            assertNotNull("Invalid null result", result);
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected invalid combo input model test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            fail("Data Valiodation error thrown when not expected, combo test with all valid input");
        }
    }

    /**
     * Test that when on elemnent of a combined call has invalid content that
     * validation occurs and and error is thrown.
     */
    @Test
    public void testCombinationInvalid() {


        InvocationMode mode = InvocationMode.Normal;
        List<String> queries = new ArrayList<>(1);
        Context ctx = getTestContext();
       
        Object inputDataModel = null;
        try {
            inputDataModel = getInvalidBundle();
        } catch (IOException e1) {
            fail("Exception loading a invalid resource bundle, invalid combo test: " + e1.getMessage());
        }
        
        Properties parameter = new Properties();

        try {
            String jsonResource = FhirUtils.newJsonParser().encodeResourceToString(getValidResource());
            parameter.setProperty("Valid", jsonResource);
        } catch (IOException e1) {
            fail("Exception geting a paramter valid resource: " + e1.getMessage());
        }
        
        boolean validate = true;
        queries.add("valid");

        try {
            @SuppressWarnings("unused")
			String result = instance.buildDataModel(mode, queries, ctx, parameter, inputDataModel, validate);
            fail("Invalid Bundle used as input combo validation should have failed");
        } catch (DataRetrievalException e) {
            e.printStackTrace();
            fail("Unexpected invalid combo input model test Exception: " + e.getMessage());

        } catch (DataValidationException e) {
            assertTrue("Did not see expected faults in invalid combo input model",e.getFaults().size()>0);
        }
    }

    
    private static final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:00");

    @Test
    public void testResolvePeriodToDate() {
    	LocalDateTime testDate = LocalDateTime.now();
    	String formattedDate = testDate.minusDays(90).format(dateFormat);
    	String period = "90d";
    	String testStmt = instance.resolvePeriodToDate(period);
    	assertTrue("Time Days statements are unequal.", testStmt.equals(formattedDate));

    	formattedDate = testDate.minusHours(90).format(dateFormat);
    	period = "90h";
    	testStmt = instance.resolvePeriodToDate(period);
    	assertTrue("Time Hours statements are unequal.", testStmt.equals(formattedDate));

    	formattedDate = testDate.minusWeeks(10).format(dateFormat);
    	period = "10w";
    	testStmt = instance.resolvePeriodToDate(period);
    	assertTrue("Time Weeks statements are unequal.", testStmt.equals(formattedDate));

    	formattedDate = testDate.minusMonths(1).format(dateFormat);
    	period = "1m";
    	testStmt = instance.resolvePeriodToDate(period);
    	assertTrue("Time Months statements are unequal.", testStmt.equals(formattedDate));

    	formattedDate = testDate.minusYears(10).format(dateFormat);
    	period = "10y";
    	testStmt = instance.resolvePeriodToDate(period);
    	assertTrue("Time Years statements are unequal.", testStmt.equals(formattedDate));
    }
    
    @Test
    public void testResolveOperation() {
    	assertTrue("Operation dateEqual statements are unequal.", instance.resolveOperation("dateEqual").equals("="));
    	assertTrue("Operation dateLessThan statements are unequal.", instance.resolveOperation("dateLessThan").equals("=<"));
    	assertTrue("Operation dateLessThanOrEqual statements are unequal.", instance.resolveOperation("dateLessThanOrEqual").equals("=<="));
    	assertTrue("Operation dateGreaterThan statements are unequal.", instance.resolveOperation("dateGreaterThan").equals("=>"));
    	assertTrue("Operation dateGreaterThanOrEqual statements are unequal.", instance.resolveOperation("dateGreaterThanOrEqual").equals("=>="));
    }
    
    @Test 
    public void testResolveDateParams() {
    	String period = "90d";
    	String testStmt = "date=<="+instance.resolvePeriodToDate(period);
    	StringBuffer query = new StringBuffer("patient/##SUBJECT.ID##/diagnosticreport?domain=lab&amp;date=##dateLessThanOrEqual-90d##");
    	assertTrue("Test query does not contain "+testStmt, instance.resolveDateParams(query).toString().contains(testStmt));
    }
    
    
    private Bundle getValidBundle() throws IOException {
        return getBundleFromInputStream(validBundle.getInputStream());
    }

    private Bundle getInvalidBundle() throws IOException {
        return getBundleFromInputStream(invalidBundle.getInputStream());
    }

    private IResource getValidResource() throws IOException {
        return this.getResourceFromInputStream(validResource.getInputStream());
    }

    private IResource getInvalidResource() throws IOException {
        return this.getResourceFromInputStream(invalidResource.getInputStream());
    }

    private Bundle getBundleFromInputStream(InputStream stream) {
        Bundle out = null;
        InputStreamReader reader = new InputStreamReader(stream);
        IResource rsc = FhirUtils.newJsonParser().parseResource(reader);
        if (rsc instanceof Bundle) {
            out = (Bundle) rsc;
        } else {
            throw new IllegalArgumentException("Resource is not a Bundle");
        }
        return out;
    }

    private IResource getResourceFromInputStream(InputStream stream) {
        IResource out = null;
        InputStreamReader reader = new InputStreamReader(stream);
        out = FhirUtils.newJsonParser().parseResource(reader);
        return out;
    }

    private Context getTestContext() {
        Context ctx = new Context();
        User user = new User();
        user.setName("Test");
        ctx.setUser(user);
        Subject subject = new Subject();
        subject.setName("Test,Pateint");
        subject.setType("Patient");
        ctx.setSubject(subject);
        return ctx;
    }
}
