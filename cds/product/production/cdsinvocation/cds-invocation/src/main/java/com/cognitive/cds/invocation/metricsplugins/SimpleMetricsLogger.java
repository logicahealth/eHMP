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

import java.util.List;

import com.cognitive.cds.invocation.CDSMetricsIFace;
import com.cognitive.cds.invocation.model.CallMetrics;
import java.io.IOException;
import javax.annotation.PostConstruct;
import org.slf4j.LoggerFactory;

/**
 * @author T
 * @version 1.0
 * @created 11-Dec-2014 9:10:43 AM
 */
public class SimpleMetricsLogger implements CDSMetricsIFace {

    private String loggerName; // FOR LOGGING METRICS ONLY
    private String sl4fjLogger; // FOR LOGGING RUNTIME CONDITION
    
    public org.slf4j.Logger logmetrics;
    public org.slf4j.Logger log;
    
    // SPRING SETTERs/GETTERs
    public String getLoggerName() {
        return loggerName;
    }
    public void setLoggerName(String loggerName) {
        this.loggerName = loggerName;
    }
    public String getSl4fjLogger() {
        return sl4fjLogger;
    }
    public void setSl4fjLogger(String sl4fjLogger) {
        this.sl4fjLogger = sl4fjLogger;
    }
        
    public SimpleMetricsLogger(){
    }

    @Override
    public void finalize() throws Throwable { }

    @PostConstruct
    void initialize() {
        logmetrics = LoggerFactory.getLogger(loggerName);
        log = LoggerFactory.getLogger(sl4fjLogger);    
    }
    /**
     * 
     * @param metrics
     * @return 
     */
    @Override
    public boolean updateMetrics(List<CallMetrics> metrics){
        boolean ret;
        
        // Log incoming metrics into slf4j metrics log file.
        if (metrics == null) {
            log.warn("No metrics given.");
        } else {
            // Iterate through all metrics and log
            for (CallMetrics cm : metrics) {
                try {
                    logmetrics.info(cm.toJsonString());
                    
                } catch (IOException ex) {
                    log.error("Unable to sl4j log metric: {}", cm.getCallId());
                }
            }
        
        }
        ret = true; //When would a false ever be returned?
     
        return ret;
    }

}
