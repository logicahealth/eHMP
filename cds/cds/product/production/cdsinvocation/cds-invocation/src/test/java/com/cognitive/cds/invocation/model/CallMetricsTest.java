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

package com.cognitive.cds.invocation.model;

import static org.junit.Assert.*;

import java.io.IOException;
import java.sql.Timestamp;

import org.junit.Test;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

/**
 * @author jgoodnough
 *
 */
public class CallMetricsTest {

	public static void main(String[] args) {

		CallMetricsTest instance = new CallMetricsTest();

		try {

			CallMetrics metric = instance.createInvokeSummary();
			System.out.println("Summary Metric: ");
			System.out.println(metric.toJsonString());
			System.out.println();
			System.out.println("End on Engine Metric: ");
			metric = instance.createEngineEnd();
			System.out.println(metric.toJsonString());
		} catch (IOException e) {
			
			e.printStackTrace();
		}
	}

	/**
	 * Test method for
	 * {@link com.cognitive.cds.invocation.model.CallMetrics#toJsonString()}.
	 */
	@Test
	public void testToJsonStringInvokeSummary() {

		String checkVal = "{\"callId\":\"theCallId\",\"context\":{\"location\":{\"codeSystem\":null,\"entityType\":\"Location\",\"id\":\"10\",\"name\":\"Test Location\",\"type\":null},\"specialty\":{\"codeSystem\":\"TestCode\",\"entityType\":\"Specialty\",\"id\":\"SpecCodeVal\",\"name\":\"Radiology\",\"type\":null},\"subject\":{\"codeSystem\":null,\"entityType\":\"Subject\",\"id\":\"EA21:200\",\"name\":\"Public,John Q\",\"type\":null},\"user\":{\"codeSystem\":null,\"entityType\":\"User\",\"id\":\"UID:101019\",\"name\":\"Junit\",\"type\":null}},\"event\":\"summary\",\"invocation\":\"TestUse\",\"invocationType\":\"Direct\",\"origin\":\"\",\"time\":1425426650977,\"timings\":{\"total\":606,\"callSetup\":101,\"handlingResults\":303,\"inEngines\":202},\"totalResults\":32,\"type\":\"invoke\"}";
		CallMetrics metric = this.createInvokeSummary();

		try {
			String test = metric.toJsonString();
//			System.out.println(checkVal);
//			System.out.println(test);
			
			JsonParser parser = new JsonParser();
			JsonElement o1 = parser.parse(checkVal);
			JsonElement o2 = parser.parse(test);
	        System.out.println("E:" + o1.toString());
	        System.out.println("F:" + o2.toString());
			assertEquals(o1, o2);
		} catch (IOException e) {
			fail(e.getMessage());
		}
	}

	@Test
	public void testToJsonStringEngineEnd() {

		String checkVal = "{\"callId\":\"theCallId\",\"context\":{\"location\":{\"codeSystem\":null,\"entityType\":\"Location\",\"id\":\"10\",\"name\":\"Test Location\",\"type\":null},\"specialty\":{\"codeSystem\":\"TestCode\",\"entityType\":\"Specialty\",\"id\":\"SpecCodeVal\",\"name\":\"Radiology\",\"type\":null},\"subject\":{\"codeSystem\":null,\"entityType\":\"Subject\",\"id\":\"EA21:200\",\"name\":\"Public,John Q\",\"type\":null},\"user\":{\"codeSystem\":null,\"entityType\":\"User\",\"id\":\"UID:101019\",\"name\":\"Junit\",\"type\":null}},\"event\":\"end\",\"invocation\":\"TestUse\",\"invocationType\":\"Direct\",\"origin\":\"Engine1\",\"time\":1425426650977,\"timings\":{},\"totalResults\":0,\"type\":\"engine\"}";
		CallMetrics metric = this.createEngineEnd();

		try {
			String test = metric.toJsonString();

			System.out.println("E:" + checkVal);
			System.out.println("F:" + test);
			
			JsonParser parser = new JsonParser();
			JsonElement o1 = parser.parse(checkVal);
			JsonElement o2 = parser.parse(test);
			
			assertEquals(o1, o2);
			
		} catch (IOException e) {
			fail(e.getMessage());
		}
	}

	private CallMetrics createInvokeSummary() {
		CallMetrics metric = new CallMetrics();
		metric.setCallId("theCallId");

		Context ctx = new Context();
		Location loc = new Location();
		loc.setId("10");
		loc.setName("Test Location");
		ctx.setLocation(loc);
		Subject subject = new Subject();
		subject.setId("EA21:200");
		subject.setName("Public,John Q");
		ctx.setSubject(subject);
		User user = new User();
		user.setId("UID:101019");
		user.setName("Junit");
		ctx.setUser(user);
		Specialty spec = new Specialty();
		spec.setId("SpecCodeVal");
		spec.setCodeSystem("TestCode");
		spec.setName("Radiology");
		ctx.setSpecialty(spec);

		metric.setContext(ctx);

		metric.setOrigin("");
		metric.setEvent("summary");
		metric.setInvocation("TestUse");
		metric.setType("invoke");
		metric.setTime(new Timestamp(1425426650977L));
		metric.setTotalResults(32);

		metric.getTimings().put("total", new Long(606L));
		metric.getTimings().put("callSetup", new Long(101L));
		metric.getTimings().put("inEngines", new Long(202L));
		metric.getTimings().put("handlingResults", new Long(303L));

		return metric;
	}

	private CallMetrics createEngineEnd() {
		CallMetrics metric = new CallMetrics();
		metric.setCallId("theCallId");

		Context ctx = new Context();
		Location loc = new Location();
		loc.setId("10");
		loc.setName("Test Location");
		ctx.setLocation(loc);
		Subject subject = new Subject();
		subject.setId("EA21:200");
		subject.setName("Public,John Q");
		ctx.setSubject(subject);
		User user = new User();
		user.setId("UID:101019");
		user.setName("Junit");
		ctx.setUser(user);
		Specialty spec = new Specialty();
		spec.setId("SpecCodeVal");
		spec.setCodeSystem("TestCode");
		spec.setName("Radiology");
		ctx.setSpecialty(spec);

		metric.setContext(ctx);

		metric.setOrigin("Engine1");
		metric.setEvent("end");
		metric.setInvocation("TestUse");
		metric.setType("engine");
		metric.setTime(new Timestamp(1425426650977L));

	

		return metric;
	}
}
