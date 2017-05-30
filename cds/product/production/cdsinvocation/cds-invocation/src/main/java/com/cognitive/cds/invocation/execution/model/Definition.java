/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.invocation.execution.model;

public class Definition {

	private String expression;

	private String scope;

	private String _id;

	private String description;

	private String name;

	private String owner;

	private String date;

	/**
	 *
	 * @return
	 */
	public String getExpression() {
		return expression;
	}

	/**
	 *
	 * @param expression
	 */
	public void setExpression(String expression) {
		this.expression = expression;
	}

	/**
	 *
	 * @return
	 */
	public String getScope() {
		return scope;
	}

	/**
	 *
	 * @param scope
	 */
	public void setScope(String scope) {
		this.scope = scope;
	}

	/**
	 *
	 * @return
	 */
	public String get_id() {
		return _id;
	}

	/**
	 *
	 * @param _id
	 */
	public void set_id(String _id) {
		this._id = _id;
	}

	/**
	 *
	 * @return
	 */
	public String getDescription() {
		return description;
	}

	/**
	 *
	 * @param description
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 *
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 *
	 * @param name
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 *
	 * @return
	 */
	public String getOwner() {
		return owner;
	}

	/**
	 *
	 * @param owner
	 */
	public void setOwner(String owner) {
		this.owner = owner;
	}

	/**
	 *
	 * @return
	 */
	public String getDate() {
		return date;
	}

	/**
	 *
	 * @param date
	 */
	public void setDate(String date) {
		this.date = date;
	}

	@Override
	public String toString() {
		return "ClassPojo [expression = " + expression + ", scope = " + scope
		        + ", _id = " + _id + ", description = " + description
		        + ", name = " + name + ", owner = " + owner + ", date = "
		        + date + "]";
	}
}
