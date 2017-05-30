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
package com.cognitive.cds.invocation.workproduct.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.TimeZone;

import org.junit.Test;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.Specialty;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class WorkProductTest {

    // Note: This check string needs to be in compact form. A Pretty print
    // version will fail the test. A Simple white space strip will pull spaces
    // in the data strings.
    private final String checkWP1 = "{" + "\"categories\":[\"UnitTestCategory1\",\"UnitTestCategory2\"]," + "\"context\":{" + "\"location\":{" + "\"codeSystem\":\"VA:Location\","
            + "\"entityType\":\"Location\"," + "\"id\":\"2883\"," + "\"name\":\"ClinicOne\"," + "\"type\":\"ClinicName\"" + "}," + "\"specialty\":null," + "\"subject\":{"
            + "\"codeSystem\":\"VA:UniversalId\"," + "\"entityType\":\"Subject\"," + "\"id\":\"2299:2222:Junk\"," + "\"name\":null," + "\"type\":\"Patient\"" + "}," + "\"user\":{"
            + "\"codeSystem\":\"VA:Provider\"," + "\"entityType\":\"User\"," + "\"id\":\"unitTestUserId\"," + "\"name\":\"TESR,USER\"," + "\"type\":\"Provider\"" + "}" + "},"
            + "\"duplicateCheckKey\":{" + "\"checkSum\":\"\"," + "\"subject\":{" + "\"codeSystem\":\"VA:UniversalId\"," + "\"entityType\":\"Subject\"," + "\"id\":\"2299:2222:Junk\","
            + "\"name\":null," + "\"type\":\"Patient\"" + "}," + "\"type\":\"advice\"" + "}," + "\"expirationDate\":1443964500000," + "\"generationDate\":1443878100000," + "\"id\":\"2929289789573\","
            + "\"invocationInfo\":{" + "\"callId\":\"UUID of CallId\"," + "\"generatedBy\":\"UnitTestRulesEngine\"," + "\"targetInfo\":{" + "\"dataModelValidationEnabled\":false,"
            + "\"intentsSet\":[\"InvocationIntentA\"]," + "\"mode\":\"Normal\"," + "\"perceivedExecutionTime\":null," + "\"supplementalMappings\":null," + "\"type\":\"Background\"" + "}" + "},"
            + "\"payload\":[{" + "\"data\":{" + "\"body\":\"This is the body\"," + "\"callId\":\"TheCallId\"," + "\"generatedBy\":\"GeneratedBYUnitTest\"," + "\"provenance\":\"Test Data\","
            + "\"title\":\"A Test Result\"," + "\"type\":\"advice\"" + "}," + "\"type\":\"advice\"" + "}]," + "\"priority\":0," + "\"type\":\"advice\"" + "}";

    @Test
    public void testToJSONString() throws ParseException, IOException {

        WorkProduct wp = createWP1();
        String out = wp.toJsonString();

        assertTrue("Missing Expiration date: " + out, out.contains("expirationDate"));
        assertTrue("Missing Gernation date: date" + out, out.contains("generationDate"));
        
        JsonParser parser = new JsonParser();
        JsonElement o1 = parser.parse(checkWP1);
        JsonElement o2 = parser.parse(out);
        
        System.out.println("E:" + o1.toString());
        System.out.println("F:" + o2.toString());
        
        assertEquals(o1, o2);

    }

    public void dumpAll() throws IOException, ParseException {
        System.out.println(createWP1().toJsonString());
        System.out.println(createWP3().toJsonString());
        System.out.println(createWP2().toJsonString());

    }

    private WorkProduct createWP1() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setId("2929289789573");
        wp.setType(InvocationConstants.ADVICE);
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

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        wp.getCategories().add("UnitTestCategory1");
        wp.getCategories().add("UnitTestCategory2");

        Result result = new Result();
        result.setBody("This is the body");
        result.setCallId("TheCallId");
        result.setGeneratedBy("GeneratedBYUnitTest");
        result.setProvenance("Test Data");
        result.setTitle("A Test Result");

        result.setType(InvocationConstants.ADVICE);

        Payload payload = new Payload();
        payload.setData(result);
        payload.setType(InvocationConstants.ADVICE);
        wp.getPayload().add(payload);

        String payloadData2 = "{FHIRData:null}";
        Payload payload2 = new Payload();
        payload2.setData(payloadData2);
        payload2.setType("FHIR-Comminication");
        // wp.getPayload().add(payload2);

        return wp;

    }

    private WorkProduct createWP3() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setId("3429289789573");
        wp.setType("CDSAdvice");
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
        Date expDate = formatter.parse("4/20/2015/13:15:00");
        wp.setExpirationDate(expDate);

        Date genDate = formatter.parse("3/12/2015/13:15:00");
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
        sub.setId("33399:2221:Junk");
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

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        String payloadData = "{\"priority\":40,\"id\":\"TheId2\",\"type\":\"Advice\"," + "\"title\":\"The Title\",\"details\":\"This is the details for a Another CDS Result\","
                + "\"dueDate\":1443989700000,\"doneDate\":1443903300000,\"provenance\":\"Generated by unit test\"}";

        Payload payload = new Payload();
        payload.setData(payloadData);
        payload.setType("CDSAdvice");
        wp.getPayload().add(payload);

        String payloadData2 = "{FHIRData:null}";
        Payload payload2 = new Payload();
        payload2.setData(payloadData2);
        payload2.setType("FHIR-Comminication");
        wp.getPayload().add(payload2);

        return wp;

    }

    private WorkProduct createWP2() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setId("2629289789573");
        wp.setType("CDSAdvice");
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
        Date expDate = formatter.parse("4/20/2015/13:15:00");
        wp.setExpirationDate(expDate);

        Date genDate = formatter.parse("3/12/2015/13:15:00");
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
        sub.setId("33399:2221:Junk");
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

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        String payloadData = "{\"priority\":70,\"id\":\"TheId3\",\"type\":\"Proposal\"," + "\"title\":\"The Title\",\"details\":\"This is the details for a Proposal\","
                + "\"dueDate\":1443989700000,\"doneDate\":1443903300000,\"provenance\":\"Generated by unit test\"}";

        Payload payload = new Payload();
        payload.setData(payloadData);
        payload.setType("Proposal");
        wp.getPayload().add(payload);

        String payloadData2 = "{FHIRData:null}";
        Payload payload2 = new Payload();
        payload2.setData(payloadData2);
        payload2.setType("FHIR-Comminication");
        wp.getPayload().add(payload2);

        return wp;

    }
}
