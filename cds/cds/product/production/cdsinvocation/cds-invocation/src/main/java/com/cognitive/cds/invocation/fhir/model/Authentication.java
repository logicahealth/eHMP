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
package com.cognitive.cds.invocation.fhir.model;

import java.io.Serializable;

// FUTURE refactor this to a common class - Not fhir related

/**
 *
 * @author tnguyen
 */
public class Authentication implements Serializable {
    /**
     * 
     */
    private static final long serialVersionUID = -8837187779685885776L;
    /**
     * 
     */
    private String verifyCode;
    private String accessCode;
    private String site;
    private String division;

    public Authentication(String accessCode, String verifyCode, String site, String division) {
        this.verifyCode = verifyCode;
        this.accessCode = accessCode;
        this.site = site;
        this.division = division;
    }

    public boolean isComplete() {

        if (verifyCode == null)
            return false;
        if (accessCode == null)
            return false;
        if (site == null)
            return false;

        if (verifyCode.isEmpty())
            return false;
        if (accessCode.isEmpty())
            return false;
        if (site.isEmpty())
            return false;
        if (division.isEmpty())
            return false;

        return true;
    }

    /**
     * Get the value of verifyCode
     *
     * @return the value of verifyCode
     */
    public String getVerifyCode() {
        return verifyCode;
    }

    /**
     * Set the value of verifyCode
     *
     * @param verifyCode
     *            new value of verifyCode
     */
    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    /**
     * Get the value of accessCode
     *
     * @return the value of accessCode
     */
    public String getAccessCode() {
        return accessCode;
    }

    /**
     * Set the value of accessCode
     *
     * @param accessCode
     *            new value of accessCode
     */
    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }

    /**
     * Get the value of site
     *
     * @return the value of site
     */
    public String getSite() {
        return site;
    }

    /**
     * Set the value of site
     *
     * @param site
     *            new value of site
     */
    public void setSite(String site) {
        this.site = site;
    }

    public String getDivision() {
		return division;
	}

	public void setDivision(String division) {
		this.division = division;
	}

	public String getAuthenticationQuery() {
        return "&accessCode=" + accessCode + "&verifyCode=" + verifyCode
                + "&site=" + site+ "&division=" + division;
    }

    @Override
    public String toString() {
        return "{verifyCode:" + verifyCode +
                ", accessCode:" + accessCode +
                ", site:" + site +
               ", division:" + division+ "}";
    }

}
