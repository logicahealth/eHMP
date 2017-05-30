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
package com.cognitive.cds.invocation.execution.model;

import java.util.Date;

import com.cognitive.cds.invocation.model.Base;
import com.cognitive.cds.invocation.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

/**
 * 
 * @author jgoodnough
 *
 */
public class Job extends Base {
	private String name;
	private String description;
	private Date lastRun;
	private ExecutionRequest execution;
	private ExecutionResult lastExecutionResult;
	private User owner;
	private boolean disabled;

	private String _id;

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the lastRun
	 */
	public Date getLastRun() {
		return lastRun;
	}

	/**
	 * @param lastRun
	 *            the lastRun to set
	 */
    @JsonIgnore
	public void setLastRun(Date lastRun) {
		this.lastRun = lastRun;
	}
    @JsonProperty("lastRun")
    public void setLastRunDate(Double lastRun) {
        this.lastRun = new Date(lastRun.longValue());
    }
    
	/**
	 * @return the execution
	 */
	public ExecutionRequest getExecution() {
		return execution;
	}

	/**
	 * @param execution
	 *            the execution to set
	 */
	public void setExecution(ExecutionRequest execution) {
		this.execution = execution;
	}

	/**
	 * @return the lastExecutionResult
	 */
	public ExecutionResult getLastExecutionResult() {
		return lastExecutionResult;
	}

	/**
	 * @param lastExecutionResult
	 *            the lastExecutionResult to set
	 */
	public void setLastExecutionResult(ExecutionResult lastExecutionResult) {
		this.lastExecutionResult = lastExecutionResult;
	}

	/**
	 * @return the owner
	 */
	public User getOwner() {
		return owner;
	}

	/**
	 * @param owner
	 *            the owner to set
	 */
	public void setOwner(User owner) {
		this.owner = owner;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the disabled
	 */
	public boolean isDisabled() {
		return disabled;
	}

	/**
	 * @param disabled
	 *            the disabled to set
	 */
	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

	/**
	 * @return the _id
	 */
	public Object get_id() {
		return _id;
	}

	/**
	 * @param _id
	 *            the _id to set
	 */
	public void set_id(Object _id) {
	    if (_id instanceof ObjectNode) {
	        _id = ((ObjectNode) _id).findValue("$oid");
	        if (_id != null && (_id instanceof TextNode)) {
	            _id = (String)((TextNode) _id).asText();
            }
	    }
		this._id = (String)_id;
	}
}
