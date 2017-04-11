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

package com.cognitive.cds;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class HealthCheckTest {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(HealthCheckTest.class);
	private static ApplicationContext context;
	private static HealthCheck healthCheck;

	@BeforeClass
	public static void beforeClass() {
		try {
			context = new ClassPathXmlApplicationContext("classpath:initIntent-mongodb-dao-context.xml");
			healthCheck = (HealthCheck) context.getBean("healthCheck");
		} catch (Exception e) {
			LOGGER.error(e.getLocalizedMessage(),e);
		}
	}

    @Ignore("This is a service integration test")
    @Test
    public void testIntents() {
    	String intents = healthCheck.getIntents();
    	assertNotNull("Intents should not be null", intents);
    	LOGGER.debug("\n********************* INTENTS \n\t" + intents);
    }

    @Ignore("This is a service integration test")
    @Test
    public void testResultsHealthCheck() {
        String results = healthCheck.healthCheck("RulesResultsService");
        assertNotNull("HealthCheck for RulesResultsService should not be null", results);
        LOGGER.debug("\n********************* HEALTH-RESULTS \n\t" + results);
    }

    @Ignore("This is a service integration test")
    @Test
    public void testMetricsHealthCheck() {
        String results = healthCheck.healthCheck("MetricsCollectionService");
        assertNotNull("HealthCheck for MetricsCollectionService should not be null", results);
        LOGGER.debug("\n********************* HEALTH-METRICS \n\t" + results);
    }

    @Ignore("This is a service integration test")
    @Test
    public void testMongoDbHealth() {
        String results = healthCheck.mongoHealth();
        assertNull("HealthCheck for MongoDB should not be null", results);
        LOGGER.debug("\n********************* MongoDB \n\t" + results);
    }

}