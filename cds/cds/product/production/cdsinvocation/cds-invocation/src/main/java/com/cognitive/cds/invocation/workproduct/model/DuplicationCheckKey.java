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

package com.cognitive.cds.invocation.workproduct.model;

import com.cognitive.cds.invocation.model.Base;
import com.cognitive.cds.invocation.model.Subject;

/**
 * The class is the information needed for first pass uniqueness checking. In
 * terms of equality check a potential duplicate is one that match in every
 * manner in the DuplicationCheckKey, which required type, subject and checksum
 * be the same. A null or empty check sum indicates that the key is not
 * calculated. The calculation of the checkSum should be such that the
 * clinically relevant portions of the work product are taken into account. care
 * should be taken to not include processing related elements like generation
 * time not be including in the check sum.
 * 
 * @author jgoodnough
 *
 */
public class DuplicationCheckKey extends Base {

	/**
	 * The type of object the duplication check is for
	 */
	private String type;
	/**
	 * The subject associated with the work product
	 */
	private Subject subject;
	/**
	 * The medically unique checksum for the object
	 */
	private String checkSum = "";

	public DuplicationCheckKey() {
	}

	public DuplicationCheckKey(String type, Subject subject) {
		this.type = type;
		this.subject = subject;
	}

	public DuplicationCheckKey(String type, Subject subject, String checkSum) {
		this.type = type;
		this.subject = subject;
		this.checkSum = checkSum;
	}

	/**
	 * The Work product type (See the work product taxonomy)
	 * 
	 * @return
	 */
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	/**
	 * The Subject this work product is for
	 * 
	 * @return
	 */
	public Subject getSubject() {
		return subject;
	}

	public void setSubject(Subject subject) {
		this.subject = subject;
	}

	/**
	 * A check sum of the clinically relevant portions
	 * 
	 * @return
	 */
	public String getCheckSum() {
		return checkSum;
	}

	public void setCheckSum(String checkSum) {
		this.checkSum = checkSum;
	}

	/***
	 * Provides a value which should be good uniqueness check key.
	 * 
	 * @return
	 */
	public String checkKey() {
		return type + "," + subject.getType() + ":" + subject.getId() + checkSum;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((checkSum == null) ? 0 : checkSum.hashCode());
		result = prime * result + ((subject == null) ? 0 : subject.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		DuplicationCheckKey other = (DuplicationCheckKey) obj;
		if (checkSum == null) {
			if (other.checkSum != null)
				return false;
		} else if (!checkSum.equals(other.checkSum))
			return false;
		if (subject == null) {
			if (other.subject != null)
				return false;
		} else if (!subject.equals(other.subject))
			return false;
		if (type == null) {
			if (other.type != null)
				return false;
		} else if (!type.equals(other.type))
			return false;
		return true;
	}

}
