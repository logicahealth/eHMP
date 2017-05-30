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
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cognitive.cds.invocation.parse;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.TimeZone;

import org.junit.Test;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.fhir.IResourceSerializer;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Specialty;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.util.FhirUtils;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.invocation.workproduct.model.InvocationInfo;
import com.cognitive.cds.invocation.workproduct.model.Payload;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

/**
 *
 * @author tnguyen
 */
public class IResourceObjectMapTest {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(IResourceObjectMapTest.class);

    @Test
    public void testObjectMapperCDS() throws IOException, ParseException {

        ObjectMapper mapper = JsonUtils.getMapper();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        ResultBundle2 rb = setupResultsBundle2_WithBundleBody();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        WorkProduct wp = prepInfoAttributes();
        this.addBundlePayload(wp);
        this.addStringPayload(wp);

        // -----------------------------------------------------
        // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
        // Serialize to format: Json String
        // -----------------------------------------------------
        String outstr = mapper.writeValueAsString(rb);

        logger.info("========== with BUNDLE ===============\n" + outstr);

        outstr = mapper.writeValueAsString(wp);

        logger.info("========== with IRESOURCE ==============\n" + outstr);

    }

    @Test
    public void testIResourceSerialier_Bundle() throws ParseException, JsonProcessingException, IOException {

        logger.info("TESTING testIResourceSerialier_Bundle()");

        ObjectMapper mapper = JsonUtils.getMapper();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        WorkProduct wp = prepInfoAttributes();
        this.addBundlePayload(wp);
        this.addStringPayload(wp);

        // -----------------------------------------------------
        // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
        // Serialize to format: Json String
        // -----------------------------------------------------

        SimpleModule module = new SimpleModule();
        module.addSerializer(IResource.class, new IResourceSerializer());
        mapper.registerModule(module);
        String outstr = mapper.writeValueAsString(wp);

        logger.info("=============================\n" + outstr);

    }

    @Test
    public void testIResourceSerialier_simple() throws ParseException, JsonProcessingException, IOException {

        logger.info("TESTING testIResourceSerialier_simple()");

        ObjectMapper mapper = JsonUtils.getMapper();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        WorkProduct wp = prepInfoAttributes();
        this.addStringPayload(wp);

        // -----------------------------------------------------
        // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
        // Serialize to format: Json String
        // -----------------------------------------------------

        SimpleModule module = new SimpleModule();
        module.addSerializer(IResource.class, new IResourceSerializer());
        mapper.registerModule(module);
        String outstr = mapper.writeValueAsString(wp);

        // -----------------------------------------------------
        // COMPARE
        // -----------------------------------------------------
        logger.info("=============================\n" + outstr);

        String compare = "{\"categories\":[\"UnitTestCategory1\",\"UnitTestCategory2\"],\"context\":{\"location\":{\"codeSystem\":\"VA:Location\",\"entityType\":\"Location\",\"id\":\"2883\",\"name\":\"ClinicOne\",\"type\":"
                + "\"ClinicName\"},\"specialty\":null,\"subject\":{\"codeSystem\":\"VA:UniversalId\",\"entityType\":\"Subject\",\"id\":\"2299:2222:Junk\",\"name\":null,\"type\":\"Patient\"},\"user\":{"
                + "\"codeSystem\":\"VA:Provider\",\"entityType\":\"User\",\"id\":\"unitTestUserId\",\"name\":\"TESR,USER\",\"type\":\"Provider\"}},\"duplicateCheckKey\":{\"checkSum\":\"\",\"subject\":{"
                + "\"codeSystem\":\"VA:UniversalId\",\"entityType\":\"Subject\",\"id\":\"2299:2222:Junk\",\"name\":null,\"type\":\"Patient\"},\"type\":\"advice\"},\"expirationDate\":1443964500000,\"generationDate\":1443878100000,\"id\":\"2929289789573\",\"invocationInfo\":{"
                + "\"callId\":\"UUID of CallId\",\"generatedBy\":\"UnitTestRulesEngine\",\"targetInfo\":{\"dataModelValidationEnabled\":false,\"intentsSet\":[\"InvocationIntentA\"],\"mode\":\"Normal\",\"perceivedExecutionTime\":null,\"supplementalMappings\":null"
                + ",\"type\":\"Background\"}},\"payload\":[{\"data\":{\"body\":\"This is the body\",\"callId\":\"TheCallId\",\"generatedBy\":\"GeneratedBYUnitTest\",\"provenance\":\"Test Data\",\"title\""
                + ":\"A Test Result\",\"type\":\"advice\"},\"type\":\"advice\"}],\"priority\":0,\"type\":\"advice\"}";

        JsonParser parser = new JsonParser();
        JsonElement o1 = parser.parse(compare);
        JsonElement o2 = parser.parse(outstr);
        
        System.out.println("E:" + o1.toString());
        System.out.println("F:" + o2.toString());
        
        assertEquals(o1, o2);
    }

    private WorkProduct prepInfoAttributes() throws ParseException, IOException {
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
        com.cognitive.cds.invocation.model.User usr = new com.cognitive.cds.invocation.model.User();
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
        ArrayList<String> intents = new ArrayList<String>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        wp.getCategories().add("UnitTestCategory1");
        wp.getCategories().add("UnitTestCategory2");

        return wp;
    }

    private void addStringPayload(WorkProduct wp) throws ParseException, IOException {
        Result2 result = new Result2();
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

    }

    private void addBundlePayload(WorkProduct wp) throws ParseException, IOException {
        Payload payload = new Payload();
        payload.setData(setupResult2_WithBundleBody());
        payload.setType(InvocationConstants.ADVICE);
        wp.getPayload().add(payload);
    }

    private Result2 setupResult2_WithBundleBody() throws IOException {

        Result2 result = new Result2();

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result3 class
        // -------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations.json"));

        IResource res = FhirUtils.newJsonParser().parseResource(new String(b, "UTF-8"));

        result = new Result2("Test2", "A Test Result 2", res, "JUNIT", "Called");

        return result;
    }

    private ResultBundle2 setupResultsBundle2_WithBundleBody() throws IOException {
        ResultBundle2 out = new ResultBundle2();
        List<Result2> results = new LinkedList<Result2>();

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result3 class
        // -------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations.json"));

        // creating a Bundle object contining the read in file
        Bundle bundle = (Bundle) FhirUtils.newJsonParser().parseResource(new String(b, "UTF-8"));

        results.add(new Result2("Test2", "A Test Result 2", bundle, "JUNIT", "Called"));

        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }
}
