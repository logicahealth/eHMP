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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


/**
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:41 AM
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Context {

	/**
	 * Patient Identifier
	 */
	public String patientId;

    /**
     *
     */
    public String userId;

    /**
     *
     */
    public String siteId;

    /**
     *
     */
    public String specialty;

    /**
     *
     */
    public String location;
	/**
	 * Primary Care provider
	 */
	public int credentials;

    /**
     *
     */
    public Context(){

	}
	/**
	 * The Patient Id from Ehmp
	 * @return
	 */
	public String getPatientId() {
		return patientId;
	}

    /**
     *
     * @param patientId
     */
    public void setPatientId(String patientId) {
		this.patientId = patientId;
	}

	/**
	 * The User Id of the current invoking user
	 * @return
	 */
	public String getUserId() {
		return userId;
	}

    /**
     *
     * @param userId
     */
    public void setUserId(String userId) {
		this.userId = userId;
	}

    /**
     *
     * @return
     */
    public String getSiteId() {
		return siteId;
	}

    /**
     *
     * @param siteId
     */
    public void setSiteId(String siteId) {
		this.siteId = siteId;
	}

    /**
     *
     * @return
     */
    public int getCredentials() {
		return credentials;
	}

    /**
     *
     * @param credentials
     */
    public void setCredentials(int credentials) {
		this.credentials = credentials;
	}
	/**
	 * Thje specialty code associated with the current request
	 * @return
	 */
	public String getSpecialty() {
		return specialty;
	}

    /**
     *
     * @param specialty
     */
    public void setSpecialty(String specialty) {
		this.specialty = specialty;
	}
	/**
	 * The location associated with the current request 
	 * @return
	 */
	public String getLocation() {
		return location;
	}

    /**
     *
     * @param location
     */
    public void setLocation(String location) {
		this.location = location;
	}



}
