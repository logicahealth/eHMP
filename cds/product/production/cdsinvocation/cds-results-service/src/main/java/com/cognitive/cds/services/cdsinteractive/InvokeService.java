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
package com.cognitive.cds.services.cdsinteractive;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.CDSInvocationIFace;
import com.cognitive.cds.invocation.CDSInvoker;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisite;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisites;
import com.cognitive.cds.invocation.execution.model.Prerequisite;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;

/**
 *
 * Generic Raw Service for interactive invocation of reasoning
 *
 * @author Jerry Goodnough
 * @version 1.0
 * @created 4/27/2015
 */
public class InvokeService implements InvokeIface {

	private static final Logger logger = LoggerFactory.getLogger(InvokeService.class);

	CDSInvocationIFace cdsInvoker;

	public InvokeService() {

	}

	public InvokeService(CDSInvoker cdsInvoker) {
		this.cdsInvoker = cdsInvoker;

	}

	public CDSInvocationIFace getCdsInvoker() {
		return cdsInvoker;
	}

	@Override
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	@Path("/invokeRules")
	public ResultBundle invokeRules(InvokeServiceReq req, @javax.ws.rs.core.Context MessageContext context) {
		// How do we make sure that FHIR get serialized correctly?
		ResultBundle invokerResult; 
        
		ErrorState errroState = checkRequestForErrors(req);
		if (errroState.ok) {
			logger.debug("Invoking " + req.getTarget().toString() + ", for " + req.getContext().toString());
            
				invokerResult = cdsInvoker.invoke(req.getTarget(), req.getContext(), req.getParameters(),
						req.getDataModel());
				logger.debug("Invoked " + req.getTarget().toString() + ", for " + req.getContext().toString());
                
		} else {
			invokerResult = errroState.bundle;
		}

		HttpServletResponse response = context.getHttpServletResponse();
		response.setStatus(invokerResult.getStatus().getHttpStatus().getStatusCode());
		try {
			response.flushBuffer();
		} catch (Exception e) {
		}

		return invokerResult;
	}

	/**
	 * Check if the request is valid
	 * 
	 * @param req
	 *            The invoke service request
	 * @return
	 */
	private ErrorState checkRequestForErrors(InvokeServiceReq req) {
		ErrorState error = new ErrorState();
		if (req.getContext() == null) {
			error.addError(StatusCode.INVALID_INPUT_DATA, "context is a required property of the request");
		}
		if (req.getTarget() == null) {
			error.addError(StatusCode.INVALID_INPUT_DATA, "target is a required property of the request");
		} else {
			InvocationTarget target = req.getTarget();
			if (target.getIntentsSet().isEmpty()) {
				error.addError(StatusCode.INVALID_INPUT_DATA, "No intents given ");
			}
			if (target.getType() == null) {
				error.addError(StatusCode.INVALID_INPUT_DATA, "Missing request type, Use Direct");
			} else if (target.getType() != InvocationType.Direct) {
				error.addError(StatusCode.INVALID_INPUT_DATA,
						"Only Direct mode supported at this time, please use Direct");
			}
			if (target.getMode() == null) {
				error.addError(StatusCode.INVALID_INPUT_DATA, "Missing request model - use Normal or Raw");
			}
			Context ctx = req.getContext();
			if (ctx.getSubject() == null) {
				error.addError(StatusCode.INVALID_INPUT_DATA, "subject is required property of context");
			}
			if (ctx.getUser() == null) {
				error.addError(StatusCode.INVALID_INPUT_DATA, "user is required property of context");
			}
		}

		return error;
	}

	private class ErrorState {

		public boolean ok = true;
		public ResultBundle bundle;

		public void addError(StatusCode code, String detail) {
			FaultInfo info = new FaultInfo(detail);

			if (bundle == null) {
				bundle = new ResultBundle();
				bundle.setStatus(code);
			} else if (!bundle.getStatus().equals(code)) {
				bundle.setStatus(StatusCode.MULTIPLE_FAULTS);
			}
			bundle.getFaultInfo().add(info);
			ok = false;
		}
	}
}
