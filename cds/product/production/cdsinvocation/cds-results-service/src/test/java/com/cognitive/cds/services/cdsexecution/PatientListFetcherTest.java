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
package com.cognitive.cds.services.cdsexecution;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.HashSet;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-executionTest.xml" })

public class PatientListFetcherTest {
	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PatientListFetcherTest.class);

	@Autowired
	//@Qualifier("baseService")
	PatientListFetcher instance;


	@Ignore("Configured as a Service level integration test right now")
	@Test
	public void testFetchSubject() {
		HashSet<String> ids = new HashSet<>();
		try {
			instance.fetchSubject("TestList1", ids);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			logger.error("Error Fetching Patient List", e);
			fail(e.getMessage());
		}
		assertTrue("Id set is empty",ids.size()>0);
	}

}
