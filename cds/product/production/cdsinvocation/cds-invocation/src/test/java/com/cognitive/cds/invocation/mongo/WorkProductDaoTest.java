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

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.Specialty;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.workproduct.model.InvocationInfo;
import com.cognitive.cds.invocation.workproduct.model.Payload;
import com.cognitive.cds.invocation.workproduct.model.WorkProductWrapper;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductAssignment;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.junit.Ignore;

/**
 *
 * @author Tadesse Sefer, Jeremy Fox
 * 
 */
public class WorkProductDaoTest {

    private static MongoDbDao mongoDbDao;
    private static WorkProductDao workProductDao;
    private static final Logger LOGGER = LoggerFactory.getLogger(WorkProductDaoTest.class);

    // private static String id;

    @BeforeClass
    public static void beforeClass() {
        try {
            ApplicationContext context = new ClassPathXmlApplicationContext("classpath:mongodb-dao-context.xml");
            mongoDbDao = (MongoDbDao) context.getBean("mongoDbDao");
            workProductDao = new WorkProductDao();
            workProductDao.setMongoDbDao(mongoDbDao);
        } catch (Exception e) {
            LOGGER.error("Error loading connection properties.  Cannot connect to MongoDB");
        }
    }

    /**
     * NOTE:
     * 
     * Ignoring all of these out for right now. They are integration tests.
     */
    @Ignore("a service integration test")
    @Test
    public void testInsertWorkProduct() {
        String id = new String();
        try {
            id = workProductDao.saveWorkProduct(createWorkProduct());
        } catch (JsonProcessingException jpe) {
            jpe.printStackTrace();
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
        LOGGER.info(id);

        Assert.assertNotNull(id);
        
        String savedId = workProductDao.getWorkProduct(id).getWorkproduct().getId();
        Assert.assertNotNull(savedId);

        // Clean up after the test
        try {
            workProductDao.deleteWorkProduct(id);
        } catch (JsonProcessingException e) {

            e.printStackTrace();
        }

    }

    @Ignore("a service integration test")
    @Test
    public void testUpdateWorkProduct() {
        String id = new String();
        WorkProduct wp = null;
        try {
            wp = createWorkProduct();
            id = workProductDao.saveWorkProduct(wp);
            Context ctx = new Context();
            User usr = new User();
            usr.setId("UpdateTestUserId");
            usr.setCodeSystem("VA:Provider");
            usr.setName("UPDATE TEST USER");
            usr.setType("Provider");
            ctx.setUser(usr);
            wp.setContext(ctx);
            workProductDao.updateWorkProduct(wp);
            WorkProductWrapper wpw = workProductDao.getWorkProduct(id);
            Assert.assertTrue(wpw.getWorkproduct().getContext().getUser().getId().equalsIgnoreCase("UpdateTestUserId"));
            // Clean up after test
            workProductDao.deleteWorkProduct(id);
        } catch (JsonProcessingException e) {
            LOGGER.error( e.getMessage());
        } catch (ParseException e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Ignore("a service integration test")
    @Test
    public void testUpdateWorkProductAssignment() {
        WorkProduct wp;
        WorkProductAssignment wpa;
        try {
            wp = createWorkProduct();
            wpa = createWorkProductAssignment();
            String wpId = workProductDao.saveWorkProduct(wp);
            wpa.setWorkProductId(wpId);
            boolean result = workProductDao.insertAssignment(wpa);

            Assert.assertTrue(result);
            wpa.setPriority(81);
            workProductDao.updateWorkProductAssignment(wpa);

            WorkProductWrapper wpw = workProductDao.getWorkProduct(wp.getId());
            wp = wpw.getWorkproduct();
            List<WorkProductAssignment> assignments = wpw.getAssignments();
            for (Iterator iterator = assignments.iterator(); iterator.hasNext();) {
                WorkProductAssignment workProductAssignment = (WorkProductAssignment) iterator.next();
                if (workProductAssignment.getUser().getId().equalsIgnoreCase(wpa.getUser().getId()) && workProductAssignment.getWorkProductId().equalsIgnoreCase(wpa.getWorkProductId())) {
                    Assert.assertTrue(workProductAssignment.getPriority() == 81);
                }
            }
            // clean up
            workProductDao.deleteWorkProduct(wp.getId());
        } catch (JsonProcessingException jpe) {
            jpe.printStackTrace();
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
    }

    @Ignore("a service integration test")
    @Test
    public void testDeleteWorkProductAssignment() {
        WorkProduct wp;
        WorkProductAssignment wpa;
        try {
            wp = createWorkProduct();
            wpa = createWorkProductAssignment();
            String wpId = workProductDao.saveWorkProduct(wp);
            wpa.setWorkProductId(wpId);
            boolean result = workProductDao.insertAssignment(wpa);

            Assert.assertTrue(result);

            workProductDao.deleteWorkProductAssignment(wpa.getWorkProductId(), wpa.getUser().getId());

            WorkProductWrapper wpw = workProductDao.getWorkProduct(wp.getId());
            wp = wpw.getWorkproduct();
            List<WorkProductAssignment> assignments = wpw.getAssignments();
            for (Iterator iterator = assignments.iterator(); iterator.hasNext();) {
                WorkProductAssignment workProductAssignment = (WorkProductAssignment) iterator.next();
                if (workProductAssignment.getUser().getId().equalsIgnoreCase(wpa.getUser().getId()) && workProductAssignment.getWorkProductId().equalsIgnoreCase(wpa.getWorkProductId())) {
                    Assert.assertTrue(false);
                }
            }
            // clean up
            workProductDao.deleteWorkProduct(wp.getId());
        } catch (JsonProcessingException jpe) {
            jpe.printStackTrace();
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
    }

    @Ignore("a service integration test")
    @Test
    public void testAssignWorkProduct() {
        WorkProduct wp;
        WorkProductAssignment wpa;
        try {
            wp = createWorkProduct();
            wpa = createWorkProductAssignment();
            String wpId = workProductDao.saveWorkProduct(wp);
            wpa.setWorkProductId(wpId);
            boolean result = workProductDao.insertAssignment(wpa);

            Assert.assertTrue(result);

            // clean up the test work product inserted for
            workProductDao.deleteWorkProduct(wp.getId());

        } catch (JsonProcessingException jpe) {
            jpe.printStackTrace();
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
    }

    private WorkProduct createWorkProduct() throws ParseException {
        WorkProduct wp = new WorkProduct();
        wp.setType(InvocationConstants.ADVICE);
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");
        Date expDate = formatter.parse("4/10/2015/13:15:00");
        wp.setExpirationDate(expDate);

        Date genDate = formatter.parse("3/10/2015/13:15:00");
        wp.setGenerationDate(genDate);

        Context ctx = new Context();
        User usr = new User();
        usr.setId("unitTestUserId");
        usr.setCodeSystem("VA:Provider");
        usr.setName("TESR,USER");
        usr.setType("Provider");
        ctx.setUser(usr);

        Subject sub = new Subject();
        sub.setCodeSystem("VA:UniversalId");
        sub.setId("2299:2222:Junk");
        sub.setType("Patient");
        ctx.setSubject(sub);

        Location loc = new Location();
        loc.setCodeSystem("VA:Location");
        // loc.setId("2883");
        loc.setType("ClinicName");
        loc.setName("ClinicOne");
        ctx.setLocation(loc);

        Specialty spec = new Specialty();
        spec.setCodeSystem("VA:Specialty");
        spec.setId("FM");
        spec.setType("Speciality");
        spec.setName("Family Medicine");

        wp.setContext(ctx);
        InvocationInfo info = new InvocationInfo();
        info.setCallId("UUID of CallId");
        info.setGeneratedBy("UnitTestRulesEngine");

        InvocationTarget targetInfo = new InvocationTarget();
        targetInfo.setMode(InvocationMode.Normal);
        targetInfo.setType(InvocationType.Background);
        ArrayList<String> intents = new ArrayList<String>();
        intents.add("InvocationIntentA");
        targetInfo.setIntentsSet(intents);
        info.setTargetInfo(targetInfo);
        wp.setInvocationInfo(info);

        wp.getCategories().add("UnitTestCategory1");
        wp.getCategories().add("UnitTestCategory2");

        Result result = new Result();
        result.setBody("This is the body");
        result.setCallId("TheCallId");
        result.setGeneratedBy("GeneratedBYUnitTest");
        result.setProvenance("Test Data");
        result.setTitle("A Test Result");

        result.setType(InvocationConstants.ADVICE);

        Payload payload = new Payload();
        payload.setData(result);
        payload.setType(InvocationConstants.ADVICE);
        wp.getPayload().add(payload);

        String payloadData2 = "{FHIRData:null}";
        Payload payload2 = new Payload();
        payload2.setData(payloadData2);
        payload2.setType("FHIR-Comminication");
        // wp.getPayload().add(payload2);

        return wp;

    }

    private WorkProductAssignment createWorkProductAssignment() throws ParseException {

        WorkProductAssignment wpa = new WorkProductAssignment();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");

        Date dueDate = formatter.parse("4/10/2015/13:15:00");
        wpa.setDueDate(dueDate);

        Date expirationDate = formatter.parse("5/10/2015/13:15:00");
        wpa.setExpirationDate(expirationDate);

        wpa.setWorkProductType("CDSAdvice");
        wpa.setReadStatus(false);
        User usr = new User();
        usr.setCodeSystem("VA:ProviderId");
        usr.setType("Provider");
        usr.setId("SITE:10000000255");
        usr.setName("Optional");
        wpa.setUser(usr);
        wpa.setPriority(76);
        return wpa;
    }

}
