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
package com.cognitive.cds.services.cdsresults;

import static org.junit.Assert.assertEquals;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import com.cognitive.cds.services.cdsresults.model.CDSResultBundle;
import com.cognitive.cds.services.cdsresults.model.Context;
import com.cognitive.cds.services.cdsresults.model.InvocationRequest;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.MappingJsonFactory;

public class RulesResultsServiceIT {
    private static String endpointUrl;
    private static InvocationRequest input;
    private static Context context;

    @BeforeClass
    public static void beforeClass() {
        endpointUrl = System.getProperty("service.url");
        input = new InvocationRequest();
        context = new Context();
        context.setPatientId("1");
        context.setSiteId("1");
        context.setUserId("1");
        context.setCredentials(1);
        input.setContext(context);
    }

    @Ignore("Service Integration test in the Unit test cycle")
    @Test
    public void testRoundtrip() throws Exception {
        List<Object> providers = new ArrayList<Object>();
        providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());
        input.setReason("demo");
        WebClient client = WebClient.create(endpointUrl + "/rest/invokeRules", providers);
        Response r = client.accept("application/json")
            .type("application/json")
            .post(input);
        assertEquals(Response.Status.OK.getStatusCode(), r.getStatus());
        MappingJsonFactory factory = new MappingJsonFactory();
        JsonFactory jfactory = new JsonFactory();
        JsonParser parser = jfactory.createParser((InputStream)r.getEntity());
        CDSResultBundle output = parser.readValueAs(CDSResultBundle.class);
        assertEquals("0", output.getStatus().getCode());
    }

    @Ignore("Service Integration test in the Unit test cycle")
    @Test
    public void testNotConfiguredRoundtrip() throws Exception {
        List<Object> providers = new ArrayList<Object>();
        providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());
        input.setReason("test");
        WebClient client = WebClient.create(endpointUrl + "/rest/invokeRules", providers);
        Response r = client.accept("application/json")
            .type("application/json")
            .post(input);
        assertEquals(Response.Status.OK.getStatusCode(), r.getStatus());
        JsonFactory jfactory = new JsonFactory();
        JsonParser parser = jfactory.createParser((InputStream)r.getEntity());
        CDSResultBundle output = parser.readValueAs(CDSResultBundle.class);
        assertEquals("1", output.getStatus().getCode());
    }
}
