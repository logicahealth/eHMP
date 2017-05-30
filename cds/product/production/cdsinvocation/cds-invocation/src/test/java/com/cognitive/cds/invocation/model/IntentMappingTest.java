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
package com.cognitive.cds.invocation.model;

import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.CDSInvoker;
import com.cognitive.cds.invocation.fhir.FhirDataRetrieverTest;
import org.junit.Ignore;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:Test-CDSMockTest.xml" })
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class IntentMappingTest {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(IntentMappingTest.class);

    @Autowired
    CDSInvoker theInvoker;

    @Ignore
    @Test
    public void testJSONString() throws IOException {
        String expected = "{\"description\":\"A Mock Intent\",\"globalName\":\"Enterprise//FirstEngine\",\"governance\":null,\"id\":\"\",\"invocations\":[{\"dataFormat\":\"application/json+fhir\",\"dataQueries\":null,\"engineName\":\"engineOne\",\"name\":null,\"rules\":[{\"id\":\"genderAgeRule\",\"properties\":{\"delay\":\"10\"}}]"
                + ",\"validateDataModel\":false}" + "],\"name\":\"FirstEngine\",\"scope\":\"Enterprise\",\"scopeId\":null}";
        IntentMapping map = theInvoker.getIntentsMap().get("FirstEngine");
        String json = map.toJsonString();
        /*if (json.compareTo(expected) != 0) {
            log.error("IntentMapping JSON string did not match exepcted value");
            log.error("E:" + expected);
            log.error("F:" + json);
            System.out.println("IntentMapping JSON string did not match exepcted value");
            System.out.println("E:" + expected);
            System.out.println("F:" + json);
            fail("IntentMapping JSON string did not match exepcted value/nE:" + expected + "/nF:" + json);
        }*/

    }
}
