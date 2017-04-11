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

package com.cognitive.cds.invocation.parse;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedList;
import java.util.List;

import org.junit.Ignore;
import org.junit.Test;

import ca.uhn.fhir.model.dstu2.resource.Bundle;

import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.util.FhirUtils;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;

public class ResultBundleObjectMapTest {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ResultBundleObjectMapTest.class);

    // ==================== DATA PREP ==============================
    /**
     * PREPING a ResultBundle with body = string
     * 
     * @return
     */
    private ResultBundle setupResults() {
        ResultBundle out1 = new ResultBundle();
        LinkedList<Result> results1 = new LinkedList<Result>();
        results1.add(new Result("Test", "A Test Result", "The Body", "JUNIT", "Uncalled"));
        results1.add(new Result("Test", "Another Result", "The Second Body", "JUNIT", "Uncalled"));
        out1.setStatus(StatusCode.SUCCESS);
        out1.setResults(results1);

        return out1;
    }

    /**
     * Using simple generic JSON string for body attribute.
     * 
     * @return
     * @throws IOException
     */
    private ResultBundle3 setupResultsBundle3_WithJSONBody() throws IOException {

        ResultBundle3 out = new ResultBundle3();
        List<Result3> results = new LinkedList<Result3>();

        results.add(new Result3("Test", "A Test Result", "{\"foo\":18}", "JUNIT", "Uncalled"));

        // -------------------------------------------
        // PREP the ResultBundle3 object ..which is representative of
        // what is returned from CDSInvoker.invoke() to upper level
        // InvokeService
        // -------------------------------------------
        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }

    // Social-history now part of observation
    /**
     * Using an HL7 FHIR full entried Patient and HealthFactors, now social-history, for body
     * attribute.
     * 
     * @return
     * @throws IOException
     */
    private ResultBundle3 setupResultsBundle3_WithSerializedObjectBody() throws IOException {
        ResultBundle3 out = new ResultBundle3();
        List<Result3> results = new LinkedList<Result3>();

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result3 class
        // -------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "samplePatientAndHealthFactors.json"));

        results.add(new Result3("Test", "A Test Result", new String(b), "JUNIT", "Uncalled"));
        // -------------------------------------------
        // PREP the ResultBundle3 object ..which is representative of
        // what is returned from CDSInvoker.invoke() to upper level
        // InvokeService
        // -------------------------------------------
        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }

    /**
     * DATA ResultBundle.Result[0].body=Item .Result[1].body=Item
     * 
     * @return
     * @throws IOException
     */
    private ResultBundle2 setupResultsBundle2_WithSimpleObjectBody() throws IOException {

        ResultBundle2 out = new ResultBundle2();
        List<Result2> results = new LinkedList<Result2>();

        String json = "{\n" + "    \"id\": 1,\n" + "    \"itemName\": \"theItem\",\n" + "    \"owner\": {\n" + "        \"id\": 2,\n" + "        \"name\": \"theUser\"\n" + "    }\n" + "}";
        Item item = new ObjectMapper().readValue(json.getBytes(), Item.class);
        results.add(new Result2("Test", "A Test Result", item, "JUNIT", "Uncalled"));

        json = "{\n" + "    \"id\": 1,\n" + "    \"itemName\": \"theItem\",\n" + "    \"owner\": {\n" + "        \"id\": 2,\n" + "        \"name\": \"theUser\"\n" + "    }\n" + "}";
        results.add(new Result2("Test2", "A Test Result 2", item, "JUNIT", "Called"));

        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }

    private ResultBundle2 setupResultsBundle2_WithBundleBody() throws IOException {
        ResultBundle2 out = new ResultBundle2();
        List<Result2> results = new LinkedList<Result2>();

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result3 class
        // -------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations.json"));

        Bundle bundle = (Bundle) FhirUtils.newJsonParser().parseResource(new String(b, "UTF-8"));

        results.add(new Result2("Test2", "A Test Result 2", bundle, "JUNIT", "Called"));

        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }

    // ==================== TESTS ==============================

    // @Test
    // public void testObjectMapperCDS() throws IOException {
    //
    //
    // ObjectMapperCDS mapper = new ObjectMapperCDS();
    //
    // //-----------------------------------------------------
    // // PREP DATA - ResultsBundle2.Result[x].body
    // //-----------------------------------------------------
    // ResultBundle2 rb = setupResultsBundle2_WithBundleBody();
    //
    // //-----------------------------------------------------
    // // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
    // // Serialize to format: Json String
    // //-----------------------------------------------------
    // String outstr = mapper.writeValueAsString(rb);
    //
    //
    //
    // logger.info("=============================\n" + outstr);
    //
    // }

    // @Ignore("resource is missing")
    @Test
    public void testSerializeBodyAsBundleObject() throws IOException {

        ObjectMapper mapper = new ObjectMapper();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        ResultBundle2 rb = setupResultsBundle2_WithBundleBody();

        // -----------------------------------------------------
        // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
        // Serialize to format: Json String
        // -----------------------------------------------------

        // SUBTEST: with custom serializer
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleModule module = new SimpleModule();
        module.addSerializer(Bundle.class, new com.cognitive.cds.invocation.fhir.BundleSerializer());
        mapper.registerModule(module);

        String outstr = mapper.writeValueAsString(rb);

        logger.info("=============================\n" + outstr);

    }

    /**
     * 
     * OTHER TESTED SCENARIOS:
     * 
     * //SUBTEST: with @JsonRawValue on "body" --> THIS PASSES..but gives body
     * as unusable pointer address //OUTCOME: 2015-05-31 16:40:39 INFO
     * ResultBundleObjectMapTest:215 -
     * {"results":[{"type":"Test2","body":Bundle[319
     * entries,id=http://127.0.0.1:8888/resource/fhir/Bundle/a4a17e7a-874d-3279-
     * b663-4f47b700f8cf],"callId":"Called","title":"A Test Result 2"
     * ,"provenance":"JUNIT","generatedBy":null}],"status":{"code":"0"},
     * "faultInfo":[]} //SUBTEST: without @JsonRawValue on "body" --> THIS GIVES
     * INFINITE RECURSION ERROR // ByteArrayOutputStream os = new
     * ByteArrayOutputStream(); // mapper.writeValue(os, rb); // String outstr =
     * os.toString();
     * 
     * //SUBTEST: with @JsonIgnore on "body" //THIS EXCLUDES THE body object
     * cause using it in conjunction //OUTCOME: 2015-05-31 16:35:37 INFO
     * ResultBundleObjectMapTest:215 -
     * {"results":[{"type":"Test2","callId":"Called","title":"A Test Result 2"
     * ,"provenance":"JUNIT","generatedBy":null}],"status":{"code":"0"},
     * "faultInfo":[]} // StringWriter writer = new StringWriter(); //
     * mapper.writeValue(writer, rb); // logger.info(writer.toString());
     * 
     * @throws IOException
     */
    @Test
    public void testSerializeBodyAsBundleObject_proto() throws IOException {

        ObjectMapper mapper = new ObjectMapper();

        // -----------------------------------------------------
        // PREP DATA - ResultsBundle2.Result[x].body
        // -----------------------------------------------------
        ResultBundle2 rb = setupResultsBundle2_WithBundleBody();

        // -----------------------------------------------------
        // SERIALIZING - data will have an Object that is a HAPI FHIR Bundle
        // Serialize to format: Json String
        // -----------------------------------------------------

        // SUBTEST: with custom serializer

        // Setup a intented output - This is legal our own non shared instance
        // of the mapper.
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleModule module = new SimpleModule();
        module.addSerializer(Bundle.class, new BundleSerializer()); // serializer
                                                                    // in test
        mapper.registerModule(module);
        String outstr = mapper.writeValueAsString(rb);

        logger.info("=============================\n" + outstr);

    }

    //
    // @Test
    // public void testDeserializeObjectToBundle() throws IOException {
    //
    // ObjectMapper mapper = new ObjectMapper();
    //
    // //-----------------------------------------------------
    // // PREP DATA - ResultsBundle2.Result[x].body = <simple Item class>
    // // SERIALIZING - data will have an Object that is a HAPI FHIR Bundles
    // //-----------------------------------------------------
    // ResultBundle2 rb = setupResultsBundle2_WithBundleBody();
    //
    // ResultBundle2 deserialized = mapper.readValue( XXX ,
    // ResultBundle2.class);
    // assertEquals(deserialized.getResults().get(0).getCallId(),
    // rb.getResults().get(0).getCallId());
    //
    // }

    /*
     * Testing with "body" = simple Item class passes successfully.
     * 
     * Running com.cognitive.cds.invocation.parse.ResultBundleObjectMapTest
     * {"results":[{"type":"Test","body":com.cognitive.cds.invocation.parse.
     * Item@46b28892,"callId":"Uncalled","title":"A Test Result"
     * ,"provenance":"JUNIT","generatedBy":null},{"type":"Test2","body":com.
     * cognitive.cds.invocation.parse.Item@46b28892,"callId":"Called","title":
     * "A Test Result 2"
     * ,"provenance":"JUNIT","generatedBy":null}],"status":{"code":"0"},
     * "faultInfo":[]}{"id":1,"itemName":"theItem","owner":{"id":2,"name":
     * "theUser"}}
     */
    @Test
    public void testBodyAsSimpleObject() throws IOException {

        ObjectMapper mapper = new ObjectMapper();

        ResultBundle2 rb = setupResultsBundle2_WithSimpleObjectBody();

        // -----------------------------------------------------
        // SERIALIZING
        // -----------------------------------------------------
        mapper.writeValue(System.out, rb);
        logger.info("\n");
        mapper.writeValue(System.out, rb.getResults().get(0).getBody());

        byte[] bodyBytes = mapper.writeValueAsBytes(rb.getResults().get(0).getBody());

    }

    /**
     * TESTING JACKSON FILTER on SERIALIZER Goal: Set up a serializer filter
     * that will ignore the specified field.
     * 
     * TEST RESULT - note no "body" attribute. 2015-05-31 15:50:57 INFO
     * ResultBundleObjectMapTest:279 -
     * {"results":[{"type":"Test2","callId":"Called","title":"A Test Result 2"
     * ,"provenance":"JUNIT","generatedBy":null}],"status":{"code":"0"},
     * "faultInfo":[]}
     * 
     * @throws IOException
     */
    // @Test
    // public void testSerialize_FilterOnBody() throws IOException {
    //
    // ObjectMapper mapper = new ObjectMapper();
    //
    // //-----------------------------------------------------
    // // PREP DATA - ResultsBundle2.Result[x].body = <simple Item class>
    // //-------------------------------- ---------------------
    // ResultBundle2 rb = setupResultsBundle2_WithBundleBody();
    //
    // //-----------------------------------------------------
    // // SERIALIZING with filter of body attribute
    // // Note: body attribute = an Object that is a HAPI FHIR Bundle
    // //-----------------------------------------------------
    // mapper.addMixIn(Object.class, BodyMixin.class);
    // FilterProvider filterProvider = new SimpleFilterProvider()
    // .addFilter("body filter",
    // SimpleBeanPropertyFilter.serializeAllExcept("body"));
    // mapper.setFilters(filterProvider);
    //
    // StringWriter writer = new StringWriter();
    // mapper.writeValue(writer, rb);
    //
    // logger.info(writer.toString());
    // }

    @Test
    public void testBodyAsSimpleItemObject() throws IOException {

        logger.info("TESTING: testBodyAsSimpleItemObject");

        ObjectMapper mapper = new ObjectMapper();

        // -----------------------------------------------------
        // SERIALIZING
        // -----------------------------------------------------
        // READ in a ResultBunlde.results[].body=<FHIR JSON>
        ResultBundle2 rb = setupResultsBundle2_WithSimpleObjectBody();

        mapper.writeValue(System.out, rb);
        logger.info("\n-------------------------");
        mapper.writeValue(System.out, rb.getResults().get(0).getBody());
        logger.info("\n");

    }

    /*
     * TEST RESULT Running
     * com.cognitive.cds.invocation.parse.ResultBundleObjectMapTest FOUND:
     * {"results":[{"type":"Test","body":{"foo":18},"callId":"Uncalled","title":
     * "A Test Result"
     * ,"provenance":"JUNIT","generatedBy":null}],"status":{"code":"0"},
     * "faultInfo":null} Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time
     * elapsed: 1.787 sec
     */

    @Ignore("String does not match right now - TODO")
    @Test
    public void testBodyAsJSONObject() throws IOException {

        ObjectMapper mapper = new ObjectMapper();

        ResultBundle3 rb = setupResultsBundle3_WithJSONBody();
        String expected = "{\"results\":[{\"type\":\"Test\",\"body\":{\"foo\":18},\"callId\":\"Uncalled\",\"title\":\"A Test Result\",\"provenance\":\"JUNIT\",\"generatedBy\":null}],\"status\":{\"code\":\"0\"},\"faultInfo\":[]}";
        String output = mapper.writeValueAsString(rb);
        if (output.compareTo(expected) != 0) {
            logger.debug("E:" + expected);
            logger.debug("F:" + expected);
            fail("JSON Mismatch");
        }

        ResultBundle3 deserialized = mapper.readValue(output, ResultBundle3.class);
        logger.info("BODY: " + deserialized.getResults().get(0).getBody().toString());
        assertEquals(deserialized.getResults().get(0).getBody().toString(), "{\"foo\":18}");
    }

    /**
     * Generically checking simple Jackson Streaming technique.
     */
    @Test
    public void testParseResultBundle_StreamAPI() {
        try {

            JsonFactory jfactory = new JsonFactory();

            // READ DATA FROM JSON FILE
            JsonParser jParser = jfactory.createParser(new File("src/test/resources/sampleResultsBundle.json"));

            // continue parsing the token till the end of input is reached
            while (!jParser.isClosed()) {
                // get the token
                JsonToken token = jParser.nextToken();

                // if its the last token then we are done
                if (token == null)
                    break;

                // looking for field that says "body"
                if (JsonToken.FIELD_NAME.equals(token) && "body".equals(jParser.getCurrentName())) {
                    while (true) {
                        token = jParser.nextToken();
                        if (token == null)
                            break;
                        token = jParser.nextToken();
                        logger.info(jParser.getText());

                    }
                }
            }
            jParser.close();

        } catch (JsonGenerationException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Test
    public void testSimpleJacksonCustomDeserializer() throws IOException {

        String json = null;

        // ----------------------------
        // USING DEFAULT DESERIALIZER with specific bind class.
        // ----------------------------
        json = "{\n" + "    \"id\": 1,\n" + "    \"itemName\": \"theItem\",\n" + "    \"owner\": {\n" + "        \"id\": 2,\n" + "        \"name\": \"theUser\"\n" + "    }\n" + "}";
        Item itemWithOwner = new ObjectMapper().readValue(json.getBytes(), Item.class);

        logger.info("-----------------------------------");
        logger.info("===> ITEM.NAME: " + itemWithOwner.getItemName());
        logger.info("===> OWNER.NAME: " + itemWithOwner.getOwner().getName());
        logger.info("===> OWNER.ID: " + itemWithOwner.getOwner().getId());

        assertEquals(itemWithOwner.getItemName(), "theItem");
        assertEquals(itemWithOwner.getOwner().getName(), "theUser");
        assertEquals(itemWithOwner.getOwner().getId(), 2);

        // ----------------------------
        // USING CUSTOM DESERIALIZER
        // to handle a newly introduced attribute (createdBy) not pre-defined in
        // bind class.
        // ----------------------------
        json = "{\n" + "    \"id\": 1,\n" + "    \"itemName\": \"theItem\",\n" + "    \"createdBy\": 20\n" + "}";

        // register a custom deserializer AND deserialize the JSON
        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Item.class, new ItemDeserializer());
        mapper.registerModule(module);

        Item itemCustom = mapper.readValue(json, Item.class);

        logger.info("-----------------------------------");
        logger.info("===> ITEM.NAME: " + itemCustom.getItemName());
        logger.info("===> OWNER.NAME: " + itemCustom.getOwner().getName());
        logger.info("===> OWNER.ID: " + itemCustom.getOwner().getId());

        assertEquals(itemCustom.getOwner().getName(), null);
        assertEquals(itemCustom.getOwner().getId(), 20);

        // NOW, if data has owner attribute instead of createdBy, ser/der should
        // still work fine.
        json = "{\n" + "    \"id\": 1,\n" + "    \"itemName\": \"theItem\",\n" + "    \"owner\": {\n" + "        \"id\": 2,\n" + "        \"name\": \"theUser\"\n" + "    }\n" + "}";
        itemCustom = mapper.readValue(json.getBytes(), Item.class);

        logger.info("-----------------------------------");
        logger.info("===> ITEM.NAME: " + itemCustom.getItemName());
        logger.info("===> OWNER.NAME: " + itemCustom.getOwner().getName());
        logger.info("===> OWNER.ID: " + itemCustom.getOwner().getId());

        assertEquals(itemCustom.getOwner().getName(), "theUser");
        assertEquals(itemCustom.getOwner().getId(), 2);

    }

}
