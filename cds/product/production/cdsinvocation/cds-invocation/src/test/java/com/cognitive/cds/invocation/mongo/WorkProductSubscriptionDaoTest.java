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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.workproduct.model.WorkProductSubscription;
import com.fasterxml.jackson.core.JsonProcessingException;

/**
 *
 * @author Jeremy Fox
 */
public class WorkProductSubscriptionDaoTest {

    private static MongoDbDao mongoDbDao;
    private WorkProductSubscriptionDao workProductSubscriptionDao;
    private WorkProductDao workProductDao;
    private static final Logger LOGGER = LoggerFactory.getLogger(WorkProductSubscriptionDaoTest.class);

    @BeforeClass
    public static void beforeClass() {
        try {
            ApplicationContext context = new ClassPathXmlApplicationContext("classpath:mongodb-dao-context.xml");
            mongoDbDao = (MongoDbDao) context.getBean("mongoDbDao");
        } catch (Exception e) {
            LOGGER.error("Error loading connection properties. Cannot connect to MongoDB");
        }
    }

    // Ignoring this out for the time being - subscription data is managed by
    // the RDK
    // so this test only passes with appropriate test data in place.
    @Ignore("a service integration test")
    @Test
    public void testGetWorkProductSubscription() {

        workProductSubscriptionDao = new WorkProductSubscriptionDao();
        workProductSubscriptionDao.setMongoDbDao(mongoDbDao);
        
        WorkProductSubscription wpsTest = new WorkProductSubscription();
        wpsTest.setUser("SITE:10000000255");
        wpsTest.setPriority("URG");
        List<String> types = new ArrayList<>();
        types.add("advice");
        types.add("proposal");
        types.add("reminder");
        wpsTest.setType(types);
        List<Integer> specialities = Arrays.asList(408439002, 408478003, 394582007, 394582007, 419772000, 394584008, 394294004, 394916005, 419192003, 408445005, 56397003, 309367003, 394813003,
                394810000);
        wpsTest.setSpecialty(specialities);
        String id = null;

        try {
            id = workProductSubscriptionDao.insertWorkProductSubscription(wpsTest);
        } catch (JsonProcessingException e) {
            LOGGER.error(e.getMessage());
        }

        Assert.assertTrue(id != null);

        // Clean up after the test
        try {
            workProductSubscriptionDao.deleteWorkProductSubscription(wpsTest);
        } catch (JsonProcessingException e) {
            LOGGER.error(e.getMessage());
        }

    }
}
