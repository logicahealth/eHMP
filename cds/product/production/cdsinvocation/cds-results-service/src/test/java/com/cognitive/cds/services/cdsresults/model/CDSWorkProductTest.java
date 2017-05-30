/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.services.cdsresults.model;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.TimeZone;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Specialty;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.invocation.workproduct.model.InvocationInfo;
import com.cognitive.cds.invocation.workproduct.model.Payload;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import ca.uhn.fhir.model.dstu2.composite.ResourceReferenceDt;
import ca.uhn.fhir.model.dstu2.resource.CommunicationRequest;
import ca.uhn.fhir.model.primitive.StringDt;

public class CDSWorkProductTest {
    private static final Logger logger = LoggerFactory.getLogger(CDSWorkProductTest.class);

    @Test
    public void testToJSONString() throws ParseException, IOException {
        // Note that field parse order is important for this check
        // So the mapper implementation must insure the same order is used.
        String check = "{\"categories\":[\"TestCategory1\",\"TestCategory20\",\"snomedcode\"],\"context\":{\"location\":{\"codeSystem\":\"VA:Location\","
                + "\"entityType\":\"Location\",\"id\":\"2883\",\"name\":\"ClinicOne\",\"type\":\"ClinicName\"},\"specialty\":{\"codeSystem\":\"VA:Specialty\","
                + "\"entityType\":\"Specialty\",\"id\":\"FM\",\"name\":\"Family Medicine\",\"type\":\"Speciality\"},\"subject\":{\"codeSystem\":\"VA:UniversalId\","
                + "\"entityType\":\"Subject\",\"id\":\"2299:2222:Junk\",\"name\":null,\"type\":\"Patient\"},\"user\":{\"codeSystem\":\"VA:Provider\","
                + "\"entityType\":\"User\",\"id\":\"unitTestUserId\",\"name\":\"TESR,USER\",\"type\":\"Provider\"}},"
                + "\"duplicateCheckKey\":{\"checkSum\":\"\",\"subject\":{\"codeSystem\":\"VA:UniversalId\",\"entityType\":\"Subject\",\"id\":\"2299:2222:Junk\","
                + "\"name\":null,\"type\":\"Patient\"},\"type\":\"advice\"},\"expirationDate\":1443964500000,\"generationDate\":1443878100000,\"id\":\"2929289789573\","
                + "\"invocationInfo\":{\"callId\":\"UUID of CallId\",\"generatedBy\":\"UnitTestRulesEngine\","
                + "\"targetInfo\":{\"dataModelValidationEnabled\":false,\"intentsSet\":[\"InvocationIntentA\"],\"mode\":\"Normal\",\"perceivedExecutionTime\":null,\"supplementalMappings\":null,"
                + "\"type\":\"Background\"}},\"payload\":[{\"data\":{\"details\":{\"detail\":\"This is the Body\",\"provenance\":\"Test Data\"},\"doneDate\":null,"
                + "\"dueDate\":1443964500000,\"generatedBy\":\"GeneratedBYUnitTest\",\"id\":null,\"pid\":\"PatientId\",\"priority\":50,\"provider\":\"ProviderId\","
                + "\"title\":\"A Test Result\",\"type\":\"advice\"},\"type\":\"advice\"}],\"priority\":0,\"type\":\"advice\"}";
        WorkProduct wp = createWP1();
        // String out = wp.toJsonString();
        String out = JsonUtils.getMapper().writeValueAsString(wp);
        
        JsonParser parser = new JsonParser();
        JsonElement o1 = parser.parse(check);
        JsonElement o2 = parser.parse(out);
        
        assertEquals(o1, o2);
    }

    public void dumpAll() throws IOException, ParseException {
        System.out.println(createWP1().toJsonString());
        System.out.println(createWP2().toJsonString());

    }

    private WorkProduct createWP1() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setId("2929289789573");
        wp.setType("advice");
        wp.getCategories().add("TestCategory1");
        wp.getCategories().add("TestCategory20");
        wp.getCategories().add("snomedcode");
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
        formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
        Date expDate = formatter.parse("4/10/2015/13:15:00");
        wp.setExpirationDate(expDate);

        Date genDate = formatter.parse("3/10/2015/13:15:00");
        wp.setGenerationDate(genDate);

        Context ctx = new Context();
        User usr = new User();
        usr.setId("unitTestUserId");
        usr.setCodeSystem("VA:Provider");
        usr.setName("TESR,USER");
        usr.setType("Provider");
        ctx.setUser(usr);

        Subject sub = new Subject();
        sub.setCodeSystem("VA:UniversalId");
        sub.setId("2299:2222:Junk");
        sub.setType("Patient");
        ctx.setSubject(sub);

        Location loc = new Location();
        loc.setCodeSystem("VA:Location");
        loc.setId("2883");
        loc.setType("ClinicName");
        loc.setName("ClinicOne");
        ctx.setLocation(loc);

        Specialty spec = new Specialty();
        spec.setCodeSystem("VA:Specialty");
        spec.setId("FM");
        spec.setType("Speciality");
        spec.setName("Family Medicine");
        ctx.setSpecialty(spec);

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<String>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        CDSResult result = new CDSResult();
        result.getDetails().setDetail("This is the Body");
        result.setGeneratedBy("GeneratedBYUnitTest");
        result.setDueDate(expDate);
        result.getDetails().setProvenance("Test Data");
        result.setTitle("A Test Result");
        result.setType(InvocationConstants.ADVICE);
        result.setPriority(50);
        result.setPid("PatientId");
        result.setProvider("ProviderId");

        Payload payload = new Payload();
        payload.setData(result);
        payload.setType("advice");
        wp.getPayload().add(payload);

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

        Payload payload2 = new Payload();

        payload2.setData(req);
        payload2.setType("FHIR-Comminication");
        // Disable for now unitl we fix FHIR infinite recursion
        // wp.getPayload().add(payload2);

        return wp;

    }

    private WorkProduct createWP2() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setId("345589789573");
        wp.setType("CDSAdvice");
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
        formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
        Date expDate = formatter.parse("5/10/2015/13:15:00");
        wp.setExpirationDate(expDate);

        Date genDate = formatter.parse("3/13/2015/13:15:00");
        wp.setGenerationDate(genDate);

        Context ctx = new Context();
        User usr = new User();
        usr.setId("unitTestUserId");
        usr.setCodeSystem("VA:Provider");
        usr.setName("TESR,USER");
        usr.setType("Provider");
        ctx.setUser(usr);

        Subject sub = new Subject();
        sub.setCodeSystem("VA:UniversalId");
        sub.setId("666222:Junk");
        sub.setType("Patient");
        ctx.setSubject(sub);

        Location loc = new Location();
        loc.setCodeSystem("VA:Location");
        loc.setId("2883");
        loc.setType("ClinicName");
        loc.setName("ClinicTwo");
        ctx.setLocation(loc);

        Specialty spec = new Specialty();
        spec.setCodeSystem("VA:Specialty");
        spec.setId("FM");
        spec.setType("Speciality");
        spec.setName("Family Medicine");
        ctx.setSpecialty(spec);

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<String>();
        intents.add("InvocationIntentB");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        CDSResult result = new CDSResult();
        result.getDetails().setDetail("This is the Second Body");
        result.setGeneratedBy("GeneratedBYUnitTest");
        result.getDetails().setProvenance("Test Data");
        result.setTitle("Another Test Result");
        result.setType(InvocationConstants.PROPOSAL);
        result.setPriority(76);
        result.setPid("PatientId");
        result.setProvider("ProviderId");

        Payload payload = new Payload();
        payload.setData(result);
        payload.setType("Result");
        wp.getPayload().add(payload);

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

        Payload payload2 = new Payload();

        payload2.setData(req);
        payload2.setType("FHIR-Comminication");
        // Disable for now unitl we fix FHIR infinite recursion
        // wp.getPayload().add(payload2);

        return wp;

    }

}
