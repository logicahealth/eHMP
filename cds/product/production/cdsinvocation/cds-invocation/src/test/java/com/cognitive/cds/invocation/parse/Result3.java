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
package com.cognitive.cds.invocation.parse;

import java.io.Serializable;

import com.cognitive.cds.invocation.DataModelHandlerIFace;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * General Structure used to wrap a reasoning result. The code element is the
 * Body which encodes the data returned on reasoning All elements are mediated
 * by the core processing infrastructure. Generally the DataModelHandlerIFace
 * installed on the invoker.
 * 
 * Note that work product process might futher refine the result structure.
 * 
 * @see DataModelHandlerIFace
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 * 
 *          Todo:
 * 
 *          1) Look at replacing the Body as am Object or Serializable
 */
public class Result3 implements Serializable {

	/**
	 * The type of result (Required)
	 */
	private String type;
	/**
	 * The actual result body (Required)
	 */
    @JsonRawValue
	private Object body;
	/**
	 * The Call id of the invocation that created the result (Required)
	 */
	private String callId;
	/**
	 * A Title (optional)
	 */
	private String title;
	/**
	 * Indication of the provenace of the Result (Optional)
	 */
	private String provenance;
	/**
	 * Engine that generated the result
	 */
	private String generatedBy;

	public Result3() {

	}

	/**
	 * Copy constructor
	 * 
	 * @param base
	 *            the bade Result object to copy
	 */
	public Result3(Result3 base) {
		body = base.body;
		type = base.type;
		callId = base.callId;
		title = base.title;
		provenance = base.provenance;
	}

	/**
	 * Simple parameter based constructor
	 * 
	 * @param type
	 *            The Type
	 * @param title
	 *            The Title
	 * @param body
	 *            The Body
	 * @param provenance
	 *            The Provenance
	 * @param callid
	 *            The callId
	 */
	public Result3(String type, String title, Object body, String provenance, String callId) {
		this.type = type;
		this.title = title;
		this.body = body;
		this.provenance = provenance;
		this.callId = callId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

    //@JsonRawValue
	public Object getBody() {
		//return body;
        // default raw value: null or "[]"
        return body == null ? null : body;
	}
    public void setBody(JsonNode node) {
        this.body = node;
    }

	public String getCallId() {
		return callId;
	}

	public void setCallId(String callId) {
		this.callId = callId;
	}

	public void finalize() throws Throwable {

	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getProvenance() {
		return provenance;
	}

	public void setProvenance(String provenance) {
		this.provenance = provenance;
	}

	/**
	 * The Engine that generated the result
	 * 
	 * @return the generatedBy
	 */
	public String getGeneratedBy() {
		return generatedBy;
	}

	/**
	 * @param generatedBy
	 *            the generatedBy to set
	 */
	public void setGeneratedBy(String generatedBy) {
		this.generatedBy = generatedBy;
	}

}
