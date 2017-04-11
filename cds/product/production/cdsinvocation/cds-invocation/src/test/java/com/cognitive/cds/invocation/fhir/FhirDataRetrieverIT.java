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
 */
package com.cognitive.cds.invocation.fhir;

import static org.junit.Assert.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.base.resource.BaseOperationOutcome.BaseIssue;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationResult;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.util.FhirUtils;
import org.apache.cxf.jaxrs.client.WebClient;

/**
 *
 * @author tnguyen
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:fhircontext-test.xml" })
public class FhirDataRetrieverIT {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FhirDataRetrieverIT.class);

    @Autowired
    @Qualifier("retrieveFhirData")
    FhirDataRetriever instance;

    public FhirDataRetrieverIT() {
    }

    @BeforeClass
    public static void setUpClass() {
    }

    @AfterClass
    public static void tearDownClass() {
    }

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() {
    }

    /**
     * NOTE: DEVELOPMENT TESTING ONLY
     *
     * Integration Test of FhirDataRetriever.getFhirData method. (with attempted
     * live retrieval from RDK FHir server)
     * 
     * @throws DataRetrievalException
     */

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetPatient() throws DataRetrievalException, InterruptedException, IOException {

        log.info("\n\n=====================> TESTING: testGetPatient <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;239");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetVitals() throws DataRetrievalException, InterruptedException, IOException {

        log.info("\n\n=====================> TESTING: testGetVitals (now vital-signs) <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;140/observation?_tag=vital-signs");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetPatientAndVitals() throws DataRetrievalException, InterruptedException, IOException {

        log.info("\n\n=====================> TESTING: testGetPatientAndVitals (now vital-signs) <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;140");
        this.getFhirData(queries);
        
        //----------------------------------------------------------------------
        // To test new re-Auth code after an RDK Auth timeout, 
        // we need to delete the current RDK session (simulating session time out), 
        // then call getFhirData() again.
        // Result should be successful since a re-Auth will be automatically done.
        //----------------------------------------------------------------------
        WebClient myClient = instance.getClient();
        log.info("DELETING RDK session");
        myClient.path("/authentication/systems").delete();
        

        queries.clear();
        queries.add("patient/9E7A;140/observation?profile=CDS&_tag=vital-signs");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetCondition() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetCondition <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;140/condition");
        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetObservation() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetObservation <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();
        queries.add("patient/9E7A;140/observation");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetEducations() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetEducations <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;253/procedure?_tag=educations");
        
        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetAllProcedure() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetAllProcedure <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/C877;227/procedure");
        
        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetHealthFactors() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetHealthFactors (now social-history) <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;140/observation?_tag=social-history");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetMedicationDispense() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetMedicationDispense <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("medicationdispense?subject.identifier=9E7A;140");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetMedicationPrescription() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetMedicationPrescription <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        //This has issues due to a change in fhir spec - this was from a period 
        //when we were transitioning versions.
        queries.add("patient/9E7A;140/medicationprescription");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetMedicationAdministration() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetMedicationAdministration <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("medicationadministration?subject.identifier=9E7A;140");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetAllergyIntolerance() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetAllergyIntolerance <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("allergyintolerance?subject.identifier=9E7A;140");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetLabs() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetLabs <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("/patient/9E7A;253/diagnosticreport?domain=lab&date>2015-01-01");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetImmunization() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetImmunization <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("immunization?subject.identifier=9E7A;140");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetComposition() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetComposition <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("composition?subject.identifier=9E7A;140&limit=1");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetReferralRequest() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetReferralRequest <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("referralrequest?subject.identifier=9E7A;140");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testGetOrderDiagnosticOrder() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testGetOrderDiagnosticOrder <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("order?subject.identifier=9E7A;8&detail.display=DiagnosticOrder");

        this.getFhirData(queries, "testGetOrderDiagnosticOrder.json");
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testDiagnosticOrder() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testDiagnosticOrder <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;8/diagnosticorder");

        this.getFhirData(queries);
    }

    @Ignore("This is really a service level integration test")
    @Test
    public void testProcedure() throws InterruptedException, IOException, DataRetrievalException {

        log.info("\n\n=====================> TESTING: testProcedure <===================== ");

        List<String> queries = new ArrayList<String>();
        Bundle b = new Bundle();

        queries.add("patient/9E7A;239/procedure?_tag=procedure");

        this.getFhirData(queries);
    }

    /**
     *
     * @param queries
     * @throws DataRetrievalException
     * @throws InterruptedException
     * @throws IOException
     */
    public void getFhirData(List<String> queries) throws DataRetrievalException, InterruptedException, IOException {
        this.getFhirData(queries, null);
    }

    public void getFhirData(List<String> queries, String resultOutputFileName) throws DataRetrievalException, InterruptedException, IOException {

        //log.info("===> getFhirData: " + instance.getBaseURL());

        Bundle bundleOut = instance.getFhirData(queries);

        // PARSE AND CHECK FINAL BUNDLE
        IParser parser = FhirUtils.newJsonParser().setPrettyPrint(true);

        String outstr = parser.encodeResourceToString(bundleOut);
        // log.info("\n\nNEW BUNDLE AFTER BUNDLE(2):\n" + outstr);
        if (resultOutputFileName != null) {
            log.info("\n===> RESULTING json WRITTEN TO: " + resultOutputFileName + "\n");
            Files.write(Paths.get("./" + resultOutputFileName), outstr.getBytes());
        }

        // --------------------------
        // Setup the schema for validating
        // --------------------------
        FhirValidator val = FhirUtils.getContext().newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(true);

        // -----------------------------------
        // Parsing & Validating a Bundle json
        // -----------------------------------
        Bundle bundle = (Bundle) parser.parseResource(outstr);
        assertNotNull("Bundle should not be null", bundle);

        ValidationResult validationResult = val.validateWithResult(bundleOut);

        log.info("....... VALIDATING: Total Issues = " + validationResult.getOperationOutcome().getIssue().size() + ".................\n");
        for (BaseIssue issue : validationResult.getOperationOutcome().getIssue()) {
            log.error(issue.getDetailsElement().getValueAsString());
        }
        log.info(".....................................................\n");
        assertTrue("Parsed & Validated: ", validationResult.isSuccessful());
    }

}
