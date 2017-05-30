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
package com.cognitive.cds.services.cdsexecution;

import javax.ws.rs.PathParam;

import org.apache.cxf.jaxrs.ext.MessageContext;

import com.cognitive.cds.invocation.execution.model.ExecutionRequest;
import com.cognitive.cds.invocation.execution.model.ExecutionResult;



/**
 * @author Jerry Goodnough
 * @version 1.0
 * @created 3/10/2015
 */
public interface ExecutionIface {

    
    // FUTURE Evaluate if there is any reason to have this interface carry info.
    // It may be better to define the main java contract and a separate rest contract that carries the rest API semantics
	
	
    /**
	 * Used to execute a Rule job by Job
	 * @param jobNameOrId
	 * @return
	 */
    public ExecutionResult executeRulesJob(@PathParam("jobnameorid")String jobNameOrId, @javax.ws.rs.core.Context  MessageContext context);
    /**
     * REST Interface to trigger rules invocation
     * 
     * @param request
     * @param context
     * @return
     */
   
    
 
    public ExecutionResult executeRulesREST(ExecutionRequest request, @javax.ws.rs.core.Context MessageContext context);
    /**
     * Used to execute a rules processing session using explicit details
     * @param request
     * @return
     */
    public ExecutionResult executeRules(ExecutionRequest request);
}
