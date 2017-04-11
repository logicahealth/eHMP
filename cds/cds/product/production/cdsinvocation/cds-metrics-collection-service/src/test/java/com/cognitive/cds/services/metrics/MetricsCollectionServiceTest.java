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
package com.cognitive.cds.services.metrics;

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

import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Location;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.model.User;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.services.metrics.model.CDSResponseStatus;
import com.cognitive.cds.services.metrics.model.MetricsUpdate;

/**
 *
 * @author tnguyen
 */
public class MetricsCollectionServiceTest {
    
    public MetricsCollectionServiceTest() {
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


    /**
     * Test of updateMetrics method, of class MetricsCollectionService.
     */
    @Ignore("This is really a servce integrayion test")
    @Test
    public void testUpdateMetrics() {
        System.out.println("updateMetrics");
        
        MetricsUpdate request = new MetricsUpdate();
        List<CallMetrics> cm =  new ArrayList<>();
        
        CallMetrics metric = new CallMetrics();
        metric.setCallId("uuidXXX");
        metric.setEvent("event9");
        metric.setInvocation("invocation9");
        metric.setType("invoke");
        
        Context ctx = new Context();
        Subject s = new Subject();
        s.setId("id10");
        s.setName("mysite : mypatient");
        s.setType("Patient");
        ctx.setSubject(s);

        User u = new User();
        u.setId("id11");
        u.setName("myuser");
        u.setType("Provider");
        ctx.setUser(u);

        Location loc = new Location();
        metric.setContext(ctx);
        
        Timestamp time = new Timestamp(Calendar.getInstance().getTime().getTime());
        metric.setTime(time);
        
        cm.add(metric);
        
        metric = new CallMetrics();
        metric.setCallId("uuidYYY");
        metric.setEvent("event9");
        metric.setInvocation("invocation9");
        metric.setType("invoke");
        
        ctx = new Context();
        s = new Subject(); 
        s.setId("id10");
        s.setName("mysite : mypatient");
        s.setType("Patient");
        ctx.setSubject(s);
        
        metric.setContext(ctx);
        time = new Timestamp(Calendar.getInstance().getTime().getTime());
        metric.setTime(time);
        
        cm.add(metric);
        
        request.setMetrics(cm);
        
        MetricsCollectionService instance = new MetricsCollectionService();
        CDSResponseStatus result = instance.updateMetrics(request);
    }

    
    /**
     * Test of writeToMetricsDb method, of class MetricsCollectionService.
     * @throws CDSDBConnectionException 
     */
    @Ignore("This is really a servce integrayion test")
    @Test
    public void testWriteToMetricsDb() throws IOException, CDSDBConnectionException {
        System.out.println("writeToMetricsDb");
        
        String callId = "uuid678";
        String event = "begin";
        String invocation = "OPenCDS";
        String metricsType = "invoke";
        Timestamp time = new Timestamp(Calendar.getInstance().getTime().getTime());
        Context ctx = new Context();
        {
            Subject s = new Subject();
            s.setId("id10");
            s.setName("mysite : mypatient");
            s.setType("Patient");
            ctx.setSubject(s);

            User u = new User();
            u.setId("id11");
            u.setName("myuser");
            u.setType("Provider");
            ctx.setUser(null);
            
            Location loc = new Location();
//            loc.setId("");
//            loc.setName("");
        }
        
        CallMetrics m = new CallMetrics();
        m.setCallId(callId);
        m.setContext(ctx);
        m.setEvent(event);
        m.setInvocation(invocation);
        m.setTime(time);
        m.setType(metricsType);
        
        
        MetricsCollectionService instance = new MetricsCollectionService();
        instance.writeToMetricsDb(m);
        
    }
      
}
