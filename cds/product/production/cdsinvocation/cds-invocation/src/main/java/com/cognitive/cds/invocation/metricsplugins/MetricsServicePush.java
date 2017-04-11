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
package com.cognitive.cds.invocation.metricsplugins;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import javax.annotation.PostConstruct;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.CDSMetricsIFace;
import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Metrics;

/**
 * A class which can POST Metrics to a REST client.  MetricsServicePush 
 * uses a singleton WebClient which does not need to be thread safe
 * because it only does a POST with no payload response.
 */
public class MetricsServicePush implements CDSMetricsIFace {

    private String metricsEndpoint;
    private String sl4fjLogger; // FOR LOGGING RUNTIME CONDITION
    private volatile WebClient client;
    private static final AtomicReference<String> LOCK = new AtomicReference<>();
    
    public org.slf4j.Logger log;
 
    @PostConstruct
    void initialize() {
        log = LoggerFactory.getLogger(sl4fjLogger);
    }
    
    /**
     *
     * @param metricsList
     * @return boolean
     */
    @Override
    public boolean updateMetrics(List<CallMetrics> metricsList) {
        
        //WRAPPER "metrics" object .. expected by server side.
        Metrics m = new Metrics();
        m.setMetrics(metricsList);
        
        try {
        	Response response = getClient().post(m);
            
            if (response.getStatus() >= 300) {
                log.error("HTTP Error: "+ Integer.toString(response.getStatus()));
                return false;
            }
        } catch (Exception ex) {
            log.error(ex.getMessage(),ex);
            return false;
        }
        
        return true;
    }
    
    
    /**
     * Thread safe creation of a WebClient 
     * @return
     */
    private WebClient getClient() {
    	if(client == null) {
    		synchronized(LOCK) {
    			if(client == null) {
    	            List<Object> providers = new ArrayList<Object>();
    	            providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());
    	            this.client = WebClient.create(metricsEndpoint, providers)
    	            		.accept(MediaType.APPLICATION_JSON).type(MediaType.APPLICATION_JSON);
    			}
    		}
    	}
    	return client;
    }
    
    
    // SPRING SETTERs/GETTERs
    public String getMetricsEndpoint() {
        return metricsEndpoint;
    }

    public void setMetricsEndpoint(String metricsEndpoint) {
        this.metricsEndpoint = metricsEndpoint;
    }

    public String getSl4fjLogger() {
        return sl4fjLogger;
    }

    public void setSl4fjLogger(String sl4fjLogger) {
        this.sl4fjLogger = sl4fjLogger;
    }
}
