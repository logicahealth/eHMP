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
package com.cognitive.cds.invocation.mongo;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.execution.model.PatientList;

public class PatientListDaoTest {

    private static MongoDbDao mongoDbDao;
    private PatientListDao patientLookup;
    private static final Logger LOGGER = LoggerFactory.getLogger(PatientListDaoTest.class);

    @BeforeClass
    public static void beforeClass() {
        try {
            ApplicationContext context = new ClassPathXmlApplicationContext(
                    "classpath:mongodb-dao-context.xml");
            mongoDbDao = (MongoDbDao) context.getBean("mongoDbDao");
        } catch (Exception e) {
            LOGGER.error("Error loading connection properties.  Cannot connect to MongoDB");
        }
    }

    @Ignore("a service integration test")
    @Test
    public void testFetchEngine() {

        patientLookup = new PatientListDao();
        patientLookup.setMongoDbDao(mongoDbDao);
        PatientList patient = patientLookup.loadPatientList("Timeout");

        Assert.assertTrue(patient != null);
    }
}
