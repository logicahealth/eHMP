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

package com.cognitive.cds.invocation.workproduct.model;

import java.util.Date;

import com.cognitive.cds.invocation.model.Base;
import com.cognitive.cds.invocation.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

/**
 * Definition of the assignment of the work product
 * 
 * @author jgoodnough
 *
 * Todo:
 * 
 * 1) Add assignment type (e.g. primary.infomative, secondary, delegation, transfer etc.) 
 * 2) Add team/group assignment
 */
public class WorkProductAssignment extends Base {

	/** 
	 * The work product id
	 */
	private String workProductId;
	
        /**
	 * The type of work product
	 */
	private String workProductType;
	
        /**
	 * The user this work product is assigned to
	 */
	private User user;
	
        /**
	 * The date the work work is due action by this user
	 */
	private Date dueDate;
	
        /**
	 * The date the work product expires for this work product
	 */
	private Date expirationDate;
	
        /**
	 * The read status of this work product for this user
	 */
	private boolean readStatus;
	
        /**
	 * The priority of the work product for this user
	 * Low 0 to High 100
	 */
	private int priority; 
	
	public Date getDueDate() {
		return dueDate;
	}
        
	@JsonIgnore
	public void setDueDate(Date dueDate) {
		this.dueDate = dueDate;
	}
        
        @JsonProperty("dueDate")
        public void setDueDateDate(Object date) {
            if (date instanceof ObjectNode) {
                date = ((ObjectNode) date).findValue("dueDate");
                if (date != null && (date instanceof TextNode)) {
                    date = (String)((TextNode) date).asText();
                } else if (date != null && (date instanceof LongNode)) {
                    date = (String) new Date(((LongNode) date).longValue()).toString();
                }
            }
            this.dueDate = (Date) date;
        }
        
	public Date getExpirationDate() {
		return expirationDate;
	}
        
	@JsonIgnore
	public void setExpirationDate(Date expirationDate) {
		this.expirationDate = expirationDate;
	}
        
        @JsonProperty("expirationDate")
        public void setExpirationDateDate(Object date) {
            if (date instanceof ObjectNode) {
                date = ((ObjectNode) date).findValue("expirationDate");
                if (date != null && (date instanceof TextNode)) {
                    date = (String)((TextNode) date).asText();
                } else if (date != null && (date instanceof LongNode)) {
                    date = (String) new Date(((LongNode) date).longValue()).toString();
                }
            }
            this.expirationDate = (Date) date;
        }

        public User getUser() {
		return user;
	}
        
        public void setUser(User user) {
		this.user = user;
	}
	
        public String getWorkProductId() {
		return workProductId;
	}
        
        public void setWorkProductId(String workProductId) {
		this.workProductId = workProductId;
	}
	
        public String getWorkProductType() {
		return workProductType;
	}
	
        public void setWorkProductType(String workProductType) {
		this.workProductType = workProductType;
	}
        
	public boolean getReadStatus() {
		return readStatus;
	}
        
        public void setReadStatus(boolean readStatus) {
		this.readStatus = readStatus;
	}

	public int getPriority() {
		return priority;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}
	
}
