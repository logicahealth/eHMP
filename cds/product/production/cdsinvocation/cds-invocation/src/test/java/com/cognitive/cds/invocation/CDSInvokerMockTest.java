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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.dstu2.composite.CodeableConceptDt;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.composite.QuantityDt;
import ca.uhn.fhir.model.dstu2.composite.ResourceReferenceDt;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.resource.CommunicationRequest;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.dstu2.valueset.ObservationStatusEnum;
import ca.uhn.fhir.model.primitive.DecimalDt;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.model.primitive.StringDt;

import com.cognitive.cds.invocation.engineplugins.MockEngine;
import com.cognitive.cds.invocation.metricsplugins.DoNothing;
import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-CDSMockTest.xml" })
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class CDSInvokerMockTest {

    @Autowired
    // @Quailifer("FullMockInvoker"))
    CDSInvoker theInvoker;

    @Ignore
    @Test
    public void testBasicSetup() {
        assertNotNull("Spring initialization failed", theInvoker);
        // Seed the engine with a number of results
        setupResultsAsResources();
        InvocationTarget target = new InvocationTarget();
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SubId1"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        target.setMode(InvocationMode.Raw);
        target.setType(InvocationType.Direct);
        LinkedList<String> intents = new LinkedList<String>();
        target.setIntentsSet(intents);
        ResultBundle out;

        // Ok now we can start some invocation requests

        // FirstEngine
        intents.add("FirstEngine");
        out = theInvoker.invoke(target, context, null, "");
        assertNotNull(out);
        if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
            fail("Invocation failed with code " + out.getStatus().getCode());
        }
        assertTrue("Incorect number of results returned by FirstEngine Intent", out.getResults().size() == 3);

        // SecondEngine - Demonstrate the engine switch ability
        intents.clear();
        intents.add("SecondEngine");
        out = theInvoker.invoke(target, context, null, "");
        assertNotNull(out);
        if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
            fail("Invocation failed with code " + out.getStatus().getCode());
        }
        assertTrue("Incorect number of results returned by SecondEngine Intent", out.getResults().size() == 2);

        // Merge
        intents.clear();
        intents.add("Merge");
        out = theInvoker.invoke(target, context, null, "");
        assertNotNull(out);
        if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
            fail("Invocation failed with code " + out.getStatus().getCode());
        }
        assertTrue("Incorect number of results returned by Merge Intent", out.getResults().size() == 5);

        // Ok for good measure we will make sure that there is a call Metric
        // summary

        DoNothing collector = (DoNothing) theInvoker.getMetricCollectors().get(0);
        List<CallMetrics> metrics = collector.getLastMetrics();
        // Get what should be the summary metric
        CallMetrics sum = metrics.get(metrics.size() - 1);
        assertTrue("Last saved metric is not a summary", sum.getEvent().compareTo("summary") == 0);
        assertTrue("Summary metric did not have the expected total results", sum.getTotalResults() == 5);
        assertTrue("Summary metric did not have the expect number of timings", sum.timings.size() == 4);
    }

    /**
     * Validate unique call Id
     */

    @Ignore
    @Test
    public void testCallId() {
        String id1 = theInvoker.generateCallId();
        String id2 = theInvoker.generateCallId();

        assertFalse("Call Id Generator is producing a duplicate", id1.compareTo(id2) == 0);

    }

    @Ignore("Test is incomplete, The mock result bundle passed back does not parse")
    @Test
    public void testParameterCall() {
        assertNotNull("Spring initialization failed", theInvoker);
        // Seed the engine with a number of results
        setupResultsAsBundle();
        InvocationTarget target = new InvocationTarget();
        Context context = new Context();
        context.setSubject(new Subject("TestSubject", "SubId1"));
        context.setLocation(new Location("Test Location", "Location1"));
        context.setUser(new User("Tester", "Id1"));
        target.setMode(InvocationMode.Normal);
        target.setType(InvocationType.Direct);
        LinkedList<String> intents = new LinkedList<String>();
        target.setIntentsSet(intents);
        Properties parameters = new Properties();

        ResultBundle out;

        // Ok now we can start some invocation requests

        // FirstEngine - Empty Parameters
        intents.add("FirstEngine");
        out = theInvoker.invoke(target, context, parameters, "");
        assertNotNull(out);
        if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
            fail("Invocation failed with code " + out.getStatus().getCode());
        }
        assertTrue("Incorect number of results returned by FirstEngine Intent", out.getResults().size() == 3);

        // Ok now we try with a parameter
        target.setMode(InvocationMode.Normal);
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

        out = theInvoker.invoke(target, context, parameters, "");
        assertNotNull(out);
        if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
            fail("Invocation failed with code " + out.getStatus().getCode());
        }
        assertTrue("Incorect number of results returned by FirstEngine Intent", out.getResults().size() == 3);

    }

    private void setupResultsAsBundle() {

        Bundle bundle1 = new Bundle();
        Bundle bundle2 = new Bundle();

        // ====================================================
        // PREP finalBundle ATTRIBUTES
        // ====================================================
        java.util.UUID uuid = java.util.UUID.randomUUID();
        bundle1.setId(new IdDt(uuid.toString()));
        // bundle1.getUpdated().setTimeZone(TimeZone.getDefault());
        bundle1.setType(BundleTypeEnum.COLLECTION);
        bundle1.setBase("http://test");
        // bundle1.setTotal(3); //Total is only valid on search and history
        // bundles!
        // bundle1.getAuthorName().setValue("CDS Invocation JUNIT");

        uuid = java.util.UUID.randomUUID();
        bundle2.setId(new IdDt(uuid.toString()));
        // bundle2.getUpdated().setTimeZone(TimeZone.getDefault());
        bundle2.setType(BundleTypeEnum.COLLECTION);
        bundle2.setBase("http://test");
        // bundle2.setTotal(2); //Total is only valid on search and history
        // bundles!
        // bundle2.getAuthorName().setValue("CDS Invocation JUNIT");

        bundle1.addEntry().setResource(createCommRequest("Who1", "Id1", "Who2", "Id2", "The first message payload"));
        bundle1.addEntry().setResource(createCommRequest("Who1", "Id1", "Who2", "Id2", "The second message payload"));
        bundle1.addEntry().setResource(createCommRequest("Who1", "Id1", "Who2", "Id2", "The third message payload"));

        MockEngine eng1 = (MockEngine) theInvoker.getEnginesMap().get("engineOne").getEngine();
        ResultBundle out1 = new ResultBundle();
        LinkedList<Result> results1 = new LinkedList<Result>();
        results1.add(new Result("Test", "A Test Bundle", bundle1, "JUNIT", "Uncalled"));
        out1.setStatus(StatusCode.SUCCESS);
        out1.setResults(results1);
        eng1.setResultBundle(out1);

        bundle2.addEntry().setResource(createCommRequest("Who1", "Id1", "Who2", "Id2", "The first message payload"));
        bundle2.addEntry().setResource(createCommRequest("Who1", "Id1", "Who2", "Id2", "The second message payload"));

        MockEngine eng2 = (MockEngine) theInvoker.getEnginesMap().get("engineTwo").getEngine();
        ResultBundle out2 = new ResultBundle();
        LinkedList<Result> results2 = new LinkedList<Result>();
        results2.add(new Result("Test", "A Test Bundle", bundle2, "JUNIT", "Uncalled"));
        out2.setStatus(StatusCode.SUCCESS);
        out2.setResults(results2);
        eng2.setResultBundle(out2);

    }

    private void setupResultsAsResources() {
        // Note: This test is tightly bound to the Spring config file with
        // expectations
        // on engine names and engine types.
        CommunicationRequest req = new CommunicationRequest();

        ResourceReferenceDt rep = new ResourceReferenceDt();
        rep.setDisplay("Who We are talking to");
        rep.setReference("Id1");
        ResourceReferenceDt rep2 = new ResourceReferenceDt();
        rep.setDisplay("More Who We are talking to");
        rep.setReference("Id2");
        ArrayList<ResourceReferenceDt> reps = new ArrayList<>();
        reps.add(rep);
        reps.add(rep2);
        req.setRecipient(reps);

        ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload comPlyLd = new ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload();
        StringDt value = new StringDt();
        value.setValue("This is the value of the communications request payload");
        comPlyLd.setContent(value);
        ArrayList<ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload> pyldList = new ArrayList<>();
        pyldList.add(comPlyLd);
        req.setPayload(pyldList);

        MockEngine eng1 = (MockEngine) theInvoker.getEnginesMap().get("engineOne").getEngine();
        ResultBundle out1 = new ResultBundle();
        LinkedList<Result> results1 = new LinkedList<Result>();
        results1.add(new Result("Test", "A Test Result", req, "JUNIT", "Uncalled"));
        results1.add(new Result("Test", "Another Result", req, "JUNIT", "Uncalled"));
        results1.add(new Result("Test", "Yet Another Test Result", req, "JUNIT", "Uncalled"));
        out1.setStatus(StatusCode.SUCCESS);
        out1.setResults(results1);
        eng1.setResultBundle(out1);

        MockEngine eng2 = (MockEngine) theInvoker.getEnginesMap().get("engineTwo").getEngine();
        ResultBundle out2 = new ResultBundle();
        LinkedList<Result> results2 = new LinkedList<Result>();
        results2.add(new Result("Test", "Engine 2 BTest Result", req, "JUNIT", "Uncalled"));
        results2.add(new Result("Test", "Engine 2 A Test Result", req, "JUNIT", "Uncalled"));
        out2.setStatus(StatusCode.SUCCESS);
        out2.setResults(results2);
        eng2.setResultBundle(out2);

    }

    private CommunicationRequest createCommRequest(String who1, String id1, String who2, String id2, String payload) {

        CommunicationRequest req = new CommunicationRequest();
        ResourceReferenceDt rep = new ResourceReferenceDt();
        rep.setDisplay(who1);
        rep.setReference(id1);
        ResourceReferenceDt rep2 = new ResourceReferenceDt();
        rep.setDisplay(who2);
        rep.setReference(id2);
        ArrayList<ResourceReferenceDt> reps = new ArrayList<>();
        reps.add(rep);
        reps.add(rep2);
        req.setRecipient(reps);

        ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload comPlyLd = new ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload();
        StringDt value = new StringDt();
        value.setValue(payload);
        comPlyLd.setContent(value);
        ArrayList<ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload> pyldList = new ArrayList<>();
        pyldList.add(comPlyLd);
        req.setPayload(pyldList);

        return req;
    }

}
