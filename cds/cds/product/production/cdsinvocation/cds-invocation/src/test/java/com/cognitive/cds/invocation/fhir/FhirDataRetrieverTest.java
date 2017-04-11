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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.helpers.IOUtils;
import org.apache.cxf.jaxrs.client.WebClient;
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

import com.cognitive.cds.invocation.util.FhirUtils;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.base.resource.BaseOperationOutcome.BaseIssue;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.resource.Bundle.Entry;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.resource.Patient;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.parser.XmlParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationResult;

/**
 *
 * @author tnguyen
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:fhircontext-test.xml" })
public class FhirDataRetrieverTest {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FhirDataRetrieverTest.class);

    @Autowired
    @Qualifier("retrieveFhirData")
    FhirDataRetriever instance;

    public FhirDataRetrieverTest() {
    }

    @BeforeClass
    public static void setUpClass() {
    }

    @AfterClass
    public static void tearDownClass() {
    }

    @Before
    public void setUp() {

    }

    @After
    public void tearDown() {
    }

    /**
     * Test parsing and validating a DSTU2 bundle and DSTU2 simple data response
     * (processing a captured data from RDK run)
     * 
     * USING TEST DATA FILE: sampleRDKFhir-Patient_dstu2.json
     * sampleRDKFhir-HealthFactors.json now social-history
     * 
     * @throws IOException
     */
    @Ignore("Development Test only")
    @Test
    public void testHAPIParser_DSTU2() throws IOException {

        log.trace("\n\n=====================> TESTING: testHAPIParser_DSTU2 <===================== ");

        String msg;
        ValidationResult validationResult;

        // --------------------------
        // PARSE entry fom repsonse
        // --------------------------

        IParser p = FhirUtils.newJsonParser();

        // --------------------------
        // Setup the schema for validating
        // --------------------------
        FhirValidator val = FhirUtils.getContext().newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(true);

        // -----------------------------------
        // Parsing & Validating a Simple json: PATIENT as simple resource
        // -----------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Patient_dstu2.json"));
        Patient res = p.parseResource(Patient.class, msg);

        log.trace("\n............. PARSING SIMPLE.............");
        log.trace("NAME:  " + res.getResourceName());
        log.trace("GENDER:  " + res.getGenderElement().getValueAsString());

        validationResult = val.validateWithResult(res);
        assertTrue("Validating sampleRDKFhir-Patient_dstu2.json", validationResult.isSuccessful());

        // now part of observation
        // -----------------------------------
        // Parsing & Validating a Bundle json
        // -----------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-HealthFactors.json"));
        Bundle bundle = (Bundle) p.parseResource(msg);
        validationResult = val.validateWithResult(bundle);

        if (!validationResult.isSuccessful()) {
            log.error("\n-------------------------------------------\n");
            for (BaseIssue issue : validationResult.getOperationOutcome().getIssue()) {
                log.error(issue.getDetailsElement().getValueAsString());
            }
            log.error("\n-------------------------------------------\n");
            assertTrue("sampleRDKFhir-HealthFactors.json", validationResult.isSuccessful());
        }

        // GETTING first resource
        Entry e = bundle.getEntry().get(0);
        IResource resource = e.getResource();

        log.trace("\n............. PARSING BUNDLE.............");
        log.trace("FIRST RESOURCE NAME: " + resource.getResourceName());
        log.trace(resource.getResourceMetadata().toString());

        assertEquals(Observation.class, resource.getClass());

        // DETERMINING WHICH RESOURCETYPE the resource is
        if (resource.getClass().equals(Patient.class)) {
            Patient pt = (Patient) resource;
            log.trace("GENDER " + pt.getGender());
            log.trace("MARITAL ms.text: " + pt.getMaritalStatus().getText());
            log.trace("MARITAL ms.coding: " + pt.getMaritalStatus().getCoding());
            log.trace("MARITAL ms.coding.display: " + pt.getMaritalStatus().getCodingFirstRep().getDisplay());
        }

        IResource aContained = e.getResource().getContained().getContainedResources().get(0);
        log.trace("CONTAINED SIZE: " + e.getResource().getContained().getContainedResources().size());
        log.trace("CONTAINED RESOURCENAME: " + aContained.getResourceName());

        try {
            msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Patient_dstu2.json"));
            Patient b = p.parseResource(Patient.class, msg);
        } catch (ca.uhn.fhir.parser.DataFormatException ex) {
            fail("Exception parsing a patient: " + ex.getMessage());

        }

        try {
            msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Patient_dstu2_bundle.json"));
            IResource i = p.parseResource(msg);
            if (!(i instanceof Bundle)) {
                fail("Parsed resource is not a bundle, but rather a " + i.getResourceName());
            }
        } catch (ca.uhn.fhir.parser.DataFormatException ex) {
            fail("Exception parsing a bundle: " + ex.getMessage());
        }
    }

    /**
     * 
     * Test parsing and validating a DSTU2 bundle of multiple resources data
     * response (processing a captured data from RDK run)
     * 
     * @throws IOException
     */
    @Ignore("Development Test only")
    @Test
    public void testHAPIBundlingOfMultipleResources() throws IOException {

        log.trace("\n\n=====================> TESTING: testHAPIBundlingOfMultipleResources <============== ");

        String msg;
        Bundle bundleout = new Bundle();

        // --------------------------
        // PREP HAPI CONTEXT AND PARSER
        // --------------------------
        FhirContext hapiFhirCtx = new FhirContext();
        hapiFhirCtx = FhirContext.forDstu2();
        IParser p = hapiFhirCtx.newJsonParser();

        // ---------------------------------
        // READ IN STATIC SIMPLE DATA from a source and add to new bundle
        // (bundleout)
        // ---------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Patient_dstu2.json"));
        Patient res = p.parseResource(Patient.class, msg);
        bundleout.addEntry().setResource(res);

        // PRINT OUT NEW BUNDLE bundleout
        String outstr = hapiFhirCtx.newJsonParser().encodeResourceToString(bundleout);
        log.trace("NEW BUNDLE AFTER SIMPLE:\n" + outstr);

        // ---------------------------------
        // READ IN STATIC BUNDLE DATA from a source
        // Tester: sampleRDKFhir-PatientAndPatient_dstu2_bundle.json
        // (a bundle containing two patients entries)
        // ---------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-PatientAndPatient_dstu2_bundle.json"));
        Bundle bundle = (Bundle) p.parseResource(msg);

        // ---------------------------------
        // LOOP THROUGH ALL ENTRIES
        // extract each RESOURCE and add to new bundle.
        // ---------------------------------
        List<Entry> entries = bundle.getEntry();

        for (Entry e : entries) {
            IResource resource = e.getResource();

            log.trace("\n............. PARSING BUNDLE.............");
            log.trace("FIRST RESOURCE NAME: " + resource.getResourceName());
            log.trace(resource.getResourceMetadata().toString());
            bundleout.addEntry().setResource(resource);

            log.trace("ADDING: " + resource.getText().getDiv().toString());
        }

        // PRINT OUT NEW BUNDLE bundleout
        outstr = FhirUtils.newJsonParser().encodeResourceToString(bundleout);
        log.trace("NEW BUNDLE AFTER BUNDLE(2):\n" + outstr);

    }

    /**
     * NOTE: DEVELOPMENT TESTING ONLY.
     */
    @Ignore("Development Test only")
    @Test
    public void testMultiCallsOneSession() {

        log.trace("\n\n=====================> TESTING: testMultiCallsOneSession <===================== ");

        Response response;
        String endpoint;
        String baseEP = "http://10.4.4.105:8888/resource/";

        StringBuilder sb = new StringBuilder();

        try {

            endpoint = baseEP;

            List<Object> providers = new ArrayList<Object>();
            // providers.add(new
            // org.codehaus.jackson.jaxrs.JacksonJsonProvider());
            providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

            // ====================================================
            // AUTHENTICATION EP
            // ====================================================
            WebClient client = WebClient.create(endpoint, providers).path("{type}/{domain}", "auth", "authentication");

            // MAINTAIN SESSION for multi request using same session(cookie)
            WebClient.getConfig(client).getRequestContext().put(org.apache.cxf.message.Message.MAINTAIN_SESSION, Boolean.TRUE);

            String body = "{" + "\"accessCode\": \"pu1234\"," + "\"verifyCode\":\"pu1234!!\"," + "\"site\":\"9E7A\"," + "\"division\":\"500\"" + "}";

            response = client.accept(MediaType.APPLICATION_JSON).type(MediaType.APPLICATION_JSON).post(body);

            InputStream in = (InputStream) response.getEntity();
            InputStreamReader is = new InputStreamReader(in);

            BufferedReader br = new BufferedReader(is);
            String read = br.readLine();

            while (read != null) {
                sb.append(read);
                read = br.readLine();
            }
            br.close();

            log.trace("\n===> sb size=" + sb.length() + "\n" + sb.toString());

            // ====================================================
            // GETTING DEMOG
            // ====================================================
            client.reset();
            client.path("{type}/{domain}/{pid}", "fhir", "patient", "10107V395912");
            response = client.accept("application/json").type("application/json").get();

            in = (InputStream) response.getEntity();
            is = new InputStreamReader(in);

            sb = new StringBuilder();
            br = new BufferedReader(is);
            read = br.readLine();
            while (read != null) {
                sb.append(read);
                read = br.readLine();
            }
            log.trace("\n===> sb size=" + sb.length() + "\n" + sb.toString());

            // ====================================================
            // GETTING ALLERGY
            // ====================================================
            client.reset();
            client.path("{type}/{domain}", "fhir", "adverseReaction").query("subject.identifier", "10107V395912");
            response = client.accept("application/json").type("application/json").get();

            in = (InputStream) response.getEntity();
            is = new InputStreamReader(in);

            br = new BufferedReader(is);
            read = br.readLine();

            // INSERT JSON STARTING NODE
            String atomhdr = "{\"atom\":[";
            sb.insert(0, atomhdr, 0, atomhdr.length());

            sb.append(","); // ADDING comma after last domain .. in prep for
                            // next domain data set

            // ADDING domain data to buffer
            while (read != null) {
                sb.append(read);
                read = br.readLine();
            }

            // ====================================================
            // GETTING OBSERVATION
            // ====================================================
            client.reset();
            // client.back(true);
            client.path("{type}/{domain}", "fhir", "observation").query("subject.identifier", "10107V395912").query("profile", "CDS");
            response = client.accept("application/json").type("application/json").get();

            in = (InputStream) response.getEntity();
            is = new InputStreamReader(in);

            br = new BufferedReader(is);
            read = br.readLine();

            sb.append(","); // ADDING comma after last domain .. in prep for
                            // next domain data set

            // ADDING domain data to buffer
            while (read != null) {
                sb.append(read);
                read = br.readLine();
            }

        } catch (MalformedURLException e) {
            log.error(e.toString());
            fail(e.getMessage());
        } catch (IOException e) {
            log.error(e.toString());
            fail(e.getMessage());
        }

        sb.append("]}");

        log.trace("\n===> sb size=" + sb.length() + "\n" + sb.toString());
    }

    @Ignore("fails")
    @Test
    public void testParseContained() {

        log.trace("\n\n=====================> TESTING: testParseContained <===================== ");

        FhirContext c = FhirContext.forDstu2();
        IParser parser = c.newJsonParser().setPrettyPrint(true);

        Observation o = new Observation();
        o.getCode().setText("obs text");

        Patient p = new Patient();
        p.addName().addFamily("patient family");
        o.getSubject().setResource(p);

        String enc = parser.encodeResourceToString(o);
        log.trace(enc);

        o = parser.parseResource(Observation.class, enc);
        assertEquals("obs text", o.getCode().getText());

        p = (Patient) o.getSubject().getResource();
        log.trace("patient family", p.getNameFirstRep().getFamilyAsSingleString());
    }

    /**
     * Test parsing and validating a DSTU2 bundle of multiple resources data
     * response (processing a captured data from RDK run)
     * 
     * @throws IOException
     */
    @Ignore("fails")
    @Test
    public void testExtractResourcesAndBuildBundle() throws InterruptedException, IOException {

        log.trace("\n\n=====================> TESTING: testExtractResourcesAndBuildBundle <===================== ");

        String msg;
        Bundle bundleIn;
        Bundle bundleOut = new Bundle();
        // ---------------------------------------------------
        FhirValidator val = FhirUtils.getContext().newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(false);

        java.util.UUID uuid = java.util.UUID.randomUUID();
        bundleOut.setId(new IdDt(uuid.toString()));

        bundleOut.setType(BundleTypeEnum.COLLECTION);
        ValidationResult validationResulta = val.validateWithResult(bundleOut);
        assertTrue("Validating Initial Bundle", validationResulta.isSuccessful());

        // --------------------------
        // PREP HAPI CONTEXT AND PARSER
        // --------------------------

        IParser p = FhirUtils.newJsonParser().setPrettyPrint(true);

        // -------------------------------------
        // Read in DSTU2 bundle of 1 resources
        // -------------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Patient_dstu2.json"));
        IResource resourceIn = p.parseResource(msg);

        instance.addSingleResource(FhirUtils.getContext(), resourceIn, bundleOut);

        String outstr = p.encodeResourceToString(bundleOut);
        log.trace("\n\nNEW BUNDLE AFTER BUNDLE(1):\n" + outstr);

        assertTrue("A Bundle with 1 resource added successsfully!", bundleOut.getEntry().size() == 1);

        // now part of observation
        // -------------------------------------
        // Read in DSTU2 bundle of 2 resources
        // -------------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-HealthFactors.json"));
        bundleIn = (Bundle) p.setPrettyPrint(true).parseResource(msg);

        instance.addResources(FhirUtils.getContext(), bundleIn, bundleOut);

        // -------------------------------------
        // PRINT OUT NEW BUNDLE bundleout
        // -------------------------------------
        outstr = p.encodeResourceToString(bundleOut);
        log.trace("NEW BUNDLE AFTER BUNDLE(2):\n" + outstr);

        assertTrue("Another Bundle with 2 resources added successsfully!", bundleOut.getEntry().size() == 3);

        // ---------------------------------------------------
        // Setup the schema for validating
        // and VALIDATE the newly created bundle: bundleOut

        ValidationResult validationResult = val.validateWithResult(bundleOut);
        assertTrue("Validating created final Json", validationResult.isSuccessful());

    }

    /**
     * 
     * @throws IOException
     */
    @Ignore
    @Test
    public void testHAPIParserAndValidate_DSTU2() throws IOException {

        log.trace("\n\n=====================> TESTING: testHAPIParserAndValidate_DSTU2 <===================== ");

        String msg;
        ValidationResult validationResult;

        // --------------------------
        // PARSE entry fom repsonse
        // --------------------------
        FhirContext fhirCtx = FhirUtils.getContext();
        IParser p = FhirUtils.newJsonParser().setPrettyPrint(true);

        // --------------------------
        // Setup the schema for validating
        // --------------------------
        FhirValidator val = fhirCtx.newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(true);

        // -----------------------------------
        // Parsing & Validating a Bundle json
        // -----------------------------------
        msg = IOUtils.toString(XmlParser.class.getResourceAsStream("/sampleRDKFhir-Condition.json"));
        Bundle bundle = (Bundle) p.parseResource(msg);

        validationResult = val.validateWithResult(bundle);

        // IResource res = p.parseResource(msg);
        // validationResult = val.validateWithResult(res);
        if (!validationResult.isSuccessful()) {
            log.error("Validation Failed!");
            log.error("....... VALIDATING Condition: Total Issues = " + validationResult.getOperationOutcome().getIssue().size() + ".................\n");
            for (BaseIssue issue : validationResult.getOperationOutcome().getIssue()) {
                log.error(issue.getDetailsElement().getValueAsString());
            }
            log.error(".....................................................\n");
        }
        assertTrue("Validation failed: ", validationResult.isSuccessful());

    }

    /**
     * Test used for quick PARSING and VALIDATING of a Bundle JSON string.
     */
    @Ignore("Development Test only")
    @Test
    public void testValidate() throws UnsupportedEncodingException {

        // ----------------------------------------
        // can read data in from a file if it's LARGE
        // ----------------------------------------
        // byte[] b = Files.readAllBytes(Paths.get("src/test/resources",
        // "DataToValidate.json"));

        // ----------------------------------------
        // else replace inline for a quickie check
        // ----------------------------------------
        String s = "{\n" + "    \"resourceType\": \"Bundle\",\n" + "    \"id\": \"a4a17e7a-874d-3279-b663-4f47b700f8cf\",\n" + "    \"type\": \"collection\",\n"
                + "    \"base\": \"http://127.0.0.1:8888/resource/fhir/\",\n" + "    \"entry\": [{\n" + "            \"resource\": {\n" + "                \"resourceType\": \"Observation\",\n"
                + "                \"modifierExtension\": [{\n" + "                        \"url\": \"http://org.cognitive.cds.invocation.fhir.datanature\",\n"
                + "                        \"valueCode\": \"Input\"\n" + "                    }, {\n" + "                        \"url\": \"http://org.cognitive.cds.invocation.fhir.parametername\",\n"
                + "                        \"valueString\": \"Weight\"\n" + "                    }],\n" + "                \"code\": {\n" + "                    \"coding\": [{\n"
                + "                            \"system\": \"http://loinc.org\",\n" + "                            \"code\": \"29463-7\"\n" + "                        }]\n" + "                },\n"
                + "                \"valueQuantity\": {\n" + "                    \"value\": 180.5,\n" + "                    \"code\": \"Pounds\"\n" + "                },\n"
                + "                \"comments\": \"Comment\",\n" + "                \"issued\": \"2015-06-02T18:55:48.338-07:00\",\n" + "                \"status\": \"preliminary\"\n"
                + "            }\n" + "        }]\n" + "}";
        byte[] b = s.getBytes(Charset.forName("UTF-8"));

        // ----------------------------------------
        // PARSE String into a BUNDLE object
        // ----------------------------------------
        FhirContext fhirCtx = FhirUtils.getContext();
        IParser parser = FhirUtils.newJsonParser().setPrettyPrint(true);

        Bundle bundle = (Bundle) parser.parseResource(new String(b, "UTF-8"));

        // -----------------------------------
        // Parsing & Validating a Bundle json
        // -----------------------------------
        FhirValidator val = fhirCtx.newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(true);

        ValidationResult validationResult = val.validateWithResult(bundle);

        // -----------------------------------
        // PRINT OUT VALIDATION RESULTs
        // -----------------------------------
        if (validationResult.getOperationOutcome().getIssue().size() > 0) {
            log.error("....... VALIDATING: Total Issues = " + validationResult.getOperationOutcome().getIssue().size() + ".................\n");
            for (BaseIssue issue : validationResult.getOperationOutcome().getIssue()) {
                log.error(issue.getDetailsElement().getValueAsString());
            }
            log.error(".....................................................\n");
        }
    }
}
