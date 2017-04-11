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
package com.cognitive.cds.invocation.engineplugins;

import com.cognitive.cds.invocation.EngineInstanceStateManagementIFace;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import static org.junit.Assert.assertTrue;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 *
 * @author jeremy
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:Test-CDSMockEngineTest.xml"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class OpenCDSEngineInstanceStateTest {

	@Autowired
	ApplicationContext appContext;

	@Autowired
	private EngineInstanceStateManagementIFace eism;

	@Ignore("This is really an integration test")
	@Test
	public void testFhirPayloadGender() {

        //We create this in the application context now so that the other properties
		//will also be autowired, etc.
		OpenCDS openCDS = new OpenCDS();
		openCDS.setEndPoint("http://10.2.2.47:8080/opencds");

		List<Rule> rules = new ArrayList<>();
		Rule rule = new Rule();
		Properties props = new Properties();
		props.put("scopingEntityId", "com.cognitive");
		props.put("businessId", "genderAge");
		props.put("version", "1.0.0");
		rule.setProperties(props);
		rules.add(rule);
		String payload = getFhirString("patientObs.json");

		ResultBundle result = openCDS.invoke(rules, payload, "11111", eism);
		System.out.println(result.getResults().get(0).getBody());
		String body = (String) result.getResults().get(0).getBody();
		assertTrue(body.contains("CommunicationRequest"));
	}

	private String getFhirString(String file) {
		StringBuilder tmp = new StringBuilder();
		try {
			InputStream is = appContext.getResource("classpath:" + file).getInputStream();
			BufferedReader br = new BufferedReader(new InputStreamReader(is));
			String sCurrentLine;
			while ((sCurrentLine = br.readLine()) != null) {
				tmp.append(sCurrentLine);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return tmp.toString();
	}
}
