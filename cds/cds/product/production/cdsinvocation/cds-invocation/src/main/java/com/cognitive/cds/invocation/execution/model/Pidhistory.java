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

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

public class Pidhistory {

	private String timestamp;

	private String pid;

	private String add;

	/**
	 *
	 * @return
	 */
	public String getTimestamp() {
		return timestamp;
	}

	/**
	 *
	 * @param timestamp
	 */
	@JsonIgnore
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

    @JsonProperty("timestamp")
    public void setTimestampTimestamp(Object timestamp) {
        if (timestamp instanceof ObjectNode) {
            timestamp = ((ObjectNode) timestamp).findValue("$date");
            if (timestamp != null && (timestamp instanceof TextNode)) {
                timestamp = (String) ((TextNode) timestamp).asText();
            } else if (timestamp != null && (timestamp instanceof LongNode)) {
                timestamp = (String) new Date(((LongNode) timestamp).longValue())
                        .toString();
            }
        }
        this.timestamp = (String) timestamp;
    }
	
	

	/**
	 *
	 * @return
	 */
	public String getPid() {
		return pid;
	}

	/**
	 *
	 * @param pid
	 */
	public void setPid(String pid) {
		this.pid = pid;
	}

	/**
	 *
	 * @return
	 */
	public String getAdd() {
		return add;
	}

	/**
	 *
	 * @param add
	 */
	public void setAdd(String add) {
		this.add = add;
	}

	@Override
	public String toString() {
		return "ClassPojo [timestamp = " + timestamp + ", pid = " + pid
		        + ", add = " + add + "]";
	}
}
