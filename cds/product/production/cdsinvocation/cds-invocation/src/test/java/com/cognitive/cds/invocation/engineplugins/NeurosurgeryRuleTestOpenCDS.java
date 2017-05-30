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
package com.cognitive.cds.invocation.engineplugins;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.cxf.helpers.IOUtils;
import org.junit.Ignore;
import org.junit.Test;

import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;

public class NeurosurgeryRuleTestOpenCDS {
    @Ignore("This is really an integration test")
	@Test
	public void testRheumatologyConsultRule() {

		OpenCDS openCDS = new OpenCDS();
		openCDS.setEndPoint("http://localhost:8080/opencds-decision-support-service");
		List<Rule> rules = new ArrayList<>();
		Rule rule = new Rule();
		Properties props = new Properties();
		props.put("scopingEntityId", "com.cognitive");
		props.put("businessId", "neurosurgeryConsult");
		props.put("version", "1.0.0");
		rule.setProperties(props);
		rules.add(rule);
		FhirContext ctx = FhirContext.forDstu2();
		IParser jsonParser = ctx.newJsonParser();
		String payload = getTestData("heightWeight.json");

		ResultBundle result = openCDS.invoke(rules, payload, "11111", null);

		String body = (String) result.getResults().get(0).getBody();

	    System.out.println(body);
		assertTrue(body.contains("Passed"));
	}
	private String getTestData(String fileName) {
		String result = "";
		ClassLoader classLoader = getClass().getClassLoader();
		try {
			result = IOUtils.toString(classLoader.getResourceAsStream(fileName));
		} catch (IOException e) {
			System.out.println("Couldn't read resoruce : " + fileName + " " + e.getMessage());
		}
		return result;
	}
}
