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
package com.cognitive.cds.invocation.execution.model;

import java.util.ArrayList;
import java.util.List;

import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.StatusCode;

/**
 * 
 * @author jgoodnough
 *
 */
public class ExecutionFault {
	private Context context;
	private InvocationTarget target;
	private StatusCode status;
	private List<FaultInfo> faultInfo;

	public ExecutionFault() {
		faultInfo = new ArrayList<FaultInfo>();
	}

	public ExecutionFault(InvocationTarget target, Context context,
	        StatusCode status, FaultInfo fault) {
		this.target = target;
		this.context = context;
		this.status = status;
		faultInfo = new ArrayList<FaultInfo>();
		faultInfo.add(fault);
	}

	/**
	 * Base Parameterized constructor
	 * 
	 * @param target
	 * @param context
	 * @param status
	 * @param faultInfo
	 */
	public ExecutionFault(InvocationTarget target, Context context,
	        StatusCode status, List<FaultInfo> faultInfo) {
		this.target = target;
		this.context = context;
		this.status = status;
		this.faultInfo = faultInfo;
	}

	/**
	 * @return the context
	 */
	public Context getContext() {
		return context;
	}

	/**
	 * @param context
	 *            the context to set
	 */
	public void setContext(Context context) {
		this.context = context;
	}

	/**
	 * @return the target
	 */
	public InvocationTarget getTarget() {
		return target;
	}

	/**
	 * @param target
	 *            the target to set
	 */
	public void setTarget(InvocationTarget target) {
		this.target = target;
	}

	/**
	 * @return the status
	 */
	public StatusCode getStatus() {
		return status;
	}

	/**
	 * @param status
	 *            the status to set
	 */
	public void setStatus(StatusCode status) {
		this.status = status;
	}

	/**
	 * @return the faultInfo
	 */
	public List<FaultInfo> getFaultInfo() {
		return faultInfo;
	}

	/**
	 * @param faultInfo
	 *            the faultInfo to set
	 */
	public void setFaultInfo(List<FaultInfo> faultInfo) {
		this.faultInfo = faultInfo;
	}

}
