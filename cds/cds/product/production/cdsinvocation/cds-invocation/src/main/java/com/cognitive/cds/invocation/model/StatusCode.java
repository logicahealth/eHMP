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
package com.cognitive.cds.invocation.model;

import javax.ws.rs.core.Response;

/**
 * Operation Status code
 * 
 * @author jgoodnough
 *
 *         Todo: 1) Break into a heirarchy of priority
 */
public class StatusCode {

	public static StatusCode SUCCESS = new StatusCode(InvocationConstants.StatusCodes.SUCCESS.getCode(),
			Response.Status.OK);
	public static StatusCode DATA_SERVER_NOT_AVAILABLE = new StatusCode(
			InvocationConstants.StatusCodes.DATA_SERVER_NOT_AVAILABLE.getCode(),Response.Status.SERVICE_UNAVAILABLE);
	public static StatusCode GENERAL_RULES_FAILURE = new StatusCode(
			InvocationConstants.StatusCodes.GENERAL_RULES_FAILURE.getCode(), Response.Status.INTERNAL_SERVER_ERROR);
	public static StatusCode INVALID_INPUT_DATA = new StatusCode(
			InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getCode(),Response.Status.BAD_REQUEST);
	public static StatusCode INVALID_OUTPUT_DATA = new StatusCode(
			InvocationConstants.StatusCodes.INVALID_OUTPUT_DATA.getCode(),Response.Status.INTERNAL_SERVER_ERROR);
	public static StatusCode MULTIPLE_FAULTS = new StatusCode(InvocationConstants.StatusCodes.MULTIPLE_FAULTS.getCode(),Response.Status.INTERNAL_SERVER_ERROR);
	public static StatusCode NO_RULES_FIRED = new StatusCode(InvocationConstants.StatusCodes.NO_RULES_FIRED.getCode(),Response.Status.OK);
	public static StatusCode RULES_ENGINE_NOT_AVAILABLE = new StatusCode(
			InvocationConstants.StatusCodes.RULES_ENGINE_NOT_AVAILABLE.getCode(),Response.Status.SERVICE_UNAVAILABLE);
	public static StatusCode SYSTEM_ERROR = new StatusCode(InvocationConstants.StatusCodes.SYSTEM_ERROR.getCode(),Response.Status.INTERNAL_SERVER_ERROR);
	public static StatusCode USE_NOT_RECOGNIZED = new StatusCode(
			InvocationConstants.StatusCodes.USE_NOT_RECOGNIZED.getCode(),Response.Status.BAD_REQUEST);
	public static StatusCode AUTHENICATION_ERROR = new StatusCode(
			InvocationConstants.StatusCodes.AUTHENICATION_ERROR.getCode(),Response.Status.UNAUTHORIZED);
	public static StatusCode CONFIGURATION_ERROR = new StatusCode(
			InvocationConstants.StatusCodes.CONFIGURATION_ERROR.getCode(),Response.Status.INTERNAL_SERVER_ERROR);
	private String code;
	private Response.Status httpStatus;

	/**
	 * Create a StatusCode entry using a string.
	 * 
	 * @param code
	 */
	public StatusCode(String code, Response.Status httpStatus) {
		this.code = code;
		this.httpStatus = httpStatus;
	}
	
	public StatusCode()
	{
		code = "0";
		httpStatus = Response.Status.OK;
	}

	
	/**
	 * Get the HTTP response status that is mapped to this status.
	 * 
	 * @return
	 */
	public Response.Status getHttpStatus() {
		return httpStatus;
	}

	/**
	 * Set the Http response status that should be associated with this status
	 * 
	 * @param status
	 */
	public void setHttpStatus(Response.Status status) {
		this.httpStatus = status;
	}

	/**
	 * Fetch the status code
	 * 
	 * @return A String representation of the status code
	 */

	public String getCode() {
		return code;
	}

	/**
	 * Set the status code value
	 * 
	 * @param code
	 *            The new code
	 */
	public void setCode(String code) {
		this.code = code;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((code == null) ? 0 : code.hashCode());
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
		StatusCode other = (StatusCode) obj;
		if (code == null) {
			if (other.code != null)
				return false;
		} else if (!code.equals(other.code))
			return false;
		return true;
	}
}
