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
package com.cognitive.cds.services.cdsresults.model;

import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;

import com.cognitive.cds.invocation.model.Base;


/**
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "CDSResult")
public class CDSResult extends Base {
	
	/**
	 * The Artifact Id
	 */
	private String id;
	
	private int priority;
	
	private String type;
	
	/**
	 * The Patient/Subject Id
	 */
	private String pid;
	
	private String title;
	
	private Details details = new Details();
	
	private Date dueDate;
	
	private Date doneDate;
	
	
	private String generatedBy;
	
	private String provider;
	
    /**
     *
     */
    public CDSResult(){
	}

    /**
     *
     * @return
     */
    public String getId() {
		return id;
	}

    /**
     *
     * @param id
     */
    public void setId(String id) {
		this.id = id;
	}

    /**
     *
     * @return
     */
    public int getPriority() {
		return priority;
	}

    /**
     *
     * @param priority
     */
    public void setPriority(int priority) {
		this.priority = priority;
	}

    /**
     *
     * @return
     */
    public String getType() {
		return type;
	}

    /**
     *
     * @param type
     */
    public void setType(String type) {
		this.type = type;
	}

    /**
     *
     * @return
     */
    public String getTitle() {
		return title;
	}
	
    /**
     *
     * @param title
     */
    public void setTitle(String title) {
		this.title = title;
	}

    /**
     *
     * @return
     */
    public Details getDetails() {
		return details;
	}

    /**
     *
     * @param details
     */
    public void setDetails(Details details) {
		this.details = details;
	}

    /**
     *
     * @return
     */
    public Date getDueDate() {
		return dueDate;
	}
	
    /**
     *
     * @param dueDate
     */
    public void setDueDate(Date dueDate) {
		this.dueDate = dueDate;
	}

    /**
     *
     * @return
     */
    public Date getDoneDate() {
		return doneDate;
	}

    /**
     *
     * @param doneDate
     */
    public void setDoneDate(Date doneDate) {
		this.doneDate = doneDate;
	}
	/**
	 * @return the generatedBy
	 */
	public String getGeneratedBy() {
		return generatedBy;
	}

	/**
	 * @param generatedBy the generatedBy to set
	 */
	public void setGeneratedBy(String generatedBy) {
		this.generatedBy = generatedBy;
	}


	
	/**
	 * @return the provider
	 */
	public String getProvider() {
		return provider;
	}

	/**
	 * @param provider the provider to set
	 */
	public void setProvider(String provider) {
		this.provider = provider;
	}

	/**
	 * @return the pid
	 */
	public String getPid() {
		return pid;
	}

	/**
	 * @param pid the pid to set
	 */
	public void setPid(String pid) {
		this.pid = pid;
	}


}
