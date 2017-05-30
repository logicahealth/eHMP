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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/*
 *  Data model for consult prerequisite.
 */
@JsonInclude(Include.NON_NULL) 
public class Prerequisite {
	String valueSetQuery;
	String remediationQuery;
	String display;
	String status;
	String domain;
	Coding coding  = new Coding();
	
	@JsonInclude(Include.NON_NULL) 
	Remediation remediation;

	public Coding getCoding() {
		return coding;
	}

	public void setCoding(Coding coding) {
		this.coding = coding;
	}

	public Remediation getRemediation() {
		return remediation;
	}

	public void setRemediation(Remediation remediation) {
		this.remediation = remediation;
	}

	public String getValueSetQuery() {
		return valueSetQuery;
	}

	public void setValueSetQuery(String valueSetQuery) {
		this.valueSetQuery = valueSetQuery;
	}

	public String getRemediationQuery() {
		return remediationQuery;
	}

	public void setRemediationQuery(String remediationQuery) {
		this.remediationQuery = remediationQuery;
	}

	public String getDisplay() {
		return display;
	}

	public void setDisplay(String display) {
		this.display = display;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDomain() {
		return domain;
	}

	public void setDomain(String domain) {
		this.domain = domain;
	}

}
