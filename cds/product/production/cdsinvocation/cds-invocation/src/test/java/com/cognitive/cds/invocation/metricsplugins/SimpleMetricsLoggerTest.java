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
package com.cognitive.cds.invocation.metricsplugins;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.cognitive.cds.invocation.CDSMetricsIFace;
import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;

/**
 *
 * @author tnguyen
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:metricscontext.xml"})
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class SimpleMetricsLoggerTest {
	@Autowired
	@Qualifier("SimpleMetrics")
	CDSMetricsIFace instance;
    public SimpleMetricsLoggerTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    @Test
    public void testSpringConstructor() throws IOException {
 
        System.out.println("SpringConstructor");
        
        List<CallMetrics> metrics = this.prepMetrics();
        
    	ApplicationContext context = 
    	  new ClassPathXmlApplicationContext(new String[] {"metricscontext.xml"});
    	SimpleMetricsLogger instance = (SimpleMetricsLogger)context.getBean("SimpleMetrics");
        
        boolean result = instance.updateMetrics(metrics);
       
        boolean expResult = true;
        assertEquals(expResult, result);
    }
    
    /**
     * Test of updateMetrics method, of class SimpleMetricsLogger.
     * @throws java.io.IOException
     */
    @Ignore("Test is really a service integration test")
    @Test
    public void testUpdateMetrics() throws IOException {
        System.out.println("updateMetrics");
        List<CallMetrics> metrics = this.prepMetrics();
        
        
        //SimpleMetricsLogger instance = new SimpleMetricsLogger();
        boolean result = instance.updateMetrics(metrics);
        
        result = instance.updateMetrics(null);
        
        boolean expResult = true;
        assertEquals(expResult, result);
        
    }
    
    //@Test
    public void testPrepMetrics() throws IOException{
        this.prepMetrics();
    }
    private List<CallMetrics> prepMetrics() throws IOException {
        
        List<CallMetrics> cm =  new ArrayList<>();
        
        
        //------- 1st metric ----------
        CallMetrics metric = new CallMetrics();
        metric.setCallId("uuidXXX");
        metric.setEvent("event9");
        metric.setInvocation("invocation9");
        metric.setType("invoke");
        
        Context ctx = new Context();
        Subject s = new Subject();
        s.setId("id10");
        s.setName("mysite : mypatient");
        s.setType("test");
        ctx.setSubject(s);

        User u = new User();
        u.setId("id11");
        u.setName("myuser");
        u.setType("test");
        ctx.setUser(null);

        Location loc = new Location();
//            loc.setId("");
//            loc.setName("");
        metric.setContext(ctx);
        
        Timestamp time = new Timestamp(Calendar.getInstance().getTime().getTime());
        metric.setTime(time);
        
        cm.add(metric);
        
        System.out.println(metric.toJsonString());
        
        //------- 2nd metric ----------
        metric = new CallMetrics();
        metric.setCallId("uuidYYY");
        metric.setEvent("event9");
        metric.setInvocation("invocation9");
        metric.setType("invoke");
        
        ctx = new Context();
        s = new Subject(); 
        s.setId("id10");
        s.setName("mysite : mypatient");
        s.setType("test");
        ctx.setSubject(s);
        
        metric.setContext(ctx);
        time = new Timestamp(Calendar.getInstance().getTime().getTime());
        metric.setTime(time);
        
        cm.add(metric);
        
        return cm;
    }
}
