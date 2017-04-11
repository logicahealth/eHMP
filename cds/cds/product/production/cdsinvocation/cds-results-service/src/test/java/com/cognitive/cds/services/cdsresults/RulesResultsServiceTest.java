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
package com.cognitive.cds.services.cdsresults;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.services.cdsinteractive.InvokeServiceReq;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import com.cognitive.cds.services.cdsresults.model.Context;
import com.cognitive.cds.services.cdsresults.model.InvocationRequest;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.MappingJsonFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;
import javax.ws.rs.core.Response;
import org.apache.cxf.jaxrs.client.WebClient;
import static org.junit.Assert.assertEquals;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 *
 * @author tnguyen
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })
public class RulesResultsServiceTest {
    
    
	@Value("${invokeRulesEndpoint}")
	String endpointUrl;

    
    /**
     * Test of invokeRulesForPatient method, of class RulesResultsService.
     */
    @Ignore("Test is not complete")
    @Test
    public void testInvokeRulesForPatient_InvocationRequest() throws IOException {
        System.out.println("invokeRulesForPatient");
        
		ResultBundle out;
        
        List<Object> providers = new ArrayList<Object>();
		providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

		InvokeServiceReq input = new InvokeServiceReq();
        
        //---------- SETTING CONTEXT ---------- 
		com.cognitive.cds.invocation.model.Context context = new com.cognitive.cds.invocation.model.Context();
		context.setSubject(new Subject("TestSubject", "9E7A;140"));
		context.setLocation(new Location("Test Location", "Location1"));
		context.setUser(new User("Tester", "Id1"));
		input.setContext(context);
        
        //----------  SETTING TARGET ---------- 
        InvocationTarget target = new InvocationTarget();
        
        // setting intents
		LinkedList<String> intents = new LinkedList<String>();
		target.setIntentsSet(intents);
		intents.add("RheumatologyConsultScreen");
        
        //setting target.mode/type
		target.setMode(InvocationMode.Normal);
		target.setType(InvocationType.Direct);
        
        
        //---------- SETTING PROPERTIES ---------- 
        Properties parameters = null;
		input.setParameters(parameters);
        
        //---------- SETTING inputDataModel ---------- 
        Object inputDataModel = null;
        
		input.setTarget(target);

		WebClient client = WebClient.create(endpointUrl, providers);
		Response r = client.accept("application/json")
                            .type("application/json")
                            .post(input);
        
        
		assertEquals(Response.Status.OK.getStatusCode(), r.getStatus());
		MappingJsonFactory jfactory = new MappingJsonFactory();
		JsonParser parser = jfactory.createParser((InputStream) r.getEntity());
		ResultBundle output = parser.readValueAs(ResultBundle.class);

		String outputJson = JsonUtils.toJsonStringCompact(output);

		System.err.println("Output: " + outputJson);
		assertEquals("0", output.getStatus().getCode());
    }
    
}
