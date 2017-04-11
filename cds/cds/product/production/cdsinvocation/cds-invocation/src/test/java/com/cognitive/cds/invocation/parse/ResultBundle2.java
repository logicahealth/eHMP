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
package com.cognitive.cds.invocation.parse;

import com.cognitive.cds.invocation.model.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;


/**
 * General packaging the result of an invocatiom
 * This package includes an overall status, a list of results, and a List of faults thta may have occured
 * 
 * @see Result
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:43 AM
 */
public class ResultBundle2 implements Serializable {

	private List<Result2> results;
	private StatusCode status;
	private List<FaultInfo> faultInfo;

	public ResultBundle2(){
		results = new LinkedList<Result2>();
	}

    @Override
    public int hashCode() {
        return results.toString().hashCode() + status.toString().hashCode() + faultInfo.toString().hashCode();
    }
        
	public List<Result2> getResults() {
        if (results == null) 
            results = new ArrayList<Result2>();
		return results;
	}

	public void setResults(List<Result2> results) {
		this.results = results;
	}

	public StatusCode getStatus() {
		return status;
	}

	public void setStatus(StatusCode status) {
		this.status = status;
	}

	public List<FaultInfo> getFaultInfo() {
        if (faultInfo == null) 
            faultInfo = new ArrayList<FaultInfo>();
        
		return faultInfo;
	}

	public void setFaultInfo(List<FaultInfo> faultInfo) {
		this.faultInfo = faultInfo;
	}



}
