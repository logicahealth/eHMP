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

package com.cognitive.cds.services.cdsexecution;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Date;
import java.util.LinkedList;
import java.util.Properties;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.dstu2.composite.CodeableConceptDt;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.composite.QuantityDt;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.valueset.ObservationStatusEnum;
import ca.uhn.fhir.model.primitive.DecimalDt;

import com.cognitive.cds.invocation.CDSInvoker;
import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.services.cdsinteractive.InvokeServiceReq;
import com.fasterxml.jackson.core.JsonProcessingException;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })
public class BounceBackTest {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(BounceBackTest.class);

	@Autowired
	// @Quailifer("FullMockInvoker"))
	CDSInvoker theInvoker;


	@Ignore("This is a Service level test, disable this to run")
	@Test
	public void testParameterCall() {
		assertNotNull("Spring initialization failed", theInvoker);
		// Seed the engine with a number of results
	
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
		intents.add("BounceBack");
	
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
		
		Observation obs1 = new Observation();
		// Needed: Code, status,
		CodeableConceptDt code1 = new CodeableConceptDt();
		CodingDt codeDt1 = new CodingDt();
		codeDt1.setCode("8302-2");
		codeDt1.setSystem("http://loinc.org");
		code1.getCoding().add(codeDt1);
		obs1.setCode(code1);
		obs1.setStatus(ObservationStatusEnum.PRELIMINARY);

		// Useful: issued, value
		obs1.setComments("Comment");
		Date now1 = new Date(System.currentTimeMillis());
		obs.setIssuedWithMillisPrecision(now1);
		QuantityDt qdt1 = new QuantityDt();
		qdt.setCode("inches");
		DecimalDt theValue1 = new DecimalDt(68.5);
		qdt1.setValue(theValue1);
		obs1.setValue(qdt1);

		parameters.put("Height", obs1);
		

		out = theInvoker.invoke(target, context, parameters, "");
		assertNotNull(out);
		if (out.getStatus().getCode().compareTo(InvocationConstants.StatusCodes.SUCCESS.getCode()) != 0) {
			fail("Invocation failed with code " + out.getStatus().getCode());
		}
		assertTrue("Incorect number of results returned by FirstEngine Intent", out.getResults().size() == 2);

	}
	
    @Ignore
	@Test
	public void testBuildParameterCall() throws JsonProcessingException {
		assertNotNull("Spring initialization failed", theInvoker);
		// Seed the engine with a number of results
	
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
		intents.add("BounceBack");
	
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
		
		Observation obs1 = new Observation();
		// Needed: Code, status,
		CodeableConceptDt code1 = new CodeableConceptDt();
		CodingDt codeDt1 = new CodingDt();
		codeDt1.setCode("8302-2");
		codeDt1.setSystem("http://loinc.org");
		code1.getCoding().add(codeDt1);
		obs1.setCode(code1);
		obs1.setStatus(ObservationStatusEnum.PRELIMINARY);

		// Useful: issued, value
		obs1.setComments("Comment");
		Date now1 = new Date(System.currentTimeMillis());
		obs.setIssuedWithMillisPrecision(now1);
		QuantityDt qdt1 = new QuantityDt();
		qdt.setCode("inches");
		DecimalDt theValue1 = new DecimalDt(68.5);
		qdt1.setValue(theValue1);
		obs1.setValue(qdt1);

		parameters.put("Height", obs1);
		

		InvokeServiceReq req = new InvokeServiceReq();
		req.setContext(context);
		req.setParameters(parameters);
		req.setTarget(target);
		
		String reqStr = JsonUtils.toJsonStringCompact(req);
		System.out.println("Example Invoke String = "+reqStr);
	}
}
